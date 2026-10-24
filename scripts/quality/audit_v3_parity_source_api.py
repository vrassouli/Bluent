#!/usr/bin/env python3
"""#552 source-declared Bluent API census for the 18 existing pilot families.

This is a source inventory, not a Fluent parity, inherited API, render or AT verdict.
Run --write to explicitly refresh the pinned snapshot after source review.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
COMPONENT_ROOT = ROOT / "src/Bluent.UI/Components"
OUTPUT = ROOT / "docs/v3/quality/FLUENT-PARITY-18-SOURCE-API.json"
FAMILIES = (
    ("Button", 428, "ButtonComponent", ("Button",)),
    ("Icon", 429, "IconComponent", ("Icon",)),
    ("Label", 430, "LabelComponent", ("Label",)),
    ("Link", 431, "LinkComponent", ("Link",)),
    ("Badge", 445, "BadgeComponent", ("Badge",)),
    ("TextField", 432, "TextFieldComponent", ("TextField",)),
    ("NumericField", 433, "NumericFieldComponent", ("NumericField",)),
    ("Checkbox", 434, "CheckBoxComponent", ("Checkbox",)),
    ("Switch", 435, "SwitchComponent", ("Switch",)),
    ("RadioGroup", 436, "RadioGroupComponent", ("RadioGroup", "Radio")),
    ("SelectField", 437, "SelectFieldComponent", ("SelectField",)),
    ("DateField", 438, "DateFieldComponent", ("DateField",)),
    ("TimeField", 439, "TimeFieldComponent", ("TimeField",)),
    ("MaskedField", 440, "MaskedFieldComponent", ("MaskedField",)),
    ("OtpField", 441, "OtpFieldComponent", ("OtpField",)),
    ("Slider", 442, "SliderComponent", ("Slider",)),
    ("RangeSlider", 443, "RangeSliderComponent", ("RangeSlider",)),
    ("FileSelect", 444, "FileSelectComponent", ("FileSelect",)),
)

# The extraction intentionally follows explicit Parameter attributes. It does NOT
# derive all inherited parameters, event wiring or actual runtime DOM behavior.
PUBLIC_PARAMETER_RE = re.compile(
    r"\[(?P<attributes>(?:Parameter|CascadingParameter)\b[^\]]*)\]"
    r"\s*(?:\[[^\]]+\]\s*)*"
    r"public\s+(?P<type>[\w<>?,.\[\] ]+?)\s+"
    r"(?P<name>\w+)\s*\{\s*get\s*;\s*set\s*;",
    re.MULTILINE,
)
RAZOR_INHERITS_RE = re.compile(r"^\s*@inherits\s+(.+?)\s*$", re.MULTILINE)
CS_INHERITS_RE = re.compile(r"\bclass\s+\w+(?:<[^>{}]+>)?\s*:\s*([\w.<>,?\[\] ]+)")
TYPEPARAM_RE = re.compile(r"^\s*@typeparam\s+(\w+)", re.MULTILINE)


def strip_comments(source: str) -> str:
    # Preserve line counts; C# source can contain // inside strings, but these
    # API declaration scans never need values to the right of inline //.
    source = re.sub(r"/\*.*?\*/", lambda m: "\n" * m.group(0).count("\n"), source, flags=re.DOTALL)
    return re.sub(r"(?m)^[ \t]*//.*$", "", source)


def inspect_component(folder: str, component: str) -> dict:
    base = COMPONENT_ROOT / folder
    if not base.is_dir():
        raise FileNotFoundError(base)
    paths = [base / (component + ".razor"), base / (component + ".razor.cs")]
    if not paths[0].exists():
        paths = [base / (component + ".cs")]
    paths = [p for p in paths if p.is_file()]
    if not paths:
        raise FileNotFoundError(f"No source for {folder}/{component}")

    parameters = []
    base_types, generic_type_parameters, tags, source_files = [], [], [], []
    for path in paths:
        relative = path.relative_to(ROOT).as_posix()
        raw = path.read_text(encoding="utf-8-sig")
        clean = strip_comments(raw)
        source_files.append(relative)
        for m in PUBLIC_PARAMETER_RE.finditer(clean):
            attrs = m.group("attributes")
            kind = ("cascading" if "CascadingParameter" in attrs else
                    "slot" if "RenderFragment" in m.group("type") else
                    "event" if "EventCallback" in m.group("type") else "value")
            parameters.append({
                "name": m.group("name"),
                "type": " ".join(m.group("type").split()),
                "kind": kind,
                "declaredAt": relative,
                "line": clean.count("\n", 0, m.start()) + 1,
                "editorRequired": "EditorRequired" in m.group(0),
            })
        for m in RAZOR_INHERITS_RE.finditer(clean):
            base_types.append(m.group(1).strip())
        for m in CS_INHERITS_RE.finditer(clean):
            base_types.append(m.group(1).strip())
        for m in TYPEPARAM_RE.finditer(clean):
            generic_type_parameters.append(m.group(1))
        # Only explicit declarative markup event handlers; no claims about
        # JS-registered events or runtime dispatch.
        if path.suffix == ".razor":
            tags.extend(re.findall(r"@on[a-z]+(?==)", raw))
    keys = [(p["declaredAt"], p["name"]) for p in parameters]
    if len(keys) != len(set(keys)):
        raise ValueError(f"Duplicate source declarations for {folder}/{component}: {keys}")
    return {
        "component": component,
        "sourceFiles": source_files,
        "declaredParameterCount": len(parameters),
        "parameters": parameters,
        "declaredBaseTypes": list(dict.fromkeys(base_types)),
        "genericTypeParameters": list(dict.fromkeys(generic_type_parameters)),
        "razorDomEventSyntax": sorted(set(tags)),
        "inheritedParameterStatus": "not_reviewed",
        "renderedEventsAndSlotsStatus": "not_reviewed",
    }


def build_inventory() -> dict:
    families = []
    for family, issue, folder, component_names in FAMILIES:
        components = [inspect_component(folder, name) for name in component_names]
        families.append({
            "family": family,
            "productIssue": issue,
            "folder": folder,
            "componentCount": len(components),
            "components": components,
            "fluentParityStatus": "not_reviewed",
            "officialUpstreamCounterpart": "not_verified",
            "approvedComponentDesign": False,
            "runtimeParityTests": 0,
            "nativeOSTests": 0,
        })
    return {
        "schemaVersion": 1,
        "auditIssue": 552,
        "sourceBaseline": "2c37dbef516230606306549458721d6bda03a8ab",
        "status": "source_inventory_only",
        "scope": "declared public Parameter/CascadingParameter metadata; inherited contracts unresolved",
        "documentation": "Source-declared census only: no Fluent mapping, parity, public base API or runtime/AT claim.",
        "families": families,
    }


def validate(snapshot: dict, expected: dict) -> list[str]:
    failures = []
    for key in ("auditIssue", "status", "sourceBaseline"):
        if snapshot.get(key) != expected[key]:
            failures.append(f"metadata drift: {key}")
    rows = snapshot.get("families", [])
    if len(rows) != 18 or {f.get("family") for f in rows} != {f[0] for f in FAMILIES}:
        failures.append("exact 18 existing component families are required")
    by_family = {f["family"]: f for f in rows if "family" in f}
    for wanted in expected["families"]:
        family = wanted["family"]
        actual = by_family.get(family)
        if actual is None:
            failures.append(f"{family}: missing")
            continue
        if actual != wanted:
            failures.append(f"{family}: direct API, owner mapping, source, or unverified status changed")
    return failures


def main(argv=None):
    p = argparse.ArgumentParser()
    p.add_argument("--write", action="store_true", help="explicitly update pinned source census")
    a = p.parse_args(argv)
    expected = build_inventory()
    if a.write:
        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        OUTPUT.write_text(json.dumps(expected, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"WROTE: {OUTPUT} ({len(FAMILIES)} families; no parity accepted)")
        return 0
    if not OUTPUT.exists():
        print(f"MISSING: {OUTPUT}; review and run --write", file=sys.stderr)
        return 1
    snapshot = json.loads(OUTPUT.read_text(encoding="utf-8"))
    failures = validate(snapshot, expected)
    for item in failures:
        print("FAIL:", item)
    print(f"#552 source API census {'FAIL' if failures else 'PASS'}: 18 families; inherited/Fluent parity unreviewed")
    return bool(failures)


if __name__ == "__main__":
    sys.exit(main())