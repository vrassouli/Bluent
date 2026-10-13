#!/usr/bin/env python3
"""#418 source-only contrast audit of a BRAND-PRESERVING Button focus candidate.

This is not production CSS, WCAG/AT signoff or approval for colored surfaces.
"""
from __future__ import annotations
import json
from audit_v3_token_preview_contrast import contrast
from generate_v3_token_preview import THEME_DIR, load_source_tokens

SOURCE_NAMES = ["--colorNeutralBackground1", "--colorNeutralBackground1Hover", "--colorBrandBackground", "--colorCompoundBrandStroke"]


def audit():
    problems, cases = [], []
    for mode in ("light", "dark"):
        for path in sorted(THEME_DIR.glob(f"theme-*-{mode}.css")):
            brand = path.stem.removeprefix("theme-").removesuffix(f"-{mode}")
            vals = load_source_tokens(path, SOURCE_NAMES)
            surface = vals["--colorNeutralBackground1"]
            current = vals["--colorBrandBackground"]
            candidate = vals["--colorCompoundBrandStroke"]
            current_ratio = contrast(current, surface)
            candidate_ratio = contrast(candidate, surface)
            hover_surface = vals["--colorNeutralBackground1Hover"]
            candidate_hover_ratio = contrast(candidate, hover_surface)
            if mode == "light":
                if current_ratio < 3:
                    problems.append(f"{brand}/light current brand below 3:1: {current_ratio:.3f}")
                if current.lower() != candidate.lower():
                    problems.append(f"{brand}/light existing compound diverges")
            else:
                if current_ratio >= 3:
                    problems.append(f"{brand}/dark baseline changed: audit the selection")
                if candidate_ratio < 3:
                    problems.append(f"{brand}/dark compound candidate below 3:1: {candidate_ratio:.3f}")
            cases.append({
                "brand": brand, "mode": mode, "neutralHost": surface,
                "currentBrand": current, "currentContrast": round(current_ratio, 3),
                "existingCompoundBrandStroke": candidate,
                "candidateContrast": round(candidate_ratio, 3),
                "hoverHost": hover_surface,
                "candidateHoverContrast": round(candidate_hover_ratio, 3),
                "hoverReviewRequired": candidate_hover_ratio < 3,
            })
    brands = {r["brand"] for r in cases}
    if len(cases) != 20 or len(brands) != 10:
        problems.append(f"Expected ten brands x two modes; found {len(brands)} / {len(cases)}")
    return {"pass": not problems,
            "classification": "Numerical opt-in source research on neutral and hover hosts (hover gaps disclosed); not a public Button token approval",
            "cases": cases, "errors": problems}


if __name__ == "__main__":
    result = audit()
    print(json.dumps(result, indent=2))
    raise SystemExit(0 if result["pass"] else 1)
