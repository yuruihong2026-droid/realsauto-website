#!/usr/bin/env python3
"""Add intrinsic width and height to local HTML image tags using Pillow."""

from __future__ import annotations

import re
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
IMG_TAG = re.compile(r"<img\b[^>]*>")
SRC = re.compile(r'\bsrc="([^"]+)"')


def local_image(src: str) -> Path:
    while src.startswith("../"):
        src = src[3:]
    return ROOT / src.split("?", 1)[0].split("#", 1)[0]


def add_dimensions(tag: str) -> str:
    source = SRC.search(tag)
    if not source or source.group(1).startswith(("http://", "https://", "data:")):
        return tag
    path = local_image(source.group(1))
    if not path.is_file():
        raise FileNotFoundError(f"image referenced by HTML does not exist: {path}")
    with Image.open(path) as image:
        width, height = image.size
    tag = re.sub(r'\s+width="[^"]*"', "", tag)
    tag = re.sub(r'\s+height="[^"]*"', "", tag)
    return tag[:-1] + f' width="{width}" height="{height}">'


def main() -> None:
    changed_tags = 0
    for page in sorted(ROOT.glob("*.html")):
        source = page.read_text(encoding="utf-8")

        def replace(match: re.Match[str]) -> str:
            nonlocal changed_tags
            old = match.group(0)
            new = add_dimensions(old)
            changed_tags += old != new
            return new

        updated = IMG_TAG.sub(replace, source)
        if updated != source:
            page.write_text(updated, encoding="utf-8")
    print(f"updated image tags: {changed_tags}")


if __name__ == "__main__":
    main()
