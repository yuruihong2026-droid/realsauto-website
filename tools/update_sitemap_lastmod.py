#!/usr/bin/env python3
"""Update sitemap lastmod values from each page's real modification date."""

from __future__ import annotations

import argparse
import re
import subprocess
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SITEMAP = ROOT / "sitemap.xml"
SITE = "https://www.realsauto.com/"


def last_modified(page: Path) -> str:
    relative = page.relative_to(ROOT)
    dirty = subprocess.run(
        ["git", "status", "--porcelain", "--", str(relative)],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    ).stdout.strip()
    if dirty:
        return datetime.fromtimestamp(page.stat().st_mtime).date().isoformat()
    committed = subprocess.run(
        ["git", "log", "-1", "--format=%cs", "--", str(relative)],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    ).stdout.strip()
    if committed:
        return committed
    return datetime.fromtimestamp(page.stat().st_mtime).date().isoformat()


def page_for_url(url: str) -> Path:
    route = url.removeprefix(SITE)
    return ROOT / (route or "index.html")


def generated_sitemap() -> str:
    source = SITEMAP.read_text(encoding="utf-8")

    def update(match: re.Match[str]) -> str:
        block = match.group(0)
        url_match = re.search(r"<loc>(.*?)</loc>", block)
        if not url_match:
            return block
        page = page_for_url(url_match.group(1))
        if not page.is_file():
            raise FileNotFoundError(f"sitemap URL has no local page: {page}")
        date = last_modified(page)
        return re.sub(r"<lastmod>.*?</lastmod>", f"<lastmod>{date}</lastmod>", block)

    return re.sub(r"  <url>.*?  </url>", update, source, flags=re.DOTALL)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    generated = generated_sitemap()
    current = SITEMAP.read_text(encoding="utf-8")
    if args.check:
        if generated != current:
            print("sitemap.xml is stale; run tools/update_sitemap_lastmod.py")
            return 1
        print("sitemap.xml lastmod values are current")
        return 0
    SITEMAP.write_text(generated, encoding="utf-8")
    print("updated sitemap.xml lastmod values")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
