#!/usr/bin/env python3
"""Focused rendered-markup checks; this is not a WCAG conformance audit."""

from collections import Counter
from html.parser import HTMLParser
import sys
import urllib.request


class MarkupParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: list[str] = []
        self.labels_for: set[str] = set()
        self.inputs: list[dict[str, str]] = []
        self.controls: list[tuple[str, dict[str, str], list[str]]] = []
        self.h1_count = 0
        self.main_count = 0
        self.lang = ""
        self._control_stack: list[tuple[str, dict[str, str], list[str]]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = {name: value or "" for name, value in attrs}
        if "id" in attributes:
            self.ids.append(attributes["id"])
        if tag == "html":
            self.lang = attributes.get("lang", "")
        elif tag == "main":
            self.main_count += 1
        elif tag == "h1":
            self.h1_count += 1
        elif tag == "label" and attributes.get("for"):
            self.labels_for.add(attributes["for"])
        elif tag in {"input", "select", "textarea"}:
            if attributes.get("type") != "hidden":
                self.inputs.append(attributes)
        elif tag in {"button", "a"}:
            item = (tag, attributes, [])
            self.controls.append(item)
            self._control_stack.append(item)

    def handle_endtag(self, tag: str) -> None:
        if self._control_stack and self._control_stack[-1][0] == tag:
            self._control_stack.pop()

    def handle_data(self, data: str) -> None:
        for _, _, chunks in self._control_stack:
            chunks.append(data)


def check_url(url: str) -> list[str]:
    with urllib.request.urlopen(url, timeout=30) as response:
        if response.status != 200:
            return [f"{url}: HTTP {response.status}"]
        html = response.read().decode("utf-8")
    parser = MarkupParser()
    parser.feed(html)
    failures: list[str] = []
    if not parser.lang:
        failures.append(f"{url}: html element has no lang attribute")
    if parser.main_count != 1:
        failures.append(f"{url}: expected one main landmark, found {parser.main_count}")
    if parser.h1_count != 1:
        failures.append(f"{url}: expected one h1, found {parser.h1_count}")
    duplicates = sorted(item for item, count in Counter(parser.ids).items() if count > 1)
    if duplicates:
        failures.append(f"{url}: duplicate IDs: {', '.join(duplicates)}")
    for attributes in parser.inputs:
        control_id = attributes.get("id", "")
        if (
            not attributes.get("aria-label")
            and not attributes.get("aria-labelledby")
            and control_id not in parser.labels_for
        ):
            failures.append(f"{url}: unlabeled form control with id '{control_id}'")
    for tag, attributes, chunks in parser.controls:
        text = "".join(chunks).strip()
        if not text and not attributes.get("aria-label") and not attributes.get("title"):
            failures.append(f"{url}: unnamed {tag} control")
    return failures


def main() -> int:
    base_url = sys.argv[1].rstrip("/")
    routes = (
        "/compatibility/static",
        "/compatibility/server",
        "/compatibility/webassembly",
        "/compatibility/auto",
    )
    failures = [
        failure
        for route in routes
        for failure in check_url(f"{base_url}{route}")
    ]
    if failures:
        print("\n".join(failures), file=sys.stderr)
        return 1
    print(
        "Focused accessibility smoke checks passed for four compatibility "
        "routes (not a WCAG conformance claim)."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
