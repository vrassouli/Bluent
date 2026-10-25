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
    "--colorBrandForeground2Hover",
    "--colorNeutralForeground2",
    "--colorBrandForegroundLink",
    "--colorBrandForeground2Pressed",
    "--colorBrandForegroundLinkHover",
    "--colorBrandForegroundLinkPressed",
    "--colorNeutralForeground1",
    "--colorNeutralForeground2Link",
    "--colorNeutralForeground3",
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
EXPECTED_DARK_BRAND_LINK_HOVER_GAPS = {
    "default", "office", "outlook", "powerapps", "powerpoint", "stream", "teams", "word",
}
EXPECTED_ALL_DARK_BRANDS = {
    "default", "excel", "office", "outlook", "powerapps", "powerbi",
    "powerpoint", "stream", "teams", "word",
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
                "brandForeground2Hover": contrast(source["--colorBrandForeground2Hover"], bg),
                "neutralForeground2": contrast(source["--colorNeutralForeground2"], bg),
                # Keep state-specific source roles independently measurable.
                "brandForeground2Pressed": contrast(source["--colorBrandForeground2Pressed"], bg),
                "brandLinkHover": contrast(source["--colorBrandForegroundLinkHover"], bg),
                "brandLinkPressed": contrast(source["--colorBrandForegroundLinkPressed"], bg),
                "neutralForeground1": contrast(source["--colorNeutralForeground1"], bg),
                "neutralLinkForeground2": contrast(source["--colorNeutralForeground2Link"], bg),
                "neutralForeground3": contrast(source["--colorNeutralForeground3"], bg),
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
            for pair in (
                "brandForeground2Hover", "neutralForeground2", "brandForeground2Pressed",
                "neutralForeground1", "neutralLinkForeground2", "neutralForeground3",
            ):
                if ratios[pair] < 4.5:
                    issues.append(f"Measured candidate role below 4.5 against neutral surface: {brand}/{mode}/{pair}")

            # Link Hover and Link Pressed are distinct source states; guard their Dark gap patterns.
            if mode == "light" and ratios["brandLinkHover"] < 4.5:
                issues.append(f"Brand link hover unexpectedly below 4.5 in Light: {brand}")
            if mode == "light" and ratios["brandLinkPressed"] < 4.5:
                issues.append(f"Brand link pressed unexpectedly below 4.5 in Light: {brand}")

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

    observed_link_hover_gaps = {
        row["brand"] for row in rows
        if row["mode"] == "dark" and row["brandLinkHover"] < 4.5
    }
    if observed_link_hover_gaps != EXPECTED_DARK_BRAND_LINK_HOVER_GAPS:
        issues.append(
            "BrandForegroundLinkHover dark-mode contrast pattern drift: "
            f"expected {sorted(EXPECTED_DARK_BRAND_LINK_HOVER_GAPS)}, got {sorted(observed_link_hover_gaps)}"
        )
    observed_link_pressed_gaps = {
        row["brand"] for row in rows
        if row["mode"] == "dark" and row["brandLinkPressed"] < 4.5
    }
    if observed_link_pressed_gaps != EXPECTED_ALL_DARK_BRANDS:
        issues.append(
            "BrandForegroundLinkPressed dark-mode contrast pattern drift: "
            f"expected {sorted(EXPECTED_ALL_DARK_BRANDS)}, got {sorted(observed_link_pressed_gaps)}"
        )

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
            "brandForeground2Hover", "neutralForeground2", "brandForeground2Pressed",
            "brandLinkHover", "brandLinkPressed", "neutralForeground1", "neutralLinkForeground2",
            "neutralForeground3",
        )
    }
    print(json.dumps({
        "pass": not issues,
        "classification": "Numerical contrast of selected opaque source-backed token colors; not full WCAG/AT",
        "brandModePairs": len(rows),
        "checks": len(rows) * 15,
        "coreContrastPairs": len(rows) * 4,
        "draftForegroundDiagnosticPairs": len(rows) * 3,
        "candidateRoleDiagnosticPairs": len(rows) * 2,
        "additionalCandidateRoleDiagnosticPairs": len(rows) * 6,
        "currentDangerBelow4_5": sum(row["currentDanger"] < 4.5 for row in rows),
        "suggestedDangerBelow4_5": sum(row["proposedDanger"] < 4.5 for row in rows),
        "actionForegroundBelow4_5": sum(row["actionForeground"] < 4.5 for row in rows),
        "brandLinkForegroundBelow4_5": sum(row["brandLinkForeground"] < 4.5 for row in rows),
        "brandForeground2Below4_5": sum(row["brandForeground2"] < 4.5 for row in rows),
        "brandForeground2HoverBelow4_5": sum(row["brandForeground2Hover"] < 4.5 for row in rows),
        "neutralForeground2Below4_5": sum(row["neutralForeground2"] < 4.5 for row in rows),
        "brandForeground2PressedBelow4_5": sum(row["brandForeground2Pressed"] < 4.5 for row in rows),
        "brandLinkHoverBelow4_5": sum(row["brandLinkHover"] < 4.5 for row in rows),
        "brandLinkPressedBelow4_5": sum(row["brandLinkPressed"] < 4.5 for row in rows),
        "neutralForeground1Below4_5": sum(row["neutralForeground1"] < 4.5 for row in rows),
        "neutralLinkForeground2Below4_5": sum(row["neutralLinkForeground2"] < 4.5 for row in rows),
        "neutralForeground3Below4_5": sum(row["neutralForeground3"] < 4.5 for row in rows),
        "brandLinkHoverDarkGapBrands": sorted(observed_link_hover_gaps),
        "brandLinkPressedDarkGapBrands": sorted(observed_link_pressed_gaps),
        "brandForeground2PressedApprovedForGenericRest": False,
        "brandLinkHoverApprovedForRest": False,
        "brandLinkPressedApprovedForRest": False,
        "neutralForeground1ApprovedAsBrandedAction": False,
        "neutralLinkForeground2ApprovedAsBrandedAction": False,
        "neutralForeground3ApprovedAsBrandedAction": False,
        "draftActionForegroundApprovedForOrdinaryText": False,
        "draftBrandLinkForegroundApprovedForOrdinaryText": False,
        "draftBrandForeground2UniversalTextCandidate": False,
        "draftBrandForeground2HoverApprovedForGenericRest": False,
        "neutralForeground2ApprovedAsBrandedAction": False,
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
            "The source --colorBrandForeground2Hover is above 4.5:1 in all 20 pairs (minimum 6.172:1), but it is a state-specific Hover role, not approval for generic Rest text.",
            "The source --colorNeutralForeground2 is above 4.5:1 in all 20 pairs (minimum 10.010:1), but it removes brand coloration and still requires semantic review.",
            "The source --colorBrandForeground2Pressed is above 4.5:1 in all 20 pairs (minimum 10.017:1), but Pressed is state-specific and not a generic Rest mapping.",
            "The source --colorBrandForegroundLinkHover falls below 4.5:1 in eight Dark brands (minimum 4.294:1); it does not resolve the generic link contrast gap.",
            "The source --colorBrandForegroundLinkPressed falls below 4.5:1 in all ten Dark brands (minimum 2.911:1); Pressed needs a separate reviewed treatment.",
            "The source --colorNeutralForeground1 is above 4.5:1 in all 20 pairs (minimum 14.548:1), but it is neutral rather than branded.",
            "The source --colorNeutralForeground2Link is above 4.5:1 in all 20 pairs (minimum 10.010:1), but it is a neutral link role, not a branded action role.",
            "The source --colorNeutralForeground3 is above 4.5:1 in all 20 pairs (minimum 6.193:1), but it is a lower-emphasis neutral role and needs hierarchy review.",
            "Do not treat any candidate source role as the approved action.foreground mapping without a reviewed semantic decision.",
        ],
    }, indent=2))
    return int(bool(issues))


if __name__ == "__main__":
    sys.exit(main())
