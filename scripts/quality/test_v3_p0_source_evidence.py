"""Negative controls for source-only P0 parity mapping."""
import copy
import json
import unittest
from pathlib import Path
from check_v3_p0_source_evidence import DATA, EXPECTED, ROOT, audit


class P0SourceEvidenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads(DATA.read_text(encoding="utf-8-sig"))

    def test_source_baseline(self):
        self.assertEqual([], audit(self.data, ROOT))

    def test_unverified_review_claim_rejected(self):
        data = copy.deepcopy(self.data)
        data["allFluentParityReviewed"] = True
        self.assertTrue(audit(data, ROOT))

    def test_wrong_product_issue_rejected(self):
        data = copy.deepcopy(self.data)
        data["items"][0]["issue"] = 999
        self.assertTrue(audit(data, ROOT))

    def test_source_anchor_drift_rejected(self):
        data = copy.deepcopy(self.data)
        data["items"][0]["sources"][0]["anchors"].append("__THIS_ANCHOR_DOES_NOT_EXIST__")
        self.assertTrue(audit(data, ROOT))

    def test_all_four_p0_issues_owned(self):
        self.assertEqual(EXPECTED, {x["family"]: x["issue"] for x in self.data["items"]})


if __name__ == "__main__":
    unittest.main()
