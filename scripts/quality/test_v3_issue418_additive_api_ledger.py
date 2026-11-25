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
    "SurfaceRole": "String | get=True set=True | ParameterAttribute",
    "SurfaceAriaLabel": "String | get=True set=True | ParameterAttribute",
    "SurfaceAriaLabelledBy": "String | get=True set=True | ParameterAttribute",
}
METHODS = {
    "DismissOnEscape():Void | generic=0",
    "DisposeAsync():System.Threading.Tasks.ValueTask | generic=0",
}
class Issue418AdditiveApiLedgerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.payload = json.loads(CONTRACT.read_text(encoding="utf-8"))
        cls.payload_schema = json.loads((ROOT / "docs/v3/tokens/issue-418-token-schema.preview.json").read_text(encoding="utf-8"))
    def test_explicit_component_deltas(self):
        types = self.payload["Components"]
        dialog = types["Bluent.UI::Bluent.UI.Components.Dialog"]
        popover = types["Bluent.UI::Bluent.UI.Components.Popover"]
        for name, signature in DIALOG.items(): self.assertEqual(dialog["Properties"][name], signature)
        for name, signature in POPOVER.items(): self.assertEqual(popover["Properties"][name], signature)
        self.assertTrue(METHODS.issubset(set(dialog["Methods"])))
        self.assertEqual(len(DIALOG)+len(POPOVER),12)
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
        property_count = sum(len(x["Properties"]) for x in types.values())
        # The current bluent-v3 base includes Label.InfoButtonAriaLabel and the
        # reviewed #435 Switch migration. Together with #418's twelve Dialog /
        # Popover properties the cumulative component snapshot is exactly 795.
        label_properties = types["Bluent.UI::Bluent.UI.Components.Label"]["Properties"]
        base_label_signature = "String | get=True set=True | ParameterAttribute"
        self.assertEqual(label_properties["InfoButtonAriaLabel"], base_label_signature)
        switch = types["Bluent.UI::Bluent.UI.Components.Switch"]
        self.assertEqual(
            switch["BaseType"],
            "Bluent.UI.Components.BluentInputComponentBase`1<Boolean>",
        )
        self.assertEqual(switch["Properties"], {
            "Label": "String | get=True set=True | ParameterAttribute",
            "LabelPosition": "Bluent.UI.Components.SwitchLabelPosition | get=True set=True | ParameterAttribute",
            "Required": "String | get=True set=True | ParameterAttribute",
        })
        self.assertEqual(property_count, 795)
        self.assertEqual(sum(len(x["Methods"]) for x in types.values()),196)
        self.assertEqual(sum(len(x["Constructors"]) for x in types.values()),139)
        self.assertEqual(sum(len(x["Events"]) for x in types.values()),13)

    def test_public_portal_scope_value_carrier_is_immutable_and_experimental(self):
        scope = (ROOT / "src/Bluent.UI/Components/PortalThemeScope.cs").read_text(encoding="utf-8-sig")
        self.assertIn("public sealed record PortalThemeScope", scope)
        self.assertIn('public PortalThemeScope(string mode, string direction = "ltr", string density = "comfortable", bool useV3Tokens = true, string? brand = null)', scope)
        for declaration in (
            "public string Mode { get; }",
            "public string Direction { get; }",
            "public string Density { get; }",
            "public bool UseV3Tokens { get; }",
            "public string? Brand { get; }",
        ):
            self.assertIn(declaration, scope)
        self.assertNotIn("OwnerId", scope)
        decision = self.payload_schema["reviewPolicy"]["selectedDecisions"]["portalOwnership"]
        self.assertEqual(decision["publicScopeValueType"]["name"], "Bluent.UI.Components.PortalThemeScope")
        self.assertFalse(decision["productionApiApproval"])

    def test_public_dialog_configurator_additions_are_fully_recorded(self):
        source = (ROOT / "src/Bluent.UI/Components/DialogComponent/DialogConfigurator.cs").read_text(encoding="utf-8-sig")
        expected = (
            "SetThemeScope(PortalThemeScope? themeScope)",
            "SetAccessibleDialog(string name)",
            "SetAccessibleDialog(string name, string closeButtonLabel)",
            "SetAccessibleDescription(string description)",
            "SetReturnFocusTargetId(string elementId)",
            "SetModalKeyboardNavigation(bool enabled = true)",
            "SetInitialFocusTargetId(string elementId)",
        )
        for signature in expected:
            self.assertIn("public DialogConfigurator " + signature, source)

    def test_public_dialog_configuration_properties_are_fully_recorded(self):
        source = (ROOT / "src/Bluent.UI/Components/DialogComponent/DialogConfiguration.cs").read_text(encoding="utf-8-sig")
        self.assertIn("public class DialogConfiguration", source)
        expected = (
            "public PortalThemeScope? ThemeScope { get; init; }",
            "public string? AccessibleName { get; init; }",
            "public string? AccessibleDescription { get; init; }",
            "public string? CloseButtonLabel { get; init; }",
            "public string? ReturnFocusTargetId { get; init; }",
            "public bool EnableModalKeyboard { get; init; }",
            "public string? InitialFocusTargetId { get; init; }",
        )
        for declaration in expected:
            self.assertIn(declaration, source)

    def test_public_popover_settings_property_is_fully_recorded(self):
        source = (ROOT / "src/Bluent.UI/Components/PopoverComponent/PopoverSettings.cs").read_text(encoding="utf-8-sig")
        self.assertIn("public bool AccessibleTriggerState { get; set; }", source)

    def test_machine_readable_complete_package_delta_has_required_members(self):
        review = self.payload_schema["reviewPolicy"]["publicApiDelta"]
        self.assertEqual(len(review["newExportedTypes"]), 1)
        self.assertEqual(review["newExportedTypes"][0]["name"], "Bluent.UI.Components.PortalThemeScope")
        members = review["addedPublicMembers"]
        self.assertEqual(len(members["Bluent.UI.Components.DialogConfigurator"]), 7)
        self.assertEqual(len(members["DialogConfiguration"]), 7)
        self.assertEqual(len(members["Bluent.UI.Components.Dialog"]), 9)
        self.assertEqual(len(members["Bluent.UI.Components.Popover"]), 5)
        self.assertEqual(len(members["Bluent.UI.Components.PopoverSettings"]), 1)
        self.assertIn("No existing public member signatures were removed or changed", review["compatibility"])

if __name__=="__main__":
    unittest.main()
