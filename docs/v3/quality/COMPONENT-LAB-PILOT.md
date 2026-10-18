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

## 2026-10-16: Canonical 66-family queue in actual Component Lab (DRAFT)

The correct editable Penpot Bluent v3 Design System page42
(e775e67c-d9da-804b-8008-cc7c2dd7ecf7) has source-owned
desktop and mobile queue cards, on native boards
e775e67c-d9da-804b-8008-cc7c2dec1d15 and
e775e67c-d9da-804b-8008-cc7c2e40c7d2.
Native Penpot bounds/fit checks PASSED 2/2, revision426.
The design is draft, NOT formally accepted visual parity.

The actual Blazor Component Lab now displays/filter-searches exactly
66 source-candidate families, issues #428-#493. Four families
(Button, Icon, Label, Link) have one runnable pilot sample each.
All 62 others are explicitly Queued; queued entries have an issue
link but NO fabricated runnable preview. This source queue is NOT
a complete migrated component family census or full public API demo.

Source: docs/v3/quality/COMPONENT-LAB-FAMILY-QUEUE.json,
generated from canonical issue #494 source candidates.
Run python scripts/quality/generate_v3_component_lab_ui_queue.py
to regenerate ComponentLabFamilyQueue.g.cs from the JSON.
Use --check and scripts/quality/check_v3_component_lab.py to reject
stale generated UI rows and false acceptance, not hand-maintained
parallel catalogs.

ACTUAL Dev01: Chrome/WebAssembly **17/17**, Edge/WebAssembly
**17/17** browser checks passed, owned browser cleanup remaining=0.
The four additional checks covered 66 rendered rows (4 live,
62 queued), #432 filtered queued TextField without fake preview,
#428 filtered Button pilot launch, and 320px width with 66 rows
and no document overflow. Prior 13 interactive specimens/RTL/
controls checks also passed again. Other Blazor render modes,
native Windows Narrator/NVDA/Contrast Themes, 100% API states
and maintainer design acceptance remain OUTSTANDING.

Build after generator fix: Demo.Pages Debug 0 errors/warnings;
full Release solution 0 errors with two existing NU1903 warnings
for Microsoft.AspNetCore.Components.WebAssembly.Server 10.0.7.
Do not suppress or call those advisories clean.

## 2026-10-16: Button actual public enum explorer (DRAFT)

The original source-owned Penpot page42 desktop/mobile boards contain
editable Button existing-API variant explorer notes. The live Blazor
sample now binds Appearance, Size and Shape of the existing Button and
updates the copied Razor example from exactly the same selected values.

Real Dev01 Chrome/WebAssembly 20/20 and Edge/WebAssembly 20/20 passed,
including initial Outline/Medium/Rounded, changing the Button to
Danger/Large/Square, confirming real CSS classes and updated Razor,
all four pilot specimens, the 66-family queue and mobile reflow.
Owned browser cleanup returned remaining=0 in both runs.
Only four of 66 families have representative pilots; no family
claims complete public API or approved Fluent 2 design parity.

Production-published SSR mode independently returned HTTP 200 for the
Component Lab page but failed interactive hydration: data-lab-interactive
remained false, window.Blazor was undefined, and app.css was HTTP 404.
SSR is not accepted. This is a separate host/bootstrap issue and not
proof that the actual shared Button code failed.

The existing SSR dependency Microsoft.AspNetCore.Components.WebAssembly.Server
10.0.7 has two high-severity NU1903 advisories:
GHSA-g27p-qf6j-c96c and GHSA-qjpx-jqm5-h2c4.
Release build succeeded with 2 warnings; -warnaserror fails and the
advisories are NOT suppressed or counted as zero warnings.

## 2026-10-18 — actual existing Split Button demo and keyboard/event routing (#421)

The source-backed public Button API already supports a Split Button:
a Button with both OnClick and Dropdown creates two native buttons.
The v3 Component Lab now exercises this existing feature inside the
already-designed advanced Button pilot area. New specimen "Send now"
uses the real primary handler and a separate "Schedule send" dropdown
MenuItem, visible independent callback counters, and synchronized
copyable Razor with actual backing handler methods. This is a #421
live laboratory improvement, NOT #428 product API or final Fluent 2 UI.

Five fail-closed real Chromium checks per render mode require the
two-button split markup and indicator, native Enter on primary with
only primary callback firing, native Enter on secondary opening menu
without primary activation, actual hit-tested pointer click on
secondary MenuItem with exactly one secondary callback, and complete
copyable source. The preexisting Button count fixture was updated
from 9 to the real 11 native buttons. Source contract checks preserve
the specimen and the five runtime gates.

Verified on Dev01, latest unpublished #421 task source:
Chrome/WebAssembly 83/83 (port 55735), Chrome/production-published
InteractiveServer 83/83 (port 65189), Edge/WebAssembly 83/83
(port 64421), Edge/production-published InteractiveServer 83/83
(port 56738): **332/332 actual browser assertions**, errors=[],
scoped Chromium owned-process cleanup remaining=0 on each of four
independent invocations. Current Demo.Pages Debug compiled with
zero warnings/errors; source/queue contract PASS.

The covered public Button parameter-name set remains 20/20 plus the
HTML disabled attribute; the split case adds a REAL behavior scenario
rather than a twenty-first parameter. All 5 pilot family entries
remain representative_only, the 66-family queue remains zero fully
accepted, and #421 remains In progress. In particular, the icon-only
secondary split trigger's accessible name, native screen reader and OS
Contrast Theme interactions, focus cycling, Escape semantics, exact
Fluent 2 visual parity, disabled/split forms, exhaustive state matrix
and human approved Penpot page42 design are NOT accepted. Those belong
to #428 after its foundation Ready gate. Nothing merged to
bluent-v3/Dev and nothing published to NuGet.
## 2026-10-18 — actual Split Button visual review specimen

Two actual Chromium screenshots of the interactive and hydrated
Component Lab on local Dev01 Chrome/WebAssembly are retained as
UNAPPROVED review evidence:
[closed Split action](evidence/component-lab-split-closed-chrome-wasm.png)
and [open menu after native Enter](evidence/component-lab-split-open-chrome-wasm.png).

The images were clipped from the live lab-split-action DOM, not
rendered mockups. The open image shows keyboard focus on the small
Split indicator and its real "Schedule send" MenuItem. These images
DO NOT certify native OS screen reader use, accepted Penpot/Fluent 2
visual parity, or a final v3 Button implementation. The current
secondary icon-only trigger has no explicit accessible name in the
source-generated markup: a #428 design/semantic review item.
Four separately tested Chrome/Edge x WASM/Server 83/83 runtime passes
remain independent interaction evidence, not visual certification.