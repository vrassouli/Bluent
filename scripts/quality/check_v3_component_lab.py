#!/usr/bin/env python3
"""Source-backed pilot coverage contract. Does not claim complete component validation."""
import json
import re
from pathlib import Path
from generate_v3_component_lab_queue import payload as expected_full_queue
from generate_v3_component_lab_ui_queue import render as generated_ui_queue

ROOT = Path(__file__).resolve().parents[2]
LAB = ROOT / "src/Bluent.UI.Demo.Pages/Pages/Components/ComponentLab.razor"
STYLE = LAB.with_suffix(".razor.css")
MENU = ROOT / "src/Bluent.UI.Demo.Pages/Layout/Side.razor"
LEDGER = ROOT / "docs/v3/quality/COMPONENT-LAB-COVERAGE.json"
QUEUE = ROOT / "docs/v3/quality/COMPONENT-LAB-FAMILY-QUEUE.json"


def check() -> int:
    data = json.loads(LEDGER.read_text(encoding="utf-8"))
    source = LAB.read_text(encoding="utf-8-sig")
    css = STYLE.read_text(encoding="utf-8-sig")
    menu = MENU.read_text(encoding="utf-8-sig")
    assert data["schemaVersion"] == 1 and data["issue"] == 421
    assert data["status"] == "pilot_incomplete", "do not infer full coverage from a partial demo"
    assert data["designSource"]["fileId"] == "b64f6665-c9ab-80b5-8008-c4ac99d9d000"
    assert data["designSource"]["approval"] == "pending"
    assert len(data["families"]) == 5
    assert data["families"][1]["propertiesDemonstrated"] == ["Value", "Variant"]
    assert data["families"][2]["propertiesDemonstrated"] == [
        "Text", "ForExpression", "RequiredSymbol", "Size", "Required", "Info"
    ]
    assert data["families"][3]["propertiesDemonstrated"] == ["Text", "Href", "Appearance", "OnClick"]
    for feature in ('id="lab-link-mode"', 'id="lab-link-appearance"', 'id="lab-link-text"',
                    'OnClick="LinkClickedAsync"', 'SelectedLinkRazor', 'LinkAppearance'):
        assert feature in source, "existing-API Link pilot missing: " + feature
    probe_text = (ROOT / "scripts/quality/probe_v3_component_lab.mjs").read_text(encoding="utf-8-sig")
    for gate in ("Link real appearance and text public parameters update native anchor",
                 "Link without Href emits semantic type=button instead of fake navigation",
                 "native Enter triggers exactly one live Link OnClick Blazor callback",
                 "Link action copyable Razor includes real OnClick and handler body"):
        assert gate in probe_text, "missing real Link browser gate: " + gate
    assert all(f["classification"]=="representative_only" for f in data["families"])

    assert len({entry["id"] for entry in data["families"]}) == 5
    assert '@page "/component-lab"' in source
    assert 'Href="component-lab"' in menu
    assert '@bind:event="oninput"' in source
    for feature in ('id="lab-direction"', 'id="lab-viewport"', 'id="lab-density"',
                    'id="lab-contrast"', 'dir="@_direction"', 'CopySourceAsync',
                    'role="status"', 'aria-pressed=', 'navigator.clipboard.writeText'):
        assert feature in source, f"pilot control missing: {feature}"
    assert 'global theme' in source, "canvas preview MUST not impersonate real app theme"
    assert "max-width:320px" in css and "prefers-reduced-motion:reduce" in css
    for token in ('id="lab-icon-value"', 'id="lab-icon-variant"',
                  'Enum.GetValues<IconVariant>()', 'Variant="@_iconVariant"',
                  'Class="lab-selected-icon"', 'SelectedIconRazor',
                  'id="lab-label-size"', 'id="lab-label-required"',
                  'Enum.GetValues<LabelSize>()', 'Enum.GetValues<LabelRequiredState>()',
                  'ForExpression="() => LabEmail"', 'Size="@_labelSize"',
                  'Required="@_labelRequired"', 'RequiredSymbol="!"',
                  'id="LabEmail"', '[Required] public string LabEmail',
                  '<Info>', 'Use a work email for contact.', 'SelectedLabelRazor'):
        assert token in source, "missing source-backed Icon/Label pilot: "+token
    assert ".lab-api-controls" in css and ".lab-form-example input:focus" in css
    assert ".lab-form-example input:focus-visible { outline:" not in css, "native illustrative input must use underline focus, not unwanted full ring"

    # Research fixture only: public Color variant belongs to Backlog #429.
    color_fixture=(ROOT/"src/Bluent.UI.Demo.Pages/Pages/Components/ComponentLabColorApps.cs")
    fixture=color_fixture.read_text(encoding="utf-8")
    assert "MIT @fluentui/svg-icons 1.1.344" in fixture
    assert "IconDefinition.FromSvg" in fixture
    assert fixture.count("<linearGradient id=") == 4
    assert "ComponentLabColorApps.Preview" in source
    assert "public IconVariant.Color is proposed in #429, not implemented" in source
    assert "@media (forced-colors: active)" in css
    assert ".lab-color-research ::deep .lab-color-preview-icon" in css
    assert ".lab-color-research ::deep .lab-color-preview-monochrome" in css
    assert "Color" not in (ROOT/"src/Bluent.UI/Icons/IconVariant.cs").read_text(encoding="utf-8")
    for gate in ("genuine MIT Fluent Color SVG renders four scoped gradients; demo explicitly labels API unavailable",
                 "default OS mode displays true Color SVG and hides monochrome fallback",
                 "Chromium emulated forced-colors media hides gradients and shows Filled source",
                 "leaving forced-colors restores exact original Color and hides Filled fallback"):
        assert gate in (ROOT/"scripts/quality/probe_v3_component_lab.mjs").read_text(encoding="utf-8")


    for entry in data["families"]:
        assert entry["classification"] == "representative_only"
        modes=entry["renderModesVerified"]
        assert len(modes)==4, "Chrome/Edge x WASM/Server pilot evidence required"
        assert modes[0].startswith("Chrome/WebAssembly Dev01:")
        assert modes[1].startswith("Edge/WebAssembly Dev01:")
        assert modes[2].startswith("Chrome/Server Dev01:")
        assert modes[3].startswith("Edge/Server Dev01:")
        for i,mode in enumerate(modes):
            if entry["id"] == "badge":
                assert "Badge CDP" in mode, "Do not infer Badge OS/AT acceptance from a pilot"
                continue
            assert "shared browser smoke 27/27" in mode
            if entry["id"] in ("button", "icon"):
                assert "interactive controls observed" in mode
            else:
                assert "native rendered markup observed" in mode
        assert entry["source"] == str(LAB.relative_to(ROOT)).replace("\\", "/")
        assert entry["labRoute"] == "/component-lab"
        demo_path = ROOT / "src/Bluent.UI.Demo.Pages/Pages/Components" / (entry["family"] + "s.razor")
        assert demo_path.exists(), f"missing referenced demo: {demo_path}"
        assert f'@page "{entry["existingDemoRoute"]}"' in demo_path.read_text(encoding="utf-8-sig")
        assert f'new("{entry["id"]}", "{entry["family"]}"' in source
        assert entry["scenarioId"] and entry["propertiesDemonstrated"] and entry["remaining"]
    # Real existing-API Button enum selectors and synchronized Razor source.
    for token in ('id="lab-button-appearance"', 'id="lab-button-size"',
                  'id="lab-button-shape"', 'Enum.GetValues<ButtonAppearance>()',
                  'Enum.GetValues<ButtonSize>()', 'Enum.GetValues<ButtonShape>()',
                  'Appearance="@_buttonAppearance"', 'Size="@_buttonSize"',
                  'Shape="@_buttonShape"', 'ActiveRazor',
                  'Toggled="@_buttonToggled"', 'ToggledChanged="ButtonToggledAsync"',
                  'Href="getting-started"', 'class="lab-click-status"',
                  'class="lab-toggle-status"', 'private Task ButtonToggledAsync(bool toggled)',
                  'SecondaryText="Recent activity"', 'Compact="true"',
                  'BadgeHorizontalPosition="HorizontalSides.End"',
                  'BadgeVerticalPosition="VerticalSides.Bottom"',
                  'ShowDropdownIndicator="true"', 'DropdownPlacement="Placement.BottomEnd"',
                  'MenuItem Title="Export report"', 'MenuItem Title="Share summary"',
                  'class="lab-menu-status"', 'private Task ChooseExportAsync()',
                  'private Task ChooseShareAsync()'):
        assert token in source, f"Button runtime explorer/source missing: {token}"
    assert all(x in data["families"][0]["propertiesDemonstrated"]
               for x in ("Appearance", "Size", "Shape", "Toggled", "ToggledChanged", "Href",
                         "SecondaryText", "Compact", "Badge", "BadgeHorizontalPosition",
                         "BadgeVerticalPosition", "Dropdown", "ShowDropdownIndicator",
                         "DropdownPlacement"))
    assert set(data["families"][4]["propertiesDemonstrated"]) == {
        "Appearance", "Size", "Shape", "Color", "Icon", "Text", "DropShadow", "AnimateShadow"
    }
    badge_source = (ROOT/"src/Bluent.UI/Components/BadgeComponent/Badge.razor.cs").read_text(encoding="utf-8-sig")
    badge_parameters = set(re.findall(
        r"\[Parameter\]\s+public\s+[^\r\n{]+?\s+(\w+)\s*\{\s*get\s*;",
        badge_source))
    badge_represented = set(data["families"][4]["propertiesDemonstrated"])
    assert len(badge_parameters) == 8 and badge_parameters == badge_represented, (
        "Badge source public parameter drift: "
        +str({"missing": sorted(badge_parameters-badge_represented),
              "stale": sorted(badge_represented-badge_parameters)}))
    assert len(data["families"][0]["propertiesDemonstrated"])==21, "20 of 20 native [Parameter] names plus disabled additional attribute"
    # Fail closed if the REAL exported Button API changes. Do not freeze a
    # misleading "20/20" count based solely on the ledger's own entries.
    actual_button = (ROOT/"src/Bluent.UI/Components/ButtonComponent/Button.razor.cs").read_text(encoding="utf-8-sig")
    actual_parameters = set(re.findall(
        r"\[Parameter\]\s+public\s+[^\r\n{]+?\s+(\w+)\s*\{\s*get\s*;",
        actual_button))
    represented = set(data["families"][0]["propertiesDemonstrated"])-{"disabled"}
    assert len(actual_parameters)==20 and represented==actual_parameters, (
        "Declared public Button parameters drifted from representative Lab scenarios: "
        +str({"missing":sorted(actual_parameters-represented),
              "stale":sorted(represented-actual_parameters)}))

    for proof in ("live Button explorer uses source-backed default enum values",
                  "real Bluent Button responds to dynamic Danger/Large/Square parameters",
                  "generated Razor example matches all three selected Button values",
                  "public Toggled Button starts untoggled with zero EventCallback notifications",
                  "native keyboard Enter sets public Toggled state and invokes ToggledChanged once",
                  "native second Enter reverts Toggled state with exactly second callback",
                  "public Button Href renders native anchor with a real destination",
                  "copyable source reflects existing Button toggle callback and Href contracts",
                  "native Button Compact Compound Badge and end/bottom positions render",
                  "existing Dropdown Button exposes native focusable indicator trigger",
                  "native keyboard Enter opens actual Dropdown MenuList with two choices",
                  "real Export report menu click invokes exactly one Blazor callback",
                  "real Share summary menu click invokes exactly a second callback",
                  "copyable Razor includes badge/menu source and backing event handlers"):
        assert proof in (ROOT/"scripts/quality/probe_v3_component_lab.mjs").read_text(encoding="utf-8")
    # The public Split Button combines an independent OnClick with Dropdown.
    # A demo is useful for #428 work, but is NOT full native AT approval.
    for needle in ('class="lab-advanced-group lab-split-action"', 'Text="Send now"',
                   'OnClick="ChooseSplitPrimaryAsync"',
                   'MenuItem Title="Schedule send" OnClick="ChooseSplitScheduleAsync"',
                   'private Task ChooseSplitPrimaryAsync()',
                   'private Task ChooseSplitScheduleAsync()'):
        assert needle in source, "existing Split Button live sample missing: "+needle
    for label in (
        "actual current public Split Button mounts independent primary and disclosure buttons",
        "native Enter on Split primary invokes only primary callback once",
        "native Enter on Split secondary opens Dropdown without primary callback",
        "real Split menu pointer action invokes only scheduled callback once",
        "copyable existing Split Button Razor includes both real event handlers",
    ):
        assert label in (ROOT/"scripts/quality/probe_v3_component_lab.mjs").read_text(
            encoding="utf-8-sig"
        ), "missing Split Button runtime browser gate: "+label
    # Existing Split Button native-disabled state must be a real Blazor
    # specimen, not an image, and never be reported as v3 AT acceptance.
    for literal in ('class="lab-advanced-group lab-split-disabled"',
                    'Text="Send disabled"',
                    'MenuItem Title="Schedule disabled" OnClick="ChooseSplitScheduleAsync"'):
        assert literal in source, "Missing disabled Split Button specimen: "+literal
    for label in (
        "existing disabled Split Button disables both native primary and disclosure",
        "native Enter cannot focus or activate disabled Split primary",
        "native Enter cannot focus or open disabled Split disclosure",
        "real CDP pointer hits both disabled Split buttons without activating either",
        "copyable disabled Split Razor passes native disabled attribute to both actions",
    ):
        assert label in (ROOT/"scripts/quality/probe_v3_component_lab.mjs").read_text(
            encoding="utf-8-sig"
        ), "Missing disabled Split native browser guard: "+label
    # Actual Chrome/Edge launch must fail closed. Cold Windows CI may need
    # >20s to start the CDP debug server when 8 parallel jobs compete.
    browser_probe=(ROOT/"scripts/quality/probe_v3_component_lab.mjs").read_text(encoding="utf-8")
    assert "'DevToolsActivePort'" in browser_probe and "},60000);" in browser_probe
    assert "if(!tab)throw Error('Missing temporary Chrome page')" in browser_probe
    # Real existing Button API final four parameter-name specimens.
    for label in ("TextClass", "Icon", "Rotated", "Orientation"):
        assert label in data["families"][0]["propertiesDemonstrated"], label
    for needle in ('id="lab-button-vertical"', 'id="lab-button-rotated"',
                   'TextClass="lab-custom-button-text"', 'Icon="@FluentIcons.Settings"',
                   'Icon="@FluentIcons.Search"', 'Orientation="Orientation.Vertical"',
                   'Rotated="true"', 'class="lab-orientation-examples"'):
        assert needle in source, "Missing native Button API specimen: "+needle
    for needle in ("real Bluent Button", "native Tab"):
        assert needle in (ROOT/"scripts/quality/probe_v3_component_lab.mjs").read_text(encoding="utf-8")
    for needle in (".lab-orientation-examples", ".lab-custom-button-text"):
        assert needle in css

    generated=(ROOT/"src/Bluent.UI.Demo.Pages/Pages/Components/ComponentLabFamilyQueue.g.cs")
    assert generated.is_file() and generated.read_text(encoding="utf-8-sig")==generated_ui_queue()
    assert "#nullable enable" in generated.read_text(encoding="utf-8")
    for token in ("Component implementation queue", 'id="lab-queue-search"',
                  "ComponentLabFamilyQueue.All.Where", "Live pilot · incomplete",
                  "Queued · no lab scenario", "https://github.com/vrassouli/Bluent/issues/"):
        assert token in source, token
    assert ".lab-queue-row" in css and ".lab-queue-list" in css
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    assert queue == expected_full_queue(), "66-family queue must match canonical #494 census"
    assert queue["familyCount"] == 66 and queue["familiesWithRepresentativeLabScenario"] == 5
    assert queue["familiesWithRealBrowserSpecimen"] == 5
    assert queue["apiCoverageComplete"] is False
    assert [item["issue"] for item in queue["families"]] == list(range(428, 494))
    assert not any(item["completeDemoAcceptance"] or item["componentDesignAccepted"] or
                   item["browserMatrixAccepted"] or item["apiPropertiesEventsMapped"]
                   for item in queue["families"])
    for item in queue["families"]:
        assert all((ROOT / f).is_file() for f in item["candidateSourceFiles"])
        assert all((ROOT / f).is_file() for f in item["existingDocumentationFiles"])
        assert all((ROOT / f).is_file() for f in item["existingConsumerExampleFiles"])
    probe=(ROOT / "scripts/quality/probe_v3_component_lab.mjs").read_text(encoding="utf-8-sig")
    for literal in ("Badge real source component renders default Filled Medium Circular Brand and no icon/shadow",
                    "Badge actual Appearance Size Shape Color Text parameters rebind source CSS and content",
                    "Badge Icon DropShadow AnimateShadow are real live rendered public parameters",
                    "Badge copyable Razor contains all eight actual public parameter names and live enum values",
                    "Badge AnimateShadow without DropShadow does not emit animated shadow class",
                    "for(const family of ['Label','Link'])",
                    "native accessible markup",
                    "markup.tag==='label'",
                    "markup.tag==='a'",
                    "mobile 320px viewport has no unintended horizontal document clipping",
                    "canonical 66 candidate rows are visible; only five have live pilots",
                    "issue 432 search finds queued TextField without fake demo control",
                    "source queue opens actual previously tested Button specimen",
                    "full 66-family queue reflows without document overflow at 320px"):
        assert literal in probe, f"real-browser probe regression: {literal}"
    flow=(ROOT/".github/workflows/v3-component-lab.yml").read_text(encoding="utf-8-sig")
    owner=(ROOT/"scripts/quality/run_v3_component_lab.ps1").read_text(encoding="utf-8-sig")
    assert "browser: [Chrome, Edge]" in flow
    assert "matrix.browser" in flow and "msedge.exe" in flow
    # Per-run prefix prevents concurrent QA owners from cross-killing.
    for marker in ('$qaRunId = [guid]::NewGuid().ToString("N")',
                   '$profilePrefix = "bluent-v3-421-lab-$qaRunId-"',
                   '$env:BLUENT_V3_LAB_PROFILE_PREFIX = $profilePrefix',
                   'TcpListener]::new([Net.IPAddress]::Loopback, 0)',
                   '$_.CommandLine.Contains($profilePrefix)',
                   '-Filter "$profilePrefix*"',
                   '"bluent-v3-421-$qaRunId-stdout.log"'):
        assert marker in owner, f"missing per-run ownership isolation: {marker}"
    assert 'http://127.0.0.1:5280' not in owner
    assert 'http://127.0.0.1:5279' not in owner
    assert 'process.env.BLUENT_V3_LAB_PROFILE_PREFIX' in probe
    assert 'Unsafe QA-owned Chromium profile prefix' in probe
    for cleanup_guard in (
        "for($attempt = 0; $attempt -lt 20; $attempt++)",
        "Start-Sleep -Milliseconds 250",
        "QA owned Chromium cleanup incomplete:",
    ):
        assert cleanup_guard in owner, f"browser teardown must remain bounded and fail closed: {cleanup_guard}"
    assert owner.count("Name='chrome.exe' OR Name='msedge.exe'")==2
    assert "remaining=$($remaining.Count)" in owner
    assert "browserName=/msedge/i.test(chrome)?'Edge':'Chrome';" in probe
    # Actual published Server pilot verified; not full component acceptance.
    server=(ROOT/"src/Bluent.UI.Demo.SSR/Components/Pages/ComponentLabServerProbe.razor").read_text(encoding="utf-8-sig")
    notes=(ROOT/"docs/v3/quality/COMPONENT-LAB-RENDER-MODES.md").read_text(encoding="utf-8-sig")
    assert '@rendermode InteractiveServer' in server and '<ComponentLab />' in server
    assert '<Containers />' in server, "InteractiveServer Lab must host Popover/Tooltip in the same interactive render boundary"
    assert 'data-lab-interactive=' in source and 'OnAfterRenderAsync' in source
    assert 'BLUENT_V3_LAB_MODE' in probe and "renderMode==='Server'" in probe
    assert '[ValidateSet("WebAssembly", "Server")]' in owner
    assert '-Mode Server' in notes and '## Verified pilot: InteractiveServer' in notes
    assert all("Server" in entry["renderModesVerified"][i] for entry in data["families"] for i in (2,3))
    assert "-WorkingDirectory $hostDirectory" in owner
    assert "dotnet build $project --configuration $config --no-restore" in owner,         "WASM runner must rebuild current Razor fixtures, never serve stale Debug binaries"
    assert owner.index("dotnet build $project --configuration") < owner.index("Start-Process dotnet"),         "WASM QA build must precede host process startup"

    assert "framework JavaScript and stylesheet requests have no HTTP failures" in probe
    assert "browser reports no unhandled JavaScript exceptions" in probe
    # After 320px compact/RTL emulation the visual viewport and a nested
    # scrolling ancestor can disagree. Do not bring back window-only
    # scrolling or skip actual native hit-testing when Chrome CI is cold.
    for marker in ("Emulation.clearDeviceMetricsOverride",
                   "innerWidth>=700",
                   "e.scrollHeight>e.clientHeight+2",
                   "e.scrollTop+=y-h/2",
                   "document.elementFromPoint(x,y)",
                   "Copy source target cannot be safely clicked"):
        assert marker in probe, f"missing strict nested scroller/copy-source gate: {marker}"
    for behavior in ("real pointer activation completes Razor Copy source interop",
                     "enabled Bluent Button receives native keyboard focus",
                     "real Enter key activates native Bluent Button exactly once",
                     "disabled Bluent Button cannot receive native focus"):
        assert behavior in probe, f"missing real-browser interaction gate: {behavior}"
    for required_gate in (
        "native Icon Regular default renders a real library source element",
        "public Icon Value dynamically swaps actual CSS or SVG source",
        "public Icon Variant Filled changes actual source class or vector path",
        "Icon copyable Razor tracks current source-owned Value and Variant",
        "official Color SVG and Filled fallback are decorative aria-hidden and never native tab stops",
        "actual Chromium accessibility tree ignores the visible decorative Color SVG",
        "native keyboard Tab bypasses both decorative Icon variants",
        "visible Filled high-contrast fallback remains decorative with readable adjacent label",
        "Label ForExpression binds native input and detects DataAnnotations Required",
        "native pointer activation of Label focuses its exact form input",
        "Label public Size and NotRequired update actual CSS + no symbol",
        "explicit Label Required restores configured symbol",
        "Label copyable Razor includes actual ForExpression Size Required and model annotation",
        "Label public Info renders a focusable native Popover trigger",
        "native keyboard Enter opens actual Label Info Popover content",
        "Label copyable Razor includes nested Info content",
    ):
        assert required_gate in probe, "missing real browser Icon/Label contract: "+required_gate
    # The prototype Color SVG and monochrome HCM alternate are both purely
    # decorative; the real Icon title is adjacent text, not duplicate icon names.
    assert 'Class="lab-color-preview-icon" aria-hidden="true"' in source
    assert 'Class="lab-color-preview-monochrome" aria-hidden="true"' in source
    assert "browser-lab-pilot:" in flow and "mode: [WebAssembly, Server]" in flow
    print("Component Lab family QUEUE PASS: 66/66 source-mapped, 5 browser pilots, ZERO complete components")
    print("Component Lab PILOT contract PASS: 5/5 source-linked families; NOT exhaustive acceptance")
    return 0


if __name__ == "__main__":
    raise SystemExit(check())
