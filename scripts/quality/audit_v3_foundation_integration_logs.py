#!/usr/bin/env python3
"""Verify real, independently run four-mode #418/#420 foundation CDP logs.

This is a *historical local integration evidence* validator, not a substitute
for final merged-head CI or native Windows AT / human design acceptance.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re

MODES = {
    "chrome_wasm": ("actual Blazor WebAssembly Chrome/CDP interaction", 950),
    "chrome_server": ("actual Blazor InteractiveServer Chrome/CDP interaction", 949),
    "edge_wasm": ("actual Blazor WebAssembly Edge/CDP interaction", 950),
    "edge_server": ("actual Blazor InteractiveServer Edge/CDP interaction", 949),
}
ORIGIN = re.compile(r"^v3 isolated deep probe origin: (http://127\.0\.0\.1:(\d+))\r?$", re.M)
SUMMARY = re.compile(r'\{\s*"classification"\s*:')
UNEXPECTED_ERROR = re.compile(
    r"(?m)^(Probe error:|Bluent QA host diagnostics:|Owned temporary QA browser cleanup failed:)"
)


def audit_log(mode: str, path: Path) -> dict:
    if mode not in MODES:
        raise ValueError(f"unknown browser/render mode {mode!r}")
    raw = path.read_bytes()
    content = raw.decode("utf-8-sig")
    origin = ORIGIN.findall(content)
    if len(origin) != 1:
        raise ValueError(f"{mode}: expected exactly one unique localhost origin")
    if UNEXPECTED_ERROR.search(content):
        raise ValueError(f"{mode}: failed browser/host/cleanup diagnostic present")
    matches = list(SUMMARY.finditer(content))
    if len(matches) != 1:
        raise ValueError(f"{mode}: expected exactly one complete browser summary")
    try:
        report, _ = json.JSONDecoder().raw_decode(content[matches[0].start():])
    except json.JSONDecodeError as exc:
        raise ValueError(f"{mode}: truncated/invalid browser JSON summary") from exc
    expected_label, expected_count = MODES[mode]
    if report.get("classification") != expected_label:
        raise ValueError(f"{mode}: wrong browser/render classification")
    if (
        type(report.get("passed")) is not int
        or type(report.get("total")) is not int
        or type(report.get("failed")) is not int
        or report["passed"] != expected_count
        or report["total"] != expected_count
        or report["failed"] != 0
        or report.get("errors") != []
    ):
        raise ValueError(f"{mode}: not all {expected_count} real assertions passed")
    return {
        "mode": mode,
        "classification": expected_label,
        "passed": expected_count,
        "total": expected_count,
        "failed": 0,
        "origin_port": int(origin[0][1]),
        "log_basename": path.name,
        "log_sha256": hashlib.sha256(raw).hexdigest(),
    }


def verify_matrix(inputs: dict[str, Path], task_heads: dict[str, str]) -> dict:
    if set(inputs) != set(MODES):
        raise ValueError("Four independent Chrome/Edge x WASM/Server logs are required")
    if set(task_heads) != {"418", "420", "425", "421"} or not all(
        re.fullmatch(r"[0-9a-f]{40}", sha) for sha in task_heads.values()
    ):
        raise ValueError("All four exact task branch HEAD SHAs are required")
    records = [audit_log(mode, inputs[mode]) for mode in MODES]
    ports = [item["origin_port"] for item in records]
    if len(set(ports)) != len(ports):
        raise ValueError("Two runs used the same localhost port; cannot prove isolation")
    digests = [item["log_sha256"] for item in records]
    if len(set(digests)) != len(digests):
        raise ValueError("Duplicate logs cannot prove independent browser modes")
    return {
        "classification": "historical-local-runtime-evidence-only",
        "not_certified": [
            "native OS high-contrast, Windows Text Size, named screen reader AT (NVDA/JAWS/Narrator)",
            "human approved Penpot/Figma parity, WCAG certification",
            "final protected-branch integration or real NuGet release",
            "historical intermittent host loss or Dialog focus permanently fixed",
        ],
        "task_heads": task_heads,
        "passed": sum(item["passed"] for item in records),
        "total": sum(item["total"] for item in records),
        "modes": records,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    for mode in MODES:
        parser.add_argument("--" + mode.replace("_", "-"), type=Path, required=True)
    for number in ("418", "420", "425", "421"):
        parser.add_argument("--head-" + number, required=True)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    inputs = {mode: getattr(args, mode) for mode in MODES}
    heads = {number: getattr(args, "head_" + number) for number in ("418", "420", "425", "421")}
    report = verify_matrix(inputs, heads)
    encoded = json.dumps(report, indent=2, ensure_ascii=False) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(encoded, encoding="utf-8")
    else:
        print(encoded, end="")


if __name__ == "__main__":
    main()