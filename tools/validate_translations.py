import argparse
import html
import json
import re
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parents[1]
TAG_RE = re.compile(r"</?([a-zA-Z0-9:-]+)\b[^>]*>")
IMG_RE = re.compile(r'<img\b[^>]*\bsrc=["\']([^"\']+)["\']', re.I)
LINK_RE = re.compile(r'<a\b[^>]*\bhref=["\']([^"\']+)["\']', re.I)
PT_MARKERS = re.compile(r"\b(que|não|uma|para|como|também|quando|porque|criança|medo|artigo|história)\b", re.I)


def tags(source):
    return TAG_RE.findall(source)


def validate(source, translated, locale):
    errors, warnings = [], []
    source_html = source.get("contentHtml", "")
    target_html = translated.get("contentHtml", "")
    if not translated.get("title", "").strip(): errors.append("título vazio")
    if not translated.get("subtitle", "").strip(): errors.append("subtítulo vazio")
    if len(target_html) < 500: errors.append("conteúdo ausente ou curto")
    if tags(source_html) != tags(target_html): errors.append("sequência de tags HTML alterada")
    if IMG_RE.findall(source_html) != IMG_RE.findall(target_html): errors.append("imagens ou caminhos alterados")
    if LINK_RE.findall(source_html) != LINK_RE.findall(target_html): errors.append("links alterados")
    if "MCSEP" in target_html: errors.append("marcador interno de tradução presente")
    if locale not in {"pt-pt"}:
        plain = re.sub(r"<[^>]+>", " ", html.unescape(target_html))
        marker_count = len(PT_MARKERS.findall(plain))
        if marker_count > 12: warnings.append(f"possíveis trechos em português: {marker_count}")
    ratio = len(target_html) / max(1, len(source_html))
    minimum_ratio = .35 if locale in {"zh-cn", "ja-jp", "ko-kr"} else .55
    if ratio < minimum_ratio or ratio > 2.6: errors.append(f"variação de tamanho anormal: {ratio:.2f}")
    return errors, warnings, ratio


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("article")
    args = parser.parse_args()
    article_dir = ROOT / "modules" / "artigos" / args.article
    source = json.loads((article_dir / "data.json").read_text(encoding="utf-8"))
    manifest_path = article_dir / "translations.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    report = {"article": args.article, "passed": [], "failed": {}}
    for path in sorted((article_dir / "translations").glob("*.json")):
        locale = path.stem
        translated = json.loads(path.read_text(encoding="utf-8"))
        errors, warnings, ratio = validate(source, translated, locale)
        item = {"errors": errors, "warnings": warnings, "ratio": round(ratio, 3), "title": translated.get("title", "")}
        if errors:
            report["failed"][locale] = item
            manifest["locales"][locale]["status"] = "error"
            manifest["locales"][locale]["validation"] = item
        else:
            report["passed"].append(locale)
            current_status = manifest["locales"][locale].get("status")
            if current_status not in {"reviewed", "published"}:
                manifest["locales"][locale]["status"] = "translated"
            manifest["locales"][locale]["validation"] = item
        print(f"{locale}: {'ERRO' if errors else 'OK'} | {translated.get('title', '')}")
        for message in errors + warnings:
            print(f"  - {message}")
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    report_path = article_dir / "translation-validation.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"PASSARAM={len(report['passed'])} FALHARAM={len(report['failed'])}")


if __name__ == "__main__":
    main()
