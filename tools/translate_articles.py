import argparse
import copy
import html
import json
import re
import time
import urllib.parse
import urllib.request
import urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARTICLE_SLUGS = [
    "durma-ou-alguma-coisa-vira-buscar-voce",
    "a-pequena-sereia-o-conto-em-que-o-amor-nao-salva-ninguem",
]
TARGETS = {
    "pt-pt": "pt-pt", "en-gb": "en", "es-es": "es", "fr-fr": "fr",
    "de-de": "de", "it-it": "it", "ru-ru": "ru", "ar": "ar",
    "hi-in": "hi", "ja-jp": "ja", "ko-kr": "ko", "zh-cn": "zh-Hans",
}
COPIES = {"es-latam": "es-es", "ar-eg": "ar"}
TEXT_KEYS = {"title", "subtitle", "description", "category"}
ATTR_RE = re.compile(r'\b(alt|title|aria-label)=("([^"]*)"|\'([^\']*)\')', re.I)
TAG_SPLIT_RE = re.compile(r"(<[^>]+>)")


def microsoft_token():
    request = urllib.request.Request(
        "https://edge.microsoft.com/translate/auth",
        headers={"User-Agent": "Mozilla/5.0"},
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read().decode("utf-8")


def microsoft_translate(values, target, token, attempts=4, text_type="plain"):
    body = json.dumps([{"Text": value} for value in values], ensure_ascii=False).encode("utf-8")
    url = "https://api-edge.cognitive.microsofttranslator.com/translate?" + urllib.parse.urlencode({
        "api-version": "3.0", "from": "pt", "to": target, "textType": text_type
    })
    request = urllib.request.Request(url, data=body, headers={
        "Authorization": f"Bearer {token}", "Content-Type": "application/json; charset=UTF-8",
        "User-Agent": "Mozilla/5.0",
    })
    for attempt in range(attempts):
        try:
            with urllib.request.urlopen(request, timeout=45) as response:
                result = json.loads(response.read().decode("utf-8"))
            return [item["translations"][0]["text"] for item in result]
        except Exception as error:
            if attempt == attempts - 1:
                raise
            is_rate_limit = isinstance(error, urllib.error.HTTPError) and error.code == 429
            time.sleep((15 if is_rate_limit else 2) * (attempt + 1))


def translate_many(values, target):
    values = list(dict.fromkeys(value for value in values if isinstance(value, str) and value.strip()))
    translated = {}
    batches, current, length = [], [], 0
    for value in values:
        if current and (length + len(value) > 30000 or len(current) >= 80):
            batches.append(current)
            current, length = [], 0
        current.append(value)
        length += len(value)
    if current:
        batches.append(current)
    token = microsoft_token()
    for batch in batches:
        pieces = microsoft_translate(batch, target, token)
        translated.update(zip(batch, (piece.strip() for piece in pieces)))
        time.sleep(.35)
    return translated


def collect_html_strings(source):
    values = []
    for part in TAG_SPLIT_RE.split(source):
        if not part:
            continue
        if part.startswith("<"):
            for match in ATTR_RE.finditer(part):
                value = match.group(3) if match.group(3) is not None else match.group(4)
                if value.strip():
                    values.append(re.sub(r"\s+", " ", html.unescape(value)).strip())
        elif part.strip():
            values.append(re.sub(r"\s+", " ", html.unescape(part)).strip())
    return values


def collect_html_attribute_strings(source):
    values = []
    for match in ATTR_RE.finditer(source):
        value = match.group(3) if match.group(3) is not None else match.group(4)
        if value.strip():
            values.append(re.sub(r"\s+", " ", html.unescape(value)).strip())
    return values


def translate_html(source, translations):
    def translate_tag(match):
        tag = match.group(0)
        def attr_replace(attr_match):
            quote = '"' if attr_match.group(3) is not None else "'"
            value = attr_match.group(3) if attr_match.group(3) is not None else attr_match.group(4)
            replacement = translations.get(html.unescape(value), html.unescape(value))
            return f"{attr_match.group(1)}={quote}{html.escape(replacement, quote=True)}{quote}"
        return ATTR_RE.sub(attr_replace, tag)

    output = []
    for part in TAG_SPLIT_RE.split(source):
        if not part:
            continue
        if part.startswith("<"):
            output.append(translate_tag(re.match(r".*", part, re.S)))
        elif part.strip():
            leading = part[:len(part) - len(part.lstrip())]
            trailing = part[len(part.rstrip()):]
            value = re.sub(r"\s+", " ", html.unescape(part)).strip()
            output.append(leading + html.escape(translations.get(value, value), quote=False) + trailing)
        else:
            output.append(part)
    return "".join(output)


def collect_metadata_strings(data):
    values = []
    for key in ("title", "subtitle"):
        if data.get(key): values.append(data[key])
    for value in data.get("tags", []): values.append(value)
    for section in ("home", "seo"):
        for key in TEXT_KEYS:
            if data.get(section, {}).get(key): values.append(data[section][key])
    for value in data.get("relationships", []): values.append(value)
    for section in ("library", "explore"):
        for value in data.get("sidebar", {}).get(section, []): values.append(value)
    return values


def translate_metadata(data, translations, locale):
    result = copy.deepcopy(data)
    for key in ("title", "subtitle"):
        if result.get(key): result[key] = translations.get(result[key], result[key])
    result["tags"] = [translations.get(value, value) for value in result.get("tags", [])]
    for section in ("home", "seo"):
        for key in TEXT_KEYS:
            value = result.get(section, {}).get(key)
            if value: result[section][key] = translations.get(value, value)
    result["relationships"] = [translations.get(value, value) for value in result.get("relationships", [])]
    for section in ("library", "explore"):
        values = result.get("sidebar", {}).get(section, [])
        result["sidebar"][section] = [translations.get(value, value) for value in values]
    result["language"] = locale
    result["translationOf"] = data["slug"]
    result["status"] = "draft"
    result["updatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    return result


def translate_article(article_dir, locale, target):
    data = json.loads((article_dir / "data.json").read_text(encoding="utf-8"))
    strings = collect_metadata_strings(data) + collect_html_attribute_strings(data["contentHtml"])
    translations = translate_many(strings, target)
    result = translate_metadata(data, translations, locale)
    token = microsoft_token()
    translated_html = microsoft_translate(
        [data["contentHtml"]], target, token, text_type="html"
    )[0]
    result["contentHtml"] = translate_html(translated_html, translations)
    output_dir = article_dir / "translations"
    output_dir.mkdir(exist_ok=True)
    (output_dir / f"{locale}.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    return len(strings)


def copy_locale(article_dir, destination, source):
    data = json.loads((article_dir / "translations" / f"{source}.json").read_text(encoding="utf-8"))
    data["language"] = destination
    data["updatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    (article_dir / "translations" / f"{destination}.json").write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def update_manifest(article_dir, generated_locales):
    path = article_dir / "translations.json"
    manifest = json.loads(path.read_text(encoding="utf-8"))
    for locale in generated_locales:
        if (article_dir / "translations" / f"{locale}.json").exists():
            manifest["locales"][locale]["status"] = "translated"
            manifest["locales"][locale]["updatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    manifest["updatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--article", choices=ARTICLE_SLUGS)
    parser.add_argument("--locale", choices=list(TARGETS))
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    slugs = [args.article] if args.article else ARTICLE_SLUGS
    for slug in slugs:
        article_dir = ROOT / "modules" / "artigos" / slug
        selected_targets = {args.locale: TARGETS[args.locale]} if args.locale else TARGETS
        for locale, target in selected_targets.items():
            output = article_dir / "translations" / f"{locale}.json"
            if output.exists() and not args.force:
                print(f"{slug}: {locale} já existe; pulando", flush=True)
                continue
            count = translate_article(article_dir, locale, target)
            print(f"{slug}: {locale} ({count} blocos)", flush=True)
        for destination, source in COPIES.items() if not args.locale else []:
            copy_locale(article_dir, destination, source)
            print(f"{slug}: {destination} baseado em {source}", flush=True)
        generated = list(selected_targets)
        if not args.locale:
            generated.extend(COPIES)
        update_manifest(article_dir, generated)
        print(f"{slug}: manifesto atualizado", flush=True)


if __name__ == "__main__":
    main()
