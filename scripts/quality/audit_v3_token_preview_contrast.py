#!/usr/bin/env python3
"""#418: source-backed numerical contrast audit for opt-in token research.

This is NOT a WCAG certification. It compares selected opaque token pairs
against neutral backgrounds in the 10 existing brand × 2 mode CSS bundles.
Known source gaps are checked for visibility rather than silently counted as
accessible; no product or stable token values are changed here.
"""
from __future__ import annotations

import json
from pathlib import Path
import sys

from generate_v3_token_preview import ROOT, THEME_DIR, load_source_tokens

MATRIX = ROOT / "docs/v3/tokens/issue-418-brand-matrix.preview.json"
NAMES = (
    "--colorPaletteRedForeground1",
    "--colorStatusDangerForeground1",
    "--colorBrandForeground1",
    "--colorBrandForeground2",
    "--colorBrandForegroundLink",
)
EXPECTED_DARK_FOREGROUND2_GAPS = {
    "default",
    "office",
    "outlook",
    "powerapps",
    "powerpoint",
    "stream",
    "teams",
    "word",
}


def luminance(color: str) -> float:
    code = color.strip().lstrip("#")
    if len(code) != 6:
        raise ValueError(f"Only opaque 6-digit hex values supported: {color}")
    values = [int(code[n:n + 2], 16) / 255 for n in (0, 2, 4)]
    linear = [v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in values]
    return sum(a * w for a, w in zip(linear, (0.2126, 0.7152, 0.0722)))


def contrast(a: str, b: str) -> float:
    x, y = luminance(a), luminance(b)
    return (max(x, y) + 0.05) / (min(x, y) + 0.05)


def main() -> int:
    matrix = json.loads(MATRIX.read_text(encoding="utf-8"))
    issues = []
    rows = []
    for brand, modes in matrix["brands"].items():
        for mode, entry in modes.items():
            t = entry["tokens"]
            source = load_source_tokens(THEME_DIR / f"theme-{brand}-{mode}.css", list(NAMES))
            bg = t["bluent.semantic.surface.default"]
            ratios = {
                "primaryText": contrast(t["bluent.semantic.text.primary"], bg),
                "onBrand": contrast(t["bluent.semantic.action.onBrand"], t["bluent.component.button.backgroundPrimary"]),
                "currentDanger": contrast(source["--colorStatusDangerForeground1"], bg),
                "proposedDanger": contrast(source["--colorPaletteRedForeground1"], bg),
                # The current opt-in draft maps action.foreground to BrandForeground1.
                # Record the actual pairing without assuming it is approved for text.
                "actionForeground": contrast(source["--colorBrandForeground1"], bg),
                "brandLinkForeground": contrast(source["--colorBrandForegroundLink"], bg),
                "brandForeground2": contrast(source["--colorBrandForeground2"], bg),
            }
            for pair in ("primaryText", "onBrand", "proposedDanger"):
                if ratios[pair] < 4.5:
                    issues.append(f"Below 4.5 for {brand}/{mode}/{pair}: {ratios[pair]:.3f}")

            # Existing dark Danger is a documented source gap; never allow the
            # opt-in source contract to silently hide the finding.
            if (ratios["currentDanger"] < 4.5) != (mode == "dark"):
                issues.append(f"Current Danger source drift: {brand}/{mode}")

            # This is a measured source gap, not an assertion that the candidate
            # is safe for ordinary text. If it changes, require the token review
            # and evidence to be updated instead of silently changing the report.
            for pair in ("actionForeground", "brandLinkForeground"):
                if (ratios[pair] < 4.5) != (mode == "dark"):
                    issues.append(f"Brand foreground gap pattern drift for {pair}: {brand}/{mode}")
            if any(ratios[pair] < 3.0 for pair in ("actionForeground", "brandLinkForeground", "brandForeground2")):
                issues.append(f"Brand foreground below 3.0 against neutral surface: {brand}/{mode}")

            rows.append({"brand": brand, "mode": mode, **ratios})

    if len(rows) != 20:
        issues.append(f"Expected 20 source brand/mode combinations; got {len(rows)}")

    observed_foreground2_gaps = {
        row["brand"] for row in rows
        if row["mode"] == "dark" and row["brandForeground2"] < 4.5
    }
    if observed_foreground2_gaps != EXPECTED_DARK_FOREGROUND2_GAPS:
        issues.append(
            "BrandForeground2 dark-mode contrast pattern drift: "
            f"expected {sorted(EXPECTED_DARK_FOREGROUND2_GAPS)}, got {sorted(observed_foreground2_gaps)}"
        )
    if any(row["mode"] == "light" and row["brandForeground2"] < 4.5 for row in rows):
        issues.append("BrandForeground2 Light source unexpectedly fell below 4.5 against neutral surface")

    minimum = {
        key: {
            "ratio": round(min(row[key] for row in rows), 3),
            "brandModes": [
                f"{row['brand']}/{row['mode']}"
                for row in rows
                if row[key] == min(other[key] for other in rows)
            ],
        }
        for key in (
            "primaryText", "onBrand", "currentDanger", "proposedDanger",
            "actionForeground", "brandLinkForeground", "brandForeground2",
        )
    }
    print(json.dumps({
        "pass": not issues,
        "classification": "Numerical contrast of selected opaque source-backed token colors; not full WCAG/AT",
        "brandModePairs": len(rows),
        "checks": len(rows) * 7,
        "coreContrastPairs": len(rows) * 4,
        "draftForegroundDiagnosticPairs": len(rows) * 3,
        "currentDangerBelow4_5": sum(row["currentDanger"] < 4.5 for row in rows),
        "suggestedDangerBelow4_5": sum(row["proposedDanger"] < 4.5 for row in rows),
        "actionForegroundBelow4_5": sum(row["actionForeground"] < 4.5 for row in rows),
        "brandLinkForegroundBelow4_5": sum(row["brandLinkForeground"] < 4.5 for row in rows),
        "brandForeground2Below4_5": sum(row["brandForeground2"] < 4.5 for row in rows),
        "draftActionForegroundApprovedForOrdinaryText": False,
        "draftBrandLinkForegroundApprovedForOrdinaryText": False,
        "draftBrandForeground2UniversalTextCandidate": False,
        "minimum": minimum,
        "issues": issues,
        "legacyCssModified": False,
        "sourceCandidate": "--colorPaletteRedForeground1",
        "reviewRequired": True,
        "reviewNotes": [
            "The opt-in draft action.foreground alias currently resolves to --colorBrandForeground1.",
            "All ten Dark brand action foreground pairs are below 4.5:1 on --colorNeutralBackground1.",
            "The source --colorBrandForegroundLink also falls below 4.5:1 in all ten Dark brands.",
            "The source --colorBrandForeground2 alternative remains below 4.5:1 in eight Dark brands.",
            "Do not treat any of these source roles as approved normal-text tokens without a reviewed semantic mapping."
        ],
    }, indent=2))
    return int(bool(issues))


if __name__ == "__main__":
    sys.exit(main())
