#!/usr/bin/env python3
"""#418: source-backed numerical text contrast audit for opt-in token research.

This is NOT a WCAG certification. It compares selected opaque token pairs
against neutral backgrounds in the 10 existing brand × 2 mode CSS bundles.
The current danger token is intentionally not changed in stable CSS.
"""
from __future__ import annotations

import json
from pathlib import Path
import sys

from generate_v3_token_preview import ROOT, THEME_DIR, load_source_tokens

MATRIX = ROOT / "docs/v3/tokens/issue-418-brand-matrix.preview.json"
NAMES = ("--colorPaletteRedForeground1", "--colorStatusDangerForeground1")


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
            }
            for pair in ("primaryText", "onBrand", "proposedDanger"):
                if ratios[pair] < 4.5:
                    issues.append(f"Below 4.5 for {brand}/{mode}/{pair}: {ratios[pair]:.3f}")
            # Current dark Danger is a documented design gap; never allow
            # the opt-in source contract to silently hide the finding.
            if (ratios["currentDanger"] < 4.5) != (mode == "dark"):
                issues.append(f"Current Danger source drift: {brand}/{mode}")
            rows.append({"brand": brand, "mode": mode, **ratios})
    if len(rows) != 20:
        issues.append(f"Expected 20 source brand/mode combinations; got {len(rows)}")
    print(json.dumps({
        "pass": not issues,
        "classification": "Numerical contrast of selected opaque source-backed token colors; not full WCAG/AT",
        "brandModePairs": len(rows),
        "checks": len(rows) * 4,
        "currentDangerBelow4_5": sum(r["currentDanger"] < 4.5 for r in rows),
        "suggestedDangerBelow4_5": sum(r["proposedDanger"] < 4.5 for r in rows),
        "minimum": {k: {"ratio": round(min(r[k] for r in rows), 3),
                         "brandModes": [f"{r['brand']}/{r['mode']}" for r in rows if r[k] == min(z[k] for z in rows)]}
                    for k in ("primaryText", "onBrand", "currentDanger", "proposedDanger")},
        "issues": issues,
        "legacyCssModified": False,
        "sourceCandidate": "--colorPaletteRedForeground1",
        "reviewRequired": True,
    }, indent=2))
    return int(bool(issues))


if __name__ == "__main__":
    sys.exit(main())
