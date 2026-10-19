"""#552 local inherited API coverage and negative controls."""
import copy
import unittest
from audit_v3_parity_inherited_api import compute, validate


class LocalInheritedApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.snapshot = compute()
        cls.by_family = {f["family"]: f for f in cls.snapshot["families"]}

    def test_all_family_chains_generated(self):
        self.assertEqual(18, len(self.by_family))

    def test_switch_inherits_checkbox_and_local_input_base(self):
        data = self.by_family["Switch"]["components"][0]
        self.assertIn("Checkbox", data["localBaseChain"])
        self.assertIn("BluentInputComponentBase", data["localBaseChain"])
        self.assertIn("Label", [x["name"] for x in data["localInheritedParameters"]])
        self.assertIn("Class", [x["name"] for x in data["localInheritedParameters"]])
        self.assertIn("InputBase<TValue>", data["externalFrameworkBaseBoundary"])

    def test_button_inherits_tooltip_and_attributes(self):
        data = self.by_family["Button"]["components"][0]
        names = [x["name"] for x in data["localInheritedParameters"]]
        self.assertIn("Tooltip", names)
        self.assertIn("AdditionalAttributes", names)

    def test_field_inherits_slot_addons(self):
        data = self.by_family["TextField"]["components"][0]
        names = [x["name"] for x in data["localInheritedParameters"]]
        self.assertIn("StartAddon", names)
        self.assertIn("EndAddon", names)
        self.assertIn("InputBase<TValue>", data["externalFrameworkBaseBoundary"])

    def test_external_framework_not_falsely_accepted(self):
        for family in self.by_family.values():
            for c in family["components"]:
                self.assertFalse(c["completePublicApiVerified"])
                self.assertEqual("local_source_only_external_pending", c["inheritedContractStatus"])

    def test_unauthorized_status_change_detected(self):
        altered = copy.deepcopy(self.snapshot)
        altered["families"][0]["components"][0]["completePublicApiVerified"] = True
        self.assertTrue(validate(altered, self.snapshot))

    def test_missing_local_base_detected(self):
        altered = copy.deepcopy(self.snapshot)
        altered["families"][0]["components"][0]["localBaseChain"] = []
        self.assertTrue(validate(altered, self.snapshot))


if __name__ == "__main__":
    unittest.main()

