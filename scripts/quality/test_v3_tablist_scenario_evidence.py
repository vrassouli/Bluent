"""Validate stored *actual* TabList product browser observations without marking parity."""
import json
import unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
EVIDENCE = ROOT / "docs/v3/quality/evidence"
REPORT = ROOT / "docs/v3/quality/FOCUS-TABLIST-PANELS-LINKS-DISABLED.md"

class TabListScenarioEvidence(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.runs = [json.loads((EVIDENCE / f"BLUENT-TABLIST-SCENARIOS-{engine}.json").read_text(encoding="utf-8-sig")) for engine in ("CHROME", "EDGE")]
        cls.report = REPORT.read_text(encoding="utf-8-sig")
    def test_two_actual_engines(self):
        self.assertEqual([r["engine"] for r in self.runs], ["chrome", "edge"])
        self.assertTrue(all(r["owner"] == 465 and "actual Bluent" in r["host"] for r in self.runs))
    def test_panel_relationship_gap(self):
        for r in self.runs:
            panel = r["before"]["panel"]
            self.assertEqual(len(panel["items"]), 6)
            self.assertEqual(len(panel["panels"]), 6)
            self.assertEqual([x["text"] for x in panel["items"]], ["Arrivals", "Departures", "Conditions"] * 2)
            self.assertTrue(all(x["role"] is None and x["ariaSelected"] is None and x["ariaControls"] is None for x in panel["items"]))
            self.assertTrue(all(x["role"] is None and x["labelledBy"] is None for x in panel["panels"]))
    def test_arrow_does_not_roving_focus(self):
        for r in self.runs:
            self.assertTrue(r["focusPanelSecond"])
            self.assertTrue(r["afterArrow"]["panel"]["items"][1]["focused"])
            self.assertFalse(r["afterArrow"]["panel"]["items"][2]["focused"])
    def test_disabled_selected_but_unfocusable(self):
        for r in self.runs:
            second = r["afterDisabledFocus"]["disabled"]["items"][1]
            self.assertTrue(second["disabled"] and second["selected"])
            self.assertFalse(r["focusDisabled"])
            self.assertFalse(second["focused"])
    def test_navigation_links_are_not_panel_tabs(self):
        for r in self.runs:
            links = r["before"]["links"]["items"]
            self.assertEqual(len(links), 4)
            self.assertEqual([x["tag"] for x in links], ["A"] * 4)
            self.assertEqual([x["href"] for x in links], [f"/components/tablists?tab{i}" for i in range(1,5)])
    def test_no_false_signoff(self):
        self.assertIn("Not", self.report)
        self.assertIn("No dynamic removal/reorder was executed", self.report)
        self.assertIn("not one six-tab group", self.report)
if __name__ == "__main__":
    unittest.main()
