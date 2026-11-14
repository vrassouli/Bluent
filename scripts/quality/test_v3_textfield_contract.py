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
            "src/Bluent.UI/Styles/Components/_text-field.scss",
            "src/Bluent.UI/Styles/Components/components.scss",
            "docs/v3/design/TEXTFIELD-DESIGN-AND-API-CONTRACT.md",
            ".github/workflows/v3-docs-contract.yml",
            "src/Bluent.UI.Demo.Pages/Pages/Components/TextFields.razor",
            "src/Bluent.UI.Demo.Pages/Layout/Side.razor",
            "src/Bluent.UI.Demo.Pages/Bluent.UI.Demo.Pages.csproj",
            "src/Bluent.UI.Demo.SSR/Components/Pages/TextFieldInteractiveServerProbe.razor",
            "scripts/quality/probe_v3_textfield_demo.mjs",
            ".github/workflows/v3-compatibility-browsers.yml",
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
            "contract": self.temp_root / relative_paths[9],
            "workflow": self.temp_root / relative_paths[10],
            "textfield_styles": self.temp_root / relative_paths[7],
            "component_styles": self.temp_root / relative_paths[8],
            "demo": self.temp_root / relative_paths[11],
            "demo_navigation": self.temp_root / relative_paths[12],
            "demo_project": self.temp_root / relative_paths[13],
            "server_probe": self.temp_root / relative_paths[14],
            "browser_probe": self.temp_root / relative_paths[15],
            "browser_workflow": self.temp_root / relative_paths[16],
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
        self._check_mutation("razor", "<textarea @attributes=GetTextFieldAdditionalAttributes()", "<textarea disabled")

    def test_native_validation_sets_aria_invalid_on_the_control(self):
        self._check_mutation(
            "code",
            'attributes["aria-invalid"] = "true";',
            'attributes["aria-invalid"] = "false";',
        )

    def test_readonly_state_class_cannot_disappear(self):
        self._check_mutation(
            "code",
            'HasNativeAttribute("readonly")',
            'HasNativeAttribute("readonly-removed")',
        )

    def test_focus_precedence_for_invalid_state_is_required(self):
        self._check_mutation(
            "textfield_styles",
            "&.invalid:focus-within",
            "&.invalid:blurred",
        )

    def test_forced_colors_disabled_mapping_is_required(self):
        self._check_mutation(
            "textfield_styles",
            "border-bottom-color: GrayText;",
            "border-bottom-color: red;",
        )

    def test_reduced_motion_rule_is_required(self):
        self._check_mutation(
            "textfield_styles",
            "@media (prefers-reduced-motion: reduce)",
            "@media (prefers-reduced-motion: no-preference)",
        )

    def test_textfield_css_import_cannot_disappear(self):
        self._check_mutation(
            "component_styles",
            '@import "_text-field.scss";',
            '@import "_text-field-removed.scss";',
        )

    def test_textfield_demo_route_cannot_disappear(self):
        self._check_mutation(
            "demo",
            '@page "/components/text-fields"',
            '@page "/components/text-field-removed"',
        )

    def test_textfield_demo_keeps_all_transform_combinations(self):
        self._check_mutation(
            "demo",
            'Name = "All three transforms"',
            'Name = "Missing final transform"',
        )

    def test_textfield_demo_navigation_cannot_disappear(self):
        self._check_mutation(
            "demo_navigation",
            'Href="components/text-fields"',
            'Href="components/fields"',
        )

    def test_textfield_demo_remains_an_analyzer_additional_file(self):
        self._check_mutation(
            "demo_project",
            '<AdditionalFiles Include="Pages\\Components\\TextFields.razor" />',
            '<None Include="Pages\\Components\\TextFields.razor" />',
        )

    def test_interactive_server_readiness_marker_is_rendered_after_first_circuit_render(self):
        self._check_mutation(
            "server_probe",
            'id="textfield-interactive-ready"',
            'id="removed-interactive-ready"',
        )

    def test_server_probe_waits_for_interactive_readiness_before_input(self):
        self._check_mutation(
            "browser_probe",
            "document.querySelector('#textfield-interactive-ready')?.dataset.ready === 'true'",
            "document.querySelector('#removed-interactive-ready')?.dataset.ready === 'true'",
        )

    def test_interactive_server_host_remains_a_real_server_circuit(self):
        self._check_mutation(
            "server_probe",
            "@rendermode InteractiveServer",
            "@rendermode InteractiveWebAssembly",
        )

    def test_browser_probe_keeps_render_mode_selection(self):
        self._check_mutation(
            "browser_probe",
            "process.env.BLUENT_TEXTFIELD_RENDER_MODE",
            "process.env.BLUENT_TEXTFIELD_RENDER_MODE_REMOVED",
        )

    def test_browser_ci_keeps_all_four_browser_render_mode_pairs(self):
        self._check_mutation(
            "browser_workflow",
            "render_mode: [InteractiveServer, WebAssembly]",
            "render_mode: [WebAssembly]",
        )

    def test_browser_ci_requires_github_matrix_expressions(self):
        original = self.original["browser_workflow"]
        self.assertIn("${{ matrix.browser }}", original)
        self.paths["browser_workflow"].write_text(
            original.replace("${{ matrix.browser }}", "${{ matrix.browser_name }}"),
            encoding="utf-8",
        )
        with self.assertRaises(TextFieldContractError):
            check_textfield_contract(self.temp_root)

    def test_browser_ci_builds_javascript_and_css_assets(self):
        self._check_mutation(
            "browser_workflow",
            "npm --prefix src/Bluent.UI run build:scss",
            "npm --prefix src/Bluent.UI run compile:scss",
        )

    def test_browser_ci_builds_javascript_bundle(self):
        self._check_mutation(
            "browser_workflow",
            "npm --prefix src/Bluent.UI.Scripts run build",
            "npm --prefix src/Bluent.UI.Scripts run bundle",
        )

    def test_browser_ci_preserves_server_host_stdout(self):
        self._check_mutation(
            "browser_workflow",
            "-RedirectStandardOutput $hostStdOut",
            "-RedirectStandardOutput $null",
        )

    def test_browser_ci_preserves_server_host_stderr(self):
        self._check_mutation(
            "browser_workflow",
            "Get-Content $logPath -Tail 160",
            "Write-Output 'no server logs'",
        )

    def test_browser_ci_invokes_the_real_textfield_probe(self):
        self._check_mutation(
            "browser_workflow",
            "node scripts/quality/probe_v3_textfield_demo.mjs",
            "node scripts/quality/probe_v3_textfield_demo_removed.mjs",
        )

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
