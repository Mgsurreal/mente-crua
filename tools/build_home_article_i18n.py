"""Build the small home-card locale bundle from article translation metadata."""

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SLUGS = [
    "a-pequena-sereia-o-conto-em-que-o-amor-nao-salva-ninguem",
    "durma-ou-alguma-coisa-vira-buscar-voce",
]
QUOTES = {
    "pt-br": ["Não rir, não lamentar, nem detestar, mas compreender.", "Spinoza"],
    "en-gb": ["Not to laugh, not to lament, nor to hate, but to understand.", "Spinoza"],
    "es-es": ["No reír, no lamentar ni detestar, sino comprender.", "Spinoza"],
}


def main() -> None:
    bundle = {locale: {"quote": quote, "articles": {}} for locale, quote in QUOTES.items()}
    for slug in SLUGS:
        article = ROOT / "modules" / "artigos" / slug
        original = json.loads((article / "data.json").read_text(encoding="utf-8"))
        bundle["pt-br"]["articles"][slug] = {
            "title": original["home"]["title"],
            "description": original["home"]["description"],
            "category": original["home"]["category"],
        }
        for path in (article / "translations").glob("*.json"):
            locale = path.stem
            if locale not in bundle:
                continue
            data = json.loads(path.read_text(encoding="utf-8"))
            bundle[locale]["articles"][slug] = {
                "title": data["home"]["title"],
                "description": data["home"]["description"],
                "category": data["home"]["category"],
            }
    output = "window.MenteCruaHomeContentI18n = " + json.dumps(bundle, ensure_ascii=False, separators=(",", ":")) + ";\n"
    (ROOT / "assets" / "js" / "home-content-i18n.js").write_text(output, encoding="utf-8")
    print("assets/js/home-content-i18n.js")


if __name__ == "__main__":
    main()
