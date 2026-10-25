from __future__ import annotations
import json
import unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
EVIDENCE = ROOT / "docs/v3/quality/evidence"
AUDIT = ROOT / "docs/v3/quality/FLUENT-PARITY-RADIOGROUP-AUDIT.md"
PROJECT = ROOT / ".bluent/PROJECT.md"
PROBE = ROOT / "scripts/quality/probe_v3_radiogroup_name_isolation.mjs"

class RadioGroupNameIsolationEvidenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.audit = AUDIT.read_text(encoding="utf-8-sig")
        cls.project = PROJECT.read_text(encoding="utf-8-sig")
        cls.probe = PROBE.read_text(encoding="utf-8-sig")
        cls.runs = {engine: json.loads((EVIDENCE / f"BLUENT-RADIOGROUP-NAME-ISOLATION-{engine}.json").read_text(encoding="utf-8-sig")) for engine in ("CHROME", "EDGE")}

    def test_chrome_and_edge_probes_pass_all_six_checks(self):
        expected = {"default-options-start-without-native-names", "adjacent-demo-groups-start-without-native-names", "temporary-distinct-name-per-group-is-applied", "label-activation-selects-and-focuses-first-radio", "ArrowRight-wraps-within-the-named-default-group", "ArrowRight-does-not-select-or-focus-the-adjacent-enum-group"}
        for engine, run in self.runs.items():
            with self.subTest(engine=engine):
                self.assertEqual(engine.lower(), run["engine"])
                self.assertEqual("73155f02", run["sourceRef"])
                self.assertEqual({"checks": 6, "passed": 6, "failed": 0}, run["summary"])
                checks = {item["name"]: item for item in run["checks"]}
                self.assertEqual(expected, set(checks))
                self.assertTrue(all(item["pass"] for item in checks.values()))
                self.assertTrue(all(item["name"] == "" for item in run["initial"]["default"]["inputs"]))
                self.assertTrue(all(item["name"] == "" for item in run["initial"]["enum"]["inputs"]))
                self.assertTrue(all(item["name"] == "__probe_default_group" for item in run["injected"]["default"]["inputs"]))
                self.assertTrue(all(item["name"] == "__probe_enum_group" for item in run["injected"]["enum"]["inputs"]))

    def test_label_and_arrow_results_show_isolation_between_groups(self):
        for engine, run in self.runs.items():
            with self.subTest(engine=engine):
                first, second = run["injected"]["default"]["inputs"][:2]
                self.assertTrue(run["afterLabel"]["default"]["inputs"][0]["checked"])
                self.assertEqual(first["id"], run["afterLabel"]["activeId"])
                self.assertEqual(first["id"], run["afterArrow"]["activeId"])
                self.assertTrue(run["afterArrow"]["groups"]["default"]["inputs"][0]["checked"])
                self.assertFalse(run["afterArrow"]["groups"]["default"]["inputs"][1]["checked"])
                self.assertNotIn(run["afterArrow"]["activeId"], [x["id"] for x in run["injected"]["enum"]["inputs"]])
                self.assertEqual([x["checked"] for x in run["beforeArrow"]["enum"]["inputs"]], [x["checked"] for x in run["afterArrow"]["groups"]["enum"]["inputs"]])
                self.assertEqual(second["id"], run["beforeArrow"]["default"]["inputs"][1]["id"])

    def test_audit_documents_the_dom_only_limit_and_links_evidence(self):
        self.assertIn("Name-isolation follow-up: Chrome and Edge (2026-10-25)", self.audit)
        self.assertIn("BLUENT-RADIOGROUP-NAME-ISOLATION-CHROME.json", self.audit)
        self.assertIn("BLUENT-RADIOGROUP-NAME-ISOLATION-EDGE.json", self.audit)
        self.assertIn("does not prove that Bluent's public group API exposes a shared name", self.audit)
        self.assertIn("Latest #552 RadioGroup name-isolation follow-up (2026-10-25)", self.project)
        self.assertIn("does not establish a public Bluent group-name API", self.project)
        self.assertIn("setAttribute('name','__probe_default_group')", self.probe)
        self.assertIn("does not prove the Bluent public API offers a group name", self.probe)

if __name__ == "__main__":
    unittest.main()

