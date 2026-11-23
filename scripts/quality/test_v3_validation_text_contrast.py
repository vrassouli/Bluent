from __future__ import annotations
import tempfile
import unittest
from pathlib import Path

from audit_v3_validation_text_contrast import BACKGROUNDS, DIAGNOSTIC_BACKGROUNDS, NON_OPAQUE_BACKGROUNDS, OPAQUE_BACKGROUNDS, audit_validation_text, contrast_ratio, discover_background_tokens, parse_theme_values

ROOT = Path(__file__).resolve().parents[2]


class ValidationTextContrastAuditTests(unittest.TestCase):
    def test_all_twenty_brand_mode_themes_cover_three_neutral_surfaces(self):
        report = audit_validation_text(ROOT)
        self.assertTrue(report["pass"], report["failures"])
        self.assertEqual(report["brandModeCombinations"], 20)
        self.assertEqual(report["neutralSurfacesPerCombination"], 3)
        self.assertEqual(report["contrastPairs"], 60)
        self.assertEqual(len(report["entries"]), 20)
        self.assertGreaterEqual(report["measuredMinimum"], 4.5)

    def test_shared_validation_message_uses_the_audited_existing_source_role(self):
        report = audit_validation_text(ROOT)
        self.assertEqual(report["sourceSelector"], ".validation-message")
        self.assertEqual(report["sourceVariable"], "--colorPaletteRedForeground1")

    def test_neutral_surface_matrix_contains_all_sixty_pairs(self):
        report = audit_validation_text(ROOT)
        pairs = [(entry["theme"], surface, ratio) for entry in report["entries"] for surface, ratio in entry["contrast"].items()]
        self.assertEqual(len(pairs), 60)
        self.assertTrue(all(ratio > 0 for _, _, ratio in pairs))
        self.assertTrue(all(surface in BACKGROUNDS for _, surface, _ in pairs))

    def test_diagnostic_host_matrix_records_unsupported_surface_contexts(self):
        report = audit_validation_text(ROOT)
        self.assertEqual(report["opaqueBackgroundTokens"], 112)
        self.assertEqual(report["diagnosticSurfacesPerCombination"], 109)
        self.assertEqual(report["diagnosticSurfacesPerCombination"], len(DIAGNOSTIC_BACKGROUNDS))
        self.assertEqual(report["diagnosticContrastPairs"], 20 * len(DIAGNOSTIC_BACKGROUNDS))
        self.assertEqual(report["diagnosticContrastPairs"], 2180)
        self.assertEqual(
            sum(item["passingPairs"] for item in report["diagnosticSummaries"].values()),
            834,
        )
        self.assertEqual(
            sum(item["passingPairs"] == 20 for item in report["diagnosticSummaries"].values()),
            26,
        )
        self.assertEqual(
            sum(item["passingPairs"] == 0 for item in report["diagnosticSummaries"].values()),
            51,
        )
        self.assertEqual(
            sum(0 < item["passingPairs"] < 20 for item in report["diagnosticSummaries"].values()),
            32,
        )
        self.assertEqual(report["nonOpaqueBackgroundsExcludedFromArithmetic"], list(NON_OPAQUE_BACKGROUNDS))
        summaries = report["diagnosticSummaries"]
        self.assertEqual(summaries["colorBrandBackground"]["passingPairs"], 0)
        self.assertEqual(summaries["colorBrandBackground"]["minimum"], 1.0027)
        self.assertEqual(summaries["colorNeutralBackgroundInverted"]["passingPairs"], 0)
        self.assertEqual(summaries["colorNeutralBackgroundInverted"]["minimum"], 2.4877)
        self.assertEqual(summaries["colorPaletteRedBackground1"]["passingPairs"], 20)
        self.assertGreaterEqual(summaries["colorPaletteRedBackground1"]["minimum"], 4.5)
        self.assertEqual(summaries["colorPaletteRedBackground2"]["passingPairs"], 0)
        # Diagnostic failures document the use boundary; they must not make
        # the separately scoped neutral host audit fail.
        self.assertTrue(report["pass"])
        self.assertEqual(report["failures"], [])

    def test_background_inventory_mismatch_fails_closed(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "theme-a-light.css").write_text(
                ":root { --colorNeutralBackground1: #ffffff; }", encoding="utf-8"
            )
            (root / "theme-b-light.css").write_text(
                ":root { --colorNeutralBackground1: #ffffff; --colorBrandBackground: #000000; }",
                encoding="utf-8",
            )
            with self.assertRaisesRegex(ValueError, "inventory differs"):
                discover_background_tokens(root)

    def test_background_opaque_format_mismatch_fails_closed(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "theme-a-light.css").write_text(
                ":root { --colorNeutralBackground1: #ffffff; }", encoding="utf-8"
            )
            (root / "theme-b-light.css").write_text(
                ":root { --colorNeutralBackground1: rgba(255, 255, 255, .5); }",
                encoding="utf-8",
            )
            with self.assertRaisesRegex(ValueError, "mix opaque hex and non-hex"):
                discover_background_tokens(root)

    def test_every_theme_has_the_same_background_inventory(self):
        opaque, non_opaque = discover_background_tokens(ROOT / "src/Bluent.UI/Styles/Themes")
        self.assertEqual(opaque, OPAQUE_BACKGROUNDS)
        self.assertEqual(non_opaque, NON_OPAQUE_BACKGROUNDS)
        self.assertEqual(len(opaque), 112)
        self.assertEqual(len(non_opaque), 16)
        self.assertTrue(set(BACKGROUNDS).issubset(opaque))

    def test_contrast_ratio_matches_known_wcag_examples(self):
        self.assertAlmostEqual(contrast_ratio("#000000", "#ffffff"), 21.0, places=4)
        self.assertAlmostEqual(contrast_ratio("#ffffff", "#ffffff"), 1.0, places=4)

    def test_theme_parser_rejects_incomplete_palette_by_omission(self):
        values = parse_theme_values("--colorPaletteRedForeground1: #e37d80;")
        self.assertEqual(values, {"colorPaletteRedForeground1": "#e37d80"})

    def test_missing_theme_values_fail_closed(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            theme_dir = root / "src/Bluent.UI/Styles/Themes"
            theme_dir.mkdir(parents=True)
            field_dir = root / "src/Bluent.UI/Styles/Components"
            field_dir.mkdir(parents=True)
            (field_dir / "_field.scss").write_text(".validation-message { color: var(--colorPaletteRedForeground1); }", encoding="utf-8")
            (theme_dir / "theme-default-light.css").write_text(":root { --colorPaletteRedForeground1: #bc2f32; }", encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "missing theme variables"):
                audit_validation_text(root)


if __name__ == "__main__":
    unittest.main()
