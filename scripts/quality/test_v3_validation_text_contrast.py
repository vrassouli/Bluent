from __future__ import annotations
import tempfile
import unittest
from pathlib import Path

from audit_v3_validation_text_contrast import BACKGROUNDS, audit_validation_text, contrast_ratio, parse_theme_values

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
