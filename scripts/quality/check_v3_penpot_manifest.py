#!/usr/bin/env python3
"""Offline structure check for the #419 Penpot workspace manifest.

This only validates repository-side metadata and labels; it cannot authenticate
a live Penpot workspace, verify design geometry or approve Fluent parity.
"""
from __future__ import annotations

import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[2]
FILE = ROOT / "docs/v3/design/penpot-workspace.manifest.json"
UUID = re.compile(r"^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$")


def main() -> int:
    data = json.loads(FILE.read_text(encoding="utf-8"))
    errors: list[str] = []

    def valid_id(label: str, value: object) -> None:
        if not isinstance(value, str) or not UUID.fullmatch(value):
            errors.append(f"{label} must be a UUID returned by Penpot")

    file_data = data["designSource"]
    valid_id("design file", file_data["fileId"])
    if data.get("issue") != 419 or data.get("reviewStatus") != "draft":
        errors.append("Only unapproved issue #419 initial design state is supported")
    if file_data.get("approval") != "pending":
        errors.append("Do not mark this draft design approved without evidence")
    upstream = data["externalReference"]
    valid_id("upstream reference", upstream["fileId"])
    if upstream["fileId"] == file_data["fileId"]:
        errors.append("The imported Fluent reference must be separate from Bluent v3")
    if not upstream.get("readOnly") or upstream.get("importableComponentsVerified") != 124:
        errors.append("Imported Fluent components should be recorded as 124, verified after sync")
    external_instance = upstream.get("realLinkedInstance", {})
    for field in ("componentId", "instanceId", "boardId"):
        valid_id(f"upstream linked instance {field}", external_instance.get(field))
    if not external_instance.get("linked") or not external_instance.get("visualInspection"):
        errors.append("Imported Button needs actual link/visual evidence")
    if upstream.get("sharedLibraryPublicationPending"):
        errors.append("Upstream linked library was already available after sync")
    if len(data["pages"]) != 15:
        errors.append("Expanded working file should expose fifteen tracked design pages")
    all_ids: list[str] = []
    for page in data["pages"]:
        valid_id(f"{page['key']} page", page["id"])
        valid_id(f"{page['key']} board", page["boardId"])
        all_ids.extend([page["id"], page["boardId"]])
    if len(all_ids) != len(set(all_ids)):
        errors.append("Design page/board IDs must be distinct")
    for c in data["components"]:
        valid_id(f"{c['name']} component", c["id"])
        valid_id(f"{c['name']} board", c["boardId"])
        if c.get("upstreamLinked") or c.get("approved"):
            errors.append("Draft local Button must not be represented as linked/approved")
    if {s["name"] for s in data["tokens"]["sets"]} != {
        "bluent-v3/draft/light", "bluent-v3/draft/dark", "bluent-v3/draft/layout",
        "bluent-v3/draft/typography", "bluent-v3/draft/spacing-scale",
        "bluent-v3/draft/motion", "bluent-v3/draft/density"
    }:
        errors.append("Missing expected draft token set")
    if sum(s["count"] for s in data["tokens"]["sets"]) != data["tokens"].get("totalEntries"):
        errors.append("Penpot token counts must total 49 in the extended draft")
    if data["tokens"].get("totalEntries") != 49 or not data["tokens"].get("modesLinkSharedSetsVerified"):
        errors.append("Expanded token-mode contract or shared-set toggle evidence missing")
    if data["designSource"].get("lastSeenRevision", 0) < 42:
        errors.append("Saved extended Penpot research version missing")
    if data["evidence"].get("extendedBoardsVisuallyInspected") != 5:
        errors.append("Five new foundation boards were not all reviewed")
    if data["evidence"].get("brandModeColorInventoryCount") != 20:
        errors.append("Expected source-verified ten brands times two modes")
    matrix = upstream.get("linkedButtonMatrix", {})
    if matrix.get("count") != 25 or len(matrix.get("styles", [])) != 5 or len(matrix.get("states", [])) != 5:
        errors.append("Expected complete 5x5 imported Button state reference")
    for key in ("pageId", "boardId"):
        valid_id(f"linked Button reference matrix {key}", matrix.get(key))
    if not matrix.get("linkedVerified") or not matrix.get("visuallyInspected"):
        errors.append("Button reference matrix must be linked and image-inspected")
    if data["evidence"].get("upstreamMatrixVerifiedLinkedCount") != 25:
        errors.append("The full upstream Button reference state matrix is not confirmed")
    # This is an offline ledger check, not an API assertion against the Penpot server.
    expected_matrices = {
        "input": (28, 84),
        "checkbox": (30, 30),
        "dialog": (4, 4),
        "datagrid-cell-medium": (7, 7),
        "switch": (40, 40),
    }
    recorded = upstream.get("linkedComponentMatrices", [])
    if len(recorded) != 5:
        errors.append("Expected five linked form/grid source-reference matrices")
    counts = 0
    for entry in recorded:
        family = entry.get("family", "")
        expected = expected_matrices.get(family)
        if expected is None:
            errors.append(f"Unexpected linked reference family: {family}")
            continue
        count, source_count = expected
        if entry.get("linkedInstanceCount") != count or entry.get("upstreamSourceVariantCount") != source_count:
            errors.append(f"Source/linked count discrepancy in {family}")
        for field in ("pageId", "boardId", "upstreamComponentId"):
            valid_id(f"{family} {field}", entry.get(field))
        if not entry.get("linkedVerified") or not entry.get("visuallyInspected"):
            errors.append(f"{family} requires source-linked and visually inspected evidence")
        matching_page = next((p for p in data["pages"] if p["id"] == entry.get("pageId")), None)
        if not matching_page or matching_page["boardId"] != entry.get("boardId"):
            errors.append(f"{family} board must be traceable to a manifest page")
        counts += entry.get("linkedInstanceCount", 0)
    if counts != 109 or upstream.get("totalLinkedReferenceMatrixInstances") != 134:
        errors.append("Input/Checkbox/Dialog/Grid cell/Switch and Button counts disagree")
    if upstream.get("totalLinkedReferenceMatrixFamilies") != 6:
        errors.append("Expected six reference matrix families including Button")
    if data["evidence"].get("formGridNewBoardsVisuallyInspected") != 5 or data["evidence"].get("formGridNewLinkedInstancesVerified") != 109:
        errors.append("Missing new Penpot form/grid visual and source-link review evidence")
    if data["evidence"].get("upstreamVariantSwitchingVerified") is not False:
        errors.append("Imported Fluent Button variant switching remains unverified")
    if data["guardrails"].get("integrationBranch") != "bluent-v3":
        errors.append("Integration branch must remain bluent-v3")
    if not data["guardrails"].get("stableDevUntouched"):
        errors.append("Do not mark v2 Dev branch changed by #419")
    print(f"#419 Penpot manifest: {len(data['pages'])} pages, "
          f"{len(data['tokens']['sets'])} token sets, "
          f"{len(data['tokens']['themes'])} themes, "
          f"{len(data['components'])} draft component(s); "
          f"{len(errors)} errors. Offline metadata only.")
    for problem in errors:
        print("ERROR:", problem)
    return int(bool(errors))


if __name__ == "__main__":
    sys.exit(main())