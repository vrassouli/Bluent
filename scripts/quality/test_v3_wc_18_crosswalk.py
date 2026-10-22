"""Negative controls for pinned 18-family WC catalog; not a Fluent acceptance gate."""
import copy
import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "scripts/quality/build_v3_wc_18_crosswalk.py"
spec = importlib.util.spec_from_file_location("wc_crosswalk_552", SOURCE)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class Upstream18Families(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.census = json.loads(module.CENSUS.read_text(encoding="utf-8-sig"))
        cls.pinned = json.loads(module.P0.read_text(encoding="utf-8-sig"))
        cls.data = json.loads(module.OUT.read_text(encoding="utf-8-sig"))

    def test_cem_pinned_42_tags_and_18_families(self):
        module.validate(self.data, self.census, self.pinned)
        self.assertEqual(len(self.data["families"]), 18)
        self.assertEqual(self.data["cemTagCount"], 42)
        self.assertEqual(len(self.data["cemSha256"]), 64)

    def test_wave_counts_and_source_issues(self):
        rows = self.data["families"]
        self.assertEqual({w: sum(x["wave"] == w for x in rows) for w in "ABCD"},
                         {"A":5, "B":6, "C":4, "D":3})
        for row in rows:
            f = next(x for x in self.census["families"] if x["family"] == row["family"])
            self.assertEqual(row["productIssue"], f["productIssue"])

    def test_absence_is_release_scoped_not_global_fluent(self):
        rows = {x["family"]: x for x in self.data["families"]}
        for name in ("Icon", "RangeSlider", "FileSelect"):
            self.assertEqual(rows[name]["counterpartKind"], "no_dedicated_tag")
            self.assertEqual(rows[name]["referencedTags"], [])
        self.assertEqual(rows["NumericField"]["counterpartKind"], "related_only")
        self.assertIn("no dedicated", module.REPORT.read_text(encoding="utf-8").lower())

    def test_reject_false_parity_claim(self):
        data = copy.deepcopy(self.data)
        data["families"][0]["fluentParity"] = "verified"
        with self.assertRaisesRegex(ValueError, "Unauthorized acceptance"):
            module.validate(data, self.census, self.pinned)

    def test_reject_wrong_owner_and_fake_tag(self):
        data = copy.deepcopy(self.data)
        data["families"][0]["productIssue"] = 9999
        with self.assertRaisesRegex(ValueError, "Owner or tag mapping"):
            module.validate(data, self.census, self.pinned)
        data = copy.deepcopy(self.data)
        data["families"][0]["referencedTags"] = ["fluent-pretend"]
        with self.assertRaisesRegex(ValueError, "Owner or tag mapping"):
            module.validate(data, self.census, self.pinned)

    def test_reject_duplicate_tag_or_changed_integrity(self):
        data = copy.deepcopy(self.data)
        data["cemPublishedTags"][0] = data["cemPublishedTags"][1]
        with self.assertRaisesRegex(ValueError, "Catalog count/uniqueness"):
            module.validate(data, self.census, self.pinned)
        data = copy.deepcopy(self.data)
        data["npmTarballIntegrity"] = "sha512-fake"
        with self.assertRaisesRegex(ValueError, "integrity drift"):
            module.validate(data, self.census, self.pinned)

    def test_offline_report_exactly_generated(self):
        self.assertEqual(module.markdown(self.data), module.REPORT.read_text(encoding="utf-8-sig"))

if __name__ == "__main__":
    unittest.main()
