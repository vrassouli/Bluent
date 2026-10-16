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
All four pilot family specimens were exercised in **Chrome and Edge
on WebAssembly**, each with **13/13 actual browser assertions on Dev01**. Button/Icon use live Blazor
search and click; Label rendered a native label and Link a native
a.bui-link with verified href. Label-to-input association and Link
disabled/navigation/security cases are not accepted yet.

## Exact QA and limitations

On Dev01, actual Chrome/Blazor WebAssembly **13/13** and actual
Edge/Blazor WebAssembly **13/13** runtime assertions passed:
app hydrated; 4 families and 4 controls; real Bluent Buttons;
actual OnClick count; live search; live Icon selection, live Label/Link
selection and native HTML tags; RTL/mobile/
compact/dark-canvas settings; 320px width with scrollWidth 320;
Razor code source shown. Owned browser process cleanup reported
remaining=0 in BOTH browser runs, including the Edge-specific
msedge.exe cleanup after a real orphan-process defect was fixed.
Run via
pwsh -NoProfile -File scripts/quality/run_v3_component_lab.ps1.
The runner starts and stops its own WASM host.

Python source contract verifies 4/4 routes, metadata and anti-overclaim:
python scripts/quality/check_v3_component_lab.py.

Release solution build had zero errors but two existing NU1903
high-severity dependency warnings for Microsoft.AspNetCore.Components.
WebAssembly.Server version 10.0.7: GHSA-g27p-qf6j-c96c and
GHSA-qjpx-jqm5-h2c4. Do not call this a zero-warning build. The
security dependency update belongs in a separately scoped issue.

## Canonical family work queue (NOT complete demo coverage)

A generated 66-family work queue now exists at
docs/v3/quality/COMPONENT-LAB-FAMILY-QUEUE.json. Each family is
mapped to its component issue #428 through #493, candidate source
paths from the real #494 public source census, and grounded existing
documentation/example paths when found. Four pilot families have
source-runnable specimens, and all four pilot specimen families were actually observed in
Chrome/Edge WebAssembly. None has complete API, AT, theme or browser
matrix acceptance. Every family remains **unaccepted** for complete
public API, design parity, browser matrix and comprehensive demos.

Regenerate and validate following a canonical source census update:

    python scripts/quality/generate_v3_component_lab_queue.py --write
    python scripts/quality/check_v3_component_lab.py

The source guard compares the generated queue to the current #494
source inventory, ensures all paths exist, preserves 66 issue mapping
and rejects false claims that any full family has been accepted.
It is a complete TRACKING QUEUE, not a complete 66-family lab.

Still missing: complete interactive demos for 66 families, per-public-property/event
example traceability, actual app Light/Dark/brands, named OS AT,
native Windows contrast, Server/Blazor interactivity matrix, approved
Penpot design-to-code parity, visual snapshots and maintained Skills.
This pilot does NOT authorize changing #428 Button to In progress until
its own prerequisite approval gates and Ready transition are met.
