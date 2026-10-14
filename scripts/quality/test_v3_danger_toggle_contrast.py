"""Design-experiment source regression for selected Danger Button contrast.

Uses emitted Fluent source roles; does NOT certify v2 or native Windows AT.
"""
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
THEMES = ROOT / "src" / "Bluent.UI" / "Styles" / "Themes"


def token(content, name):
    match = re.search(r"^\s*--" + re.escape(name) + r":\s*(#[0-9a-fA-F]{6})\s*;", content, re.M)
    if not match:
        raise AssertionError(f"Missing {name}")
    return match.group(1)


def contrast(a, b):
    def luminosity(value):
        parts = [int(value[i:i + 2], 16) / 255 for i in (1, 3, 5)]
        rgb = [v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in parts]
        return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722
    la, lb = luminosity(a), luminosity(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)


class DangerToggledContrastTests(unittest.TestCase):
    def test_ten_source_brands_light_dark_all_button_states(self):
        sources = sorted(THEMES.glob("theme-*-light.css")) + sorted(THEMES.glob("theme-*-dark.css"))
        self.assertEqual(len(sources), 20)
        for source in sources:
            with self.subTest(theme=source.name):
                css = source.read_text(encoding="utf-8")
                selected = (token(css, "colorPaletteRedBackground1"), token(css, "colorPaletteRedForeground2"))
                hovered = (token(css, "colorPaletteRedBackground2"), token(css, "colorPaletteRedForeground2"))
                pressed = (token(css, "colorPaletteRedBackground3"), token(css, "colorNeutralForegroundOnBrand"))
                untoggled = pressed
                for state, (background, foreground) in (
                    ("selected", selected), ("selected-hover", hovered), ("selected-pressed", pressed),
                    ("not-selected", untoggled)
                ):
                    self.assertGreaterEqual(
                        contrast(background, foreground), 4.5,
                        f"{source.name}/{state}: {foreground} on {background} = {contrast(background, foreground):.2f}:1",
                    )
                if "light" in source.name:
                    before = contrast(token(css, "colorPaletteRedBackground1"),
                                      token(css, "colorNeutralForegroundOnBrand"))
                    self.assertLess(before, 4.5, f"{source.name} original white-on-pale bug unexpectedly changed")

    def test_change_is_only_opt_in_styling_lab_not_public_component_css(self):
        css = (ROOT / "src/Bluent.UI.Demo.Pages/Pages/Scenarios/V3StylingLab.razor.css").read_text(encoding="utf-8")
        self.assertIn(".v3-lab-focus-matrix ::deep .bui-button.danger.toggled", css)
        self.assertIn(".v3-lab-focus-matrix ::deep .bui-button.danger.toggled:hover", css)
        self.assertIn(".v3-lab-focus-matrix ::deep .bui-button.danger.toggled:hover:active", css)
        self.assertIn("color: var(--colorPaletteRedForeground2);", css)
        self.assertIn("background-color: var(--colorPaletteRedBackground2);", css)
        self.assertIn("color: ButtonText;", css)


if __name__ == "__main__":
    unittest.main()
