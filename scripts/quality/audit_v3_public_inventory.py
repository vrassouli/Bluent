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
    "CheckBox": "Checkbox", "TooltipContainer": "Tooltip", "TooltipSurface": "Tooltip", "Radio": "RadioGroup", "SplitPanelContainer": "SplitPanel",
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
    "DialogContainer", "DialogDefaultContent", "MessageBoxDefaultContent",
    "DrawerContainer", "PopoverContainer", "PopoverSurface",
    "TooltipContainer", "TooltipSurface", "ToastContainer", "ToastDefaultContent",
    "BluentDynamicComponent", "CursorLocation", "PopoverContainerBase",
}
# Dedicated component issues with consumer syntax verified against docs/demo source.
EXPLICIT_COMPONENT_ROUTES = {
    ('Bluent.UI', 'AccordionPanel'): (507, 'src/Bluent.UI.Demo.Pages/Pages/Components/Accordions.razor', 'markup'),
    ('Bluent.UI', 'DataGridColumn'): (508, 'docs/components/data-grid.md', 'markup'),
    ('Bluent.UI.Charts', 'Dataset'): (509, 'src/Bluent.UI.Demo.Pages/Pages/Components/Charts.razor', 'markup'),
    ('Bluent.UI.Diagrams', 'DrawingCanvas'): (510, 'src/Bluent.UI.Demo.Pages/Pages/Components/DrawingCanvases.razor', 'markup'),
    ('Bluent.UI', 'BreadcrumbItem'): (511, 'src/Bluent.UI.Demo.Pages/Pages/Components/Breadcrumbs.razor', 'markup'),
    ('Bluent.UI', 'CardHeader'): (512, 'src/Bluent.UI.Demo.Pages/Pages/Components/Cards.razor', 'markup'),
    ('Bluent.UI', 'CardContent'): (513, 'src/Bluent.UI.Demo.Pages/Pages/Components/Cards.razor', 'markup'),
    ('Bluent.UI', 'CardFooter'): (514, 'src/Bluent.UI.Demo.Pages/Pages/Components/Cards.razor', 'markup'),
    ('Bluent.UI', 'CardPreview'): (515, 'src/Bluent.UI.Demo.Pages/Pages/Components/Cards.razor', 'markup'),
    ('Bluent.UI', 'CardFloatingAction'): (516, 'src/Bluent.UI.Demo.Pages/Pages/Components/Cards.razor', 'markup'),
    ('Bluent.UI', 'MenuItem'): (517, 'src/Bluent.UI.Demo.Pages/Pages/Components/Buttons.razor', 'markup'),
    ('Bluent.UI', 'NavItem'): (518, 'docs/components/nav-list.md', 'markup'),
    ('Bluent.UI', 'Radio'): (519, 'docs/components/radio-group.md', 'markup'),
    ('Bluent.UI', 'TreeItem'): (520, 'docs/components/tree.md', 'markup'),
    ('Bluent.UI', 'WizardStep'): (521, 'docs/components/wizard.md', 'markup'),
    ('Bluent.UI', 'ToolbarButton'): (522, 'src/Bluent.UI.Demo.Pages/Pages/Components/Diagrams.razor', 'markup'),
    ('Bluent.UI', 'Tab'): (523, 'docs/components/tab-list.md', 'markup'),
    ('Bluent.UI', 'ListItem'): (524, 'docs/components/list.md', 'markup'),
    ('Bluent.UI', 'ActionCardGroup'): (525, 'src/Bluent.UI.Demo.Pages/Pages/Components/ActionCards.razor', 'markup'),
    ('Bluent.UI', 'MenuDivider'): (526, 'src/Bluent.UI.Demo.Pages/Pages/Components/Menus.razor', 'markup'),
    ('Bluent.UI', 'MenuItemGroup'): (527, 'src/Bluent.UI.Demo.Pages/Pages/Components/Menus.razor', 'markup'),
    ('Bluent.UI', 'ToolbarButtonItem'): (528, None, 'source-only'),
    ('Bluent.UI', 'ToolbarDivider'): (529, 'src/Bluent.UI.Demo.Pages/Pages/Components/Diagrams.razor', 'markup'),
    ('Bluent.UI.Charts', 'Colors'): (530, 'src/Bluent.UI.Demo.Pages/Pages/Components/Charts.razor', 'markup'),
    ('Bluent.UI.Charts', 'Legend'): (531, 'docs/components/chart.md', 'markup'),
    ('Bluent.UI.Charts', 'Subtitle'): (532, 'src/Bluent.UI.Demo.Pages/Pages/Components/Charts.razor', 'markup'),
    ('Bluent.UI.Charts', 'Title'): (533, 'docs/components/chart.md', 'markup'),
    ('Bluent.UI.Charts', 'Tooltip'): (534, 'src/Bluent.UI.Demo.Pages/Pages/Components/Charts.razor', 'markup'),
    ('Bluent.UI.Charts', 'XScale'): (535, 'src/Bluent.UI.Demo.Pages/Pages/Components/Charts.razor', 'markup'),
    ('Bluent.UI.Charts', 'YScale'): (536, 'docs/components/chart.md', 'markup'),
    ('Bluent.UI.Diagrams', 'Line'): (537, 'docs/components/diagram-shapes.md', 'markup'),
    ('Bluent.UI.Diagrams', 'Rect'): (538, 'docs/components/diagram-shapes.md', 'markup'),
    ('Bluent.UI.Utilities', 'HierarchyItemBrowser'): (539, 'docs/components/hierarchy-utilities.md', 'documented-type'),
    ('Bluent.UI.Utilities', 'MdiTabList'): (540, 'src/Bluent.UI.Demo.Pages/Pages/Mdi/Index.razor', 'markup'),
    ('Bluent.UI.Utilities', 'MdiTabToolbarItem'): (541, 'src/Bluent.UI.Demo.Pages/Pages/Mdi/Index.razor', 'markup'),
    ('Bluent.UI.Utilities', 'RedoToolbarButton'): (542, 'docs/components/toolbar-buttons.md', 'markup'),
    ('Bluent.UI.Utilities', 'UndoToolbarButton'): (543, 'docs/components/toolbar-buttons.md', 'markup'),
    ('Bluent.UI', 'Containers'): (544, 'src/Bluent.UI.Demo.Pages/Layout/MainLayout.razor', 'markup'),
    ('Bluent.UI', 'DockBar'): (545, 'src/Bluent.UI.Demo.Pages/Pages/Components/DockPanels.razor', 'markup'),
    ('Bluent.UI', 'DockContainer'): (546, 'src/Bluent.UI.Demo.Pages/Pages/Components/DockPanels.razor', 'markup'),
    ('Bluent.UI', 'DrawerContent'): (547, 'src/Bluent.UI.Demo.Pages/Pages/Components/Drawers.razor', 'markup'),
    ('Bluent.UI', 'MasterContainer'): (548, None, 'source-only'),
}
NON_CONSUMER_COMPONENTS = {
    "TabListTabItem": "Renderer instantiated from public Tab via RenderTreeBuilder; no consumer tag examples",
    "HierarchyTreeItem": "Recursive renderer instantiated by HierarchyTreeBrowser; consumers use browser",
}

FAMILY_PRIMARY_COMPONENTS = {
    'Dialog': 'Dialog',
    'Drawer': 'Drawer',
    'DockPanel': 'DockPanel',
    'Accordion': 'Accordion',
    'ActionCard': 'ActionCard',
    'Breadcrumb': 'Breadcrumb',
    'Card': 'Card',
    'DataGrid': 'DataGrid',
    'List': 'ItemsList',
    'MenuList': 'MenuList',
    'NavList': 'NavList',
    'RadioGroup': 'RadioGroup',
    'TabList': 'TabList',
    'Toolbar': 'Toolbar',
    'Tree': 'Tree',
    'Wizard': 'Wizard',
    'Chart': 'Chart',
    'Shapes': 'Circle',
    'Diagram': 'Diagram',
    'Hierarchy': 'HierarchyTreeBrowser',
    'MdiTab': 'MdiTab',
    'ToolbarButtons': 'SaveToolbarButton',
}

# Both exported CLR symbols remain API contracts, but neither can be
# instantiated as a standalone consumer markup component.
ABSTRACT_API_COMPONENTS = {
    "Overflow": "Public abstract Razor base. Consumer documentation explicitly prohibits <Overflow> markup; use concrete overflow-aware descendants.",
}
NON_COMPONENT_FAMILIES = {"Tooltip": 456, "Overflow": 472}

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
                "internal-composite-review" if name in NON_CONSUMER_COMPONENTS else
                "abstract-public-api" if name in ABSTRACT_API_COMPONENTS else
                "infrastructure-review" if name in INFRASTRUCTURE_NAMES else
                "public-candidate")
        items.append({
            "package": package,
            "markupName": name,
            "source": relative,
            "sourceKind": source_kind,
            "classification": kind,
            "exceptionReason": NON_CONSUMER_COMPONENTS.get(name) or ABSTRACT_API_COMPONENTS.get(name),
            "consumerInfrastructure": name in {"Containers", "DockBar", "DockContainer", "DrawerContent"},
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
        route = EXPLICIT_COMPONENT_ROUTES.get((item["package"], item["markupName"]))
        if route is not None:
            issue, usage, evidence_kind = route
            if evidence_kind not in {"markup", "documented-type", "source-only"}:
                raise ValueError(f"Unknown consumer evidence kind for #{issue}")
            if evidence_kind == "source-only":
                if usage is not None:
                    raise ValueError(f"#{issue} source-only route must have no evidence path")
            else:
                if usage is None or not (ROOT / usage).is_file():
                    raise ValueError(f"#{issue} missing consumer evidence file: {usage}")
                evidence = (ROOT / usage).read_text(encoding="utf-8-sig")
                pattern = (r"<" + re.escape(item["markupName"]) + r"(?=[\s/>])"
                           if evidence_kind == "markup" else
                           r"\b" + re.escape(item["markupName"]) + r"\b")
                if not re.search(pattern, evidence):
                    raise ValueError(
                        f"dedicated issue #{issue} evidence for "
                        f"{item['markupName']} missing in {usage}"
                    )
        else:
            issue, usage, evidence_kind = None, None, None
        item["consumerExample"] = usage
        item["evidenceKind"] = evidence_kind
        if item["classification"] != "public-candidate" and not item["exceptionReason"]:
            item["exceptionReason"] = {
                "infrastructure-review": (
                    "Exported infrastructure/service renderer; no direct canonical "
                    "consumer markup example. Preserve public CLR API; owning issue "
                    "reviews standalone API eligibility before migration."
                ),
                "internal-path-review": (
                    "Exported type under Internal/Internals; no direct canonical "
                    "demo/docs markup. Preserve public CLR API; owning family "
                    "must review independent API eligibility."
                ),
            }[item["classification"]]
        item["reviewOwnerIssue"] = (
            item["familyIssue"] if item["familyIssue"] is not None else 420
        ) if item["classification"] != "public-candidate" else None
        primary = (item["classification"] == "public-candidate" and
                   FAMILY_PRIMARY_COMPONENTS.get(item["family"]) == item["markupName"])
        item["componentIssue"] = (
            issue if issue is not None else
            item["familyIssue"] if (single or primary) else None
        )
        item["routing"] = (
            "dedicated-source-routed" if issue is not None else
            "sole-family-provisional" if single else
            "family-primary-provisional" if primary else
            "review-or-split-required"
        )
    # Future docs/demo/skill routes are obligations, not invented finished artifacts.
    family_docs = {}
    for line in INVENTORY.read_text(encoding="utf-8-sig").splitlines():
        if not line.startswith("| [") or "](" not in line:
            continue
        label = line.split("[", 1)[1].split("](", 1)[0]
        link = line.split("](", 1)[1].split(")", 1)[0]
        if link.endswith(".md"):
            family_docs[label] = "docs/components/" + link
    for item in items:
        doc_path = family_docs.get(item["family"])
        item["documentationRoute"] = doc_path if doc_path and (ROOT / doc_path).is_file() else "docs/v3/inventory/README.md"
        item["demoRoute"] = item["consumerExample"] if item["evidenceKind"] == "markup" else "pending-per-component-demo"
        item["skillRoute"] = "pending-per-component-skill" if item["classification"] == "public-candidate" else ".agents/skills/bluent-v3-inventory/SKILL.md"
        item["designRoute"] = "penpot-component-design-pending" if item["classification"] == "public-candidate" else "Penpot #494 source ownership decision"
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
    present_families = {
        item["family"] for item in items
        if item["classification"] == "public-candidate"
    }
    missing = set(ISSUES) - present_families
    if missing != set(NON_COMPONENT_FAMILIES):
        raise ValueError(
            f"unexpected retrieval families without public component candidates: {missing}"
        )
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
        "nonComponentFamilyExceptions": NON_COMPONENT_FAMILIES,
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
