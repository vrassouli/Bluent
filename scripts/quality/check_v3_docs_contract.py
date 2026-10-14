#!/usr/bin/env python3
"""#422: prevent inventory-summary drift and invalid v3 canonical docs links.

Uses only Python stdlib; validates existing *retrieval families*, not completed
v3 implementations or final component API / Fluent parity.
"""
from __future__ import annotations

from collections import Counter
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[2]
INVENTORY = ROOT / "docs/components/inventory.md"
INDEX = ROOT / "docs/v3/README.md"
TEMPLATE = ROOT / "docs/v3/COMPONENT-REFERENCE-TEMPLATE.md"
SECTIONS = {
    "Main UI package": "Bluent.UI",
    "Charts package": "Bluent.UI.Charts",
    "Diagrams package": "Bluent.UI.Diagrams",
    "Utilities package": "Bluent.UI.Utilities",
}
EXPECTED_BASELINE = dict(zip(SECTIONS.values(), (58, 2, 2, 4)))
LINK = re.compile(r"(?<!!)\[[^\]]+\]\(([^)]+)\)")
SUMMARY = re.compile(r"^\| `(Bluent\.UI(?:\.Charts|\.Diagrams|\.Utilities)?)` \| (\d+) \| (\d+) \| (\d+) \|$")
TOTAL = re.compile(r"^\| \*\*Total\*\* \| \*\*(\d+)\*\* \| \*\*(\d+)\*\* \| \*\*(\d+)\*\* \|$")


def validate_inventory(lines: list[str] | None = None) -> list[str]:
    if lines is None:
        lines = INVENTORY.read_text(encoding="utf-8").splitlines()
    current = ""
    counts: Counter[str] = Counter()
    source_verified: Counter[str] = Counter()
    runtime_verified: Counter[str] = Counter()
    summary: dict[str, tuple[int, int, int]] = {}
    summary_total: tuple[int, int, int] | None = None
    problems: list[str] = []
    for line in lines:
        if line.startswith("## "):
            current = line[3:].strip()
            continue
        if current in SECTIONS and line.startswith("| ["):
            package = SECTIONS[current]
            counts[package] += 1
            if "Source verified" in line or "Runtime verified" in line:
                source_verified[package] += 1
            if "Runtime verified" in line:
                runtime_verified[package] += 1
            match = LINK.search(line)
            if match:
                target = (INVENTORY.parent / match.group(1).split("#", 1)[0]).resolve()
                if not target.is_file():
                    problems.append(f"Missing component reference {package}: {match.group(1)}")
        if current == "Coverage summary":
            if m := SUMMARY.match(line):
                summary[m.group(1)] = tuple(int(x) for x in m.groups()[1:])
            if m := TOTAL.match(line):
                summary_total = tuple(int(x) for x in m.groups())
    for package, expected in EXPECTED_BASELINE.items():
        found = counts[package]
        if found != expected:
            problems.append(f"{package}: baseline has {found} rows instead of expected {expected}; revisit #416 inventory")
        actual = (found, source_verified[package], runtime_verified[package])
        if summary.get(package) != actual:
            problems.append(f"{package}: summary {summary.get(package)} does not match inventory {actual}")
    expected_total = (sum(counts.values()), sum(source_verified.values()), sum(runtime_verified.values()))
    if summary_total != expected_total:
        problems.append(f"Total summary {summary_total} != actual {expected_total}")
    if "All 66 currently tracked" not in "\n".join(lines):
        problems.append("Inventory prose total still stale (expected 66 retrieval families)")
    print(f"inventory: {dict(counts)} / summary {summary_total}")
    return problems


def validate_canonical_docs() -> list[str]:
    problems = []
    for source in (INDEX, TEMPLATE):
        if not source.is_file():
            problems.append(f"Missing canonical v3 doc {source}")
            continue
        body = source.read_text(encoding="utf-8")
        for match in LINK.finditer(body):
            target = match.group(1).strip()
            if target.startswith(("http:", "https:", "mailto:", "#")):
                continue
            destination = (source.parent / target.split("#", 1)[0]).resolve()
            if not destination.is_file():
                problems.append(f"{source.relative_to(ROOT)} missing relative link: {target}")
        if "not a released" not in body.lower() and "not a supported" not in body.lower():
            problems.append(f"{source.relative_to(ROOT)} must explicitly separate v3 drafts from shipped APIs")
    return problems


if __name__ == "__main__":
    failures = validate_inventory() + validate_canonical_docs()
    for failure in failures:
        print("FAIL: " + failure, file=sys.stderr)
    print(f"v3 docs contract: {'PASS' if not failures else 'FAIL'} ({len(failures)} findings)")
    raise SystemExit(1 if failures else 0)
