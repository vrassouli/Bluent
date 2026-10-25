from __future__ import annotations

import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EVIDENCE = ROOT / "docs/v3/quality/evidence"
AUDIT = ROOT / "docs/v3/quality/FLUENT-PARITY-RADIOGROUP-AUDIT.md"
PROJECT = ROOT / ".bluent/PROJECT.md"
SOURCE = ROOT / "src/Bluent.UI/Components/RadioGroupComponent/Radio.razor"


class RadioGroupFormEvidenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.audit = AUDIT.read_text(encoding="utf-8-sig")
        cls.project = PROJECT.read_text(encoding="utf-8-sig")
        cls.runs = {
            engine: json.loads((EVIDENCE / f"BLUENT-RADIOGROUP-FORM-{engine}.json").read_text(encoding="utf-8-sig"))
            for engine in ("CHROME", "EDGE")
        }

    def test_chrome_and_edge_form_data_probes_have_three_zero_failure_checks(self):
        expected = {
            "default-name-omission",
            "native-default-value-when-only-name-is-present",
            "native-explicit-value-participates-in-FormData",
        }
        for engine, run in self.runs.items():
            with self.subTest(engine=engine):
                self.assertEqual(engine.lower(), run["engine"])
                self.assertEqual("73155f02", run["sourceRef"])
                self.assertEqual({"checks": 3, "passed": 3, "failed": 0}, run["summary"])
                self.assertEqual(expected, {check["name"] for check in run["checks"]})
                checks = {check["name"]: check for check in run["checks"]}
                self.assertTrue(all(check["pass"] for check in checks.values()))
                self.assertEqual([], checks["default-name-omission"]["observed"]["formData"])
                self.assertEqual([["choice", "on"]], checks["native-default-value-when-only-name-is-present"]["observed"]["formData"])
                self.assertEqual([["choice", "affirmative"]], checks["native-explicit-value-participates-in-FormData"]["observed"]["formData"])
                self.assertIn("synthetic form", run["scope"])
                self.assertIn("does not submit an HTTP request", run["scope"])

    def test_audit_keeps_the_probe_boundary_and_links_both_evidence_files(self):
        self.assertIn("Native form-data probe: Chrome and Edge (2026-10-25)", self.audit)
        self.assertIn("BLUENT-RADIOGROUP-FORM-CHROME.json", self.audit)
        self.assertIn("BLUENT-RADIOGROUP-FORM-EDGE.json", self.audit)
        self.assertIn("not a real HTTP submission", self.audit)
        self.assertIn("not native screen-reader acceptance", self.audit)
        self.assertIn("Latest #552 RadioGroup FormData follow-up (2026-10-25)", self.project)
        self.assertIn("not real HTTP submission or Blazor validation/callback acceptance", self.project)

    def test_component_value_parameter_is_not_rendered_as_native_value(self):
        markup = SOURCE.read_text(encoding="utf-8-sig")
        self.assertIn("@attributes=GetInputAdditionalAttributes()", markup)
        self.assertIn('checked="@IsChecked"', markup)
        self.assertNotIn('value="@Value"', markup)


if __name__ == "__main__":
    unittest.main()
