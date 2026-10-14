"""Regression evidence for contextual focus sources, not a WCAG sign-off."""
import sys
from pathlib import Path
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent))
from audit_v3_focus_host_surface_matrix import audit


class FocusHostSurfaceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.report = audit()

    def test_complete_ten_brand_two_mode_five_host_source_matrix(self):
        self.assertTrue(self.report["pass"], self.report["errors"])
        self.assertEqual(self.report["entries"], 100)
        self.assertEqual(len(self.report["summary"]), 10)

    def test_brand_ring_can_remain_on_tested_neutral_hosts(self):
        for mode in ("light", "dark"):
            d = self.report["summary"][f"{mode}/neutral"]
            self.assertEqual(d["count"], 10)
            self.assertEqual(d["ringFailures"], 0)
            self.assertGreaterEqual(d["ring"][0], 3)

    def test_brand_ring_has_known_color_filled_host_failures(self):
        for mode in ("light", "dark"):
            for context in ("brand", "brandHover", "danger"):
                d = self.report["summary"][f"{mode}/{context}"]
                self.assertEqual(d["ringFailures"], 10, f"{mode}/{context}")
                self.assertLess(d["ring"][1], 3)

    def test_inverse_source_fixes_tested_brand_and_danger_hosts_but_not_all(self):
        for mode in ("light", "dark"):
            for context in ("brand", "brandHover", "danger"):
                d = self.report["summary"][f"{mode}/{context}"]
                self.assertEqual(d["inverseFailures"], 0, f"{mode}/{context}")
                self.assertGreaterEqual(d["inverse"][0], 3)
        self.assertEqual(self.report["summary"]["dark/inverted"]["inverseFailures"], 10)

    def test_scope_guards_against_button_face_confusion(self):
        label = self.report["classification"]
        self.assertIn("HOST containers", label)
        self.assertIn("not Button-face", label)
        self.assertIn("not", label)
        self.assertEqual(len(self.report["cases"]), 100)
        self.assertTrue(all(c["ringToken"].startswith("--color")
                            and c["hostToken"].startswith("--color")
                            and c["inverseToken"] == "--colorNeutralForegroundOnBrand"
                            for c in self.report["cases"]))


if __name__ == "__main__":
    unittest.main()
