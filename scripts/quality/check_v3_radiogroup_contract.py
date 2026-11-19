"""Fail-closed source/API, demo, docs and real-browser contract for RadioGroup #436."""
from __future__ import annotations
import json
from pathlib import Path
import sys
ROOT = Path(__file__).resolve().parents[2]
class RadioGroupContractError(ValueError):
    pass
def need(value: bool, message: str) -> None:
    if not value:
        raise RadioGroupContractError(message)
def check_radiogroup_contract(root: Path = ROOT) -> None:
    def read(relative: str) -> str:
        full = root / relative
        need(full.is_file(), f"required file missing: {relative}")
        return full.read_text(encoding="utf-8-sig")
    group = read("src/Bluent.UI/Components/RadioGroupComponent/RadioGroup.razor")
    group_cs = read("src/Bluent.UI/Components/RadioGroupComponent/RadioGroup.razor.cs")
    group_source = group + "`n" + group_cs
    radio = read("src/Bluent.UI/Components/RadioGroupComponent/Radio.razor")
    radio_cs = read("src/Bluent.UI/Components/RadioGroupComponent/Radio.razor.cs")
    group_css = read("src/Bluent.UI/Styles/Components/_radio-group.scss")
    css = read("src/Bluent.UI/Styles/Components/_radio.scss")
    scss = read("src/Bluent.UI/Styles/Components/components.scss")
    compiled = read("src/Bluent.UI/Styles/Components/components.css")
    shipped = read("src/Bluent.UI/wwwroot/bluent.ui.components.min.css")
    demo = read("src/Bluent.UI.Demo.Pages/Pages/Components/Radios.razor")
    demo_css = read("src/Bluent.UI.Demo.Pages/Pages/Components/Radios.razor.css")
    server = read("src/Bluent.UI.Demo.SSR/Components/Pages/RadioInteractiveServerProbe.razor")
    tests = read("tests/RegexSampleGeneratorTest/RadioGroupRenderSemanticsTests.cs")
    probe = read("scripts/quality/probe_v3_radiogroup.mjs")
    runner = read("scripts/quality/run_v3_radiogroup.ps1")
    reference = read("docs/v3/components/radio-group.md")
    design = read("docs/v3/design/RADIOGROUP-DESIGN-AND-API-CONTRACT.md")
    migration = read("docs/v3/design/MIGRATION-IMPACT-LEDGER.md")
    skill = read(".agents/skills/bluent-v3-radiogroup/SKILL.md")
    router = read(".agents/skills/bluent-v3/COMPONENT-ROUTER.md")
    skill_index = read("docs/v3/skills/README.md")
    docs_index = read("docs/v3/README.md")
    changelog = read("CHANGELOG.md")
    project = read(".bluent/PROJECT.md")
    workflow = read(".github/workflows/v3-compatibility-browsers.yml")
    for token in ("<fieldset", "</fieldset>", '<legend class="group-label">', 'CascadingValue Value="this" IsFixed'):
        need(token in group, f"native group semantics missing: {token}")
    need('role="radiogroup"' not in group, "no redundant radiogroup role")
    need("public void Dispose()" not in group_source, "RadioGroup must preserve InputBase public API and override its protected Dispose(bool) hook")
    for token in ("BluentInputComponentBase<TValue?>", "NameAttributeValue", "RadioGroupName",
                  "nameof(ValueExpression)", "return Id", "CurrentValue",
                  "OnValidationStateChanged += HandleValidationStateChanged",
                  "OnValidationStateChanged -= HandleValidationStateChanged",
                  "SynchronizeEditContextSubscription", "protected override void Dispose(bool disposing)", "base.Dispose(disposing)",
                  "GetValidationMessages(FieldIdentifier)"):
        need(token in group_source, f"typed/name/validation lifecycle missing: {token}")
    for token in ('type="radio"', ' name="@RadioGroup.RadioGroupName"', ' value="@GetInputValue()"',
                  ' value="@GetInputValue()"', 'checked="@IsChecked"', 'id="@Id"',
                  '@onchange="HandleOnChange"'):
        need(token in radio, f"native radio markup missing: {token}")
    need('<label class="indicator" for="@Id" aria-hidden="true"></label>' in radio,
         "radio indicator must be a native associated label so its visual hit target activates the input")
    need('<label class="option-label" for="@Id">@Label</label>' in radio,
         "radio option text must remain the accessible native label")
    for token in ("EditorRequired", "CultureInfo.InvariantCulture",
                  "OnValueChanged += OnValueChanged", "OnValueChanged -= OnValueChanged",
                  'attributes["aria-invalid"] = "true"'):
        need(token in radio_cs, f"radio option behaviour missing: {token}")
    for token in ("PublicParameterSurfaceRemainsUnchanged",
                  "EditContextValidationStateChangesRerenderEveryOptionAsInvalid"):
        need(token in tests, f"renderer/API regression missing: {token}")
    for token in ("min-block-size: 24px", "inline-size: 24px", "block-size: 24px",
                  ":focus-visible", "outline-offset: 2px", "@media (forced-colors: active)",
                  "ButtonText", "Canvas", "Highlight"):
        need(token in css, f"radio CSS contract missing: {token}")
    need("--bui-v3-" not in css + group_css, "unapproved #418 token alias used")
    need("_radio.scss" in scss and "_radio-group.scss" in scss, "radio Sass imports missing")
    need("bui-radio-group" in compiled and "bui-radio-group" in shipped, "compiled/shipped CSS missing")
    for token in ('@page "/components/radios"', "radio-delivery-window", "radio-contact-window",
                  "radio-delivery-speed", "radio-alert-frequency", 'aria-label="Quiet hours preference"',
                  'dir="rtl"', 'lang="fa"', "<EditForm", "<DataAnnotationsValidator />",
                  "ValidationMessage", "radio-form-submit", 'id="radio-form-selection"',
                  "[Required(", "Orientation.Vertical"):
        need(token in demo, f"showcase scenario missing: {token}")
    for token in ("white-space: pre-wrap", "overflow-wrap: anywhere"):
        need(token in demo_css, f"320px showcase wrapping missing: {token}")
    for token in ('@page "/compatibility/radios-server"', "@rendermode InteractiveServer",
                  "<Containers />", "<Radios />", "radio-interactive-ready"):
        need(token in server, f"InteractiveServer fixture missing: {token}")
    need(probe.count("check(") == 26, "browser probe must retain 26 assertions")
    need("document.querySelector('#radio-form-selection')" in probe and "aria-invalid" in probe, "valid form probe must wait for parent binding and cleared validation before submit")
    need("document.querySelector(\'#radio-delivery-status\')" in probe and "document.querySelector(\'#radio-contact-status\')" in probe, "keyboard group-isolation probe must wait for both Blazor-bound model status values")
    for token in ("Accessibility.getPartialAXTree", "Input.dispatchKeyEvent",
                  "Input.dispatchMouseEvent", "new FormData(element)", "forced-colors",
                  "320px viewport", "runtimeSignals"):
        need(token.lower() in probe.lower(), f"browser probe assertion missing: {token}")
    for token in ("BLUENT_RADIO_EVIDENCE_DIR", "WebAssembly", "Server", "Chrome",
                  "Edge", "probe_v3_radiogroup.mjs", "bounded retries"):
        need(token.lower() in runner.lower(), f"runner matrix/evidence/cleanup missing: {token}")
    for token in ("104/104", "DRAFT", "#418", "#421", "2.x", "Narrator", "Contrast Themes"):
        need(token.lower() in reference.lower(), f"reference acceptance boundary missing: {token}")
    for token in ("0125a79e-69b2-807f-8008-f726bd61b423",
                  "0125a79e-69b2-807f-8008-f726c1464f5d",
                  "0125a79e-69b2-807f-8008-f726c665a5cf", "DRAFT",
                  "104/104", "#418", "#421"):
        need(token.lower() in design.lower(), f"design traceability missing: {token}")
    need("M24" in migration and "RadioGroup native group semantics" in migration, "migration M24 missing")
    need("RadioGroup v3 implementation record" in docs_index, "v3 docs index missing RadioGroup")
    need("RadioGroup implementation handoff" in skill_index, "v3 Skill index missing RadioGroup")
    need("RadioGroup example:" in router and "bluent-v3-radiogroup/SKILL.md" in router, "component router missing RadioGroup Skill")
    need("#436" in skill and "#418" in skill and "#421" in skill and "not a released" in skill.lower(),
         "task Skill must preserve issue and dependency boundaries")
    need("#436" in changelog and "104/104" in changelog and "DRAFT" in changelog, "unreleased changelog entry missing")
    need("RadioGroup #436" in project, "PROJECT.md checkpoint missing")
    coverage = json.loads(read("docs/v3/quality/COMPONENT-LAB-COVERAGE.json"))
    rows = [row for row in coverage["families"] if row.get("id") == "radio"]
    need(len(rows) == 1 and rows[0].get("classification") == "representative_only",
         "existing v2 Component Lab RadioGroup pilot must remain representative_only")
    v3 = rows[0].get("v3Implementation", {})
    need(v3.get("issue") == 436 and v3.get("status") == "in_progress"
         and v3.get("localBrowserMatrix", {}).get("total") == "104/104",
         "separate #436 v3 coverage record missing")
    need(v3.get("designSource", {}).get("reviewStatus") == "draft_pending_maintainer_visual_review",
         "Penpot DRAFT state must remain explicit")
    evidence = root / "docs/v3/quality/evidence"
    for browser, mode, render_mode in (("Chrome","WebAssembly","WebAssembly"),
                                       ("Edge","WebAssembly","WebAssembly"),
                                       ("Chrome","Server","InteractiveServer"),
                                       ("Edge","Server","InteractiveServer")):
        name = f"{browser}-{mode}.json"
        path = evidence / name
        need(path.is_file(), f"browser report missing: {name}")
        report = json.loads(path.read_text(encoding="utf-8-sig"))
        checks = report.get("checks")
        need(report.get("browser") == browser and report.get("renderMode") == render_mode,
             f"browser report identity mismatch: {name}")
        need(report.get("passed") == 26 and report.get("failed") == 0
             and isinstance(checks, list) and len(checks) == 26
             and all(item.get("pass") is True for item in checks),
             f"browser report is not 26/26: {name}")
        need(not report.get("runtimeSignals"), f"browser runtime signals found: {name}")
        for capture in ("initial-1280px", "320px", "1280px"):
            image = evidence / f"{browser}-{mode}-{capture}.png"
            need(image.is_file() and image.stat().st_size > 1000, f"screenshot missing: {image.name}")
    need("  radio-group-contract:" in workflow and "  radio-group-runtime:" in workflow,
         "permanent source-contract/browser-runtime CI jobs missing")
    contract_job = workflow.split("  radio-group-contract:",1)[1].split("  radio-group-runtime:",1)[0]
    for token in ("check_v3_radiogroup_contract.py","test_v3_radiogroup_contract.py"):
        need(token in contract_job, f"contract CI missing: {token}")
    runtime_job = workflow.split("  radio-group-runtime:",1)[1]
    for token in ("browser: [Chrome, Edge]", "render_mode: [WebAssembly, Server]",
                  "windows-latest", "run_v3_radiogroup.ps1", "BLUENT_RADIO_EVIDENCE_DIR",
                  "if: always()", "actions/upload-artifact@v4", "retention-days: 7"):
        need(token in runtime_job, f"browser matrix CI missing: {token}")
def main() -> int:
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=ROOT)
    args = parser.parse_args()
    check_radiogroup_contract(args.root)
    print("PASS #436 RadioGroup source/API, CSS, docs, evidence and four-cell browser CI contract")
    return 0
if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RadioGroupContractError as error:
        print(f"FAIL #436 RadioGroup contract: {error}", file=sys.stderr)
        raise SystemExit(1)