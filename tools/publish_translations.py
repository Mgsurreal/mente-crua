"""Publish reviewed article translations as static localized HTML pages."""

from __future__ import annotations

import argparse
import json
import posixpath
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin, urlparse

from lxml import etree, html


ROOT = Path(__file__).resolve().parents[1]
LOCALES = {
    "pt-br": ("pt-BR", "ltr", "Português (Brasil)", "pt-BR"),
    "pt-pt": ("pt-PT", "ltr", "Português (Portugal)", "pt-PT"),
    "en-gb": ("en-GB", "ltr", "English", "en-GB"),
    "es-es": ("es-ES", "ltr", "Español (España)", "es-ES"),
    "es-latam": ("es-419", "ltr", "Español (Latinoamérica)", "es-419"),
    "fr-fr": ("fr-FR", "ltr", "Français", "fr-FR"),
    "de-de": ("de-DE", "ltr", "Deutsch", "de-DE"),
    "it-it": ("it-IT", "ltr", "Italiano", "it-IT"),
    "ru-ru": ("ru-RU", "ltr", "Русский", "ru-RU"),
    "ar": ("ar", "rtl", "العربية", "ar"),
    "ar-eg": ("ar-EG", "rtl", "العربية (مصر)", "ar-EG"),
    "hi-in": ("hi-IN", "ltr", "हिन्दी", "hi-IN"),
    "ja-jp": ("ja-JP", "ltr", "日本語", "ja-JP"),
    "ko-kr": ("ko-KR", "ltr", "한국어", "ko-KR"),
    "zh-cn": ("zh-CN", "ltr", "简体中文", "zh-CN"),
}

UI = {
    "en-gb": {
        "language": "Language", "in_article": "In this article", "connections": "Connections",
        "library": "Further reading", "explore": "Keep exploring", "related": "Connections beyond this article",
        "by": "By Mente Crua Team", "share": "Share", "listen": "Listen to article",
        "pause": "Pause", "stop": "Stop", "speed": "Speed", "reader": "Reader available",
    }
}


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def select(node, selector: str):
    """Small selector set used here, without the optional cssselect package."""
    fixed = {
        'meta[name="description"]': './/meta[@name="description"]',
        'meta[property="og:title"]': './/meta[@property="og:title"]',
        'meta[property="og:description"]': './/meta[@property="og:description"]',
        'meta[name="twitter:title"]': './/meta[@name="twitter:title"]',
        'meta[name="twitter:description"]': './/meta[@name="twitter:description"]',
        ".article-hero h1": './/*[contains(concat(" ", normalize-space(@class), " "), " article-hero ")]//h1',
        ".article-deck": './/*[contains(concat(" ", normalize-space(@class), " "), " article-deck ")]',
        ".article-kicker": './/*[contains(concat(" ", normalize-space(@class), " "), " article-kicker ")]',
        ".article-paper": './/*[contains(concat(" ", normalize-space(@class), " "), " article-paper ")]',
        ".article-copy": './/*[contains(concat(" ", normalize-space(@class), " "), " article-copy ")]',
        ".header-content": './/*[contains(concat(" ", normalize-space(@class), " "), " header-content ")]',
        "article": ".//article",
        "#article-language-switcher": './/*[@id="article-language-switcher"]',
        'link[rel="canonical"]': './/link[@rel="canonical"]',
        'link[rel="alternate"][hreflang]': './/link[@rel="alternate" and @hreflang]',
    }
    return node.xpath(fixed[selector])


def set_meta(doc, selector: str, value: str | None) -> None:
    if not value:
        return
    nodes = select(doc, selector)
    if nodes:
        nodes[0].set("content", value)


def replace_text(doc, selector: str, value: str) -> None:
    nodes = select(doc, selector)
    if not nodes:
        return
    node = nodes[0]
    node.text = value
    for child in list(node):
        node.remove(child)


def normalized_text(value: str) -> str:
    return " ".join(value.split())


def set_text_node(node, value: str) -> None:
    parent = node.getparent()
    leading = str(node)[: len(str(node)) - len(str(node).lstrip())]
    trailing = str(node)[len(str(node).rstrip()) :]
    replacement = f"{leading}{value}{trailing}"
    if node.is_text:
        parent.text = replacement
    else:
        parent.tail = replacement


def translate_copy_in_place(copy, source_html: str, translated_html: str) -> None:
    """Keep the hand-crafted page layout and replace only matching text/alt content."""
    source = html.fragment_fromstring(source_html, create_parent="div")
    translated = html.fragment_fromstring(translated_html, create_parent="div")
    source_nodes = [node for node in source.xpath(".//text()") if normalized_text(str(node))]
    translated_nodes = [node for node in translated.xpath(".//text()") if normalized_text(str(node))]
    if len(source_nodes) != len(translated_nodes):
        raise ValueError(f"Sequência textual incompatível: {len(source_nodes)} != {len(translated_nodes)}")
    translations: dict[str, list[str]] = {}
    for source_node, translated_node in zip(source_nodes, translated_nodes):
        translations.setdefault(normalized_text(str(source_node)), []).append(normalized_text(str(translated_node)))
    used: dict[str, int] = {}
    for node in list(copy.xpath(".//text()")):
        key = normalized_text(str(node))
        values = translations.get(key)
        if not values:
            continue
        index = min(used.get(key, 0), len(values) - 1)
        set_text_node(node, values[index])
        used[key] = index + 1

    translated_images = {
        image.get("src"): image.get("alt", "")
        for image in translated.xpath(".//img[@src]")
    }
    for image in copy.xpath(".//img[@src]"):
        if image.get("src") in translated_images:
            image.set("alt", translated_images[image.get("src")])
        image.attrib.pop("width", None)
        image.attrib.pop("height", None)


def replace_link_list(section, items: list[str]) -> None:
    lists = section.xpath(".//ul")
    if not lists:
        return
    target = lists[0]
    links = target.xpath(".//a")
    for link, raw in zip(links, items):
        label, _, href = raw.partition(" | ")
        link.text = label
        if href:
            link.set("href", href.lower() if href.lower() != "future" else "futuro")


def localize_article_extras(doc, data: dict, locale_code: str) -> None:
    labels = UI.get(locale_code, {})
    cards = doc.xpath('.//section[contains(concat(" ", normalize-space(@class), " "), " article-side-card ")]')
    translated_headings = doc.xpath('.//*[contains(concat(" ", normalize-space(@class), " "), " article-copy ")]//h2')
    if cards and translated_headings:
        title = cards[0].xpath("./h2")
        if title and labels.get("in_article"):
            title[0].text = labels["in_article"]
        links = cards[0].xpath(".//a")
        for link, heading in zip(links, translated_headings):
            link.text = "".join(heading.itertext()).strip()
            if heading.get("id"):
                link.set("href", f"#{heading.get('id')}")
        if len(links) > len(translated_headings) and labels.get("explore"):
            links[-1].text = labels["explore"]
    if len(cards) > 1:
        title = cards[1].xpath("./h2")
        if title and labels.get("connections"):
            title[0].text = labels["connections"]
        replace_link_list(cards[1], [f"{item} | #" for item in data.get("relationships", [])])
    if len(cards) > 2:
        title = cards[2].xpath("./h2")
        if title and labels.get("library"):
            title[0].text = labels["library"]
        replace_link_list(cards[2], data.get("sidebar", {}).get("library", []))
    if len(cards) > 3:
        title = cards[3].xpath("./h2")
        if title and labels.get("explore"):
            title[0].text = labels["explore"]
        replace_link_list(cards[3], data.get("sidebar", {}).get("explore", []))
    related = doc.xpath('.//section[contains(concat(" ", normalize-space(@class), " "), " article-related ")]')
    if related:
        heading = related[0].xpath("./h2")
        if heading and labels.get("related"):
            heading[0].text = labels["related"]
        for link, label in zip(related[0].xpath(".//a"), data.get("relationships", [])):
            link.text = label

    if not labels:
        return
    byline = doc.xpath('.//*[contains(concat(" ", normalize-space(@class), " "), " article-byline ")]//strong')
    if byline:
        byline[0].text = labels["by"]
    for selector, key, symbol in [
        ('//*[@data-share-native]', "share", ""), ('//*[@data-reader-play]', "listen", "▶ "),
        ('//*[@data-reader-pause]', "pause", "⏸ "), ('//*[@data-reader-stop]', "stop", "■ "),
    ]:
        nodes = doc.xpath(selector)
        if nodes:
            for child in list(nodes[0]):
                nodes[0].remove(child)
            nodes[0].text = f"{symbol}{labels[key]}"
    speed = doc.xpath('//*[@data-reader-rate]/parent::*//span')
    if speed:
        speed[0].text = labels["speed"]
    reader = doc.xpath('//*[contains(concat(" ", normalize-space(@class), " "), " article-reader-status ")]')
    if reader:
        reader[0].text = labels["reader"]


def rewrite_relative_urls(doc, original_dir: str, localized_dir: str) -> None:
    base = f"https://atlas.local/{original_dir}/"
    for node in doc.xpath("//*[@src or @href]"):
        for attr in ("src", "href"):
            value = node.get(attr)
            if not value or re.match(r"^(?:[a-z]+:|#|//)", value, re.I):
                continue
            parsed = urlparse(urljoin(base, value))
            target = parsed.path.lstrip("/")
            relative = posixpath.relpath(target, localized_dir)
            node.set(attr, relative + (f"?{parsed.query}" if parsed.query else "") + (f"#{parsed.fragment}" if parsed.fragment else ""))


def publish(article_dir: Path, locale_code: str) -> Path:
    manifest_path = article_dir / "translations.json"
    manifest = read_json(manifest_path)
    entry = manifest["locales"].get(locale_code)
    if not entry:
        raise ValueError(f"Idioma ausente do manifesto: {locale_code}")
    data = read_json(article_dir / entry["source"])
    parser = html.HTMLParser(encoding="utf-8")
    doc = html.document_fromstring((article_dir / "index.html").read_bytes(), parser=parser)
    html_lang, direction, _, hreflang = LOCALES[locale_code]
    doc.set("lang", html_lang)
    doc.set("dir", direction)
    title_nodes = doc.xpath("//title")
    title_value = data.get("seo", {}).get("title") or data["title"]
    if title_nodes:
        title_nodes[0].text = title_value
    set_meta(doc, 'meta[name="description"]', data.get("seo", {}).get("description") or data.get("subtitle"))
    set_meta(doc, 'meta[property="og:title"]', title_value)
    set_meta(doc, 'meta[property="og:description"]', data.get("seo", {}).get("description") or data.get("subtitle"))
    set_meta(doc, 'meta[name="twitter:title"]', title_value)
    set_meta(doc, 'meta[name="twitter:description"]', data.get("seo", {}).get("description") or data.get("subtitle"))
    replace_text(doc, ".article-hero h1", data["title"])
    replace_text(doc, ".article-deck", data.get("subtitle", ""))
    replace_text(doc, ".article-kicker", data.get("home", {}).get("category") or data.get("category", ""))

    papers = select(doc, ".article-paper")
    if papers:
        papers[0].set("data-article-lang", html_lang)
    copies = select(doc, ".article-copy")
    if copies:
        original_data = read_json(article_dir / "data.json")
        translate_copy_in_place(copies[0], original_data["contentHtml"], data["contentHtml"])
    localize_article_extras(doc, data, locale_code)

    for old in select(doc, "#article-language-switcher"):
        old.getparent().remove(old)
    available = [
        code for code in LOCALES
        if code == "pt-br" or (
            manifest["locales"].get(code, {}).get("source")
            and (article_dir / manifest["locales"][code]["source"]).exists()
        )
    ]
    switcher = etree.Element("label", id="article-language-switcher", attrib={"class": "article-language-switcher"})
    etree.SubElement(switcher, "span").text = UI.get(locale_code, {}).get("language", "Language")
    select_node = etree.SubElement(switcher, "select", attrib={"aria-label": "Article language"})
    for code in available:
        option = etree.SubElement(select_node, "option", value="index.html" if code == "pt-br" else f"index-{code}.html", attrib={"data-locale": code})
        option.text = LOCALES[code][2]
        if code == locale_code:
            option.set("selected", "selected")
    headers = select(doc, ".header-content")
    if headers:
        headers[0].append(switcher)
    bodies = doc.xpath("//body")
    if bodies:
        etree.SubElement(bodies[0], "script", src="../../../assets/js/article-language-selector.js")

    slug = article_dir.name
    original_dir = f"modules/artigos/{slug}"
    localized_dir = original_dir
    rewrite_relative_urls(doc, original_dir, localized_dir)

    canonicals = select(doc, 'link[rel="canonical"]')
    current_canonical = canonicals[0].get("href") if canonicals else ""
    production_root = current_canonical.split("/modules/")[0] if "/modules/" in current_canonical else "https://mente-crua.surreal-marcosrg.workers.dev"
    canonical = canonicals[0] if canonicals else etree.SubElement(doc.xpath("//head")[0], "link")
    canonical.set("rel", "canonical")
    canonical.set("href", f"{production_root}/{original_dir}/index-{locale_code}.html")
    for alternate in select(doc, 'link[rel="alternate"][hreflang]'):
        alternate.getparent().remove(alternate)
    head = doc.xpath("//head")[0]
    for code in available:
        path = f"{original_dir}/" if code == "pt-br" else f"{original_dir}/index-{code}.html"
        etree.SubElement(head, "link", rel="alternate", hreflang=LOCALES[code][3], href=f"{production_root}/{path}")
    etree.SubElement(head, "link", rel="alternate", hreflang="x-default", href=f"{production_root}/{original_dir}/")

    output_path = article_dir / f"index-{locale_code}.html"
    rendered = "<!DOCTYPE html>\n" + html.tostring(doc, encoding="unicode", method="html")
    output_path.write_text(rendered, encoding="utf-8", newline="\n")
    entry["status"] = "published"
    entry["publishedAt"] = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    manifest["updatedAt"] = entry["publishedAt"]
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return output_path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("article", help="Article slug")
    parser.add_argument("locale", nargs="?", help="Locale code; omit to build every translation")
    args = parser.parse_args()
    article_dir = ROOT / "modules" / "artigos" / args.article
    manifest = read_json(article_dir / "translations.json")
    locales = [args.locale] if args.locale else [code for code in LOCALES if code != "pt-br" and manifest["locales"].get(code, {}).get("source")]
    for locale in locales:
        path = publish(article_dir, locale)
        print(path.relative_to(ROOT).as_posix())


if __name__ == "__main__":
    main()
