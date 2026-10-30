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
BUTTON_DOC = ROOT / "docs/components/button.md"
BUTTON_API_SOURCES = (
    ROOT / "src/Bluent.UI/Components/ButtonComponent/Button.razor.cs",
    ROOT / "src/Bluent.UI/Components/BluentUiComponentBase.cs",
    ROOT / "src/Bluent.Core/BluentComponentBase.cs",
)
PARAMETER_DECLARATION = re.compile(
    r"^\s*\[Parameter(?:\s*\([^\]]*\))?\]\s+public\s+.+?\s+([A-Za-z_]\w*)\s*\{\s*get;\s*set;\s*\}",
    re.M,
)
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


def validate_button_api_docs(body: str | None = None) -> list[str]:
    """Keep the Button parameter table aligned with its component/base-class API."""
    problems: list[str] = []
    if body is None:
        if not BUTTON_DOC.is_file():
            return [f"Missing Button component reference {BUTTON_DOC}"]
        body = BUTTON_DOC.read_text(encoding="utf-8")

    declared: set[str] = set()
    for source in BUTTON_API_SOURCES:
        if not source.is_file():
            problems.append(f"Missing Button API source {source.relative_to(ROOT)}")
            continue
        source_text = source.read_text(encoding="utf-8")
        declared.update(PARAMETER_DECLARATION.findall(source_text))

    start = body.find("## Parameters")
    end = body.find("## Events and binding", start + 1) if start >= 0 else -1
    if start < 0 or end < 0:
        return problems + ["Button reference must contain a Parameters table before Events and binding"]

    documented: set[str] = set()
    for line in body[start:end].splitlines():
        if not line.lstrip().startswith("|"):
            continue
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if len(cells) < 2 or cells[0].lower() in {"parameter", "---", ""}:
            continue
        first = cells[0]
        names = re.findall(r"`([A-Za-z_]\w*)`", first)
        if names:
            documented.update(names)
        elif first.casefold() == "unmatched attributes":
            documented.add("AdditionalAttributes")

    missing = sorted(declared - documented)
    extra = sorted(documented - declared)
    if missing:
        problems.append(f"Button API parameters missing from docs/components/button.md: {missing}")
    if extra:
        problems.append(f"Button docs list names not declared as [Parameter] in the Button/base classes: {extra}")
    if not problems:
        print(f"Button API docs: {len(declared)} declared parameters mapped to the reference table")
    return problems


PARAMETER_METADATA_DECLARATION = re.compile(
    r'^[ \t]*\[Parameter(?:[ \t]*\([^\]]*\))?\][ \t]*public[ \t]+'
    r'([\w?.<>, \r\n\t]+?)[ \t\r\n]+([A-Za-z_]\w*)[ \t]*'
    r'\{[ \t]*get;[ \t]*set;[ \t]*\}[ \t]*(?:=[ \t]*([^;\r\n]+);)?',
    re.M,
)


def validate_button_api_metadata_docs(body: str | None = None) -> list[str]:
    """Verify each documented Button parameter's C# type and default value."""
    problems: list[str] = []
    if body is None:
        if not BUTTON_DOC.is_file():
            return [f"Missing Button component reference {BUTTON_DOC}"]
        body = BUTTON_DOC.read_text(encoding="utf-8")

    metadata: dict[str, tuple[str, str]] = {}
    for source in BUTTON_API_SOURCES:
        if not source.is_file():
            problems.append(f"Missing Button API source {source.relative_to(ROOT)}")
            continue
        source_text = source.read_text(encoding="utf-8")
        for match in PARAMETER_METADATA_DECLARATION.finditer(source_text):
            type_name, name, initializer = match.groups()
            type_name = re.sub(r"\s+", "", type_name)
            if initializer:
                expression = initializer.strip()
                prefix = type_name.split("<", 1)[0] + "."
                default = expression[len(prefix):] if expression.startswith(prefix) else expression
            elif type_name.endswith("?"):
                default = "null"
            elif type_name == "bool":
                default = "false"
            elif type_name.startswith("EventCallback"):
                default = "empty"
            else:
                default = "default"
            metadata[name] = (type_name, default)

    start = body.find("## Parameters")
    end = body.find("## Events and binding", start + 1) if start >= 0 else -1
    if start < 0 or end < 0:
        return problems + ["Button reference must contain a Parameters table before Events and binding"]

    documented: set[str] = set()
    for line in body[start:end].splitlines():
        if not line.lstrip().startswith("|"):
            continue
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if len(cells) < 4 or cells[0].casefold() in {"parameter", "---", ""}:
            continue
        names = re.findall(chr(96) + r"([A-Za-z_]\w*)" + chr(96), cells[0])
        if not names and cells[0].casefold() == "unmatched attributes":
            names = ["AdditionalAttributes"]
        if not names:
            continue
        type_match = re.search(r"`([^`]+)`", cells[1])
        documented_type = re.sub(r"\s+", "", type_match.group(1)) if type_match else ""
        default_match = re.search(r"`([^`]+)`", cells[2])
        documented_default = default_match.group(1).strip() if default_match else cells[2].strip()
        for name in names:
            documented.add(name)
            actual = metadata.get(name)
            if actual is None:
                continue
            actual_type, actual_default = actual
            if not documented_type:
                problems.append(f"{name} is missing its C# type in docs/components/button.md")
            elif documented_type != actual_type:
                problems.append(
                    f"{name} type mismatch: docs={documented_type}, source={actual_type}"
                )
            if documented_default != actual_default:
                problems.append(
                    f"{name} default mismatch: docs={documented_default}, source={actual_default}"
                )

    missing = sorted(set(metadata) - documented)
    if missing:
        problems.append(f"Button API metadata missing from docs/components/button.md: {missing}")
    if not problems:
        print(f"Button API metadata: {len(metadata)} parameter types/defaults match the reference table")
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
    failures = (validate_inventory() + validate_canonical_docs() +
                validate_button_api_docs() + validate_button_api_metadata_docs())
    for failure in failures:
        print("FAIL: " + failure, file=sys.stderr)
    print(f"v3 docs contract: {'PASS' if not failures else 'FAIL'} ({len(failures)} findings)")
    raise SystemExit(1 if failures else 0)
