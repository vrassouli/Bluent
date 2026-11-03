"""#552 declared-source API inventory: positive and negative controls."""
import copy
import unittest

from audit_v3_parity_source_api import build_inventory, inspect_component, validate


class SourceApiAuditTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.snapshot = build_inventory()

    def test_eighteen_families_and_issues(self):
        self.assertEqual(18, len(self.snapshot["families"]))
        self.assertEqual(18, len({x["productIssue"] for x in self.snapshot["families"]}))

    def test_direct_parameters_do_not_erase_base_contract(self):
        switch = next(x for x in self.snapshot["families"] if x["family"] == "Switch")
        self.assertEqual("not_reviewed", switch["components"][0]["inheritedParameterStatus"])
        self.assertIn("Checkbox<bool>", switch["components"][0]["declaredBaseTypes"])
        self.assertEqual(0, switch["components"][0]["declaredParameterCount"])

    def test_non_razor_render_tree_source(self):
        icon = next(x for x in self.snapshot["families"] if x["family"] == "Icon")
        self.assertTrue(icon["components"][0]["sourceFiles"][0].endswith("Icon.cs"))
        self.assertIn("Variant", [p["name"] for p in icon["components"][0]["parameters"]])

    def test_radio_group_has_child_radio_component(self):
        family = next(x for x in self.snapshot["families"] if x["family"] == "RadioGroup")
        self.assertEqual({"Radio", "RadioGroup"}, {x["component"] for x in family["components"]})

    def test_no_false_fluent_approval(self):
        self.assertTrue(all(x["fluentParityStatus"] == "not_reviewed" and
                            not x["approvedComponentDesign"] for x in self.snapshot["families"]))

    def test_mutation_is_detected(self):
        altered = copy.deepcopy(self.snapshot)
        altered["families"][0]["components"][0]["parameters"] = []
        self.assertTrue(validate(altered, self.snapshot))

    def test_false_parity_claim_is_detected(self):
        altered = copy.deepcopy(self.snapshot)
        altered["families"][0]["fluentParityStatus"] = "verified"
        self.assertTrue(validate(altered, self.snapshot))


if __name__ == "__main__":
    unittest.main()
