#!/usr/bin/env python3
"""Compare the 18-family direct source parameters with the existing #494 CLR contracts.

Source/compiler metadata only. This cannot certify inherited Blazor InputBase,
rendered output, Fluent feature parity, browser behavior, or OS/AT.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "docs/v3/quality/FLUENT-PARITY-18-SOURCE-API.json"
CONTRACTS = ROOT / "docs/v3/inventory/public-component-contracts.json"


def check(source, contracts):
    by_name = {}
    for key, item in contracts["Components"].items():
        if not key.startswith("Bluent.UI::"):
            continue
        short = item["Type"].split(".")[-1].split(chr(96))[0]
        by_name.setdefault(short, []).append(item)
    errors = []
    count = 0
    for family in source["families"]:
        for component in family["components"]:
            name = component["component"]
            candidates = by_name.get(name, [])
            if len(candidates) != 1:
                errors.append(f"{family['family']}/{name}: missing or ambiguous CLR export")
                continue
            properties = candidates[0].get("Properties", {})
            emitted = {n for n, sig in properties.items() if "ParameterAttribute" in sig}
            declared = {p["name"] for p in component["parameters"]}
            if emitted != declared:
                errors.append(f"{family['family']}/{name}: missing-in-source={sorted(emitted-declared)} missing-in-CLR={sorted(declared-emitted)}")
            count += len(declared)
            if family["fluentParityStatus"] != "not_reviewed":
                errors.append(f"{family['family']}: claimed Fluent approval")
    return errors, count


def main():
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    contract = json.loads(CONTRACTS.read_text(encoding="utf-8"))
    errors, count = check(source, contract)
    for error in errors:
        print("FAIL:", error)
    print(f"#552 direct source to #494 compiled contract: {'FAIL' if errors else 'PASS'}; {count} declared items, 18 families (NOT Fluent acceptance)")
    return bool(errors)


if __name__ == "__main__":
    sys.exit(main())
