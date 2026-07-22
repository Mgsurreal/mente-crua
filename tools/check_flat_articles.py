"""Check generated flat locale article pages for broken local references."""

from pathlib import Path
from urllib.parse import urlparse

from lxml import html


ROOT = Path(__file__).resolve().parents[1]
ARTICLES = [
    ROOT / "modules" / "artigos" / "durma-ou-alguma-coisa-vira-buscar-voce",
    ROOT / "modules" / "artigos" / "a-pequena-sereia-o-conto-em-que-o-amor-nao-salva-ninguem",
]


def check_page(path: Path) -> list[str]:
    errors = []
    doc = html.parse(str(path))
    root = doc.getroot()
    original = html.parse(str(path.parent / "index.html"))
    copy_xpath = '//*[contains(concat(" ", normalize-space(@class), " "), " article-copy ")]'
    localized_copy = doc.xpath(copy_xpath)
    original_copy = original.xpath(copy_xpath)
    if localized_copy and original_copy:
        signature = lambda node: [(item.tag, item.get("class", "")) for item in node.iter()]
        if signature(localized_copy[0]) != signature(original_copy[0]):
            errors.append("estrutura editorial difere do original")
    locale = path.stem.removeprefix("index-")
    expected_dir = "rtl" if locale in {"ar", "ar-eg"} else "ltr"
    if root.get("dir") != expected_dir:
        errors.append(f"dir={root.get('dir')} (esperado {expected_dir})")
    options = doc.xpath('//*[@id="article-language-switcher"]//option')
    if len(options) != 15:
        errors.append(f"seletor tem {len(options)} opções")
    selected = doc.xpath('//*[@id="article-language-switcher"]//option[@selected]/@data-locale')
    if selected != [locale]:
        errors.append(f"seleção atual incorreta: {selected}")
    ids = set(doc.xpath('//*[@id]/@id'))
    for href in doc.xpath('//a[starts-with(@href,"#")]/@href'):
        if len(href) > 1 and href[1:] not in ids:
            errors.append(f"âncora ausente: {href}")
    for value in doc.xpath('//*[@src]/@src | //link[@href]/@href'):
        parsed = urlparse(value)
        if parsed.scheme or value.startswith(("#", "//")):
            continue
        local = value.split("?", 1)[0].split("#", 1)[0]
        if local and not (path.parent / local).resolve().exists():
            errors.append(f"arquivo ausente: {value}")
    return sorted(set(errors))


def main() -> None:
    failed = 0
    total = 0
    for article in ARTICLES:
        for path in sorted(article.glob("index-*.html")):
            total += 1
            errors = check_page(path)
            if errors:
                failed += 1
                print(f"ERRO {path.relative_to(ROOT).as_posix()}")
                for error in errors:
                    print(f"  - {error}")
            else:
                print(f"OK {path.relative_to(ROOT).as_posix()}")
    print(f"ARQUIVOS={total} FALHAS={failed}")
    raise SystemExit(1 if failed else 0)


if __name__ == "__main__":
    main()
