#!/usr/bin/env python3
"""Create smaller WebP copies of raster images referenced by site HTML."""

from __future__ import annotations

import re
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
IMAGE_SRC = re.compile(r'<img\b[^>]*\bsrc="([^"]+\.(?:jpe?g|png))"', re.I)
EXCLUDED = {"reals-logo.png"}


def referenced_images() -> set[Path]:
    paths: set[Path] = set()
    for page in ROOT.glob("*.html"):
        for src in IMAGE_SRC.findall(page.read_text(encoding="utf-8")):
            while src.startswith("../"):
                src = src[3:]
            path = ROOT / src
            if path.name not in EXCLUDED:
                paths.add(path)
    return paths


def main() -> None:
    for source in sorted(referenced_images()):
        target = source.with_suffix(".webp")
        if target.exists() and target.stat().st_mtime >= source.stat().st_mtime:
            print(f"keep {target.relative_to(ROOT)} ({target.stat().st_size} bytes)")
            continue
        with Image.open(source) as image:
            image.save(target, "WEBP", quality=88, method=6)
        if target.stat().st_size >= source.stat().st_size:
            target.unlink()
            print(f"skip {source.relative_to(ROOT)} (WebP was not smaller)")
            continue
        print(
            f"write {target.relative_to(ROOT)}: "
            f"{source.stat().st_size} -> {target.stat().st_size} bytes"
        )

    updated_references = 0
    for page in sorted(ROOT.glob("*.html")):
        original = page.read_text(encoding="utf-8")

        def use_webp(match: re.Match[str]) -> str:
            nonlocal updated_references
            src = match.group(1)
            normalized = src
            while normalized.startswith("../"):
                normalized = normalized[3:]
            target = (ROOT / normalized).with_suffix(".webp")
            if not target.exists():
                return match.group(0)
            updated_references += 1
            return match.group(0).replace(src, str(Path(src).with_suffix(".webp")))

        updated = IMAGE_SRC.sub(use_webp, original)
        if updated != original:
            page.write_text(updated, encoding="utf-8")
    print(f"updated HTML image references: {updated_references}")


if __name__ == "__main__":
    main()
