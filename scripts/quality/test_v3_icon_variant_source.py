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


    def test_svg_is_opaque_markup_without_size_or_viewbox_normalization(self):
        component = read("src/Bluent.UI/Components/IconComponent/Icon.cs")
        definition = read("src/Bluent.UI/Icons/IconDefinition.cs")
        source = read("src/Bluent.UI/Icons/IconSource.cs")
        css = read("src/Bluent.UI/wwwroot/bluent.ui.components.min.css")
        svg_branch = component.split("case IconSourceKind.Svg:", 1)[1].split("case IconSourceKind.Image:", 1)[0]

        self.assertIn('builder.OpenElement(0, "span")', svg_branch)
        self.assertIn("builder.AddContent(5, (MarkupString)source.Value)", svg_branch)
        self.assertIn("IconSource.Svg(regularSvg)", definition)
        self.assertIn("IconSource.Svg(filledSvg)", definition)
        self.assertIn("new(IconSourceKind.Svg, svg)", source)
        for attribute in ("width", "height", "viewBox", "preserveAspectRatio"):
            self.assertNotIn(f'"{attribute}"', svg_branch)
        self.assertNotIn("Size", component)
        self.assertNotIn(".bui-icon", css)

    def test_root_attribute_order_and_accessibility_are_forwarded_not_synthesized(self):
        component = read("src/Bluent.UI/Components/IconComponent/Icon.cs")
        base = read("src/Bluent.Core/BluentComponentBase.cs")
        ui_base = read("src/Bluent.UI/Components/BluentUiComponentBase.cs")
        common = component.split("private void AddCommonAttributes", 1)[1]

        emitted = [
            common.index("AddMultipleAttributes(sequence, AdditionalAttributes)"),
            common.index('AddAttribute(sequence + 1, "id", Id)'),
            common.index('AddAttribute(sequence + 2, "class", GetComponentClass())'),
            common.index('AddAttribute(sequence + 3, "style", Style)'),
        ]
        self.assertEqual(sorted(emitted), emitted)
        self.assertEqual(3, component.count("AddCommonAttributes(builder,"))
        self.assertLess(
            component.index("AddCommonAttributes(builder, 7)"),
            component.index('builder.AddAttribute(11, "src", source.Value)'),
        )
        self.assertIn("[Parameter] public string? Class { get; set; }", base)
        self.assertIn("[Parameter] public string? Style { get; set; }", base)
        self.assertIn("GetClasses())} {Class}", base)
        self.assertIn('TryGetValue("id"', base)
        self.assertNotIn("GetComponentStyle()", component)
        self.assertIn('builder.AddAttribute(sequence + 3, "style", Style);', component)
        for attribute in (
            '"role"', '"title"', '"aria-hidden"', '"aria-label"',
            '"aria-labelledby"', '"alt"',
        ):
            self.assertNotIn(attribute, component)
        self.assertIn("TooltipService.SetTrigger", ui_base)
        self.assertNotIn('"title"', ui_base)

        docs = read("docs/components/icon.md")
        report = read("docs/v3/quality/FLUENT-PARITY-ICON-AUDIT.md")
        self.assertIn("SVG sizing and root attributes", docs)
        self.assertIn("not browser DOM or published InteractiveServer evidence", docs)
        self.assertIn("Source-proven geometry, attribute and naming contract", report)
        self.assertIn("serialized result for the SVG span, image, and CSS-class hosts", report)
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

    def test_exact_npm_svg_asset_pin_is_inventory_only_not_color_approval(self):
        snapshot_path = ROOT / "docs/v3/quality/evidence/FLUENT-ICON-ASSET-PACKAGES-2026-10-23.json"
        snapshot = json.loads(snapshot_path.read_text(encoding="utf-8-sig"))
        self.assertEqual("2026-10-23", snapshot["capturedOn"])
        svg = snapshot["packages"]["@fluentui/svg-icons"]
        react = snapshot["packages"]["@fluentui/react-icons"]
        self.assertEqual("1.1.344", svg["version"])
        self.assertEqual("sha512-rasjaq4hBXzRS25pSY9gaqwY7NdvZJCz7G/rtpwF6mCmg2R+9TnySLhHbR+sOpkMP/IDDG28XvxRcNEQ/lJYoQ==", svg["distIntegrity"])
        self.assertEqual("MIT", svg["license"])
        self.assertEqual((21732, 21732, 2991), (svg["publishedTarballInventory"]["svgFiles"], svg["publishedTarballInventory"]["filenamePatternMatches"], svg["publishedTarballInventory"]["uniqueIconBaseNames"]))
        inventory = svg["publishedTarballInventory"]
        self.assertEqual([10, 12, 16, 20, 24, 28, 32, 48], inventory["sizesObserved"])
        self.assertEqual(["color", "filled", "light", "regular"], inventory["stylesObserved"])
        self.assertEqual(890, inventory["colorFiles"])
        self.assertEqual(214, inventory["lightFiles"])
        self.assertEqual([16, 20, 24, 28, 48], svg["packedReadme"]["declaredSizes"])
        self.assertTrue(svg["packedReadme"]["statesColorDeprecated"])
        self.assertTrue(svg["packedReadme"]["warnsColorMayBeRemoved"])
        self.assertEqual("2.0.344", react["version"])
        self.assertEqual("sha512-pvEVFOUrrtmIglqdfhDVX6XT80a5z9kX+BTso6NAzgmkko8nlURhOzNwvZZlsCK4yQseH/4NQdYoN8ijO7IHdNw==", react["distIntegrity"])
        self.assertIn("not approved", snapshot["decisionStatus"]["bluentIconVariantColor"])
        family_matrix = json.loads((ROOT / "docs/v3/quality/FLUENT-PARITY-RETRO-AUDIT.json").read_text(encoding="utf-8-sig"))
        icon = next(x for x in family_matrix["families"] if x["family"] == "Icon")
        self.assertEqual("1.1.344", icon["fluentSvgAssetReference"]["version"])
        self.assertEqual(svg["distIntegrity"], icon["fluentSvgAssetReference"]["integrity"])
        report = read("docs/v3/quality/FLUENT-PARITY-ICON-VARIANTS.md")
        self.assertIn("exact npm asset inventory", report.lower())
        self.assertIn("Color SVG files", report)
        self.assertIn("not a Bluent API", report)

    def test_canonical_icon_docs_preserve_custom_svg_trust_boundary(self):
        docs = read("docs/components/icon.md")
        migration = read("docs/compatibility/migration-and-upgrades.md")
        component = read("src/Bluent.UI/Components/IconComponent/Icon.cs")
        definition = read("src/Bluent.UI/Icons/IconDefinition.cs")
        self.assertIn("Security boundary for custom SVG", docs)
        self.assertIn("trusted, developer-controlled SVG", docs)
        self.assertIn("Do not pass user-submitted", docs)
        self.assertIn("does not promise to sanitize SVG", docs)
        self.assertIn("Only use trusted developer-controlled SVG strings", migration)
        self.assertIn("(MarkupString)source.Value", component)
        self.assertIn("IconSource.Svg(regularSvg)", definition)
        self.assertIn("IconSource.Svg(filledSvg)", definition)
        prototype = read("docs/v3/quality/FLUENT-PARITY-ICON-SVG-PROTOTYPE.md")
        self.assertIn("no sanitizer call", prototype)
        self.assertIn("not a proof of exploitability", prototype)

    def test_report_does_not_invent_approval(self):
        report = read("docs/v3/quality/FLUENT-PARITY-ICON-VARIANTS.md")
        for boundary in ("NOT Fluent parity", "not approved", "screen readers"):
            self.assertIn(boundary.lower(), report.lower())

if __name__ == "__main__":
    unittest.main()
