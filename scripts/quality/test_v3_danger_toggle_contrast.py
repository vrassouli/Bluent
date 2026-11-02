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

    def test_v3_package_opt_in_contract_not_global_css(self):
        src = (ROOT / "src/Bluent.UI/wwwroot/v3/danger-toggle.opt-in.preview.css").read_text(encoding="utf-8")
        razor = (ROOT / "src/Bluent.UI.Demo.Pages/Pages/Scenarios/V3StylingLab.razor").read_text(encoding="utf-8")
        lab_css = (ROOT / "src/Bluent.UI.Demo.Pages/Pages/Scenarios/V3StylingLab.razor.css").read_text(encoding="utf-8")
        for state in (
            "[data-bui-v3-danger-toggle] .bui-button.danger.toggled {",
            "[data-bui-v3-danger-toggle] .bui-button.danger.toggled:hover {",
            "[data-bui-v3-danger-toggle] .bui-button.danger.toggled:hover:active {",
        ):
            self.assertIn(state, src)
        for role in (
            "--colorPaletteRedBackground1",
            "--colorPaletteRedBackground2",
            "--colorPaletteRedBackground3",
            "--colorPaletteRedForeground2",
            "--colorNeutralForegroundOnBrand",
            "background-color: ButtonFace;",
            "color: ButtonText;",
        ):
            self.assertIn(role, src)
        self.assertIn('href="_content/Bluent.UI/v3/danger-toggle.opt-in.preview.css"', razor)
        self.assertIn('class="v3-lab-focus-matrix" data-bui-v3-danger-toggle', razor)
        self.assertNotIn(".v3-lab-focus-matrix ::deep .bui-button.danger.toggled", lab_css)
        self.assertNotIn("[data-bui-v3-danger-toggle]", (ROOT / "src/Bluent.UI/Styles/Components/_button.scss").read_text(encoding="utf-8"))

    def test_unmodified_legacy_danger_css_still_contains_known_old_state(self):
        legacy = (ROOT / "src/Bluent.UI/Styles/Components/_button.scss").read_text(encoding="utf-8")
        self.assertIn("background-color: var(--colorPaletteRedBackground1);", legacy)
        self.assertIn("color: var(--colorNeutralForegroundOnBrand);", legacy)


if __name__ == "__main__":
    unittest.main()
