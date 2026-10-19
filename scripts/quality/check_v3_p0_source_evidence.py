#!/usr/bin/env python3
"""Guard #552 P0 source claims against silent source/API drift; not a parity test."""
from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "docs/v3/quality/FLUENT-PARITY-P0-SOURCE.json"
EXPECTED = {"Button": 428, "Slider": 442, "RangeSlider": 443, "FileSelect": 444}


def audit(document, root=ROOT):
    problems = []
    if document.get("auditIssue") != 552 or document.get("epicIssue") != 416:
        problems.append("wrong owning audit/epic")
    if document.get("allFluentParityReviewed") is not False:
        problems.append("source observations cannot claim all Fluent parity reviewed")
    for key in ("runtimeBrowserChecks", "nativeAssistiveTechnologyChecks", "approvedComponentDesigns"):
        if document.get(key) != 0:
            problems.append(f"unverified source baseline must keep {key}=0")
    if document.get("figma", {}).get("approved") is not False:
        problems.append("a workflow board is not design approval")
    items = document.get("items", [])
    if len(items) != len(EXPECTED) or {x.get("family") for x in items} != set(EXPECTED):
        problems.append("exact four P0 families required")
    for item in items:
        family = item.get("family", "?")
        if item.get("issue") != EXPECTED.get(family) or item.get("status") != "source_observed":
            problems.append(f"{family}: owning issue or evidence status changed without audit")
        if not item.get("sources"):
            problems.append(f"{family}: no source anchors")
        for source in item.get("sources", []):
            path = root / source["path"]
            if not path.is_file():
                problems.append(f"{family}: missing {source['path']}")
                continue
            contents = path.read_text(encoding="utf-8-sig")
            for anchor in source.get("anchors", []):
                if anchor not in contents:
                    problems.append(f"{family}: source drift in {source['path']}: {anchor}")
    return problems


def main():
    findings = audit(json.loads(DATA.read_text(encoding="utf-8-sig")))
    for finding in findings:
        print("FAIL:", finding)
    print(f"#552 P0 source-evidence gate: {'FAIL' if findings else 'PASS'} ({len(EXPECTED)} families; not a Fluent parity verdict)")
    return 1 if findings else 0


if __name__ == "__main__":
    sys.exit(main())
