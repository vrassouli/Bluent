from __future__ import annotations
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
QUALITY = ROOT / "docs/v3/quality"
EVIDENCE = QUALITY / "evidence"
REPORT = QUALITY / "FLUENT-PARITY-LABEL-LINK-BADGE-BROWSER-AUDIT.md"
MATRIX = QUALITY / "FLUENT-PARITY-RETRO-AUDIT.json"

class LabelLinkBadgeBrowserEvidenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.report = REPORT.read_text(encoding="utf-8-sig")
        cls.matrix = json.loads(MATRIX.read_text(encoding="utf-8-sig"))
        cls.runs = {
            engine: json.loads((EVIDENCE / f"BLUENT-LABEL-LINK-BADGE-{engine.upper()}.json").read_text(encoding="utf-8-sig"))
            for engine in ("chrome", "edge")
        }

    def test_both_engines_have_complete_zero_failure_runs_and_screenshots(self):
        for engine, run in self.runs.items():
            with self.subTest(engine=engine):
                self.assertEqual(engine, run["engine"])
                self.assertEqual("73155f02", run["sourceRef"])
                self.assertEqual(31, run["summary"]["checks"])
                self.assertEqual(31, run["summary"]["passed"])
                self.assertEqual(0, run["summary"]["failed"])
                self.assertEqual(31, len(run["checks"]))
                self.assertTrue(all(item["pass"] for item in run["checks"]))
                screenshots = run["summary"]["screenshots"]
                self.assertEqual(9, len(screenshots))
                for screenshot in screenshots:
                    file = EVIDENCE / screenshot
                    self.assertTrue(file.is_file(), screenshot)
                    self.assertGreater(file.stat().st_size, 1000, screenshot)

    def test_each_component_is_captured_in_three_modes(self):
        expected_modes = {"LIGHT-LTR", "DARK-RTL", "FORCED-COLORS"}
        expected_pages = {"labels", "links", "badges"}
        for engine, run in self.runs.items():
            with self.subTest(engine=engine):
                visual_cases = [c for c in run["cases"] if c.get("mode") in expected_modes]
                self.assertEqual(9, len(visual_cases))
                self.assertEqual(expected_pages, {c["page"] for c in visual_cases})
                self.assertEqual(expected_modes, {c["mode"] for c in visual_cases})
                self.assertEqual(9, len({(c["page"], c["mode"]) for c in visual_cases}))

    def test_label_info_button_inherits_unrelated_label_name(self):
        for engine, run in self.runs.items():
            with self.subTest(engine=engine):
                case = next(c for c in run["cases"] if c.get("page") == "labels" and c.get("mode") == "LIGHT-LTR")
                snapshot = case["labelSnapshot"]
                self.assertEqual("Required field*", snapshot["required"]["text"])
                self.assertFalse(snapshot["required"]["targetExists"])
                self.assertIsNone(snapshot["infoButton"]["ariaLabel"])
                self.assertIsNone(snapshot["infoButton"]["title"])
                self.assertEqual("button", case["infoAx"][0]["role"])
                self.assertEqual("This is a label", case["infoAx"][0]["name"])

    def test_disabled_link_is_focusable_generic_without_disabled_semantics(self):
        for engine, run in self.runs.items():
            with self.subTest(engine=engine):
                case = next(c for c in run["cases"] if c.get("page") == "links" and c.get("mode") == "LIGHT-LTR")
                links = case["linkSnapshot"]
                self.assertEqual(("A", "#", 0), (links["default"]["tag"], links["default"]["hrefAttribute"], links["default"]["tabIndex"]))
                self.assertEqual("Subtle link", links["subtle"]["text"])
                self.assertEqual("A", links["disabled"]["tag"])
                self.assertIsNone(links["disabled"]["hrefAttribute"])
                self.assertIsNone(links["disabled"]["ariaDisabled"])
                self.assertTrue(links["disabled"]["disabledAttribute"])
                self.assertEqual(0, links["disabled"]["tabIndex"])
                self.assertEqual("generic", case["disabledAx"][0]["role"])
                self.assertEqual("", case["disabledAx"][0]["name"])

    def test_badge_animation_ignores_emulated_reduced_motion(self):
        for engine, run in self.runs.items():
            with self.subTest(engine=engine):
                case = next(c for c in run["cases"] if c.get("mode") == "REDUCED-MOTION")
                observed = case["reducedMotion"]
                self.assertTrue(observed["prefersReducedMotion"])
                self.assertEqual("badge-pulse-shadow", observed["animationName"])
                self.assertEqual("1.5s", observed["animationDuration"])
                self.assertEqual("infinite", observed["iterationCount"])
                badge_case = next(c for c in run["cases"] if c.get("page") == "badges" and c.get("mode") == "LIGHT-LTR")
                self.assertEqual("+99", badge_case["badgeSnapshot"]["countBadge"]["text"])
                self.assertFalse(badge_case["badgeSnapshot"]["countBadge"]["role"])

    def test_report_and_matrix_preserve_acceptance_boundary(self):
        self.assertIn("31/31 instrumentation checks", self.report)
        self.assertIn("This is a label", self.report)
        self.assertIn("generic node with an empty accessible name", self.report)
        self.assertIn("prefers-reduced-motion: reduce", self.report)
        self.assertIn("native screen readers", self.report)
        self.assertFalse(self.matrix["auditComplete"])
        self.assertTrue(self.matrix["noneApproved"])
        for family in self.matrix["families"]:
            self.assertEqual("pending", family["designApproval"])
            self.assertIsNone(family["evidenceBundle"])

if __name__ == "__main__":
    unittest.main()
