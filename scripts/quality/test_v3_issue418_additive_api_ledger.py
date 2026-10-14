"""#418 additive component-API ledger after #494."""
from __future__ import annotations
import json
import unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
CONTRACT = ROOT / "docs/v3/inventory/public-component-contracts.json"
DIALOG = {
    "AccessibleDescription": "String | get=True set=True | ParameterAttribute",
    "AccessibleName": "String | get=True set=True | ParameterAttribute",
    "CloseButtonLabel": "String | get=True set=True | ParameterAttribute",
    "EnableModalKeyboard": "Boolean | get=True set=True | ParameterAttribute",
    "InitialFocusTargetId": "String | get=True set=True | ParameterAttribute",
    "IsModal": "Boolean | get=True set=True | ParameterAttribute",
    "UseStandardTitleHeading": "Boolean | get=True set=True | ParameterAttribute",
}
POPOVER = {
    "AccessibleTriggerState": "Boolean | get=True set=True | ParameterAttribute",
    "ThemeScope": "Bluent.UI.Components.PortalThemeScope | get=True set=True | CascadingParameterAttribute",
}
METHODS = {
    "DismissOnEscape():Void | generic=0",
    "DisposeAsync():System.Threading.Tasks.ValueTask | generic=0",
}
class Issue418AdditiveApiLedgerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.payload = json.loads(CONTRACT.read_text(encoding="utf-8"))
    def test_explicit_component_deltas(self):
        types = self.payload["Components"]
        dialog = types["Bluent.UI::Bluent.UI.Components.Dialog"]
        popover = types["Bluent.UI::Bluent.UI.Components.Popover"]
        for name, signature in DIALOG.items(): self.assertEqual(dialog["Properties"][name], signature)
        for name, signature in POPOVER.items(): self.assertEqual(popover["Properties"][name], signature)
        self.assertTrue(METHODS.issubset(set(dialog["Methods"])))
        self.assertEqual(len(DIALOG)+len(POPOVER),9)
        self.assertEqual(len(METHODS),2)
    def test_new_features_remain_opt_in(self):
        dialog = (ROOT/"src/Bluent.UI/Components/DialogComponent/Dialog.razor.cs").read_text(encoding="utf-8-sig")
        popover = (ROOT/"src/Bluent.UI/Components/PopoverComponent/Popover.razor.cs").read_text(encoding="utf-8-sig")
        for name in DIALOG: self.assertIn(name,dialog)
        self.assertIn("[Parameter] public bool IsModal { get; set; }",dialog)
        self.assertIn("[Parameter] public bool EnableModalKeyboard { get; set; }",dialog)
        self.assertIn("[Parameter] public bool AccessibleTriggerState { get; set; }",popover)
        self.assertIn("[CascadingParameter]",popover)
        self.assertIn("DismissOnEscape()",dialog)
        self.assertIn("DisposeAsync()",dialog)
    def test_compiled_snapshot_counts_and_base_types(self):
        types=self.payload["Components"]
        self.assertEqual(len(types),140)
        self.assertEqual(len(self.payload["SharedBaseContracts"]),8)
        self.assertEqual(sum(len(x["Properties"]) for x in types.values()),788)
        self.assertEqual(sum(len(x["Methods"]) for x in types.values()),196)
        self.assertEqual(sum(len(x["Constructors"]) for x in types.values()),139)
        self.assertEqual(sum(len(x["Events"]) for x in types.values()),13)
if __name__=="__main__":
    unittest.main()
