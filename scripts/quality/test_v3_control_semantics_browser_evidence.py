from __future__ import annotations
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
QUALITY = ROOT / "docs/v3/quality"
EVIDENCE = QUALITY / "evidence"
REPORT = QUALITY / "FLUENT-PARITY-CONTROL-SEMANTICS-BROWSER-AUDIT.md"
MATRIX = QUALITY / "FLUENT-PARITY-RETRO-AUDIT.json"

class ControlSemanticsBrowserEvidenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.report = REPORT.read_text(encoding="utf-8-sig")
        cls.matrix = json.loads(MATRIX.read_text(encoding="utf-8-sig"))
        cls.runs = {
            engine: json.loads((EVIDENCE / f"BLUENT-CONTROL-SEMANTICS-{engine.upper()}.json").read_text(encoding="utf-8-sig"))
            for engine in ("chrome", "edge")
        }

    def test_both_engines_have_complete_zero_failure_runs_and_screenshots(self):
        for engine, run in self.runs.items():
            with self.subTest(engine=engine):
                self.assertEqual(engine, run["engine"])
                self.assertEqual("73155f02", run["sourceRef"])
                self.assertEqual(56, run["summary"]["checks"])
                self.assertEqual(56, run["summary"]["passed"])
                self.assertEqual(0, run["summary"]["failed"])
                self.assertEqual(56, len(run["checks"]))
                self.assertTrue(all(item["pass"] for item in run["checks"]))
                screenshots = run["summary"]["screenshots"]
                self.assertEqual(9, len(screenshots))
                for screenshot in screenshots:
                    file = EVIDENCE / screenshot
                    self.assertTrue(file.is_file(), screenshot)
                    self.assertGreater(file.stat().st_size, 1000, screenshot)
                self.assertIn("screen-reader certification", run["scope"])

    def test_checkbox_mixed_state_and_switch_role_are_observed_in_both_ax_trees(self):
        for engine, run in self.runs.items():
            with self.subTest(engine=engine):
                checkbox_case = next(c for c in run["cases"] if c.get("page") == "checkboxes" and c.get("mode") == "LIGHT-LTR")
                checkbox = checkbox_case["checkbox"]
                self.assertIn("indeterminate", checkbox["before"]["wrapperClass"].split())
                self.assertFalse(checkbox["before"]["checked"])
                self.assertFalse(checkbox["before"]["indeterminate"])
                self.assertIsNone(checkbox["before"]["ariaChecked"])
                self.assertEqual("checkbox", checkbox["ax"][0]["role"])
                self.assertEqual("Indeterminate checkbox", checkbox["ax"][0]["name"])
                self.assertEqual("false", checkbox["ax"][0]["properties"]["checked"])
                switch_case = next(c for c in run["cases"] if "switch" in c)
                switch = switch_case["switch"]
                self.assertEqual("checkbox", switch["ax"][0]["role"])
                self.assertEqual("Light", switch["ax"][0]["name"])
                self.assertNotEqual(switch["before"]["checked"], switch["afterSpace"]["checked"])
                self.assertEqual(switch["before"]["checked"], switch["restored"]["checked"])

    def test_radiogroup_wrapper_and_cross_group_arrow_leak_are_reproduced(self):
        for engine, run in self.runs.items():
            with self.subTest(engine=engine):
                group_case = next(c for c in run["cases"] if c.get("page") == "radios" and c.get("mode") == "LIGHT-LTR")
                group = group_case["radioGroup"]
                self.assertTrue(all(not option["name"] for option in group["before"]["options"]))
                self.assertEqual("none", group["groupAx"][0]["role"])
                self.assertTrue(group["groupAx"][0]["ignored"])
                self.assertFalse(group["groupAx"][0]["name"])
                self.assertTrue(all(option["ax"][0]["role"] == "radio" for option in group["optionAx"]))
                self.assertEqual(["Yes", "No"], [option["ax"][0]["name"] for option in group["optionAx"]])
                keyboard = next(c["radioKeyboard"] for c in run["cases"] if "radioKeyboard" in c)
                self.assertTrue(keyboard["crossGroupArrow"]["crossGroupArrowLeaked"])
                all_options = keyboard["crossGroupArrow"]["all"]
                first_group_last = keyboard["afterSpace"]["options"][1]["id"]
                next_group_first = keyboard["crossGroupArrow"]["enumFirstId"]
                self.assertTrue(next(x for x in all_options if x["id"] == first_group_last)["checked"])
                self.assertTrue(next(x for x in all_options if x["id"] == next_group_first)["checked"])
                self.assertEqual(next_group_first, keyboard["crossGroupArrow"]["activeId"])

    def test_otp_accessible_names_typing_backspace_paste_and_digit_filtering(self):
        for engine, run in self.runs.items():
            with self.subTest(engine=engine):
                otp_case = next(c for c in run["cases"] if c.get("page") == "fields" and c.get("mode") == "LIGHT-LTR" and "otp" in c)
                otp = otp_case["otp"]
                self.assertEqual("group", otp["before"]["role"])
                self.assertEqual("Verification code", otp["before"]["ariaLabel"])
                self.assertEqual("4", otp["before"]["dataLength"])
                self.assertEqual([f"Digit {i} of 4" for i in range(1, 5)], [cell["ariaLabel"] for cell in otp["before"]["cells"]])
                self.assertTrue(all(cell["inputMode"] == "numeric" and cell["autocomplete"] == "one-time-code" and cell["pattern"] == r"\d*" and cell["maxLength"] == 1 for cell in otp["before"]["cells"]))
                self.assertEqual("group", otp["groupAx"][0]["role"])
                self.assertEqual("Verification code", otp["groupAx"][0]["name"])
                self.assertTrue(all(cell["ax"][0]["role"] == "textbox" and cell["ax"][0]["name"] == otp["before"]["cells"][cell["index"]]["ariaLabel"] for cell in otp["cellAx"]))
                keyboard = next(c["otpKeyboard"] for c in run["cases"] if "otpKeyboard" in c)
                self.assertEqual("OTP: 42", keyboard["afterSecond"]["outputText"])
                self.assertEqual("OTP: 4", keyboard["afterBackspace"]["outputText"])
                self.assertTrue(keyboard["pasteEvent"]["defaultPrevented"])
                self.assertEqual("7391", keyboard["pasteEvent"]["clipboardText"])
                self.assertEqual("7391", keyboard["afterPaste"]["hidden"]["value"])
                self.assertEqual("OTP: 7391", keyboard["afterPaste"]["outputText"])
                self.assertTrue(keyboard["afterPaste"]["cells"][-1]["value"] == "1")
                self.assertEqual("OTP: 739", keyboard["afterInvalid"]["outputText"])
                self.assertEqual(2, keyboard["activeAfterArrow"])
        self.assertIn("synthetic ClipboardEvent", self.runs["chrome"]["scope"])

    def test_report_preserves_partial_evidence_and_native_at_boundary(self):
        self.assertIn("56/56 instrumentation checks", self.report)
        self.assertIn("cross-group navigation leakage reproduced in both Chrome and Edge", self.report)
        self.assertIn("not native screen-reader output", self.report)
        self.assertIn("forced-colors was emulated", self.report.lower())
        self.assertIn("full evidence bundle", self.report)
        self.assertFalse(self.matrix["auditComplete"])
        self.assertTrue(self.matrix["noneApproved"])
        for family in self.matrix["families"]:
            self.assertEqual("pending", family["designApproval"])
            self.assertIsNone(family["evidenceBundle"])

if __name__ == "__main__":
    unittest.main()
