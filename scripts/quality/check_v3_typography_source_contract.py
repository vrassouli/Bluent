#!/usr/bin/env python3
"""#418 read-only source audit of the current v2 typography CSS.

No fonts are selected or shipped by this script. It measures whether the
*existing* Fluent-derived CSS source has one stable typography scale across
all ten Bluent brands and both Light/Dark modes; design approval is separate.
"""
from __future__ import annotations

import json
import re

from generate_v3_scoped_brands import read_source

BRANDS = (
    "default", "excel", "office", "outlook", "powerapps", "powerbi",
    "powerpoint", "stream", "teams", "word",
)
MODES = ("light", "dark")
KEYS = (
    "--fontFamilyBase", "--fontFamilyNumeric", "--fontFamilyMonospace",
    "--fontWeightRegular", "--fontWeightSemibold",
    *(f"--fontSizeBase{x}" for x in (100, 200, 300, 400, 500, 600)),
    *(f"--lineHeightBase{x}" for x in (100, 200, 300, 400, 500, 600)),
)
SIZES = re.compile(r"^[0-9]+(?:\.[0-9]+)?px$")


def run() -> dict:
    refs = {
        (b, m): read_source(b, m)
        for b in BRANDS for m in MODES
    }
    base = refs[("default", "light")]
    differences: list[dict[str, str]] = []
    missing: list[str] = []
    for (brand, mode), values in refs.items():
        for key in KEYS:
            if key not in values:
                missing.append(f"{brand}/{mode}: {key}")
            elif values[key] != base.get(key):
                differences.append({
                    "brand": brand, "mode": mode, "token": key,
                    "expected": base.get(key, "<missing>"),
                    "actual": values[key],
                })
    units = {
        key: base.get(key)
        for key in KEYS if key.startswith(("--fontSize", "--lineHeight"))
    }
    bad_units = [f"{key}: {value}" for key, value in units.items()
                 if value is None or not SIZES.fullmatch(value)]
    bad_lines = [
        n for n in (100, 200, 300, 400, 500, 600)
        if float(base[f"--lineHeightBase{n}"].removesuffix("px"))
        < float(base[f"--fontSizeBase{n}"].removesuffix("px"))
    ] if not (missing or bad_units) else []
    issues = missing + [json.dumps(x, ensure_ascii=False) for x in differences] + bad_units + [f"lineHeight smaller than fontSize: {n}" for n in bad_lines]
    result = {
        "researchOnly": True,
        "source": "existing emitted Bluent theme CSS, not approved v3 typography",
        "brands": len(BRANDS),
        "modes": len(MODES),
        "combinations": len(refs),
        "tokensPerCombination": len(KEYS),
        "sourceScaleSizes": [100, 200, 300, 400, 500, 600],
        "largerTypeScaleNotDeclared": True,
        "familyStack": base.get("--fontFamilyBase"),
        "sampleFontSize300": base.get("--fontSizeBase300"),
        "sampleLineHeight300": base.get("--lineHeightBase300"),
        "equalAcrossBrandModes": len(differences) == 0,
        "errors": issues,
    }
    return result


if __name__ == "__main__":
    output = run()
    print(json.dumps(output, indent=2, ensure_ascii=False))
    if output["errors"]:
        raise SystemExit(1)
