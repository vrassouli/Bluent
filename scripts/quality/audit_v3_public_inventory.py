#!/usr/bin/env python3
"""#494: source-derived v3 component CANDIDATE census (not runtime/public API proof).

Python stdlib only. The generated JSON is a review queue, not a release-ready
assertion that every file exposes a public markup tag. Use --write / --check.
"""
from __future__ import annotations

import argparse
from collections import Counter
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs/v3/inventory/public-component-sources.json"
INVENTORY = ROOT / "docs/components/inventory.md"
PACKAGES = {
    "Bluent.UI": "src/Bluent.UI/Components",
    "Bluent.UI.Charts": "src/Bluent.UI.Charts/Components",
    "Bluent.UI.Diagrams": "src/Bluent.UI.Diagrams/Components",
    "Bluent.UI.Utilities": "src/Bluent.UI.Utilities",
}
# Existing #428–#493 are FAMILY tasks, not a promise that one family = one tag.
FAMILIES = (
    "Button Icon Label Link TextField NumericField Checkbox Switch RadioGroup "
    "SelectField DateField TimeField MaskedField OtpField Slider RangeSlider "
    "FileSelect Badge Avatar Tag Spinner ProgressBar Skeleton ButtonGroup Card "
    "ActionCard Spacer Stack Tooltip Popover Overlay Dialog Drawer Menu MenuList "
    "DropdownSelect DropdownList TabList NavList Breadcrumb List Accordion Toast "
    "MessageBar Overflow Toolbar DataGrid DataList DataPager Tree Calendar Wizard "
    "SplitPanel TileLayout DockPanel PropertyEditor MediaQuery AudioCapture "
    "Chart Gauge Diagram Shapes AppBusyIndicator Hierarchy MdiTab ToolbarButtons"
).split()
ISSUES = {name: 428 + i for i, name in enumerate(FAMILIES)}
assert len(ISSUES) == 66 and ISSUES["ToolbarButtons"] == 493
ALIASES = {
    "CheckBox": "Checkbox", "Radio": "RadioGroup", "SplitPanelContainer": "SplitPanel",
    "ItemsList": "List", "ListItem": "List", "Tab": "TabList",
    "TabListTabItem": "TabList", "Containers": "Dialog", "MasterContainer": "Dialog",
    "DrawingCanvas": "Diagram", "Circle": "Shapes", "Line": "Shapes",
    "Rect": "Shapes", "HierarchyItemBrowser": "Hierarchy",
    "HierarchyTreeBrowser": "Hierarchy", "HierarchyTreeItem": "Hierarchy",
    "MdiTabList": "MdiTab", "MdiTabToolbarItem": "MdiTab",
    "RedoToolbarButton": "ToolbarButtons", "SaveToolbarButton": "ToolbarButtons",
    "UndoToolbarButton": "ToolbarButtons", "ToolbarButton": "Toolbar",
    "ToolbarDivider": "Toolbar", "MediaQuery": "MediaQuery",
    "Gauge": "Gauge", "Chart": "Chart", "Colors": "Chart",
    "Dataset": "Chart", "Legend": "Chart", "Scale": "Chart",
    "XScale": "Chart", "YScale": "Chart", "Subtitle": "Chart",
    "Title": "Chart", "Tooltip": "Chart",
}
INFRASTRUCTURE_NAMES = {
    "Containers", "MasterContainer", "DialogContainer", "DialogDefaultContent",
    "MessageBoxDefaultContent", "DockContainer", "DockBar",
    "DrawerContainer", "DrawerContent", "PopoverContainer", "PopoverSurface",
    "TooltipContainer", "TooltipSurface", "ToastContainer", "ToastDefaultContent",
    "BluentDynamicComponent", "CursorLocation",
}
# Dedicated component issues with consumer syntax verified against docs/demo source.
EXPLICIT_COMPONENT_ISSUES = {
    ("Bluent.UI", "AccordionPanel"): 507,
    ("Bluent.UI", "DataGridColumn"): 508,
    ("Bluent.UI.Charts", "Dataset"): 509,
    ("Bluent.UI.Diagrams", "DrawingCanvas"): 510,
}
CLASS_PATTERN = re.compile(
    r"\bpublic\s+(?P<modifiers>(?:sealed\s+|partial\s+|abstract\s+)*)"
    r"class\s+(?P<name>[A-Za-z_]\w*)"
    r"(?:<[^>{}]+>)?\s*:\s*(?P<bases>[^\r\n{]+)"
)
COMPONENT_BASES = (
    "ComponentBase", "BluentUiComponentBase", "BluentComponentBase",
    "OverflowItemComponentBase", "IComponent", "ChartJs",
    "DrawingCanvas", "Scale", "Dataset",
)


def family_for(package: str, path: Path, name: str) -> str | None:
    if name in ALIASES:
        return ALIASES[name]
    if name in ISSUES:
        return name
    parts = path.parts
    for part in reversed(parts[:-1]):
        if part.endswith("Component"):
            label = part.removesuffix("Component")
            return ALIASES.get(label, label) if label in ISSUES or label in ALIASES else None
    if package == "Bluent.UI.Utilities":
        if "ToolbarButtons" in parts:
            return "ToolbarButtons"
        if "Hierarchy" in parts:
            return "Hierarchy"
        if "MdiTab" in parts:
            return "MdiTab"
    if package == "Bluent.UI.Charts":
        return "Gauge" if name == "Gauge" else "Chart"
    if package == "Bluent.UI.Diagrams":
        return "Shapes" if name in {"Circle", "Line", "Rect"} else "Diagram"
    return None


def census():
    rows = []
    for package, source_root in PACKAGES.items():
        directory = ROOT / source_root
        razor_paths = sorted(directory.rglob("*.razor"))
        entry_names = {p.stem for p in razor_paths}
        for path in razor_paths:
            rows.append((package, path, path.stem, "razor"))
        for path in sorted(directory.rglob("*.cs")):
            if path.name.endswith(".razor.cs"):
                continue
            # All concrete public C# component classes in the four package
            # component roots, including Chart.js wrappers and descendant tags.
            body = path.read_text(encoding="utf-8-sig")
            for match in CLASS_PATTERN.finditer(body):
                name, parents = match.group("name"), match.group("bases")
                if "abstract" in match.group("modifiers").split():
                    continue  # e.g. Chart Dataset base versus concrete Dataset<TKey,TValue>
                if name in entry_names or not any(base in parents for base in COMPONENT_BASES):
                    continue
                rows.append((package, path, name, "csharp"))
    items = []
    for package, path, name, source_kind in rows:
        relative = path.relative_to(ROOT).as_posix()
        family = family_for(package, path.relative_to(ROOT), name)
        internal_path = any(part.lower() in {"internal", "internals"} for part in path.parts)
        kind = ("internal-path-review" if internal_path else
                "infrastructure-review" if name in INFRASTRUCTURE_NAMES else
                "public-candidate")
        items.append({
            "package": package,
            "markupName": name,
            "source": relative,
            "sourceKind": source_kind,
            "classification": kind,
            "familyIssue": ISSUES.get(family),
            "family": family,
            "componentIssue": None,  # #494 must split and verify, no fake ownership
            "verification": "source-candidate",
        })
    # A one-tag family has a provisional issue route. Multitag families still
    # need explicit child issues and approval, never silently reuse the parent.
    counts = Counter(x["family"] for x in items if x["classification"] == "public-candidate")
    for item in items:
        single = (item["classification"] == "public-candidate" and
                  counts[item["family"]] == 1 and item["familyIssue"] is not None)
        explicit = EXPLICIT_COMPONENT_ISSUES.get((item["package"], item["markupName"]))
        item["componentIssue"] = explicit if explicit is not None else item["familyIssue"] if single else None
        item["routing"] = ("dedicated-source-routed" if explicit is not None else
                           "sole-family-provisional" if single else "review-or-split-required")
    items.sort(key=lambda x: (x["package"], x["source"], x["markupName"]))
    return items


def families_from_docs():
    text = INVENTORY.read_text(encoding="utf-8-sig")
    sections = [
        ("Bluent.UI", "## Main UI package", "### Infrastructure"),
        ("Bluent.UI.Charts", "## Charts package", "## Diagrams package"),
        ("Bluent.UI.Diagrams", "## Diagrams package", "## Utilities package"),
        ("Bluent.UI.Utilities", "## Utilities package", "## Coverage summary"),
    ]
    counts = {}
    for package, start, end in sections:
        block = text.split(start, 1)[1].split(end, 1)[0]
        counts[package] = sum(1 for line in block.splitlines() if line.startswith("| ["))
    return counts


def payload():
    items = census()
    counts = families_from_docs()
    return {
        "issue": 494,
        "status": "source-candidate-only; NOT public API/markup or runtime verified",
        "source": "src/* component roots (Razor + concrete public C# candidate classes)",
        "penpot": {
            "fileId": "b64f6665-c9ab-80b5-8008-c4ac99d9d000",
            "pageId": "44b12572-0104-807e-8008-ca032a4746f0",
            "boardId": "44b12572-0104-807e-8008-ca035bbc8ca7",
        },
        "retrievalFamilies": counts,
        "retrievalFamiliesTotal": sum(counts.values()),
        "rawSourceCandidates": len(items),
        "components": items,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--write", action="store_true")
    mode.add_argument("--check", action="store_true")
    args = parser.parse_args()
    expected = json.dumps(payload(), ensure_ascii=False, indent=2) + "\n"
    if args.write:
        OUT.parent.mkdir(parents=True, exist_ok=True)
        OUT.write_text(expected, encoding="utf-8")
    elif not OUT.exists() or OUT.read_text(encoding="utf-8") != expected:
        raise SystemExit("public component source manifest is missing/stale; run --write and review the diff")
    data = json.loads(expected)
    if data["retrievalFamilies"]["Bluent.UI"] != 58 or data["retrievalFamiliesTotal"] != 66:
        raise SystemExit("family counts drifted: review docs/components/inventory.md before accepting")
    if any(c["familyIssue"] is None and c["classification"] == "public-candidate" for c in data["components"]):
        bad = [c["markupName"] for c in data["components"] if c["familyIssue"] is None and c["classification"] == "public-candidate"]
        raise SystemExit("unmapped public candidates need issue routing: " + ", ".join(bad))
    print(f"#494: {data['rawSourceCandidates']} source candidates; {data['retrievalFamiliesTotal']} retrieval families. Mode: {'write' if args.write else 'check'}")


if __name__ == "__main__":
    main()
