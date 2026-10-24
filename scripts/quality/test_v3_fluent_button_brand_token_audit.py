import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EVIDENCE = ROOT / "docs/v3/quality/evidence/FLUENT-BLUENT-BUTTON-BRAND-TOKEN-RECONCILIATION.json"
TYPOGRAPHY = ROOT / "docs/v3/quality/evidence/FLUENT-BLUENT-BUTTON-TYPOGRAPHY-CHROME.json"


class FluentButtonBrandTokenReconciliation(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.record = json.loads(EVIDENCE.read_text(encoding="utf-8-sig"))
        cls.typography = json.loads(TYPOGRAPHY.read_text(encoding="utf-8-sig"))

    def test_primary_button_resolves_through_semantic_brand_token(self):
        button = (ROOT / "src/Bluent.UI/Styles/Components/_button.scss").read_text(encoding="utf-8-sig")
        self.assertRegex(button, r"&\.primary\s*\{\s*background-color:\s*var\(--colorBrandBackground\)")

        default_light = (ROOT / "src/Bluent.UI/Styles/Themes/theme-default-light.scss").read_text(encoding="utf-8-sig")
        default_dark = (ROOT / "src/Bluent.UI/Styles/Themes/theme-default-dark.scss").read_text(encoding="utf-8-sig")
        self.assertIn("@include light-theme($brand-default)", default_light)
        self.assertIn("@include dark-theme($brand-default)", default_dark)

    def test_source_mapping_and_compiled_default_tokens_are_grounded(self):
        expected_files = {
            "src/Bluent.UI/Styles/Themes/theme/light/brand-palette.scss": "--colorBrandBackground: #{map.get($brand, 80)};",
            "src/Bluent.UI/Styles/Themes/theme/dark/brand-palette.scss": "--colorBrandBackground: #{map.get($brand, 70)};",
        }
        for relative_path, needle in expected_files.items():
            self.assertIn(needle, (ROOT / relative_path).read_text(encoding="utf-8-sig"))

        brand = (ROOT / "src/Bluent.UI/Styles/Themes/_brand.scss").read_text(encoding="utf-8-sig")
        self.assertRegex(brand, r'(?m)^\s*70:\s*"#18599B",')
        self.assertRegex(brand, r'(?m)^\s*80:\s*"#1267B4",')
        self.assertIn("--colorBrandBackground: #1267B4;", (ROOT / "src/Bluent.UI/Styles/Themes/theme-default-light.css").read_text(encoding="utf-8-sig"))
        self.assertIn("--colorBrandBackground: #18599B;", (ROOT / "src/Bluent.UI/Styles/Themes/theme-default-dark.css").read_text(encoding="utf-8-sig"))

    def test_release_computed_colors_match_source_tokens_and_pinned_fluent_observations(self):
        expected = {
            "LIGHT-LTR": ("rgb(15, 108, 189)", "rgb(18, 103, 180)", "#0F6CBD", "#1267B4", [3, 5, 9]),
            "DARK-RTL": ("rgb(17, 94, 163)", "rgb(24, 89, 155)", "#115EA3", "#18599B", [7, 5, 8]),
        }
        actual = {row["mode"]: row for row in self.record["observations"]}
        self.assertEqual(set(expected), set(actual))
        for mode, values in expected.items():
            fluent_rgb, bluent_rgb, fluent_hex, bluent_hex, absolute_delta = values
            row = actual[mode]
            ref = self.typography["modes"][mode]
            self.assertEqual(fluent_rgb, ref["official"]["computedStyle"]["backgroundColor"])
            self.assertEqual(bluent_rgb, ref["bluentRelease"]["computedStyle"]["backgroundColor"])
            self.assertEqual(fluent_hex, row["fluentHex"])
            self.assertEqual(bluent_hex, row["bluentHex"])
            self.assertEqual(absolute_delta, row["absoluteRgbDelta"])
            self.assertTrue(row["computedValueMatchesCompiledToken"])

    def test_diagnosis_does_not_promote_source_difference_to_approved_defect(self):
        self.assertEqual("source_token_divergence_confirmed_design_intent_unresolved", self.record["status"])
        self.assertFalse(self.record["parityAccepted"])
        self.assertFalse(self.record["designApproved"])
        self.assertFalse(self.record["productSourceChanged"])
        self.assertFalse(self.record["productApiChanged"])
        self.assertFalse(self.record["productCssChanged"])
        self.assertTrue(any("intentional product-brand choice" in text for text in self.record["diagnosis"]["notEstablished"]))

    def test_report_links_the_evidence_and_preserves_design_gate(self):
        report = (ROOT / "docs/v3/quality/FLUENT-PARITY-BUTTON-BRAND-TOKEN-RECONCILIATION.md").read_text(encoding="utf-8-sig")
        self.assertIn("FLUENT-BLUENT-BUTTON-BRAND-TOKEN-RECONCILIATION.json", report)
        self.assertIn("does not establish whether the divergence is a defect", report)
        self.assertIn("all 18 family parity dimensions remain open", report)


if __name__ == "__main__":
    unittest.main()
