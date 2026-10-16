# Component Lab pilot (#421)

Status: In progress, not v3 release acceptance and not 100 percent
component/API coverage. Branch: v3/issue-421-component-lab; target:
bluent-v3. Existing stable Dev/2.x and NuGet are unchanged.

## Editable design source

Penpot Bluent v3 Design System:
file b64f6665-c9ab-80b5-8008-c4ac99d9d000
page 42 Component demo shell #421
id e775e67c-d9da-804b-8008-cc7c2dd7ecf7
desktop board e775e67c-d9da-804b-8008-cc7c2dec1d15
mobile board e775e67c-d9da-804b-8008-cc7c2e40c7d2.
Both are native editable draft designs, not approved visual parity.

## Current implementation

Demo route /component-lab is linked in the existing Side navigation.
The real shared Blazor page includes searchable Button, Icon, Label
and Link existing-component specimens, a selectable family catalog,
readable and copyable Razor example, a source-linked coverage manifest,
direction LTR/RTL, fluid/320px preview, spacing density and backdrop
contrast controls. These controls are live and scoped to this pilot.
Canvas contrast changes only its backdrop, NOT Bluent global theme.

Coverage JSON: docs/v3/quality/COMPONENT-LAB-COVERAGE.json.
All four families are representative_only and list known omissions.
Label/Link were source/Build verified, not exercised in live 9-check
browser interactions.

## Exact QA and limitations

On Dev01, actual Chrome/Blazor WebAssembly ran 9/9 runtime assertions:
app hydrated; 4 families and 4 controls; real Bluent Buttons;
actual OnClick count; live search; live Icon selection; RTL/mobile/
compact/dark-canvas settings; 320px width with scrollWidth 320;
Razor code source shown. Owned browser process cleanup reported
remaining=0. Run via
pwsh -NoProfile -File scripts/quality/run_v3_component_lab.ps1.
The runner starts and stops its own WASM host.

Python source contract verifies 4/4 routes, metadata and anti-overclaim:
python scripts/quality/check_v3_component_lab.py.

Release solution build had zero errors but two existing NU1903
high-severity dependency warnings for Microsoft.AspNetCore.Components.
WebAssembly.Server version 10.0.7: GHSA-g27p-qf6j-c96c and
GHSA-qjpx-jqm5-h2c4. Do not call this a zero-warning build. The
security dependency update belongs in a separately scoped issue.

Still missing: entire 66-family inventory, per-public-property/event
example traceability, actual app Light/Dark/brands, named OS AT,
native Windows contrast, Chrome/Edge x Server/WASM matrix, approved
Penpot design-to-code parity, visual snapshots and maintained Skills.
This pilot does NOT authorize changing #428 Button to In progress until
its own prerequisite approval gates and Ready transition are met.
