"""Negative controls for #552 CLR metadata vs direct-source API crosswalk."""
import copy
import json
import unittest
from check_v3_parity_clr_crosswalk import check, SOURCE, CONTRACTS


class ClrCrosswalkTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = json.loads(SOURCE.read_text(encoding="utf-8"))
        cls.contracts = json.loads(CONTRACTS.read_text(encoding="utf-8"))

    def test_all_eighteen_compiled_types_match_direct_source(self):
        errors, count = check(self.source, self.contracts)
        self.assertEqual([], errors)
        self.assertEqual(112, count)

    def test_fake_source_property_fails(self):
        source = copy.deepcopy(self.source)
        source["families"][0]["components"][0]["parameters"].append({"name": "FakeFeature"})
        self.assertTrue(check(source, self.contracts)[0])

    def test_omitted_source_property_fails(self):
        source = copy.deepcopy(self.source)
        source["families"][0]["components"][0]["parameters"] = []
        self.assertTrue(check(source, self.contracts)[0])

    def test_fake_fluent_approval_fails(self):
        source = copy.deepcopy(self.source)
        source["families"][0]["fluentParityStatus"] = "verified"
        self.assertTrue(check(source, self.contracts)[0])


if __name__ == "__main__":
    unittest.main()
