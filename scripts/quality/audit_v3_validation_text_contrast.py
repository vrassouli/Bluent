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


def parse_theme_values(css: str) -> dict[str, str]:
    values: dict[str, str] = {}
    for name in (FOREGROUND, *BACKGROUNDS):
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

    entries, seen = [], set()
    for path in sorted(themes_dir.glob("theme-*.css")):
        match = re.fullmatch(r"theme-([a-z0-9]+)-(light|dark)\.css", path.name)
        if match is None:
            continue
        brand, mode = match.groups()
        values = parse_theme_values(path.read_text(encoding="utf-8-sig"))
        missing = [name for name in (FOREGROUND, *BACKGROUNDS) if name not in values]
        if missing:
            raise ValueError(f"{path.name} is missing theme variables: {', '.join(missing)}")
        key = (brand, mode)
        if key in seen:
            raise ValueError(f"Duplicate theme combination: {brand}/{mode}")
        seen.add(key)
        ratios = {name: round(contrast_ratio(values[FOREGROUND], values[name]), 4) for name in BACKGROUNDS}
        entries.append({
            "theme": path.stem,
            "brand": brand,
            "mode": mode,
            "foreground": values[FOREGROUND],
            "backgrounds": {name: values[name] for name in BACKGROUNDS},
            "contrast": ratios,
            "minimum": min(ratios.values()),
        })

    expected = {(brand, mode) for brand in BRANDS for mode in MODES}
    if seen != expected:
        raise ValueError(f"Theme matrix mismatch; missing={sorted(expected-seen)}, extra={sorted(seen-expected)}")
    all_ratios = [ratio for entry in entries for ratio in entry["contrast"].values()]
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
