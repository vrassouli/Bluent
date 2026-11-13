from __future__ import annotations

import shutil
import tempfile
import unittest
from pathlib import Path

from check_v3_textfield_contract import TextFieldContractError, check_textfield_contract

ROOT = Path(__file__).resolve().parents[2]


class TextFieldContractTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory(prefix="bluent-textfield-contract-")
        self.temp_root = Path(self.temp_dir.name)
        relative_paths = (
            "src/Bluent.UI/Components/TextFieldComponent/TextField.razor.cs",
            "src/Bluent.UI/Components/TextFieldComponent/TextField.razor",
            "src/Bluent.UI/Components/BluentFieldComponentBase.cs",
            "src/Bluent.UI/Components/BluentInputComponentBase.cs",
            "src/Bluent.UI/Components/TextFieldComponent/TextFieldValuePipeline.cs",
            "src/Bluent.UI.Scripts/src/TextField/TextField.ts",
            "src/Bluent.UI.Scripts/src/index.ts",
            "docs/v3/design/TEXTFIELD-DESIGN-AND-API-CONTRACT.md",
            ".github/workflows/v3-docs-contract.yml",
        )
        for relative in relative_paths:
            destination = self.temp_root / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(ROOT / relative, destination)
        self.paths = {
            "code": self.temp_root / relative_paths[0],
            "razor": self.temp_root / relative_paths[1],
            "field_base": self.temp_root / relative_paths[2],
            "input_base": self.temp_root / relative_paths[3],
            "pipeline": self.temp_root / relative_paths[4],
            "interop": self.temp_root / relative_paths[5],
            "script_entry": self.temp_root / relative_paths[6],
            "contract": self.temp_root / relative_paths[7],
            "workflow": self.temp_root / relative_paths[8],
        }
        self.original = {key: file.read_text(encoding="utf-8-sig") for key, file in self.paths.items()}

    def tearDown(self):
        self.temp_dir.cleanup()

    def _check_mutation(self, key: str, old: str, new: str):
        self.assertIn(old, self.original[key], f"mutation anchor missing for {key}")
        self.paths[key].write_text(self.original[key].replace(old, new, 1), encoding="utf-8")
        with self.assertRaises(TextFieldContractError):
            check_textfield_contract(self.temp_root)

    def test_current_textfield_source_and_reference_match(self):
        check_textfield_contract(ROOT)

    def test_missing_direct_parameter_is_rejected(self):
        self._check_mutation("code", "[Parameter] public bool AsciiDigits { get; set; }", "public bool AsciiDigits { get; set; }")

    def test_direct_parameter_documentation_type_drift_is_rejected(self):
        self._check_mutation("contract", "| Rows | int? | null |", "| Rows | string | null |")

    def test_direct_boolean_parameter_cannot_gain_an_explicit_true_default(self):
        self._check_mutation(
            "code",
            "[Parameter] public bool DigitOnly { get; set; }",
            "[Parameter] public bool DigitOnly { get; set; } = true;",
        )

    def test_inherited_parameter_documentation_cannot_disappear(self):
        self._check_mutation(
            "contract",
            "| `BindValueEvent` | `BluentFieldComponentBase<string?>` | `string`",
            "| `BindValueEvent` | `BluentFieldComponentBase<string?>` | `event`",
        )

    def test_inherited_bind_event_default_is_checked_against_source(self):
        self._check_mutation(
            "field_base",
            '[Parameter] public string BindValueEvent { get; set; } = "onchange";',
            '[Parameter] public string BindValueEvent { get; set; } = "oninput";',
        )

    def test_inherited_size_default_is_checked_against_source(self):
        self._check_mutation(
            "field_base",
            "[Parameter] public FieldSize Size { get; set; } = FieldSize.Medium;",
            "[Parameter] public FieldSize Size { get; set; } = FieldSize.Small;",
        )

    def test_inherited_source_parameter_cannot_disappear(self):
        self._check_mutation("field_base", "[Parameter] public string BindValueEvent", "public string BindValueEvent")

    def test_transform_setter_order_is_fail_closed(self):
        old = self.original["pipeline"]
        changed = old.replace(
            "if (digitOnly)\n            value = value?.ToDigits();\n\n        if (asciiDigits)",
            "if (asciiDigits)\n            value = value?.ToAsciiDigits();\n\n        if (digitOnly)",
            1,
        )
        self.assertNotEqual(old, changed)
        self.paths["pipeline"].write_text(changed, encoding="utf-8")
        with self.assertRaises(TextFieldContractError):
            check_textfield_contract(self.temp_root)

    def test_textfield_setter_must_delegate_to_the_value_pipeline(self):
        self._check_mutation(
            "code",
            "TextFieldValuePipeline.Normalize(",
            "TextFieldValuePipeline.NormalizeRemoved(",
        )

    def test_normalized_value_not_raw_text_is_committed_to_input_base(self):
        self._check_mutation(
            "code",
            "CurrentValueAsString = normalized;",
            "CurrentValueAsString = value;",
        )

    def test_native_selection_mapping_cannot_be_removed(self):
        self._check_mutation(
            "code",
            "TextFieldValuePipeline.NormalizeWithSelection(",
            "TextFieldValuePipeline.NormalizeWithoutSelection(",
        )

    def test_javascript_selection_restore_cannot_be_removed(self):
        self._check_mutation(
            "interop",
            "element.setSelectionRange(start, end, direction);",
            "element.focus();",
        )
    def test_capture_phase_selection_tracking_must_be_installed(self):
        self._check_mutation(
            "code",
            'InvokeVoidAsync("trackTextSelection", Element.Value)',
            'InvokeVoidAsync("trackTextSelectionRemoved", Element.Value)',
        )

    def test_capture_phase_listener_must_run_before_blazor_input_handler(self):
        self._check_mutation(
            "interop",
            'element.addEventListener("input", listener, true);',
            'element.addEventListener("input", listener, false);',
        )

    def test_native_selection_listener_must_be_removed_on_dispose(self):
        self._check_mutation(
            "code",
            'InvokeVoidAsync("stopTrackingTextSelection", Element.Value)',
            'InvokeVoidAsync("disposeTextSelection", Element.Value)',
        )
    def test_native_textarea_branch_is_required(self):
        self._check_mutation("razor", "<textarea @attributes=GetInputAdditionalAttributes()", "<textarea disabled")

    def test_transform_caret_acceptance_scenario_cannot_disappear(self):
        self._check_mutation(
            "contract",
            "TF-TRANSFORM-005 | Mid-string digit normalization",
            "TF-TRANSFORM-005 | missing caret scenario",
        )

    def test_evidence_scope_cannot_claim_v3_implementation(self):
        self._check_mutation("contract", "This is not a released v3 API", "This is a released v3 API")

    def test_docs_workflow_stays_wired_to_textfield_changes(self):
        self._check_mutation(
            "workflow",
            '      - "src/Bluent.UI/Components/TextFieldComponent/**"',
            '      # TextField path omitted',
        )


if __name__ == "__main__":
    unittest.main()
