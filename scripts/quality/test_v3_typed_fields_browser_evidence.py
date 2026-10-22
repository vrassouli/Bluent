from __future__ import annotations
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
QUALITY = ROOT / "docs/v3/quality"
EVIDENCE = QUALITY / "evidence"
REPORT = QUALITY / "FLUENT-PARITY-TYPED-FIELDS-BROWSER-AUDIT.md"
MATRIX = QUALITY / "FLUENT-PARITY-RETRO-AUDIT.json"

class TypedFieldsBrowserEvidenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.report = REPORT.read_text(encoding="utf-8-sig")
        cls.matrix = json.loads(MATRIX.read_text(encoding="utf-8-sig"))
        cls.runs = {
            engine: json.loads((EVIDENCE / f"BLUENT-TYPED-FIELDS-{engine.upper()}.json").read_text(encoding="utf-8-sig"))
            for engine in ("chrome", "edge")
        }

    def test_both_engines_have_complete_zero_failure_runs_and_screenshots(self):
        for engine, run in self.runs.items():
            with self.subTest(engine=engine):
                self.assertEqual(engine, run["engine"])
                self.assertEqual("73155f02", run["sourceRef"])
                self.assertEqual(39, run["summary"]["checks"])
                self.assertEqual(39, run["summary"]["passed"])
                self.assertEqual(0, run["summary"]["failed"])
                self.assertEqual(39, len(run["checks"]))
                self.assertTrue(all(item["pass"] for item in run["checks"]))
                screenshots = run["summary"]["screenshots"]
                self.assertEqual(18, len(screenshots))
                for screenshot in screenshots:
                    file = EVIDENCE / screenshot
                    self.assertTrue(file.is_file(), screenshot)
                    self.assertGreater(file.stat().st_size, 1000, screenshot)
                self.assertIn("no native screen-reader", run["scope"])

    def test_all_five_families_have_browser_ax_names_in_three_modes(self):
        expected = {
            "Masked field": ("textbox", "Masked field"),
            "Time field": ("textbox", "Time only"),
            "Date field": ("textbox", "Small date field"),
            "Numeric field": ("textbox", "Nullable int"),
            "Select field": ("combobox", "Select field"),
        }
        expected_modes = {"LIGHT-LTR", "DARK-RTL", "FORCED-COLORS"}
        for engine, run in self.runs.items():
            with self.subTest(engine=engine):
                field_cases = [c for c in run["cases"] if c.get("typedFields")]
                self.assertEqual(expected_modes, {c["mode"] for c in field_cases})
                for case in field_cases:
                    self.assertEqual(5, len(case["typedFields"]["families"]))
                    self.assertEqual(5, sum(1 for group in case["typedFields"]["snapshot"] if group["headingFound"]))
                light = next(c for c in field_cases if c["mode"] == "LIGHT-LTR")
                families = {f["family"]: f for f in light["typedFields"]["families"]}
                self.assertEqual(set(expected), set(families))
                for family, (role, name) in expected.items():
                    self.assertTrue(families[family]["elementPresent"], family)
                    self.assertEqual(role, families[family]["observedRole"], family)
                    self.assertEqual(name, families[family]["observedName"], family)
                    self.assertTrue(families[family]["allGroupFields"], family)

    def test_numeric_and_select_keyboard_paths_update_values(self):
        for engine, run in self.runs.items():
            with self.subTest(engine=engine):
                keyboard = next(c["typedFieldKeyboard"] for c in run["cases"] if "typedFieldKeyboard" in c)
                self.assertEqual("123", keyboard["numericAfter"]["value"])
                self.assertEqual("Value: 123", keyboard["numericAfter"]["output"])
                self.assertEqual("Green", keyboard["selectBefore"]["value"])
                self.assertEqual("Blue", keyboard["selectAfter"]["value"])

    def test_maskedfield_fixed_digit_prefix_mismatch_is_reproduced(self):
        for engine, run in self.runs.items():
            with self.subTest(engine=engine):
                keyboard = next(c["typedFieldKeyboard"] for c in run["cases"] if "typedFieldKeyboard" in c)
                mask = keyboard["maskAfter"]
                self.assertEqual("0991-234-5678", mask["input"])
                self.assertEqual("Typed value: 0991-234-5678", mask["output"])
                self.assertNotEqual("0912-345-6789", mask["input"])

    def test_report_keeps_runtime_and_acceptance_boundaries_explicit(self):
        self.assertIn("39/39 instrumentation checks", self.report)
        self.assertIn("reproduced in Chrome and Edge", self.report)
        self.assertIn("native screen-reader output", self.report)
        self.assertIn("not native Windows Contrast Themes", self.report)
        self.assertIn("full Fluent parity", self.report)
        self.assertFalse(self.matrix["auditComplete"])
        self.assertTrue(self.matrix["noneApproved"])
        for family in self.matrix["families"]:
            self.assertEqual("pending", family["designApproval"])
            self.assertIsNone(family["evidenceBundle"])

if __name__ == "__main__":
    unittest.main()
