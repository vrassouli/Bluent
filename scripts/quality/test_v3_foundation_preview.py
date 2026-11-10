from __future__ import annotations

import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts" / "quality"))
import generate_v3_foundation_preview as foundation


class FoundationPreviewContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data, cls.source_by_key = foundation.load()
        cls.css, cls.matrix = foundation.render(cls.data, cls.source_by_key)
        cls.layers = cls.data["layers"]

    def test_preview_scope_and_branch_safety(self):
        self.assertEqual(self.data["issue"], 418)
        self.assertEqual(self.data["schemaVersion"], "0.1.0-preview")
        self.assertEqual(self.data["status"], "draft-opt-in-only-not-public-api")
        self.assertFalse(self.matrix["summary"]["publishedBundleChanged"])
        self.assertEqual(self.css.count("[data-bui-v3-foundations] {"), 2)
        self.assertNotIn("!important", self.css.lower())
        self.assertNotIn("@import", self.css.lower())

    def test_inventory_and_20_by_96_source_coverage(self):
        self.assertEqual(len(self.layers["source"]), 96)
        self.assertEqual(len(self.layers["designSource"]), 5)
        self.assertEqual(len(self.layers["semantic"]), 104)
        self.assertEqual(len(self.layers["component"]), 14)
        self.assertEqual(self.matrix["summary"]["brandModeCombinations"], 20)
        self.assertEqual(self.matrix["summary"]["sourceValuesVerified"], 1920)
        self.assertEqual(self.matrix["summary"]["nativePenpotSemanticAliasesExpected"], 95)
        self.assertEqual(sum(x["type"] == "css-function" for x in self.layers["source"]), 9)

    def test_all_semantic_and_component_aliases_are_resolved(self):
        source_keys = {x["key"] for x in self.layers["source"]}
        design_keys = {x["key"] for x in self.layers["designSource"]}
        semantic_names = {x["name"] for x in self.layers["semantic"]}
        for item in self.layers["semantic"]:
            alias = item["alias"]
            self.assertTrue(alias.startswith(("source:", "design-source:")), item["name"])
            target = alias.split(":", 1)[1]
            self.assertIn(target, source_keys if alias.startswith("source:") else design_keys, item["name"])
        for item in self.layers["component"]:
            self.assertIn(item["alias"], semantic_names, item["name"])
            self.assertEqual(item["status"], "component-consumption-candidate")

    def test_field_min_height_is_not_generic_button_height(self):
        design = {x["key"]: x for x in self.layers["designSource"]}
        semantic = {x["name"]: x for x in self.layers["semantic"]}
        component = {x["name"]: x for x in self.layers["component"]}
        css = (ROOT / "src/Bluent.UI/Styles/Components/_field.scss").read_text(encoding="utf-8-sig")
        self.assertIn("--fui-text-field-min-height: 24px", css)
        self.assertIn("--fui-text-field-min-height: 32px", css)
        self.assertIn("--fui-text-field-min-height: 40px", css)
        for size, value in {"small": 24, "medium": 32, "large": 40}.items():
            src = design[f"field.minHeight.{size}"]
            self.assertEqual(src["value"], value)
            self.assertEqual(src["sourceReference"]["path"], "src/Bluent.UI/Styles/Components/_field.scss")
            semantic_name = f"bluent.semantic.field.minHeight.{size}"
            self.assertEqual(semantic[semantic_name]["alias"], f"design-source:field.minHeight.{size}")
            component_name = f"bluent.component.textField.minHeight.{size}"
            self.assertEqual(component[component_name]["alias"], semantic_name)
            self.assertNotIn(f"bluent.component.button.height.{size}", component)

    def test_density_gaps_and_reduced_motion_are_explicit_policy_sources(self):
        design = {x["key"]: x for x in self.layers["designSource"]}
        self.assertNotIn("density.gap.compact", design)
        semantic = {x["name"]: x for x in self.layers["semantic"]}
        expected = {"compact": "source:spacing.horizontal.s", "regular": "source:spacing.horizontal.m", "comfortable": "source:spacing.horizontal.l"}
        for size, alias in expected.items():
            self.assertEqual(semantic[f"bluent.semantic.density.gap.{size}"]["alias"], alias)
        default = self.matrix["brandModeCombinations"]["default"]["light"]["tokens"]
        self.assertEqual([default[f"spacing.horizontal.{k}"] for k in ("s", "m", "l")], ["8px", "12px", "16px"])
        reduced = design["motion.duration.reduced"]
        self.assertEqual(reduced["value"], 0)
        self.assertIsNone(reduced["cssSource"])
        self.assertIn("not an emitted global duration variable", reduced["note"])

    def test_css_font_stack_is_the_authoritative_fallback(self):
        tokens = self.matrix["brandModeCombinations"]["default"]["light"]["tokens"]
        self.assertIn("Segoe UI", tokens["type.family.base"])
        self.assertIn("Segoe UI Web (West European)", tokens["type.family.base"])
        self.assertIn("sans-serif", tokens["type.family.base"])
        self.assertIn("Consolas", tokens["type.family.monospace"])
        self.assertIn("Bahnschrift", tokens["type.family.numeric"])
        numeric = next(x for x in self.layers["source"] if x["key"] == "type.family.numeric")
        self.assertEqual(numeric["penpotFidelity"], "canvas-system-fallback-only-css-stack-authoritative")

    def test_typography_spacing_shape_stroke_and_motion_values_match_the_source(self):
        expected_sizes = ["10px", "12px", "14px", "16px", "20px", "24px", "28px", "32px", "40px", "68px"]
        expected_lines = ["14px", "16px", "20px", "22px", "28px", "32px", "36px", "40px", "52px", "92px"]
        expected_spacing = ["0", "2px", "4px", "6px", "8px", "10px", "12px", "16px", "20px", "24px", "32px", "48px", "64px"]
        expected_radii = {"none": "0", "small": "2px", "medium": "4px", "codeLarge": "6px", "codeXLarge": "8px", "circular": "10000px"}
        expected_durations = {"ultraFast": "50ms", "faster": "100ms", "fast": "150ms", "normal": "200ms", "gentle": "250ms", "slow": "300ms", "slower": "400ms", "ultraSlow": "500ms"}
        for brand in self.data["supportedBrands"]:
            for mode in self.data["modes"]:
                tokens = self.matrix["brandModeCombinations"][brand][mode]["tokens"]
                self.assertEqual([tokens[f"type.size.{n}"] for n in (100, 200, 300, 400, 500, 600, 700, 800, 900, 1000)], expected_sizes)
                self.assertEqual([tokens[f"type.lineHeight.{n}"] for n in (100, 200, 300, 400, 500, 600, 700, 800, 900, 1000)], expected_lines)
                self.assertEqual([tokens[f"spacing.horizontal.{n}"] for n in ("none", "xxs", "xs", "snudge", "s", "mnudge", "m", "l", "xl", "xxl", "xxxl", "xxxxl", "xxxxxl")], expected_spacing)
                self.assertEqual([tokens[f"spacing.vertical.{n}"] for n in ("none", "xxs", "xs", "snudge", "s", "mnudge", "m", "l", "xl", "xxl", "xxxl", "xxxxl", "xxxxxl")], expected_spacing)
                for key, value in expected_radii.items(): self.assertEqual(tokens[f"radius.{key}"], value)
                for key, value in expected_durations.items(): self.assertEqual(tokens[f"motion.duration.{key}"], value)
                self.assertEqual(tokens["stroke.width.thin"], "1px")
                self.assertEqual(tokens["stroke.width.thickest"], "4px")
                self.assertTrue(tokens["motion.curve.easyEase"].startswith("cubic-bezier("))

    def test_fluent_design_radius_names_are_crosswalked_without_renaming_legacy_css(self):
        source = {x["key"]: x for x in self.layers["source"]}
        design = {x["key"]: x for x in self.layers["designSource"]}
        semantic = {x["name"]: x for x in self.layers["semantic"]}
        tokens = self.matrix["brandModeCombinations"]["default"]["light"]["tokens"]
        self.assertEqual(source["radius.codeLarge"]["css"], "--borderRadiusLarge")
        self.assertEqual(source["radius.codeXLarge"]["css"], "--borderRadiusXLarge")
        self.assertEqual(tokens["radius.codeLarge"], "6px")
        self.assertEqual(tokens["radius.codeXLarge"], "8px")
        self.assertEqual(design["radius.xlarge"]["value"], 12)
        self.assertEqual(semantic["bluent.semantic.radius.large"]["alias"], "source:radius.codeXLarge")
        self.assertEqual(semantic["bluent.semantic.radius.xlarge"]["alias"], "design-source:radius.xlarge")
        self.assertEqual(semantic["bluent.semantic.radius.legacyCodeLarge"]["alias"], "source:radius.codeLarge")
        self.assertIn("--bui-v3-foundation-radius-large: var(--borderRadiusXLarge);", self.css)
        self.assertIn("--bui-v3-foundation-radius-xlarge: 12px;", self.css)
        self.assertIn("--bui-v3-foundation-radius-legacy-code-large: var(--borderRadiusLarge);", self.css)

    def test_shadow_geometry_is_exactly_the_emitted_css_source(self):
        tokens = self.matrix["brandModeCombinations"]["default"]["light"]["tokens"]
        expected = {
            "elevation.neutral.2": "0 0 2px var(--colorNeutralShadowAmbient), 0 1px 2px var(--colorNeutralShadowKey)",
            "elevation.neutral.4": "0 0 2px var(--colorNeutralShadowAmbient), 0 2px 4px var(--colorNeutralShadowKey)",
            "elevation.neutral.8": "0 0 2px var(--colorNeutralShadowAmbient), 0 4px 8px var(--colorNeutralShadowKey)",
            "elevation.neutral.16": "0 0 2px var(--colorNeutralShadowAmbient), 0 8px 16px var(--colorNeutralShadowKey)",
            "elevation.neutral.28": "0 0 8px var(--colorNeutralShadowAmbient), 0 14px 28px var(--colorNeutralShadowKey)",
            "elevation.neutral.64": "0 0 8px var(--colorNeutralShadowAmbient), 0 32px 64px var(--colorNeutralShadowKey)",
        }
        for key, value in expected.items(): self.assertEqual(tokens[key], value)

    def test_component_css_aliases_resolve_via_the_semantic_layer(self):
        semantic = {x["name"]: x for x in self.layers["semantic"]}
        for item in self.layers["component"]:
            target = semantic[item["alias"]]
            self.assertIn(f"{item['css']}: var({target['css']});", self.css)

    def test_generator_outputs_are_preview_only_and_deterministic(self):
        self.assertTrue(self.css.endswith("\n"))
        for path in (foundation.CSS_OUT, foundation.MATRIX_OUT): self.assertTrue(path.is_file())
        self.assertFalse(self.matrix["summary"]["publishedBundleChanged"])
        self.assertNotIn("wwwroot", str(foundation.CSS_OUT).replace("\\", "/"))

    def test_native_penpot_alias_count_excludes_css_only_easing_curves(self):
        self.assertEqual(self.data["design"]["nativePenpotSemanticAliasesExpected"], 95)
        self.assertIn("Nine motion curves", self.data["design"]["nativePenpotSemanticAliasLimit"])
        self.assertEqual(sum(x["type"] == "css-function" for x in self.layers["source"]), 9)


if __name__ == "__main__":
    unittest.main()
