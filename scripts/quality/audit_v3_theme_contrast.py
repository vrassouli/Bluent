#!/usr/bin/env python3
"""Exploratory WCAG contrast baseline across existing branded Bluent themes.

Measure only *explicitly paired opaque CSS variables*, not actual DOM contrast,
disabled states, composite backgrounds, focus outlines or full WCAG conformance.
Outputs compact summary; --json includes per-brand/mode evidence.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
THEMES = ROOT / "src/Bluent.UI/Styles/Themes"
PAIRS = (
    ("neutral-text", "--colorNeutralForeground1", "--colorNeutralBackground1"),
    ("primary-button", "--colorNeutralForegroundOnBrand", "--colorBrandBackground"),
    ("primary-hover", "--colorNeutralForegroundOnBrand", "--colorBrandBackgroundHover"),
    ("primary-pressed", "--colorNeutralForegroundOnBrand", "--colorBrandBackgroundPressed"),
)
ASSUMED_MIN_TEXT_RATIO = 4.5
TOKEN = re.compile(r"(--[\w-]+)\s*:\s*([^;{}]+);")
HEX = re.compile(r"^#([0-9a-fA-F]{3,8})$")


def rgb(value: str) -> tuple[int, int, int] | None:
    found = HEX.fullmatch(value.strip())
    if not found:
        return None
    digits = found.group(1)
    if len(digits) == 3:
        return tuple(int(c * 2, 16) for c in digits)
    if len(digits) == 6:
        return tuple(int(digits[i:i+2], 16) for i in (0, 2, 4))
    # alpha cannot be evaluated without a known composited background
    return None


def luminance(color: tuple[int, int, int]) -> float:
    channels = [n / 255 for n in color]
    linear = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
              for c in channels]
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]


def contrast(foreground: str, background: str) -> float | None:
    a, b = rgb(foreground), rgb(background)
    if a is None or b is None:
        return None
    left, right = sorted((luminance(a), luminance(b)), reverse=True)
    return round((left + 0.05) / (right + 0.05), 3)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--json", action="store_true", help="All comparisons")
    options = parser.parse_args()
    details = []
    for filename in sorted(THEMES.glob("theme-*-light.css")):
        brand = filename.name.removeprefix("theme-").removesuffix("-light.css")
        for mode in ("light", "dark"):
            source = (THEMES / f"theme-{brand}-{mode}.css").read_text(encoding="utf-8-sig")
            props = dict(TOKEN.findall(source))
            for key, fg, bg in PAIRS:
                ratio = contrast(props.get(fg, ""), props.get(bg, ""))
                details.append({
                    "brand": brand, "mode": mode, "pair": key,
                    "foreground_token": fg, "foreground": props.get(fg),
                    "background_token": bg, "background": props.get(bg),
                    "ratio": ratio, "below_4_5": ratio is not None and ratio < ASSUMED_MIN_TEXT_RATIO,
                })
    low = [x for x in details if x["below_4_5"]]
    not_measured = [x for x in details if x["ratio"] is None]
    report = {
        "classification": "candidate opaque CSS text-pair ratios; not rendered UI/WCAG proof",
        "threshold": ASSUMED_MIN_TEXT_RATIO, "count": len(details),
        "below_threshold": len(low), "unmeasurable": len(not_measured),
        "low_pairs": low, "unmeasurable_pairs": not_measured,
        "all_pairs": details if options.json else None,
    }
    if options.json:
        print(json.dumps(report, indent=2))
    else:
        print(f"Candidate text color pairs: {len(details)}")
        print(f"Under {ASSUMED_MIN_TEXT_RATIO}: {len(low)}")
        print(f"Unmeasurable color pairs: {len(not_measured)}")
        for entry in low:
            print(f"  {entry['brand']:12} {entry['mode']:5} {entry['pair']:16} "
                  f"{entry['ratio']:.3f} ({entry['foreground']}/{entry['background']})")


if __name__ == "__main__":
    main()
