#!/usr/bin/env python3
"""Check REALS/Lanyu entity and certification attribution across site pages."""

from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
LANYU = "Tianjin Lanyu Zongheng Technology Co., Ltd."


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self._hidden_depth = 0
        self._json_depth = 0
        self._json_parts: list[str] = []
        self.visible_parts: list[str] = []
        self.json_documents: list[dict[str, Any]] = []
        self.meta_description = ""

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        if tag == "meta" and attributes.get("name", "").lower() == "description":
            self.meta_description = attributes.get("content") or ""
        if tag in {"style", "noscript"}:
            self._hidden_depth += 1
        elif tag == "script":
            self._hidden_depth += 1
            if attributes.get("type") == "application/ld+json":
                self._json_depth = 1
                self._json_parts = []

    def handle_data(self, data: str) -> None:
        if self._json_depth:
            self._json_parts.append(data)
        elif not self._hidden_depth:
            self.visible_parts.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag == "script" and self._json_depth:
            document = json.loads("".join(self._json_parts))
            if isinstance(document, dict):
                self.json_documents.append(document)
            self._json_depth = 0
        if tag in {"script", "style", "noscript"} and self._hidden_depth:
            self._hidden_depth -= 1


def walk_json(value: Any):
    if isinstance(value, dict):
        yield value
        for child in value.values():
            yield from walk_json(child)
    elif isinstance(value, list):
        for child in value:
            yield from walk_json(child)


def has_unattributed_iatf_claim(text: str) -> bool:
    normalized = " ".join(text.split())
    prohibited = (
        r"IATF(?:\s*16949(?::2016)?)?[ -]certified manufacturer",
        r"REALS\s+(?:is|are|has|holds|operates)[^.]{0,100}IATF",
        r"IATF[^.]{0,100}[ -]certified[^.]{0,80}(?:REALS|our company)",
        r"(?:our|REALS(?:'s)?)\s+(?:own\s+)?(?:IATF[^.]{0,50})?(?:factory|facilities)",
    )
    return any(re.search(pattern, normalized, re.IGNORECASE) for pattern in prohibited)


def product_manufacturer_status(documents: list[dict[str, Any]]) -> str:
    products = [node for doc in documents for node in walk_json(doc) if node.get("@type") == "Product"]
    if not products:
        return "无需"
    valid = all(
        isinstance(product.get("manufacturer"), dict)
        and product["manufacturer"].get("@type") == "Organization"
        and product["manufacturer"].get("name") == LANYU
        for product in products
    )
    return "是" if valid else "否"


def has_sales_relationship(visible_text: str, documents: list[dict[str, Any]]) -> bool:
    combined = " ".join(visible_text.split())
    visible_match = re.search(
        rf"REALS is the (?:international|overseas) sales company of {re.escape(LANYU)}",
        combined,
        re.IGNORECASE,
    )
    if visible_match:
        return True
    for document in documents:
        for node in walk_json(document):
            if node.get("@type") != "Organization" or node.get("name") != "REALS":
                continue
            parent = node.get("parentOrganization")
            if isinstance(parent, dict) and parent.get("name") == LANYU:
                return True
    return False


def main() -> int:
    pages = sorted(ROOT.glob("*.html"))
    failures: list[str] = []
    rows: list[tuple[str, str, str, str]] = []

    if len(pages) != 12:
        failures.append(f"expected 12 HTML pages, found {len(pages)}")

    for page in pages:
        parser = PageParser()
        try:
            parser.feed(page.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError) as exc:
            failures.append(f"{page.name}: parse error: {exc}")
            continue

        visible = " ".join(parser.visible_parts)
        searchable = f"{parser.meta_description} {visible}"
        unattributed = has_unattributed_iatf_claim(searchable)
        manufacturer = product_manufacturer_status(parser.json_documents)
        sales_relation = has_sales_relationship(visible, parser.json_documents)
        rows.append((page.name, "是" if unattributed else "否", manufacturer, "是" if sales_relation else "否"))

        if unattributed:
            failures.append(f"{page.name}: unattributed IATF or owned-factory claim")
        if manufacturer == "否":
            failures.append(f"{page.name}: Product manufacturer is not {LANYU}")
    headers = ("页面", "是否出现未归属的 IATF 声明", "是否有 manufacturer 正确归属", "是否有 REALS=销售公司 表述")
    widths = [max(len(headers[i]), *(len(row[i]) for row in rows)) for i in range(4)]
    print(" | ".join(headers[i].ljust(widths[i]) for i in range(4)))
    print("-|-".join("-" * width for width in widths))
    for row in rows:
        print(" | ".join(row[i].ljust(widths[i]) for i in range(4)))

    if failures:
        print("\nFAIL", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        return 1
    print("\nPASS: entity attribution checks passed for all 12 pages.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
