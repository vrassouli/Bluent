#!/usr/bin/env python3
"""Issue #433: NumericField source/API and real-browser CI contract."""
from __future__ import annotations
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]

class NumericFieldContractError(ValueError):
    pass

def need(condition: bool, message: str) -> None:
    if not condition:
        raise NumericFieldContractError(message)

def check_numericfield_contract(root: Path = ROOT) -> None:
    def read(relative: str) -> str:
        path = root / relative
        need(path.is_file(), f"required NumericField contract file is missing: {relative}")
        return path.read_text(encoding="utf-8-sig")

    code = read("src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor.cs")
    bridge = read("src/Bluent.UI/Components/NumericFieldComponent/Internal/NumericFieldKeyboardCallback.cs")
    razor = read("src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor")
    pipeline = read("src/Bluent.UI/Components/NumericFieldComponent/NumericFieldValuePipeline.cs")
    interop = read("src/Bluent.UI/wwwroot/bluent.ui.numeric-field.js")
    runner = read("scripts/quality/run_v3_numericfield.ps1")
    probe = read("scripts/quality/probe_v3_numericfield.mjs")
    workflow = read(".github/workflows/v3-compatibility-browsers.yml")
    demo = read("src/Bluent.UI.Demo.Pages/Pages/Components/NumericFields.razor")
    server_program = read("src/Bluent.UI.Demo.SSR/Program.cs")
    reference = read("docs/v3/components/numeric-field.md")

    for token in ("public TValue? Min", "public TValue? Max", "public TValue? Step", "_stepWasProvided", "_effectiveStep = _stepWasProvided"):
        need(token in code, f"NumericField source/API contract is missing: {token}")
    need("NumericFieldValuePipeline.IsPositiveFinite(_effectiveStep)" in code,
         "Step must reject zero, negative and non-finite values")
    need("private Task HandleNumericFieldKeyAsync" in code and "[JSInvokable]" not in code,
         "JS callback handler must not be public on NumericField")
    need("internal sealed class NumericFieldKeyboardCallback" in bridge and "[JSInvokable]" in bridge
         and "public Task HandleNumericFieldKeyAsync" in bridge,
         "JS interop must use the internal callback bridge")
    need("DotNetObjectReference<NumericFieldKeyboardCallback>" in code,
         "NumericField must bind JS interop to the internal callback bridge")
    need("async ValueTask IAsyncDisposable.DisposeAsync()" in code
         and "public async ValueTask DisposeAsync()" not in code,
         "DisposeAsync must remain an explicit interface implementation")
    for token in ('role="spinbutton"', 'aria-valuenow', 'aria-valuemin', 'aria-valuemax'):
        need(token in razor, f"spinbutton semantics are missing: {token}")
    for token in ('dir="ltr"', 'disabled="@IsDisabled"', 'readonly="@IsReadOnly"'):
        need(token in razor, f"native input semantics are missing: {token}")
    for token in ('data-bui-numeric-has-min="@(HasExplicitMin ? "true" : "false")"',
                  'data-bui-numeric-has-max="@(HasExplicitMax ? "true" : "false")"'):
        need(token in razor, f"JS bounds flag must serialize explicitly: {token}")
    need('@onfocusin="HandleFocus"' in razor and '@onfocusout="HandleBlur"' in razor,
         "Focus and blur callbacks must use bubbling focusin/focusout events")
    need("await OnFocus.InvokeAsync()" in code and "await OnBlur.InvokeAsync()" in code,
         "Focus and blur callbacks must be invoked by their native component handlers")
    for token in ("TryParse", "Format", "NormalizeForParsing", "CharUnicodeInfo.GetDecimalDigitValue", "\\u066B", "\\u066C", "NonFinite", "Overflow"):
        need(token.lower() in pipeline.lower(), f"culture/value pipeline coverage is missing: {token}")
    for token in ("addEventListener", "removeEventListener", "keydown", "ArrowUp", "ArrowDown", "Home", "End"):
        need(token in interop, f"numeric-field interop lifetime/keyboard support is missing: {token}")
    for token in ('[ValidateSet("WebAssembly", "Server")]', '[ValidateSet("Chrome", "Edge")]', "dotnet publish"):
        need(token in runner, f"browser runner does not support the required mode: {token}")
    need("  numericfield-runtime:" in workflow, "permanent NumericField browser job is missing")
    numeric_job = workflow.split("  numericfield-runtime:", 1)[1]
    for token in ("browser: [Chrome, Edge]", "render_mode: [WebAssembly, Server]",
                  "windows-latest", "run_v3_numericfield.ps1", "BLUENT_NUMERIC_EVIDENCE_PATH",
                  "if: always()", "actions/upload-artifact@v4", "retention-days: 7"):
        need(token in numeric_job, f"permanent NumericField browser CI matrix is missing: {token}")
    for token in ("39 assertions per browser/render-mode cell", "156/156",
                  "culture matrix", "component-level unmount", "native clipboard paste", "mid-string caret",
                  "GainFocus", "OnFocus", "OnBlur", "StartAddon", "EndAddon",
                  "native", "DRAFT", "not yet"):
        need(token.lower() in reference.lower(), f"NumericField evidence boundary is missing or overstated: {token}")
    for locale in ("en-US", "de-DE", "fa-IR", "ar-EG"):
        need(locale in probe, f"live browser culture matrix is missing locale: {locale}")
    for token in ("Emulation.setLocaleOverride", "Network.setUserAgentOverride", "acceptLanguage",
                  "Intl.NumberFormat", "numeric-lifecycle-probe", "numeric-lifecycle-unmount",
                  "component unmount disposes its actual keyboard listener"):
        need(token in probe, f"live browser culture/lifecycle probe is missing: {token}")
    for token in ("data-bui-qa-culture", "data-bui-qa-native-digits", "_showLifecycleProbe",
                  "numeric-lifecycle-probe", "UnmountNumericLifecycleProbe"):
        need(token in demo, f"NumericField demo culture/lifecycle fixture is missing: {token}")
    for token in ("GainFocus=\"true\"", "OnFocus=\"HandleDemoNumericFocus\"",
                  "OnBlur=\"HandleDemoNumericBlur\"", "StartAddon=\"@CurrencyAddon\"",
                  "EndAddon=\"@UnitAddon\"", "ParsingErrorMessage=", "MinimumErrorMessage=",
                  "MaximumErrorMessage=", "OverflowErrorMessage="):
        need(token in demo, f"NumericField demo does not exercise the public parameter: {token}")
    for token in ("StartAddon and EndAddon render in logical slots",
                  "Blazor registers bubbling focusin/focusout handlers on NumericField",
                  "GainFocus focuses the input on its first interactive render",
                  "ParsingErrorMessage", "MinimumErrorMessage", "MaximumErrorMessage",
                  "OverflowErrorMessage", "custom validation override fixture recovers"):
        need(token in probe, f"NumericField browser evidence is missing public-parameter coverage: {token}")
    for token in ("UseRequestLocalization", "en-US", "de-DE", "fa-IR", "ar-EG"):
        need(token in server_program, f"InteractiveServer locale host configuration is missing: {token}")
    need("BLUENT_NUMERIC_EVIDENCE_PATH" in probe and "writeFile" in probe,
         "each browser/render-mode run must preserve machine-readable evidence")

def main() -> int:
    import argparse
    parser = argparse.ArgumentParser(description="Fail-closed NumericField #433 source and browser-CI contract.")
    parser.add_argument("--root", type=Path, default=ROOT)
    args = parser.parse_args()
    check_numericfield_contract(args.root)
    print("PASS #433 NumericField source/API, native semantics, culture pipeline and four-cell browser CI contract")
    return 0

if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except NumericFieldContractError as error:
        print(f"FAIL #433 NumericField contract: {error}", file=sys.stderr)
        raise SystemExit(1)
