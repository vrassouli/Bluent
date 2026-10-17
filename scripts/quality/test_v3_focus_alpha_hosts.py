"""#418 fail-closed alpha-composited focus-host research, NOT public CSS approval."""
from __future__ import annotations

from collections import Counter
import unittest
from unittest.mock import patch
from audit_v3_focus_alpha_hosts import audit, composite, rgba, rgb_hex


class FocusAlphaHostsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.report = audit()

    def test_all_ten_brands_two_modes_two_real_alpha_layers_two_underlays(self):
        self.assertTrue(self.report["passedResearchContract"], self.report["errors"])
        self.assertEqual(self.report["entries"], 80)
        self.assertEqual(len({c["brand"] for c in self.report["cases"]}), 10)
        self.assertEqual(Counter(c["mode"] for c in self.report["cases"]),
                         {"light":40,"dark":40})

    def test_known_light_alpha_over_brand_is_below_three_for_both_colors(self):
        case = next(c for c in self.report["cases"]
                    if c["brand"]=="default" and c["mode"]=="light"
                    and c["overlayToken"]=="--colorNeutralBackgroundAlpha"
                    and c["underlayToken"]=="--colorBrandBackground")
        self.assertEqual(case["compositedHost"], "#89B3DA")
        self.assertEqual(case["brandContrast"], 2.627)
        self.assertEqual(case["inverseContrast"], 2.205)
        self.assertTrue(case["bothBelow3"])

    def test_all_ten_light_brands_expose_one_dual_contrast_failure(self):
        fails=[c for c in self.report["cases"] if c["bothBelow3"]]
        self.assertEqual(len(fails),10)
        self.assertEqual({c["brand"] for c in fails},
                         {c["brand"] for c in self.report["cases"]})
        self.assertTrue(all(c["mode"]=="light" and
                            c["overlayToken"]=="--colorNeutralBackgroundAlpha" and
                            c["underlayToken"]=="--colorBrandBackground" for c in fails))

    def test_dark_current_baseline_has_no_dual_failure_but_no_certification(self):
        self.assertEqual(self.report["dualFailureByMode"],{"light":10,"dark":0})
        self.assertIn("not sampled browser pixels",self.report["scope"])
        self.assertIn("NOT approved focus token semantics",self.report["scope"])

    def test_true_opaque_underlay_and_alpha_compositing(self):
        self.assertEqual(composite("rgba(255, 255, 255, 0.5)","#1267B4"),"#89B3DA")
        self.assertEqual(composite("rgba(255, 255, 255, 1)","#1267B4"),"#FFFFFF")
        self.assertEqual(composite("rgba(0, 0, 0, 0.5)","#FFFFFF"),"#808080")

    def test_no_false_acceptance_of_zero_opacity_or_non_rgba(self):
        for value in ("transparent","rgb(255, 255, 255)",
                      "rgba(0, 0, 0, 0)","rgba(256, 0, 0, 0.5)",
                      "rgba(255, 255, 255, .5)","rgba(0, 0, 0, -0.1)"):
            with self.subTest(value=value):
                with self.assertRaises(ValueError):
                    rgba(value)

    def test_underlay_must_be_real_opaque_hex(self):
        for color in ("rgba(0,0,0,0.5)", "#FFF", "transparent", "var(--color)"):
            with self.subTest(color=color):
                with self.assertRaises(ValueError):
                    rgb_hex(color)

    def test_missing_source_theme_fails_closed(self):
        from pathlib import Path
        with patch("audit_v3_focus_alpha_hosts.THEME_DIR",Path("/a/nonexistent/v3/token-source")):
            broken=audit()
        self.assertFalse(broken["passedResearchContract"])
        self.assertTrue(broken["errors"])

    def test_failing_light_example_cannot_be_reinterpreted_as_approved_ring(self):
        failing=next(c for c in self.report["cases"] if c["bothBelow3"])
        self.assertFalse(failing["eitherAtLeast3"])
        self.assertLess(max(failing["brandContrast"],failing["inverseContrast"]),3)

if __name__=="__main__":
    unittest.main()
