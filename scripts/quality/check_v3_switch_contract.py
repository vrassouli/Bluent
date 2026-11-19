# Bluent v3 Switch — #435 fail-closed source/API and browser-CI contract.
from __future__ import annotations

import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]


class SwitchContractError(ValueError):
    pass


def need(condition: bool, message: str) -> None:
    if not condition:
        raise SwitchContractError(message)


def check_switch_contract(root: Path = ROOT) -> None:
    def read(relative: str) -> str:
        path = root / relative
        need(path.is_file(), f"required Switch contract file is missing: {relative}")
        return path.read_text(encoding="utf-8-sig")

    razor = read("src/Bluent.UI/Components/SwitchComponent/Switch.razor")
    code = read("src/Bluent.UI/Components/SwitchComponent/Switch.razor.cs")
    enum = read("src/Bluent.UI/Components/SwitchComponent/SwitchLabelPosition.cs")
    css = read("src/Bluent.UI/Styles/Components/_switch.scss")
    demo = read("src/Bluent.UI.Demo.Pages/Pages/Components/Switches.razor")
    pages_project = read("src/Bluent.UI.Demo.Pages/Bluent.UI.Demo.Pages.csproj")
    nav = read("src/Bluent.UI.Demo.Pages/Layout/Side.razor")
    header = read("src/Bluent.UI.Demo.Pages/Layout/Header.razor")
    fields = read("src/Bluent.UI.Demo.Pages/Pages/Components/Fields.razor")
    lab = read("src/Bluent.UI.Demo.Pages/Pages/Components/ComponentLab.razor")
    server = read("src/Bluent.UI.Demo.SSR/Components/Pages/SwitchInteractiveServerProbe.razor")
    tests = read("tests/RegexSampleGeneratorTest/SwitchRenderSemanticsTests.cs")
    probe = read("scripts/quality/probe_v3_switch.mjs")
    runner = read("scripts/quality/run_v3_switch.ps1")
    workflow = read(".github/workflows/v3-compatibility-browsers.yml")
    reference = read("docs/v3/components/switch.md")
    design = read("docs/v3/design/SWITCH-DESIGN-AND-API-CONTRACT.md")
    migration = read("docs/v3/design/MIGRATION-IMPACT-LEDGER.md")
    skill = read(".agents/skills/bluent-v3-switch/SKILL.md")
    router = read(".agents/skills/bluent-v3/COMPONENT-ROUTER.md")
    skill_index = read("docs/v3/skills/README.md")
    docs_index = read("docs/v3/README.md")

    need('@inherits BluentInputComponentBase<bool>' in razor,
         "Switch must keep the scoped direct bool input base, not inherit Checkbox")
    need('@inherits Checkbox<bool>' not in razor and 'Checkbox<bool>' not in code,
         "Switch must not leak Checkbox-only parameters via inheritance")
    for token in ('type="checkbox"', 'role="switch"', 'checked="@CurrentValue"', '@onchange="ChangeHandler"'):
        need(token in razor, f"native binary switch semantics are missing: {token}")
    need('aria-checked=' not in razor and 'aria-checked' not in razor,
         "do not author a competing aria-checked state on the native checkbox")
    need('UncheckedLabel' not in razor + code and 'IndeterminateLabel' not in razor + code,
         "state-swapping and indeterminate Checkbox label APIs must not return")
    for forbidden in ('public bool Circular', 'CheckboxSize Size', 'public void Toggle()', 'ChildContent'):
        need(forbidden not in code, f"Checkbox-only or unapproved Switch API must not return: {forbidden}")
    for token in ('public string? Label', 'public string? Required', 'SwitchLabelPosition LabelPosition',
                  'OnParametersSet', 'aria-label', 'aria-labelledby', 'GetSwitchAttributes',
                  'RemoveAttribute(attributes, "role")', 'RemoveAttribute(attributes, "aria-checked")',
                  'RemoveAttribute(attributes, "type")', 'RemoveAttribute(attributes, "checked")',
                  'NormalizeBooleanAttribute(attributes, "disabled"',
                  'NormalizeBooleanAttribute(attributes, "required"', 'aria-invalid',
                  'CurrentValue = isChecked'):
        need(token in code, f"Switch source contract is missing: {token}")
    for token in ('After', 'Before', 'Above'):
        need(token in enum, f"Switch-specific label position is missing: {token}")

    for token in ('min-block-size: 24px', 'block-size: 20px', 'inline-size: 40px',
                  'block-size: 14px', 'inline-size: 14px', 'inset-inline-start',
                  'margin-inline-start: calc(100% - 14px)', ':focus-visible', 'outline: 2px solid var(--colorStrokeFocus2)',
                  'outline-offset: 2px', 'inset-block-start: auto', 'inset-block-end: 2px', 'flex-basis: 20px', '@media (forced-colors: active)', 'CanvasText', 'Highlight',
                  '@media (prefers-reduced-motion: reduce)', 'transition: none'):
        need(token in css, f"Switch CSS visual/accessibility contract is missing: {token}")
    for forbidden in ('--bui-v3-', 'bluent.component.switch', 'data-bui-v3-focus-'):
        need(forbidden not in css + code, f"Switch must not consume preview/global #418 or Focus-host API: {forbidden}")
    need('left:' not in css and 'right:' not in css and 'translateX(' not in css,
         "Switch must use logical inline-axis positioning, not physical LTR/RTL offsets")

    for token in ('@page "/components/switches"', 'SwitchLabelPosition.Above',
                  'SwitchLabelPosition.Before', 'aria-label="Enable compact mode"',
                  'DataAnnotationsValidator', 'Required="*"', 'dir="rtl"', 'lang="fa"',
                  'switch-validation-submit', 'HandleInvalidSubmit', 'HandleValidSubmit'):
        need(token in demo, f"Switch live showcase scenario is missing: {token}")
    need('Pages/Components/Switches.razor' in pages_project.replace('\\', '/'),
         "Switch showcase must be included in the Component Lab AdditionalFiles mapping")
    need('Href="components/switches"' in nav,
         "Switch showcase route must be discoverable in navigation")
    need('Label="Dark theme"' in header and 'Label="Right-to-left layout"' in header,
         "header setting consumers must use stable setting-oriented Switch names")
    for token in ('Label="Notifications"', 'Label="Feature access"', 'SwitchLabelPosition.Before'):
        need(token in fields + lab, f"existing v3 consumer examples must migrate to stable Switch API: {token}")
    need('UncheckedLabel' not in fields + lab + demo,
         "v3 demos must not keep the old state-swapping UncheckedLabel API")
    for token in ('@page "/compatibility/switches-server"', '@rendermode InteractiveServer',
                  'Switches', 'switch-interactive-ready'):
        need(token in server, f"InteractiveServer Switch host is missing: {token}")

    for token in ('RendersOneNativeCheckboxWithSwitchRoleAndNativeCheckedState',
                  'AccessibleNameRemainsStableWhenTheBooleanValueChanges',
                  'GeneratedInputIdIsStableAndAssociatedWithTheVisibleLabelOutsideEditForm',
                  'CallerAccessibleNameAllowsOmittingVisibleLabel',
                  'MissingVisibleAndAccessibleNameIsRejected', 'SupportsTheThreeFluentLabelPlacements',
                  'ReservedAttributesCannotOverrideNativeSwitchSemantics',
                  'RequiredMarkerIsDecorativeAndNativeRequiredIsIndependent',
                  'NativeDisabledAndEditContextValidationAreReflectedOnTheSwitch'):
        need(token in tests, f"focused Switch render regression test is missing: {token}")
    for token in ("Accessibility.getPartialAXTree", "Space key",
                  "focus-visible", "320px reflow", "forced-colors", "reduced-motion",
                  "EditForm", "RTL specimen", "runtimeSignals"):
        need(token.lower() in probe.lower(), f"real Switch browser probe coverage is missing: {token}")
    need("rtl.thumbRight<=rtl.midpoint&&rtl.offThumbLeft>=rtl.midpoint" in probe,
         "RTL On/Off thumb geometry must be checked on opposite sides of the measured track midpoint")
    for token in ('WebAssembly', 'Server', 'Chrome', 'Edge', 'BLUENT_SWITCH_EVIDENCE_DIR',
                  'bluent-v3-435-evidence', 'bounded retries'):
        need(token.lower() in runner.lower(), f"Switch browser runner is missing matrix/cleanup/evidence behavior: {token}")

    need('  switch-runtime:' in workflow, "permanent Switch browser CI job is missing")
    switch_job = workflow.split('  switch-runtime:', 1)[1].split('\n  radio-group-contract:', 1)[0]
    for token in ('browser: [Chrome, Edge]', 'render_mode: [WebAssembly, Server]',
                  'windows-latest', 'run_v3_switch.ps1', 'BLUENT_SWITCH_EVIDENCE_DIR',
                  'if: always()', 'actions/upload-artifact@v4', 'retention-days: 7'):
        need(token in switch_job, f"four-cell Switch browser CI/artifact contract is missing: {token}")

    for token in ('not a released v3 API', 'SwitchLabelPosition', 'role="switch"',
                  'stable', '24 × 24', '#418', '100/100', 'M23', '2.x'):
        need(token.lower() in reference.lower() + design.lower() + migration.lower(),
             f"Switch documentation/migration boundary is missing: {token}")
    cases = (
        ('BLUENT-SWITCH-CHROME-WASM.json', 'Chrome', 'WebAssembly'),
        ('BLUENT-SWITCH-EDGE-WASM.json', 'Edge', 'WebAssembly'),
        ('BLUENT-SWITCH-CHROME-INTERACTIVESERVER.json', 'Chrome', 'InteractiveServer'),
        ('BLUENT-SWITCH-EDGE-INTERACTIVESERVER.json', 'Edge', 'InteractiveServer'),
    )
    for relative, browser_name, render_mode in cases:
        path = root / 'docs/v3/quality/evidence' / relative
        need(path.is_file(), f"Switch browser report is missing: {relative}")
        report = json.loads(path.read_text(encoding='utf-8-sig'))
        checks = report.get('checks')
        need(report.get('browser') == browser_name and report.get('renderMode') == render_mode,
             f"Switch browser report does not match its matrix cell: {relative}")
        need(report.get('passed') == 27 and report.get('failed') == 0
             and isinstance(checks, list) and len(checks) == 27
             and all(item.get('pass') is True for item in checks),
             f"Switch browser evidence does not pass 27/27: {relative}")
        need(not report.get('runtimeSignals'), f"Switch browser runtime signals are present: {relative}")
    for browser in ('CHROME', 'EDGE'):
        for mode in ('WASM', 'INTERACTIVESERVER'):
            prefix = f'BLUENT-SWITCH-{browser}-{mode}'
            for capture in ('320px', '1280px', 'DARK-THEME-1280px', 'LIGHT-THEME-1280px'):
                filename = f'{prefix}-{capture}.png'
                need((root / 'docs/v3/quality/evidence' / filename).is_file(),
                     f"Switch responsive/theme screenshot evidence is missing: {filename}")

    for relative in ('docs/v3/components/switch.md', 'docs/v3/design/SWITCH-DESIGN-AND-API-CONTRACT.md',
                     '.agents/skills/bluent-v3-switch/SKILL.md', 'docs/v3/design/MIGRATION-IMPACT-LEDGER.md'):
        need((root / relative).is_file(), f"canonical Switch documentation/Skill is missing: {relative}")
    need('bluent-v3-switch/SKILL.md' in router and 'bluent-v3-switch/SKILL.md' in skill_index,
         "Switch task Skill must be discoverable through both the component router and v3 Skill index")
    need('switch.md' in docs_index.lower(), "canonical v3 docs index must link the Switch implementation record")
    need('not a released' in skill.lower() and '#435' in skill and '#418' in skill,
         "Switch handoff Skill must retain task, foundation and unreleased boundaries")


def main() -> int:
    import argparse
    parser = argparse.ArgumentParser(description="Fail-closed Switch #435 source/API, evidence and browser-CI contract.")
    parser.add_argument("--root", type=Path, default=ROOT)
    args = parser.parse_args()
    check_switch_contract(args.root)
    print("PASS #435 Switch source/API, native semantics, accessible-name, CSS, docs, evidence and four-cell browser CI contract")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except SwitchContractError as error:
        print(f"FAIL #435 Switch contract: {error}", file=sys.stderr)
        raise SystemExit(1)