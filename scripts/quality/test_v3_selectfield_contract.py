from __future__ import annotations

import unittest

from check_v3_selectfield_contract import (
    validate_demo_contract,
    validate_evidence_report,
    validate_reference_contract,
    validate_source_contract,
)


class SelectFieldSourceContractTests(unittest.TestCase):
    def setUp(self) -> None:
        self.razor = """
        <select @attributes="GetInputAdditionalAttributes()" id="@GetInputId()" name="@NameAttributeValue"
                multiple @bind="CurrentValueAsStringArray" @bind:event="@BindValueEvent">@ChildContent</select>
        <select @bind-value="CurrentValueAsString" @bind-value:event="@BindValueEvent">@ChildContent</select>
        StartAddon EndAddon
        """
        self.code = """
        [Parameter] public RenderFragment? ChildContent { get; set; }
        private readonly bool _isMultipleSelect = typeof(TValue).IsArray;
        private string?[]? CurrentValueAsStringArray { get; set; }
        private static string? FormatValueAsStringForArray(object? value) => value switch
        {
            bool boolean => boolean ? "true" : "false",
            _ => Convert.ToString(value, CultureInfo.CurrentCulture)
        };
        if (typeof(TValue) == typeof(bool[])) { bool.TryParse(item, out parsed); }
        if (typeof(TValue) == typeof(bool?[])) { bool.TryParse(item, out parsed); }
        BindConverter.TryConvertTo<TValue>(value, CultureInfo.CurrentCulture, out var result);
        TryParseSelectableValueFromString(value, out result, out validationErrorMessage);
        return boolean ? "true" : "false";
        yield return "bui-select-field";
        """

    def test_native_scalar_and_array_binders_are_required(self) -> None:
        self.assertEqual(validate_source_contract(self.razor, self.code), [])

    def test_fails_when_multiple_attribute_is_removed(self) -> None:
        errors = validate_source_contract(self.razor.replace("multiple", ""), self.code)
        self.assertTrue(any("multiple" in error for error in errors))

    def test_fails_when_bind_value_event_is_not_applied(self) -> None:
        errors = validate_source_contract(
            self.razor.replace('@bind:event="@BindValueEvent"', '@bind:event="onchange"'),
            self.code,
        )
        self.assertTrue(any("BindValueEvent" in error for error in errors))

    def test_fails_when_boolean_array_conversion_is_removed(self) -> None:
        errors = validate_source_contract(
            self.razor,
            self.code.replace("typeof(TValue) == typeof(bool[])", "false"),
        )
        self.assertTrue(any("bool[]" in error for error in errors))

    def test_fails_when_direct_api_is_widened(self) -> None:
        code = self.code.replace(
            "[Parameter] public RenderFragment? ChildContent { get; set; }",
            "[Parameter] public RenderFragment? ChildContent { get; set; }\n[Parameter] public bool Searchable { get; set; }",
        )
        self.assertTrue(any("direct parameters" in error for error in validate_source_contract(self.razor, code)))


class SelectFieldDemoContractTests(unittest.TestCase):
    def test_demo_requires_all_verified_typed_value_shapes(self) -> None:
        demo = '''
        @page "/components/select-fields"
        <SelectField TValue="string" />
        <SelectField TValue="int" />
        <SelectField TValue="string[]" />
        <SelectField TValue="int[]" />
        <SelectField TValue="bool[]" />
        <SelectField BindValueEvent="oninput" />
        <EditForm><DataAnnotationsValidator /></EditForm>
        <section dir="rtl"></section>
        '''
        server = '@page "/compatibility/select-fields-server" @rendermode InteractiveServer <SelectFields />'
        nav = '<Tab Href="components/select-fields" />'
        self.assertEqual(validate_demo_contract(demo, server, nav), [])

    def test_demo_cannot_omit_boolean_array_example(self) -> None:
        demo = '''
        @page "/components/select-fields"
        <SelectField TValue="string" />
        <SelectField TValue="int" />
        <SelectField TValue="string[]" />
        <SelectField TValue="int[]" />
        <SelectField BindValueEvent="oninput" />
        <EditForm><DataAnnotationsValidator /></EditForm>
        <section dir="rtl"></section>
        '''
        server = '@page "/compatibility/select-fields-server" @rendermode InteractiveServer <SelectFields />'
        nav = '<Tab Href="components/select-fields" />'
        self.assertTrue(any("bool[]" in error for error in validate_demo_contract(demo, server, nav)))


class SelectFieldEvidenceContractTests(unittest.TestCase):
    def _report(self) -> dict:
        return {
            "component": "SelectField",
            "issue": 437,
            "browser": "Chrome",
            "renderMode": "WebAssembly",
            "checks": [{"name": f"assertion {index}", "pass": True} for index in range(19)],
            "summary": {"passed": 19, "failed": 0},
            "signals": [],
        }

    def test_exact_nineteen_pass_report_is_accepted(self) -> None:
        self.assertEqual(validate_evidence_report(self._report(), "Chrome", "WebAssembly"), [])

    def test_failed_browser_assertion_is_rejected(self) -> None:
        report = self._report()
        report["checks"][7]["pass"] = False
        report["summary"] = {"passed": 18, "failed": 1}
        errors = validate_evidence_report(report, "Chrome", "WebAssembly")
        self.assertTrue(any("failed" in error.lower() for error in errors))

    def test_unexpected_runtime_signal_is_rejected(self) -> None:
        report = self._report()
        report["signals"] = [{"type": "console", "text": "error"}]
        self.assertTrue(validate_evidence_report(report, "Chrome", "WebAssembly"))

    def test_render_mode_mismatch_is_rejected(self) -> None:
        report = self._report()
        self.assertTrue(validate_evidence_report(report, "Chrome", "Server"))


class SelectFieldReferenceContractTests(unittest.TestCase):
    def _content(self) -> tuple[str, str, str, str]:
        reference = "not a released ChildContent BindValueEvent string[] int[] bool[] combobox listbox 76/76 DRAFT Windows Contrast Themes Narrator"
        design = "DRAFT native HTML select BindValueEvent bool[] b64f6665-c9ab-80b5-8008-c4ac99d9d000 28143240-43dc-80cc-8008-f84a2fd6a22c"
        migration = "## M25 — SelectField"
        skill = "not merged or released bluent-v3 76/76 DRAFT check_v3_selectfield_contract.py"
        return reference, design, migration, skill

    def test_complete_reference_and_design_contract_is_accepted(self) -> None:
        self.assertEqual(validate_reference_contract(*self._content()), [])

    def test_design_approval_cannot_be_implied_by_removing_draft_boundary(self) -> None:
        reference, design, migration, skill = self._content()
        errors = validate_reference_contract(reference, design.replace("DRAFT", "APPROVED"), migration, skill)
        self.assertTrue(any("DRAFT" in error for error in errors))

    def test_migration_record_is_required(self) -> None:
        reference, design, _, skill = self._content()
        self.assertTrue(validate_reference_contract(reference, design, "M24 — RadioGroup", skill))


if __name__ == "__main__":
    unittest.main()
