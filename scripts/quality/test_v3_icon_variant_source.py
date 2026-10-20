"""#552 / Icon #429 source snapshot; deliberately not browser or AT approval."""
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ICON_ROOT = ROOT / "src/Bluent.UI"
METADATA = ICON_ROOT / "wwwroot/fonts/icons/FluentSystemIcons-Resizable.json"

def read(relative):
    return (ROOT / relative).read_text(encoding="utf-8-sig")

def icon_inventory(data):
    names = {"regular": set(), "filled": set()}
    for key in data:
        match = re.fullmatch(r"ic_fluent_(.+)_20_(regular|filled)", key)
        if match:
            names[match.group(2)].add(match.group(1))
    return names

class IconSourceParityCheckpoint(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.catalog = json.loads(METADATA.read_text(encoding="utf-8-sig"))
        cls.variants = icon_inventory(cls.catalog)

    def test_bundled_font_catalog_is_explicitly_only_20_regular_filled(self):
        regular, filled = self.variants["regular"], self.variants["filled"]
        self.assertEqual(5694, len(self.catalog))
        self.assertEqual((2827, 2867), (len(regular), len(filled)))
        self.assertEqual((2875, 8, 48), (len(regular | filled), len(regular - filled), len(filled - regular)))
        self.assertEqual([], [key for key in self.catalog if key.endswith("_color")])
        self.assertEqual(len(self.catalog), len(regular) + len(filled))

    def test_public_enum_two_variants_and_default_regular(self):
        enum = read("src/Bluent.UI/Icons/IconVariant.cs")
        members = re.search(r"enum IconVariant\s*\{([^}]*)\}", enum).group(1)
        self.assertEqual(["Regular", "Filled"], [x.strip() for x in members.split(",") if x.strip()])
        component = read("src/Bluent.UI/Components/IconComponent/Icon.cs")
        self.assertIn("IconVariant Variant { get; set; } = IconVariant.Regular", component)
        self.assertIn("IconDefinition? Value { get; set; }", component)

    def test_filled_fallback_is_explicit_and_not_color(self):
        definition = read("src/Bluent.UI/Icons/IconDefinition.cs")
        self.assertIn("variant == IconVariant.Filled && Filled.HasValue", definition)
        self.assertIn(": Regular;", definition)
        self.assertIn("FromCss(", definition)
        self.assertIn("FromSvg(", definition)
        self.assertIn("FromImage(", definition)

    def test_generator_filters_size_and_style_exactly(self):
        generator = read("src/Bluent.UI.IconGenerator/FluentIconsGenerator.cs")
        self.assertIn('"_20_regular"', generator)
        self.assertIn('"_20_filled"', generator)
        self.assertIn('(?:regular|filled)', generator)
        self.assertIn("pair.Regular ?? pair.Filled", generator)
        self.assertNotIn('"_20_color"', generator)

    def test_rendered_kinds_and_attribute_contract_are_not_auto_accessibility(self):
        component = read("src/Bluent.UI/Components/IconComponent/Icon.cs")
        for kind in ("IconSourceKind.CssClass", "IconSourceKind.Svg", "IconSourceKind.Image"):
            self.assertIn(kind, component)
        self.assertIn("AddMultipleAttributes(sequence, AdditionalAttributes)", component)
        for intrinsic in ('"aria-hidden"', '"aria-label"', '"alt"'):
            self.assertNotIn(intrinsic, component)

    def test_demo_covers_existing_only_not_color(self):
        demo = read("src/Bluent.UI.Demo.Pages/Pages/Components/Icons.razor")
        self.assertIn('Variant="IconVariant.Filled"', demo)
        self.assertIn('Value="@CustomSvgIcon"', demo)
        self.assertIn('Value="@PowerPointIcon"', demo)
        self.assertNotIn("IconVariant.Color", demo)

    def test_inventory_negative_control_catches_unreviewed_color_or_size_growth(self):
        sample = dict(self.catalog)
        sample["ic_fluent_example_24_color"] = 0
        self.assertEqual(self.variants, icon_inventory(sample))
        sample["ic_fluent_example_20_regular"] = 0
        self.assertIn("example", icon_inventory(sample)["regular"])
        self.assertNotIn("example", self.variants["regular"])

    def test_report_does_not_invent_approval(self):
        report = read("docs/v3/quality/FLUENT-PARITY-ICON-VARIANTS.md")
        for boundary in ("NOT Fluent parity", "not approved", "screen readers"):
            self.assertIn(boundary.lower(), report.lower())

if __name__ == "__main__":
    unittest.main()
