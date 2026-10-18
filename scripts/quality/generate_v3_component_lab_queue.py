
"""Generate the #421 FAMILY queue from verified source census, not assumptions."""
from __future__ import annotations
import argparse
import json
from collections import defaultdict
from pathlib import Path

from audit_v3_public_inventory import FAMILIES, ISSUES

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "docs/v3/inventory/public-component-sources.json"
PILOT = ROOT / "docs/v3/quality/COMPONENT-LAB-COVERAGE.json"
TARGET = ROOT / "docs/v3/quality/COMPONENT-LAB-FAMILY-QUEUE.json"


def payload():
    census = json.loads(SOURCE.read_text(encoding="utf-8-sig"))
    pilot = json.loads(PILOT.read_text(encoding="utf-8-sig"))
    assert census["retrievalFamiliesTotal"] == 66
    assert pilot["status"] == "pilot_incomplete"
    by_family = defaultdict(list)
    for item in census["components"]:
        if item["classification"] == "public-candidate":
            by_family[item["family"]].append(item)
    specimens = {x["family"]: x for x in pilot["families"]}
    entries = []
    for family in FAMILIES:
        components = by_family[family]
        if not components:
            assert family in census["nonComponentFamilyExceptions"], family
        sources = sorted({x["source"] for x in components if x.get("source")})
        docs = sorted({
            x["documentationRoute"] for x in components
            if x.get("documentationRoute") and (ROOT / x["documentationRoute"]).is_file()
        })
        examples = sorted({
            x["consumerExample"] for x in components
            if x.get("consumerExample") and (ROOT / x["consumerExample"]).is_file()
        })
        specimen = specimens.get(family)
        # Browser-proven pilot: Button/Icon interaction, Label/Link native
        # rendered markup. No full public-API or AT acceptance inferred.
        sample_level = (
            "chrome_wasm_interaction_observed" if family in ("Button", "Icon")
            else "chrome_wasm_native_markup_observed" if family in ("Label", "Link", "Badge")
            else "chrome_and_edge_wasm_server_native_text_input_binding_observed" if family == "TextField"
            else "chrome_and_edge_wasm_server_checkbox_native_checked_nullable_disabled_observed" if family == "Checkbox"
            else "chrome_and_edge_wasm_server_native_switch_on_off_disabled_observed" if family == "Switch"
            else "chrome_edge_wasm_server_numeric_native_input_focus_blur_observed" if family == "NumericField"
            else "no_component_lab_scenario"
        )
        entries.append({
            "family": family,
            "issue": ISSUES[family],
            "candidateSourceCount": len(sources),
            "candidateSourceFiles": sources,
            "existingDocumentationFiles": docs,
            "existingConsumerExampleFiles": examples,
            "scenarioId": specimen["scenarioId"] if specimen else None,
            "scenarioEvidence": sample_level,
            "apiPropertiesEventsMapped": False,
            "completeDemoAcceptance": False,
            "componentDesignAccepted": False,
            "browserMatrixAccepted": False,
            "outstanding": (
                "Full public API/property/event/state mapping, design parity, "
                "theme/RTL/keyboard/accessibility and all render-mode tests"
            )
        })
    assert len(entries) == 66
    assert [x["issue"] for x in entries] == list(range(428, 494))
    return {
        "schemaVersion": 1,
        "issue": 421,
        "status": "source_family_queue_only_NOT_exhaustive_demo",
        "sourceInventory": "docs/v3/inventory/public-component-sources.json",
        "sourceManifestScope": census["status"],
        "familyCount": len(entries),
        "familiesWithRepresentativeLabScenario": len(specimens),
        "familiesWithRealBrowserSpecimen": 9,
        "apiCoverageComplete": False,
        "note": (
            "This is a complete 66-family WORK QUEUE sourced from the #494 census, "
            "NOT 66 tested interactive demos or accepted v3 components. "
            "Family source candidates are not an authoritative public API census."
        ),
        "families": entries
    }


def main():
    ap = argparse.ArgumentParser()
    group = ap.add_mutually_exclusive_group(required=True)
    group.add_argument("--write", action="store_true")
    group.add_argument("--check", action="store_true")
    args = ap.parse_args()
    desired = json.dumps(payload(), ensure_ascii=False, indent=2) + "\n"
    if args.write:
        TARGET.write_text(desired, encoding="utf-8")
    elif not TARGET.is_file() or TARGET.read_text(encoding="utf-8") != desired:
        raise SystemExit("Component Lab family work queue is missing or stale. Review #494 data and regenerate.")
    print("Component Lab family queue: 66/66 mapped to issues; 9 pilots, 9 real-browser specimens across four independent local modes; ZERO complete API acceptance.")


if __name__ == "__main__":
    main()
