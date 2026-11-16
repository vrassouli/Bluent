from __future__ import annotations
import shutil
import tempfile
import unittest
from pathlib import Path

from check_v3_numericfield_contract import NumericFieldContractError, check_numericfield_contract

ROOT = Path(__file__).resolve().parents[2]
FILES = (
    "src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor.cs",
    "src/Bluent.UI/Components/NumericFieldComponent/Internal/NumericFieldKeyboardCallback.cs",
    "src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor",
    "src/Bluent.UI/Components/NumericFieldComponent/NumericFieldValuePipeline.cs",
    "src/Bluent.UI/wwwroot/bluent.ui.numeric-field.js",
    "src/Bluent.UI.Demo.Pages/Pages/Components/NumericFields.razor",
    "src/Bluent.UI.Demo.SSR/Program.cs",
    "scripts/quality/run_v3_numericfield.ps1",
    "scripts/quality/probe_v3_numericfield.mjs",
    ".github/workflows/v3-compatibility-browsers.yml",
    "docs/v3/components/numeric-field.md",
)

class NumericFieldContractTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="bluent-numericfield-contract-")
        self.root = Path(self.temp.name)
        for relative in FILES:
            destination = self.root / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(ROOT / relative, destination)
        self.paths = {relative: self.root / relative for relative in FILES}

    def tearDown(self):
        self.temp.cleanup()

    def mutate(self, relative: str, old: str, new: str):
        path = self.paths[relative]
        body = path.read_text(encoding="utf-8-sig")
        self.assertIn(old, body, f"mutation anchor missing: {relative}: {old}")
        path.write_text(body.replace(old, new, 1), encoding="utf-8")
        with self.assertRaises(NumericFieldContractError):
            check_numericfield_contract(self.root)

    def test_current_source_and_ci_contract(self):
        check_numericfield_contract(self.root)

    def test_missing_focus_and_validation_parameter_demo_coverage_is_rejected(self):
        self.mutate("src/Bluent.UI.Demo.Pages/Pages/Components/NumericFields.razor",
                    'OnFocus="HandleDemoNumericFocus"', 'OnFocus="default"')

    def test_missing_step_default_is_rejected(self):
        self.mutate("src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor.cs",
                    "_effectiveStep = _stepWasProvided", "_effectiveStep = false && _stepWasProvided")

    def test_js_callback_does_not_become_public_component_api(self):
        self.mutate("src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor.cs",
                    "private Task HandleNumericFieldKeyAsync", "public Task HandleNumericFieldKeyAsync")

    def test_js_bridge_remains_internal(self):
        self.mutate("src/Bluent.UI/Components/NumericFieldComponent/Internal/NumericFieldKeyboardCallback.cs",
                    "internal sealed class NumericFieldKeyboardCallback", "public sealed class NumericFieldKeyboardCallback")

    def test_disposal_remains_explicit_interface_implementation(self):
        self.mutate("src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor.cs",
                    "async ValueTask IAsyncDisposable.DisposeAsync()", "public async ValueTask DisposeAsync()")

    def test_removing_spinbutton_semantics_is_rejected(self):
        self.mutate("src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor",
                    'role="spinbutton"', 'role="textbox"')

    def test_missing_four_cell_browser_matrix_is_rejected(self):
        self.mutate(".github/workflows/v3-compatibility-browsers.yml",
                    "render_mode: [WebAssembly, Server]", "render_mode: [WebAssembly]")

    def test_missing_failure_artifact_preservation_is_rejected(self):
        relative = ".github/workflows/v3-compatibility-browsers.yml"
        body = self.paths[relative].read_text(encoding="utf-8-sig")
        before, numeric_job = body.split("  numericfield-runtime:", 1)
        self.assertIn("if: always()", numeric_job)
        changed = before + "  numericfield-runtime:" + numeric_job.replace("if: always()", "if: success()", 1)
        self.paths[relative].write_text(changed, encoding="utf-8")
        with self.assertRaises(NumericFieldContractError):
            check_numericfield_contract(self.root)

    def test_missing_live_culture_matrix_is_rejected(self):
        relative = "scripts/quality/probe_v3_numericfield.mjs"
        body = self.paths[relative].read_text(encoding="utf-8-sig")
        self.assertIn("ar-EG", body)
        self.paths[relative].write_text(body.replace("ar-EG", "ar-XX", 1), encoding="utf-8")
        with self.assertRaises(NumericFieldContractError):
            check_numericfield_contract(self.root)

    def test_missing_component_unmount_probe_is_rejected(self):
        relative = "scripts/quality/probe_v3_numericfield.mjs"
        body = self.paths[relative].read_text(encoding="utf-8-sig")
        self.assertIn("component unmount disposes its actual keyboard listener", body)
        self.paths[relative].write_text(body.replace(
            "component unmount disposes its actual keyboard listener",
            "component disposal assertion removed", 1), encoding="utf-8")
        with self.assertRaises(NumericFieldContractError):
            check_numericfield_contract(self.root)

    def test_missing_server_culture_middleware_is_rejected(self):
        relative = "src/Bluent.UI.Demo.SSR/Program.cs"
        body = self.paths[relative].read_text(encoding="utf-8-sig")
        self.assertIn("UseRequestLocalization", body)
        self.paths[relative].write_text(body.replace("UseRequestLocalization", "UseDefaultFiles", 1), encoding="utf-8")
        with self.assertRaises(NumericFieldContractError):
            check_numericfield_contract(self.root)

    def test_missing_machine_readable_browser_evidence_is_rejected(self):
        relative = "scripts/quality/probe_v3_numericfield.mjs"
        body = self.paths[relative].read_text(encoding="utf-8-sig")
        self.assertIn("BLUENT_NUMERIC_EVIDENCE_PATH", body)
        self.paths[relative].write_text(body.replace("BLUENT_NUMERIC_EVIDENCE_PATH", "BLUENT_NUMERIC_EVIDENCE_DISABLED"), encoding="utf-8")
        with self.assertRaises(NumericFieldContractError):
            check_numericfield_contract(self.root)


if __name__ == "__main__":
    unittest.main()
