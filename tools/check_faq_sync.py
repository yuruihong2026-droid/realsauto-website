#!/usr/bin/env python3
"""Verify that FAQPage JSON-LD exactly matches each visible product FAQ."""

from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PAGES = (
    "automotive-fleece-tape.html",
    "polyester-fabric-tape.html",
    "pvc-wire-harness-tape.html",
    "aluminum-foil-fiberglass-tape.html",
    "automotive-cable-clips-ties.html",
    "expandable-braided-sleeving.html",
)


def text_content(fragment: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", fragment)).strip()


def visible_faqs(source: str) -> list[tuple[str, str]]:
    match = re.search(
        r'<p class="kicker">FAQ</p>.*?'
        r'<div class="app-list"[^>]*>(.*?)</div>\s*</section>',
        source,
        re.DOTALL,
    )
    if not match:
        raise ValueError("visible FAQ section not found")
    return [
        (text_content(question), text_content(answer))
        for question, answer in re.findall(
            r"<strong>(.*?)</strong><p[^>]*>(.*?)</p>", match.group(1), re.DOTALL
        )
    ]


def jsonld_faqs(source: str) -> list[tuple[str, str]]:
    for raw in re.findall(
        r'<script type="application/ld\+json">(.*?)</script>', source, re.DOTALL
    ):
        data = json.loads(raw)
        if data.get("@type") == "FAQPage":
            return [
                (item["name"], item["acceptedAnswer"]["text"])
                for item in data.get("mainEntity", [])
            ]
    raise ValueError("FAQPage JSON-LD not found")


def main() -> int:
    failed = False
    for name in PAGES:
        source = (ROOT / name).read_text(encoding="utf-8")
        structured = jsonld_faqs(source)
        visible = visible_faqs(source)
        matches = sum(left == right for left, right in zip(structured, visible))
        synced = structured == visible
        print(
            f"{name}: JSON-LD {len(structured)} vs visible {len(visible)} "
            f"vs identical {matches} — {'PASS' if synced else 'FAIL'}"
        )
        failed |= not synced
    return int(failed)


if __name__ == "__main__":
    sys.exit(main())
