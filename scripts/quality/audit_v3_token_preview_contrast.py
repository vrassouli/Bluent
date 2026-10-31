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

    # User-approved direction: keep each source brand hue, derive separate
    # Dark Rest/Hover/Pressed candidates from their corresponding source role.
    # These are opt-in preview values, not public token/API acceptance.
    dark_candidates = matrix.get("darkBrandForegroundCandidates", {})
    candidate_pairs = []
    expected_candidate_sources = {
        "action": "--colorBrandForeground1",
        "linkRest": "--colorBrandForegroundLink",
        "linkHover": "--colorBrandForegroundLinkHover",
        "linkPressed": "--colorBrandForegroundLinkPressed",
    }
    candidate_brands = {
        key for key, value in dark_candidates.items()
        if isinstance(value, dict) and "roles" in value
    }
    if candidate_brands != EXPECTED_ALL_DARK_BRANDS:
        issues.append(
            "Expected one generated dark foreground candidate set for every brand: "
            f"got {sorted(candidate_brands)}"
        )
    for brand in sorted(EXPECTED_ALL_DARK_BRANDS):
        entry = dark_candidates.get(brand, {})
        background = entry.get("background")
        if not background:
            issues.append(f"Missing Dark candidate background for {brand}")
            continue
        if background.upper() != load_source_tokens(THEME_DIR / f"theme-{brand}-dark.css", ["--colorNeutralBackground1"])["--colorNeutralBackground1"].upper():
            issues.append(f"Dark candidate background drift for {brand}")
        role_values = entry.get("roles", {})
        if set(role_values) != set(expected_candidate_sources):
            issues.append(f"Expected four separate Rest/Hover/Pressed foreground roles for {brand}")
            continue
        source_values = load_source_tokens(
            THEME_DIR / f"theme-{brand}-dark.css", list(expected_candidate_sources.values())
        )
        for role, source_name in expected_candidate_sources.items():
            candidate = role_values[role]
            if candidate.get("sourceCss") != source_name or candidate.get("outputCss") is None:
                issues.append(f"Foreground role/source mapping drift for {brand}/{role}")
                continue
            if candidate.get("source", "").upper() != source_values[source_name].upper():
                issues.append(f"Foreground source value mismatch for {brand}/{role}")
            measured = contrast(candidate["candidate"], background)
            candidate_pairs.append({"brand": brand, "role": role, "ratio": measured})
            if measured < 4.5:
                issues.append(f"Dark brand foreground below minimum 4.5:1: {brand}/{role}={measured:.4f}")
            if measured < 4.6:
                issues.append(f"Dark brand foreground missed preview buffer 4.6:1: {brand}/{role}={measured:.4f}")
            if abs(measured - float(candidate.get("contrastRatio", -1))) > 0.0001:
                issues.append(f"Stored/computed candidate contrast mismatch for {brand}/{role}")

    if len(candidate_pairs) != 40:
        issues.append(f"Expected 40 dark brand foreground candidate pairs; got {len(candidate_pairs)}")

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
        "classification": "300 source-backed opaque-pair diagnostics plus 40 generated per-brand Dark foreground preview pairs; not full WCAG/AT",
        "brandModePairs": len(rows),
        "checks": len(rows) * 15 + len(candidate_pairs),
        "sourceDiagnosticChecks": len(rows) * 15,
        "darkBrandForegroundCandidatePairs": len(candidate_pairs),
        "darkBrandForegroundCandidatesBelow4_5": sum(item["ratio"] < 4.5 for item in candidate_pairs),
        "darkBrandForegroundCandidatesBelow4_6": sum(item["ratio"] < 4.6 for item in candidate_pairs),
        "darkBrandForegroundCandidateMinimum": round(min((item["ratio"] for item in candidate_pairs), default=0), 4),
        "darkBrandForegroundCandidateMinimumByRole": {
            role: round(min((item["ratio"] for item in candidate_pairs if item["role"] == role), default=0), 4)
            for role in expected_candidate_sources
        },
        "darkBrandForegroundDirectionApproved": True,
        "darkBrandForegroundValuesApprovedForProduction": False,
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
            "The maintainer approved the brand-preserving direction: each brand keeps a dedicated Dark foreground derived from its own source hue.",
            "The generated opt-in preview now contains 40 Dark candidate values: Action Rest, Link Rest, Link Hover and Link Pressed for all ten source brands; all meet the 4.6:1 preview target against the emitted neutral Dark surface.",
            "Link Hover and Pressed candidates derive from their own corresponding state sources; no state value is substituted for Rest.",
            "Exact values are design/review candidates, not approved public token names or shipped CSS; rendered Blazor, forced-colors and native AT review remain separate gates.",
            "The opt-in draft action.foreground alias currently resolves to --colorBrandForeground1 in the base mapping; a per-brand Dark selector overrides it only inside the existing v3 token scope.",
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
            "The brand-preserving direction is approved, but candidate color values and public token names remain gated on editable design review and rendered Blazor/forced-colors/AT evidence.",
        ],
    }, indent=2))
    return int(bool(issues))


if __name__ == "__main__":
    sys.exit(main())
