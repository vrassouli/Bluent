"""Regression guard for brand-preserving focus colors in source Fluent themes."""
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent))
from audit_v3_brand_focus_candidate import audit
from audit_v3_token_preview_contrast import contrast


class BrandFocusSourceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.result = audit()

    def test_ten_brands_and_twenty_existing_sources(self):
        self.assertTrue(self.result["pass"], self.result["errors"])
        self.assertEqual(len(self.result["cases"]), 20)
        self.assertEqual(len({v["brand"] for v in self.result["cases"]}), 10)

    def test_light_current_brand_unchanged_and_readable_on_neutral(self):
        rows = [r for r in self.result["cases"] if r["mode"] == "light"]
        self.assertEqual(len(rows), 10)
        for r in rows:
            self.assertEqual(r["currentBrand"].lower(), r["existingCompoundBrandStroke"].lower())
            self.assertGreaterEqual(r["currentContrast"], 3, r["brand"])

    def test_dark_original_contrast_gap_is_recorded(self):
        rows = [r for r in self.result["cases"] if r["mode"] == "dark"]
        self.assertEqual(len(rows), 10)
        for r in rows:
            self.assertLess(r["currentContrast"], 3, r["brand"])

    def test_dark_existing_compound_brand_candidate_passes_neutral_host(self):
        rows = [r for r in self.result["cases"] if r["mode"] == "dark"]
        self.assertGreaterEqual(min(r["candidateContrast"] for r in rows), 3.5)
        for r in rows:
            self.assertGreaterEqual(r["candidateContrast"], 3, r["brand"])
            self.assertNotEqual(r["currentBrand"].lower(), r["existingCompoundBrandStroke"].lower())

    def test_candidate_cannot_claim_dark_hover_background_conformance(self):
        dark = [r for r in self.result["cases"] if r["mode"] == "dark"]
        self.assertEqual(len(dark), 10)
        # This records the known gap, not a UI accessibility pass.
        for r in dark:
            self.assertTrue(r["hoverReviewRequired"], r["brand"])
            self.assertLess(r["candidateHoverContrast"], 3.0, r["brand"])
            self.assertGreater(r["candidateHoverContrast"], 2.5, r["brand"])

    def test_light_candidate_on_hover_neutral(self):
        light = [r for r in self.result["cases"] if r["mode"] == "light"]
        self.assertEqual(len(light), 10)
        for r in light:
            self.assertFalse(r["hoverReviewRequired"], r["brand"])
            self.assertGreaterEqual(r["candidateHoverContrast"], 3.0, r["brand"])

    def test_contrast_math_and_scope(self):
        self.assertAlmostEqual(contrast("#000000", "#FFFFFF"), 21, places=7)
        self.assertAlmostEqual(contrast("#292929", "#292929"), 1, places=7)
        self.assertIn("not a public Button token approval", self.result["classification"])


if __name__ == "__main__":
    unittest.main()
