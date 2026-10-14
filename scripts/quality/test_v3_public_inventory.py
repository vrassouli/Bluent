"""#494 source inventory invariants; runtime and public API remain unverified."""
import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("audit_v3_public_inventory", ROOT / "scripts/quality/audit_v3_public_inventory.py")
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)


class InventoryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.payload = audit.payload()
        cls.rows = cls.payload["components"]

    def test_family_count_corrected(self):
        self.assertEqual(self.payload["retrievalFamilies"]["Bluent.UI"], 58)
        self.assertEqual(self.payload["retrievalFamiliesTotal"], 66)
        self.assertEqual(len(audit.ISSUES), 66)

    def test_markdown_summary_matches_actual_row_counts(self):
        text = audit.INVENTORY.read_text(encoding="utf-8-sig")
        summary = text.split("## Coverage summary", 1)[1].split("## Prioritization", 1)[0]
        q = chr(96)
        self.assertIn("| " + q + "Bluent.UI" + q + " | 58 | 58 | 1 |", summary)
        self.assertIn("| **Total** | **66** | **66** | **1** |", summary)
    def test_generic_dataset_not_lost_behind_abstract_base(self):
        names = [r["markupName"] for r in self.rows if r["package"] == "Bluent.UI.Charts"]
        self.assertIn("Dataset", names)
        self.assertNotIn("Scale", names)
        self.assertTrue({"Chart", "Legend", "Tooltip", "XScale", "YScale", "Gauge"}.issubset(names))

    def test_razor_and_csharp_components(self):
        self.assertTrue(any(r["markupName"] == "AccordionPanel" and r["sourceKind"] == "razor" for r in self.rows))
        self.assertTrue(any(r["markupName"] == "DataGridColumn" and r["sourceKind"] == "csharp" for r in self.rows))
        self.assertTrue(any(r["markupName"] == "Circle" and r["sourceKind"] == "csharp" for r in self.rows))

    def test_internal_paths_require_manual_classification(self):
        rows = [r for r in self.rows if "/Internal/" in r["source"] or "/Internals/" in r["source"]]
        self.assertGreater(len(rows), 0)
        self.assertTrue(all(r["classification"] == "internal-path-review" for r in rows))

    def test_candidate_issues_and_deduplicated_sources(self):
        ids = [(r["package"], r["source"], r["markupName"]) for r in self.rows]
        self.assertEqual(len(ids), len(set(ids)))
        self.assertTrue(all(r["familyIssue"] in range(428, 494) for r in self.rows if r["classification"] == "public-candidate"))

    def test_snapshot_drift(self):
        self.assertEqual(json.loads(audit.OUT.read_text(encoding="utf-8")), self.payload)
        self.assertEqual(self.payload["penpot"]["pageId"], "44b12572-0104-807e-8008-ca032a4746f0")
        self.assertEqual(sum(r["routing"] == "sole-family-provisional" for r in self.rows), 45)
        self.assertTrue(all(r["verification"] == "source-candidate" for r in self.rows))
        self.assertTrue(all(r["componentIssue"] == r["familyIssue"] for r in self.rows if r["routing"] == "sole-family-provisional"))


if __name__ == "__main__":
    unittest.main()



