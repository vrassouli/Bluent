#!/usr/bin/env python3
"""Small dependency-free unit tests for the v3 WCAG arithmetic (not UI tests)."""
import unittest

from audit_v3_theme_contrast import contrast, rgb


class ContrastMathTests(unittest.TestCase):
    def test_black_white_is_21(self):
        self.assertEqual(contrast("#000000", "#fff"), 21.0)

    def test_identical_colors_are_one(self):
        self.assertEqual(contrast("#1267B4", "#1267B4"), 1.0)

    def test_short_rgb_expands(self):
        self.assertEqual(rgb("#abc"), (170, 187, 204))

    def test_alpha_and_invalid_are_not_misreported(self):
        self.assertIsNone(contrast("#ffffff80", "#000"))
        self.assertIsNone(contrast("currentColor", "#000"))

    def test_wcag_sample_against_white(self):
        self.assertAlmostEqual(contrast("#777777", "#ffffff"), 4.478, places=3)


if __name__ == "__main__":
    unittest.main()
