#!/usr/bin/env python3
"""#418 research-only brand-scoped source CSS (all 10 existing brands x 2 modes).

Reads emitted, unminified Bluent theme CSS; does not alter theme bundles.
Only variables that differ between existing brands within a mode are
overridden. Every brand gets the complete *union* of varying variables,
so changing a document-wide legacy stylesheet cannot leak its colors
into an explicitly scoped v3 host. No guessing from hex values.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

from v3_theme_css_parser import read_theme_variables

ROOT = Path(__file__).resolve().parents[2]
SCHEMA = ROOT / "docs/v3/tokens/issue-418-token-schema.preview.json"
THEMES = ROOT / "src/Bluent.UI/Styles/Themes"
OUTPUT = ROOT / "docs/v3/tokens/issue-418-brand-scopes.preview.css"
def read_source(brand: str, mode: str) -> dict[str, str]:
    return read_theme_variables(THEMES / f"theme-{brand}-{mode}.css", mode)

def generate() -> tuple[str, dict]:
    source = json.loads(SCHEMA.read_text(encoding="utf-8"))
    if source["issue"] != 418:
        raise ValueError("Invalid schema issue")
    brands, modes = source["supportedBrands"], source["modes"]
    if len(brands) != 10 or modes != ["light", "dark"]:
        raise ValueError("Unexpected source brand/mode contract")
    definitions = {(b, m): read_source(b, m) for b in brands for m in modes}
    baseline = set(definitions[(brands[0], modes[0])])
    for (brand, mode), values in definitions.items():
        if set(values) != baseline:
            raise ValueError(f"Inconsistent brand variable keys: {brand}/{mode}")
    changing = sorted(
        key for key in baseline
        if any(len({definitions[(brand, mode)][key].lower() for brand in brands}) > 1
               for mode in modes)
    )
    # Preserve strict selectors and keep all source tokens in their originating mode.
    css = [
        "/* GENERATED #418 DEMO-ONLY experimental per-host brand variable bridge.",
        "   Source: src/Bluent.UI/Styles/Themes/theme-{brand}-{mode}.css",
        "   Not shipped in Bluent.UI, NuGet or the stable Dev branch.",
        "   Regenerate: python scripts/quality/generate_v3_scoped_brands.py */",
    ]
    for brand in brands:
        for mode in modes:
            css.append(
                f'[data-bui-v3-tokens][data-bui-brand="{brand}"][data-bui-theme="{mode}"] {{'
            )
            for var in changing:
                css.append(f"  {var}: {definitions[(brand, mode)][var]};")
            css.append("}")
    return "\n".join(css) + "\n", {
        "brands": len(brands),
        "modes": len(modes),
        "modeCombinations": len(definitions),
        "sourceVariablesPerMode": len(baseline),
        "brandSensitiveVariables": len(changing),
        "declarations": len(changing) * len(definitions),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    expected, summary = generate()
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != expected:
            raise SystemExit("FAIL: scoped-brand research asset drift")
    else:
        OUTPUT.write_text(expected, encoding="utf-8")
    print(json.dumps({"pass": True, "mode": "check" if args.check else "generate",
                      "demoOnly": True, **summary}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
