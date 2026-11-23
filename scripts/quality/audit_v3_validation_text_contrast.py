from __future__ import annotations
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
THEMES_DIR = ROOT / "src/Bluent.UI/Styles/Themes"
FIELD_SCSS = ROOT / "src/Bluent.UI/Styles/Components/_field.scss"
BRANDS = ("default", "excel", "office", "outlook", "powerapps", "powerbi", "powerpoint", "stream", "teams", "word")
MODES = ("light", "dark")
FOREGROUND = "colorPaletteRedForeground1"
BACKGROUNDS = ("colorNeutralBackground1", "colorNeutralBackground2", "colorNeutralBackground3")
BACKGROUND_NAME_PATTERN = re.compile(r"--(color[A-Za-z0-9]*Background[A-Za-z0-9]*)\s*:")
OPAQUE_HEX_PATTERN = re.compile(r"--(color[A-Za-z0-9]*Background[A-Za-z0-9]*)\s*:\s*(#[0-9a-fA-F]{6})\s*;")


def discover_background_tokens(themes_dir: Path) -> tuple[tuple[str, ...], tuple[str, ...]]:
    """Return the complete common background inventory split by opaque hex support.

    Alpha, transparent, and other non-hex values cannot be compared without
    knowing the actual composited host pixels, so they are listed separately.
    Any per-theme inventory drift fails closed instead of silently shrinking
    the diagnostic matrix.
    """
    paths = sorted(themes_dir.glob("theme-*.css"))
    if not paths:
        raise ValueError(f"No theme CSS files found in {themes_dir}")

    inventories: dict[Path, set[str]] = {}
    opaque_values: dict[Path, dict[str, str]] = {}
    for path in paths:
        css = path.read_text(encoding="utf-8-sig")
        inventories[path] = set(BACKGROUND_NAME_PATTERN.findall(css))
        opaque_values[path] = {name: value.lower() for name, value in OPAQUE_HEX_PATTERN.findall(css)}

    expected = set.union(*inventories.values())
    mismatches = {
        path.name: sorted(expected - names)
        for path, names in inventories.items()
        if names != expected
    }
    if mismatches:
        raise ValueError(f"Theme background inventory differs between files: {mismatches}")

    opaque_counts = {
        name: sum(name in values for values in opaque_values.values())
        for name in expected
    }
    mixed_formats = {
        name: count
        for name, count in opaque_counts.items()
        if 0 < count < len(paths)
    }
    if mixed_formats:
        raise ValueError(
            "Background values mix opaque hex and non-hex formats between themes: "
            f"{mixed_formats}"
        )

    opaque_common = {name for name, count in opaque_counts.items() if count == len(paths)}
    non_opaque = expected - opaque_common
    return tuple(sorted(opaque_common)), tuple(sorted(non_opaque))


OPAQUE_BACKGROUNDS, NON_OPAQUE_BACKGROUNDS = discover_background_tokens(THEMES_DIR)
# Exhaustively compare every common opaque background except the three formal
# neutral-base acceptance surfaces. This diagnostic inventory is derived from
# source themes and intentionally does not expand the formal pass/fail gate.
DIAGNOSTIC_BACKGROUNDS = tuple(name for name in OPAQUE_BACKGROUNDS if name not in BACKGROUNDS)


def parse_theme_values(css: str, background_names: tuple[str, ...] | None = None) -> dict[str, str]:
    values: dict[str, str] = {}
    if background_names is None:
        background_names = (*BACKGROUNDS, *DIAGNOSTIC_BACKGROUNDS)
    for name in (FOREGROUND, *background_names):
        match = re.search(rf"--{re.escape(name)}\s*:\s*(#[0-9a-fA-F]{{6}})\s*;", css)
        if match:
            values[name] = match.group(1).lower()
    return values


def relative_luminance(color: str) -> float:
    if not re.fullmatch(r"#[0-9a-fA-F]{6}", color):
        raise ValueError(f"Expected a six-digit hex color, got {color!r}")
    channels = [int(color[index:index + 2], 16) / 255 for index in (1, 3, 5)]
    def linearize(channel: float) -> float:
        return channel / 12.92 if channel <= 0.04045 else ((channel + 0.055) / 1.055) ** 2.4
    red, green, blue = (linearize(channel) for channel in channels)
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue


def contrast_ratio(foreground: str, background: str) -> float:
    first, second = relative_luminance(foreground), relative_luminance(background)
    lighter, darker = max(first, second), min(first, second)
    return (lighter + 0.05) / (darker + 0.05)


def audit_validation_text(root: Path = ROOT) -> dict:
    themes_dir = root / "src/Bluent.UI/Styles/Themes"
    field_scss = root / "src/Bluent.UI/Styles/Components/_field.scss"
    source = field_scss.read_text(encoding="utf-8-sig")
    selector = re.search(
        r"\.validation-message\s*\{\s*color:\s*var\(--colorPaletteRedForeground1\)\s*;",
        source,
    )
    if selector is None:
        raise ValueError("_field.scss must preserve .validation-message -> --colorPaletteRedForeground1")

    diagnostic_backgrounds, non_opaque_backgrounds = discover_background_tokens(themes_dir)
    diagnostic_backgrounds = tuple(name for name in diagnostic_backgrounds if name not in BACKGROUNDS)
    required_backgrounds = (*BACKGROUNDS, *diagnostic_backgrounds)

    entries, seen = [], set()
    for path in sorted(themes_dir.glob("theme-*.css")):
        match = re.fullmatch(r"theme-([a-z0-9]+)-(light|dark)\.css", path.name)
        if match is None:
            continue
        brand, mode = match.groups()
        values = parse_theme_values(path.read_text(encoding="utf-8-sig"), required_backgrounds)
        missing = [name for name in (FOREGROUND, *required_backgrounds) if name not in values]
        if missing:
            raise ValueError(f"{path.name} is missing theme variables: {', '.join(missing)}")
        key = (brand, mode)
        if key in seen:
            raise ValueError(f"Duplicate theme combination: {brand}/{mode}")
        seen.add(key)
        ratios = {name: round(contrast_ratio(values[FOREGROUND], values[name]), 4) for name in BACKGROUNDS}
        diagnostic_ratios = {
            name: round(contrast_ratio(values[FOREGROUND], values[name]), 4)
            for name in diagnostic_backgrounds
        }
        entries.append({
            "theme": path.stem,
            "brand": brand,
            "mode": mode,
            "foreground": values[FOREGROUND],
            "backgrounds": {name: values[name] for name in BACKGROUNDS},
            "contrast": ratios,
            "minimum": min(ratios.values()),
            "diagnosticContrast": diagnostic_ratios,
        })

    expected = {(brand, mode) for brand in BRANDS for mode in MODES}
    if seen != expected:
        raise ValueError(f"Theme matrix mismatch; missing={sorted(expected-seen)}, extra={sorted(seen-expected)}")
    all_ratios = [ratio for entry in entries for ratio in entry["contrast"].values()]
    diagnostic_summaries = {
        name: {
            "minimum": round(min(entry["diagnosticContrast"][name] for entry in entries), 4),
            "passingPairs": sum(entry["diagnosticContrast"][name] >= 4.5 for entry in entries),
            "totalPairs": len(entries),
        }
        for name in diagnostic_backgrounds
    }
    diagnostic_ratios = [
        ratio for entry in entries for ratio in entry["diagnosticContrast"].values()
    ]
    failures = [
        {"theme": entry["theme"], "surface": surface, "ratio": ratio}
        for entry in entries for surface, ratio in entry["contrast"].items() if ratio < 4.5
    ]
    return {
        "pass": not failures,
        "sourceSelector": ".validation-message",
        "sourceVariable": f"--{FOREGROUND}",
        "brands": len(BRANDS),
        "modes": len(MODES),
        "brandModeCombinations": len(entries),
        "neutralSurfacesPerCombination": len(BACKGROUNDS),
        "contrastPairs": len(all_ratios),
        "normalTextMinimum": 4.5,
        "measuredMinimum": round(min(all_ratios), 4),
        "opaqueBackgroundTokens": len(required_backgrounds),
        "diagnosticSurfacesPerCombination": len(diagnostic_backgrounds),
        "diagnosticContrastPairs": len(diagnostic_ratios),
        "diagnosticSummaries": diagnostic_summaries,
        "nonOpaqueBackgroundsExcludedFromArithmetic": list(non_opaque_backgrounds),
        "diagnosticScope": "All common opaque six-digit-hex source backgrounds except the three formal neutral-base surfaces; these diagnostics do not affect the neutral-surface pass/fail result. Non-opaque/alpha backgrounds are listed separately because contrast depends on compositing.",
        "failures": failures,
        "entries": entries,
    }


if __name__ == "__main__":
    try:
        result = audit_validation_text()
    except (OSError, ValueError) as error:
        print(json.dumps({"pass": False, "error": str(error)}, indent=2))
        raise SystemExit(1)
    print(json.dumps(result, indent=2))
    raise SystemExit(0 if result["pass"] else 1)
