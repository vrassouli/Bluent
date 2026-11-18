from __future__ import annotations

import shutil
import tempfile
import unittest
from pathlib import Path

from check_v3_switch_contract import SwitchContractError, check_switch_contract

ROOT = Path(__file__).resolve().parents[2]
FILES = (
    "src/Bluent.UI/Components/SwitchComponent/Switch.razor",
    "src/Bluent.UI/Components/SwitchComponent/Switch.razor.cs",
    "src/Bluent.UI/Components/SwitchComponent/SwitchLabelPosition.cs",
    "src/Bluent.UI/Styles/Components/_switch.scss",
    "src/Bluent.UI.Demo.Pages/Pages/Components/Switches.razor",
    "src/Bluent.UI.Demo.Pages/Bluent.UI.Demo.Pages.csproj",
    "src/Bluent.UI.Demo.Pages/Layout/Side.razor",
    "src/Bluent.UI.Demo.Pages/Layout/Header.razor",
    "src/Bluent.UI.Demo.Pages/Pages/Components/Fields.razor",
    "src/Bluent.UI.Demo.Pages/Pages/Components/ComponentLab.razor",
    "src/Bluent.UI.Demo.SSR/Components/Pages/SwitchInteractiveServerProbe.razor",
    "tests/RegexSampleGeneratorTest/SwitchRenderSemanticsTests.cs",
    "scripts/quality/probe_v3_switch.mjs",
    "scripts/quality/run_v3_switch.ps1",
    ".github/workflows/v3-compatibility-browsers.yml",
    "docs/v3/components/switch.md",
    "docs/v3/design/SWITCH-DESIGN-AND-API-CONTRACT.md",
    "docs/v3/design/MIGRATION-IMPACT-LEDGER.md",
    ".agents/skills/bluent-v3-switch/SKILL.md",
    ".agents/skills/bluent-v3/COMPONENT-ROUTER.md",
    "docs/v3/skills/README.md",
    "docs/v3/README.md",
    "docs/v3/quality/evidence/BLUENT-SWITCH-CHROME-WASM.json",
    "docs/v3/quality/evidence/BLUENT-SWITCH-EDGE-WASM.json",
    "docs/v3/quality/evidence/BLUENT-SWITCH-CHROME-INTERACTIVESERVER.json",
    "docs/v3/quality/evidence/BLUENT-SWITCH-EDGE-INTERACTIVESERVER.json",
    "docs/v3/quality/evidence/BLUENT-SWITCH-CHROME-WASM-320px.png",
    "docs/v3/quality/evidence/BLUENT-SWITCH-CHROME-WASM-1280px.png",
    "docs/v3/quality/evidence/BLUENT-SWITCH-EDGE-WASM-320px.png",
    "docs/v3/quality/evidence/BLUENT-SWITCH-EDGE-WASM-1280px.png",
    "docs/v3/quality/evidence/BLUENT-SWITCH-CHROME-INTERACTIVESERVER-320px.png",
    "docs/v3/quality/evidence/BLUENT-SWITCH-CHROME-INTERACTIVESERVER-1280px.png",
    "docs/v3/quality/evidence/BLUENT-SWITCH-EDGE-INTERACTIVESERVER-320px.png",
    "docs/v3/quality/evidence/BLUENT-SWITCH-EDGE-INTERACTIVESERVER-1280px.png",
    "docs/v3/quality/evidence/BLUENT-SWITCH-CHROME-WASM-DARK-THEME-1280px.png",
    "docs/v3/quality/evidence/BLUENT-SWITCH-CHROME-WASM-LIGHT-THEME-1280px.png",
    "docs/v3/quality/evidence/BLUENT-SWITCH-EDGE-WASM-DARK-THEME-1280px.png",
    "docs/v3/quality/evidence/BLUENT-SWITCH-EDGE-WASM-LIGHT-THEME-1280px.png",
    "docs/v3/quality/evidence/BLUENT-SWITCH-CHROME-INTERACTIVESERVER-DARK-THEME-1280px.png",
    "docs/v3/quality/evidence/BLUENT-SWITCH-CHROME-INTERACTIVESERVER-LIGHT-THEME-1280px.png",
    "docs/v3/quality/evidence/BLUENT-SWITCH-EDGE-INTERACTIVESERVER-DARK-THEME-1280px.png",
    "docs/v3/quality/evidence/BLUENT-SWITCH-EDGE-INTERACTIVESERVER-LIGHT-THEME-1280px.png",
)


class SwitchContractTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="bluent-switch-contract-")
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
        with self.assertRaises(SwitchContractError):
            check_switch_contract(self.root)

    def test_current_switch_source_design_docs_and_ci_contract(self):
        check_switch_contract(self.root)

    def test_switch_cannot_inherit_checkbox_apis(self):
        self.mutate("src/Bluent.UI/Components/SwitchComponent/Switch.razor",
                    "@inherits BluentInputComponentBase<bool>", "@inherits Checkbox<bool>")

    def test_native_switch_role_is_required(self):
        self.mutate("src/Bluent.UI/Components/SwitchComponent/Switch.razor",
                    'role="switch"', 'role="checkbox"')

    def test_native_aria_checked_override_is_forbidden(self):
        self.mutate("src/Bluent.UI/Components/SwitchComponent/Switch.razor.cs",
                    'RemoveAttribute(attributes, "aria-checked")', 'RemoveAttribute(attributes, "aria-disabled")')

    def test_stable_name_api_rejects_state_swapping_label(self):
        self.mutate("src/Bluent.UI/Components/SwitchComponent/Switch.razor.cs",
                    "public string? Label { get; set; }", "public string? UncheckedLabel { get; set; }")

    def test_physical_left_right_css_is_rejected(self):
        self.mutate("src/Bluent.UI/Styles/Components/_switch.scss", "inset-inline-start", "left")

    def test_above_label_native_input_must_be_anchored_to_the_control_row(self):
        self.mutate("src/Bluent.UI/Styles/Components/_switch.scss",
                    "inset-block-end: 2px;", "inset-block-end: 0;")

    def test_above_label_indicator_keeps_medium_track_height_in_column_flow(self):
        self.mutate("src/Bluent.UI/Styles/Components/_switch.scss",
                    "flex-basis: 20px;", "flex-basis: 40px;")

    def test_focus_visible_style_cannot_be_removed(self):
        relative = "src/Bluent.UI/Styles/Components/_switch.scss"
        body = self.paths[relative].read_text(encoding="utf-8-sig")
        self.assertIn(":focus-visible", body)
        self.paths[relative].write_text(body.replace(":focus-visible", ":focus"), encoding="utf-8")
        with self.assertRaises(SwitchContractError):
            check_switch_contract(self.root)

    def test_missing_server_matrix_host_is_rejected(self):
        self.mutate("src/Bluent.UI.Demo.SSR/Components/Pages/SwitchInteractiveServerProbe.razor",
                    "@rendermode InteractiveServer", "@rendermode InteractiveWebAssembly")

    def test_missing_fourth_cell_ci_job_is_rejected(self):
        relative = ".github/workflows/v3-compatibility-browsers.yml"
        body = self.paths[relative].read_text(encoding="utf-8-sig")
        before, switch_job = body.split("  switch-runtime:", 1)
        self.assertIn("render_mode: [WebAssembly, Server]", switch_job)
        switch_job = switch_job.replace("render_mode: [WebAssembly, Server]", "render_mode: [WebAssembly]", 1)
        self.paths[relative].write_text(before + "  switch-runtime:" + switch_job, encoding="utf-8")
        with self.assertRaises(SwitchContractError):
            check_switch_contract(self.root)

    def test_failure_artifact_must_be_preserved(self):
        relative = ".github/workflows/v3-compatibility-browsers.yml"
        body = self.paths[relative].read_text(encoding="utf-8-sig")
        marker = "  switch-runtime:"
        before, switch_job = body.split(marker, 1)
        self.assertIn("if: always()", switch_job)
        self.paths[relative].write_text(
            before + marker + switch_job.replace("if: always()", "if: success()", 1),
            encoding="utf-8")
        with self.assertRaises(SwitchContractError):
            check_switch_contract(self.root)

    def test_unapproved_preview_token_alias_is_rejected(self):
        self.mutate("src/Bluent.UI/Styles/Components/_switch.scss",
                    "--colorStrokeFocus2", "--bui-v3-switch-focus-ring")

    def test_browser_evidence_contract_is_fail_closed(self):
        relative = "docs/v3/quality/evidence/BLUENT-SWITCH-CHROME-WASM.json"
        report = self.paths[relative].read_text(encoding="utf-8-sig")
        changed = report.replace('"failed": 0', '"failed": 1', 1)
        self.assertNotEqual(report, changed)
        self.paths[relative].write_text(changed, encoding="utf-8")
        with self.assertRaises(SwitchContractError):
            check_switch_contract(self.root)

    def test_browser_evidence_must_contain_all_27_successful_assertions(self):
        relative = "docs/v3/quality/evidence/BLUENT-SWITCH-CHROME-WASM.json"
        path = self.paths[relative]
        body = path.read_text(encoding="utf-8-sig")
        self.assertIn('"passed": 27', body)
        path.write_text(body.replace('"passed": 27', '"passed": 26', 1), encoding="utf-8")
        with self.assertRaises(SwitchContractError):
            check_switch_contract(self.root)

    def test_browser_evidence_must_include_light_and_dark_theme_captures(self):
        relative = "docs/v3/quality/evidence/BLUENT-SWITCH-CHROME-WASM-DARK-THEME-1280px.png"
        self.paths[relative].unlink()
        with self.assertRaises(SwitchContractError):
            check_switch_contract(self.root)

    def test_rtl_thumb_geometry_must_check_on_and_off_against_track_midpoint(self):
        self.mutate("scripts/quality/probe_v3_switch.mjs",
                    "rtl.thumbRight<=rtl.midpoint&&rtl.offThumbLeft>=rtl.midpoint",
                    "rtl.thumbLeft<rtl.trackLeft+rtl.trackRight/2")

    def test_switch_skill_must_be_linked_from_both_routers(self):
        self.mutate("docs/v3/skills/README.md",
                    "bluent-v3-switch/SKILL.md", "bluent-v3-component/SKILL.md")


if __name__ == "__main__":
    unittest.main()