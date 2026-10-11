#!/usr/bin/env python3
"""Guard the *existing* Bluent 2.x Button API while designing v3 (#419).

Source-text compatibility inventory only: presence does NOT prove behavior,
accessibility, or actual v3 implementation. No generated assets are changed.
"""
from __future__ import annotations

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / "src/Bluent.UI/Components/ButtonComponent"

REQUIRED_ENUMS = {
    "ButtonAppearance": {"Default", "Primary", "Danger", "Outline", "Subtle", "Transparent"},
    "ButtonSize": {"Small", "Medium", "Large"},
    "ButtonShape": {"Rounded", "Circular", "Square"},
}

REQUIRED_PARAMS = {
    "Text", "TextClass", "SecondaryText", "Icon", "Toggled", "Rotated",
    "Orientation", "ToggledChanged", "OnClick", "Shape", "Appearance",
    "Size", "Href", "Badge", "BadgeHorizontalPosition", "BadgeVerticalPosition",
    "Dropdown", "ShowDropdownIndicator", "Compact", "DropdownPlacement",
}


def main() -> int:
    errors: list[str] = []
    for name, baseline in REQUIRED_ENUMS.items():
        file = BASE / f"{name}.cs"
        source = file.read_text(encoding="utf-8")
        m = re.search(rf"\benum\s+{re.escape(name)}\s*\{{([^}}]+)\}}", source, re.S)
        if not m:
            errors.append(f"Missing {name} enum declaration")
            continue
        values = set(
            re.match(r"\s*([A-Za-z_]\w*)", entry).group(1)
            for entry in m.group(1).split(",")
            if re.match(r"\s*([A-Za-z_]\w*)", entry)
        )
        missing = baseline - values
        if missing:
            errors.append(f"{name} lost baseline values: {sorted(missing)}")
        print(f"{name}: {len(values)} actual members; {len(baseline)} baseline preserved")

    codebehind = (BASE / "Button.razor.cs").read_text(encoding="utf-8")
    actual = set(re.findall(
        r"^\s*\[Parameter\]\s+public\s+[^\r\n]+?\s+(\w+)\s*\{",
        codebehind, re.M
    ))
    missing = REQUIRED_PARAMS - actual
    if missing:
        errors.append(f"Button lost required existing public parameters: {sorted(missing)}")
    print(f"Button.razor.cs: {len(actual)} parameter(s); "
          f"{len(REQUIRED_PARAMS)} baseline names preserved")

    markup = (BASE / "Button.razor").read_text(encoding="utf-8")
    markers = {
        "link/button native tag selection": "GetButtonTag()",
        "split-button compound": "<ButtonGroup>",
        "dropdown popover": "<Popover",
        "icon rendering": "<Icon ",
        "badge slot": "badge-wrapper",
        "secondary text slot": "secondary-text",
    }
    for label, source_marker in markers.items():
        if source_marker not in markup:
            errors.append(f"Missing documented source mechanism ({label}): {source_marker}")
    print(f"Button.razor: {len(markers)} source mechanism markers checked")

    for error in errors:
        print("ERROR:", error)
    print(f"Button v2 source/API baseline: {len(errors)} errors. "
          "Presence only; not a v3 API or behavioral parity certification.")
    return int(bool(errors))


if __name__ == "__main__":
    sys.exit(main())
