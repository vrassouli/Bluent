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
## 2026-10-18 — actual Chrome/WebAssembly CI Copy source regression

Exact #421 commit 23c33af4 browser run 39111545774 was **RED** in
Chrome/WebAssembly (other three browser-mode jobs PASS) because after
testing the RTL, 320px viewport and compact-density modes, the final
Copy source pointer target was above the visual viewport (center
y=-108.17px, window.scrollY=0). The browser's native hit test correctly
refused to click an offscreen button; 82 prior checks had passed. This
was a test viewport/scroll ownership problem, NOT evidence that the
Split Button callback behavior was broken or that its existing
accessibility gap was fixed.

The #421 QA probe now waits for the desktop viewport layout to settle
after clearing CDP device metrics, then locates actual scrollable
ancestor(s) and positions the Copy button in the usable viewport. A
real document.elementFromPoint hit test is STILL required. The source
contract prevents accidentally reverting to scrolling window alone;
the browser test still fails if the target cannot be safely hit or
if native pointer Copy source interop does not succeed.

Independent Dev01 actual **Chrome/WebAssembly** run of this modified
source completed 83/83, errors=[], owned Chrome cleanup remaining=0
at localhost port 52539. A new exact GitHub Actions run must validate
the remediation in the same formerly failing CI job. Do not count
the previous red run as green or mark #421 complete.
### 2026-10-18 — real 375px RTL mobile Split Button image

The [mobile 375px RTL Split Button and opened secondary menu](evidence/component-lab-split-open-rtl-mobile-chrome-wasm.png)
is an actual Chrome/WebAssembly CDP screenshot of the hydrated live
component, not a Penpot mockup. The current lab's RTL direction
and Narrow viewport controls were set through real Blazor change
events, then Chromium was resized to 375x850 CSS pixels and native
Enter opened the secondary menu. In this existing-API implementation
the primary Send now button appears to the right of the caret button,
and the opened Schedule send menu overlays part of the live status
text beneath the split control; this is a concrete spacing/placement
review reference for eventual #428, not yet an approved bug fix.

The image does not establish Penpot parity or native Windows Screen
Reader compliance. It does not alter any public Button code, public
ARIA or product CSS. The #421 browser suite independently enforces
RTL/narrow behavior and actual Split action callbacks.
## 2026-10-18 — per-invocation Component Lab ownership and default ports

The #421 source-owned PowerShell runner previously defaulted to shared
ports 5279 (WASM) and 5280 (published Server). It also used shared
stdout/stderr log filenames and, more importantly, cleaned ALL Chrome
and Edge processes whose command line contained the generic
bluent-v3-421-lab- profile prefix. Overlapping legitimate QA runs on
the same Dev01 host could therefore terminate **each other's**
browser profiles or attach to the wrong Blazor server.

Every runner invocation now creates a unique nonce and uses it for
its browser profile prefix, stdout/stderr logs and scoped cleanup.
Unless an explicit -BaseUrl is passed, the runner obtains a fresh
ephemeral 127.0.0.1 TCP port from the operating system. The real
Chromium CDP probe validates the supplied profile-prefix format
and creates its actual temporary profile under that precise name.
PowerShell cleanup matches only this one invocation's full nonce
instead of touching another run's Chromium/profile directories.
An explicit -BaseUrl remains supported for controlled QA sessions.

This is a reduction of genuine host/process cross-talk risk, NOT a
promise that port release-to-bind is atomic or that all historical
browser flakiness is cured. Failure assertions and real browser
hit-tested click/keyboard/Copy-source checks remain mandatory.

Locally validated against actual #421 source on Dev01:
- **Chrome/WebAssembly**, default OS port 54421: 83/83 pass,
  errors=[], owned Chromium cleanup remaining=0.
- **Edge/production-published InteractiveServer**, default OS
  port 62920: 83/83 pass, errors=[], cleanup remaining=0.
- Component Lab source/ledger regression checks PASS, including
  guards for unique port/log/profile/cleanup ownership.
- Separate exact-head screenshot-evidence commit bc3bd58c
  GitHub Windows CI four browser modes all SUCCESS
  (run 39113043450), and Documentation Contract SUCCESS.

This does not change production Bluent components or public APIs,
nor does it certify a completed v3 family, native OS AT, or approved
Penpot visual parity. #421 remains In progress/Draft, #428 Backlog.
## 2026-10-18 — native disabled Split Button specimen (not #428 product)

Added a LIVE current Bluent Button sample with OnClick + Dropdown
and an HTML disabled attribute, adjacent to the existing active Split.
Both underlying native primary and secondary buttons are expected to
be inert. Two separate EventCallbacks reuse the enabled specimen's
counter as a negative assertion: pressing native Enter or clicking
either disabled button must not increment either counter or open
"Schedule disabled".

The #421 browser probe has five additional fail-closed checks:
both DOM native buttons disabled, disabled primary cannot receive
focus/activate by CDP Enter, disabled disclosure likewise, BOTH actual
CDP hit-tested pointer clicks remain inert, and copyable Razor retains
the disabled attribute and real handlers. Native pointer checks
are still required even when buttons are disabled.

Actual Dev01 current task-source local results:
- Chrome/WebAssembly, port 64430: **88/88 assertions passed**,
  failed=0, browser owned-process cleanup remaining=0.
- Edge/production-published InteractiveServer, port 63588:
  **88/88 assertions passed**, failed=0, cleanup remaining=0.
- An earlier Chrome/WASM attempt passed all 88 functional assertions
  but left 1 Chromium child at the initial 350ms teardown check.
  Runner cleanup was corrected to wait up to 5 seconds with
  GUID-scoped termination and FAIL CLOSED if a child survives.
  Repeated actual runs above verified remaining=0.
- The 66-family strict source ledger still has zero fully accepted v3
  components; this is representative current-API coverage only.

[Actual 375px RTL mobile active-versus-disabled Split Button screenshot](evidence/component-lab-split-disabled-rtl-mobile-chrome-wasm.png)
was captured from the fully hydrated actual Blazor Demo on Dev01,
with live RTL and mobile 320px Lab canvas controls, CSS viewport 375px;
it is NOT a design mockup or approved Penpot visual parity. The
disabled light-background contrast, icon-only secondary accessible
name, Escape/focus-cycle details and real Windows OS screen reader
evidence still belong to #428's component acceptance.
## 2026-10-18 — real advanced Button card spacing regression fixed

A user's visual review of the previous live 375px RTL screenshots
identified an actual layout problem: the enabled and disabled Split
specimens had adjoining bordered cards with zero visible spacing.
Source inspection identified the cause: both Split specimen groups
were accidentally placed OUTSIDE the existing lab-advanced-actions
CSS Grid, whose four intended children need uniform 0.75rem gap.

Fix in the #421 Demo Pages Lab ONLY: place the two Split specimens
inside the same grid as Compound/Badge and Dropdown examples.
The resulting desktop arrangement is 2 x 2 with the existing
0.75rem row/column gap. The Lab-controlled 320px Narrow preview
also forces the grid to one column even inside a wide desktop browser,
with four vertically separated cards. A physical 375px RTL viewport
likewise stacks them with the same 0.75rem (12px at the default
16px root font) visible separation. This is a grid relationship fix,
not per-card arbitrary margin overrides or a production Button CSS
change.

TWO actual browser geometry assertions now reject missing cards,
touching desktop rows/columns, narrow 320px RTL card overlaps or
cards escaping their grid. The source checker rejects splitting
these four groups out of the shared grid and losing the narrow
layout override. All FOUR independently run actual Dev01 QA modes
are green on the corrected local task source:
- Chrome/WebAssembly: 90/90, browser cleanup remaining=0.
- Chrome/production-published InteractiveServer: 90/90,
  cleanup remaining=0.
- Edge/WebAssembly: 90/90, cleanup remaining=0.
- Edge/production-published InteractiveServer: 90/90,
  cleanup remaining=0.
Total **360/360 actual browser checks**, not a synthetic screenshot
assertion. The real Blazor Demo.Pages Debug -warnaserror build had
zero warnings and errors.

[VIEW REAL Chrome RTL/mobile after-spacing screenshot](evidence/component-lab-split-disabled-rtl-mobile-spaced-chrome-wasm.png).
It shows the enabled and disabled Split Button samples separated
by the now-uniform Lab grid gap. Retain the earlier [zero-gap
historical screenshot](evidence/component-lab-split-disabled-rtl-mobile-chrome-wasm.png)
as a visual before/reference, not as current appearance.

The screenshots are local real Blazor browser captures, NOT approved
Penpot design parity or named native OS screen-reader testing.
The Component Lab remains In progress with zero of 66 fully accepted
final v3 components; #428 product Button remains Backlog.
## 2026-10-18 — correct English caption flow inside RTL Component Lab cards

Follow-up review of the actual 375px RTL split Button screenshot exposed
awkward English punctuation and a displaced sentence-ending period in
the disabled specimen help text. The outer RTL layout and Split primary/
caret order were right, but demo-only English captions inherited RTL
base text direction. This is NOT a problem with Fluent 2 Button APIs.

In the #421 Demo only, the four advanced Button card headings and
three status/help lines now explicitly declare lang=en and dir=ltr.
Scoped CSS gives these labels consistent margin=0, full available
content width, 1.45 line height and wrapping without overflowing the
card. They are right-aligned against the parent RTL card edge while
keeping natural English punctuation, and left-aligned in LTR. Button
direction, keyboard order, grid spacing and CSS production library
components are unchanged.

Two real-browser geometry/typographic checks now reject mixed-direction
regressions in the 320px RTL preview and the restored LTR layout;
they verify caption language/direction, logical alignment, within-card
bounds and no default paragraph margin. Current source independent
Dev01 Chrome/WebAssembly 92/92 and Edge/published InteractiveServer
92/92 passed with browser errors=[] and owned Chromium cleanup=0.

[New REAL 375px RTL English caption screenshot](evidence/component-lab-split-rtl-english-legibility-chrome-wasm.png)
from the hydrated Blazor page can be compared with the
[prior 375px RTL spaced screenshot](evidence/component-lab-split-disabled-rtl-mobile-spaced-chrome-wasm.png).
The new image is a browser reference, not human Penpot signoff or
native Windows screen-reader evidence. The screenshot and CSS belong
only to the source-owned #421 Lab, not the unfinished #428 Button.
## 2026-10-18 — container-width-correct mobile preview for existing Button/Icon API

The responsive previews previously relied on the window-level
max-width 600px media query to stack the current Button
Orientation/Rotated specimen pair, and on max-width 440px for
Icon/Label/Badge API controls. Those queries only see the outer
browser width; a 320px lab-canvas.narrow embedded in a
desktop-width browser could still render two squeezed columns.
This is a Lab-only layout bug, not a new Button/Fluent2 implementation.

The same narrow-canvas override already used by the four advanced
Button cards now covers lab-orientation-examples and
lab-api-controls. In wide layout their normal desktop grids remain.
In the 320px RTL preview, both Orientation/Rotated native Button
cards stack as one column with at least 10 CSS px real row gap, and
Icon's two actual API selects stack full width with at least 10 CSS
px gap. No outside-grid positioning, hidden clipping, per-card margin
hacks or edits to public Bluent components were used.

Two additional STRICT actual CDP geometry checks, inserted in the
existing source-owned Component Lab QA browser run, enforce preview
width at most 320px, one true CSS grid column, at least 10 CSS px
vertical gaps, and no card/control protrusions beyond the owner Grid.
Both were verified in INDEPENDENT Dev01 real-browser runs:
- Chrome/WebAssembly: 94/94 checks, errors=[], Chrome owned-profile
  process cleanup remaining=0.
- Edge/production-published InteractiveServer: 94/94 checks,
  errors=[], Edge owned-profile cleanup remaining=0.

[ACTUAL Chromium screenshot: RTL 320px Orientation/Rotated preview inside
a desktop-wide browser](evidence/component-lab-orientation-narrow-rtl-wide-browser.png)
is a real hydrated Blazor live capture using an 1150px browser CDP
viewport with the Lab canvas deliberately narrowed to 320px and RTL.
It is NOT a design mockup, named OS screen-reader evidence, or accepted
Fluent 2 Penpot parity. It is independent layout QA evidence. The
existing canonical Penpot Lab page42 is still pending human parity
review, #421 stays In progress, and #428 Button remains Backlog.
## 2026-10-18 — Compact density unified across Component Lab specimens

Compact previously narrowed only the lab-examples basic Button gap;
advanced Button, Orientation/Rotated and Icon API selector grids kept
full default gutters and padding. That was visually inconsistent.

The task-only Lab CSS now keeps default density unmodified: advanced,
orientation and API grid gutters remain 12 CSS px at 16px root size.
Compact reduces all three to 8 CSS px; card internal gap to 6 CSS px,
card/API panel padding to 10 CSS px. No production Bluent API/styles
or Button #428 implementation changed.

Three extra fail-closed actual CDP browser checks:
1. RTL 320px Compact advanced Button and Orientation cards keep
   8px real border separation with no overlap / outside overflow.
2. Switching back to Default restores 12px gutters.
3. Icon API preview controls also keep an 8px gutter with reduced
   panel padding, without overlap.

Independent real Dev01 Chrome/WebAssembly 97/97 and
Edge/production-published InteractiveServer 97/97, no failures,
no unhandled JavaScript, Chromium cleanup remaining=0. Demo
Pages Debug -warnaserror, source/queue and docs contracts pass.

ACTUAL screenshots from fully hydrated Chrome/WebAssembly in
RTL narrow-320px Lab canvas, as distinct live density selections:
- [Default density, 12px grid gutters](evidence/component-lab-advanced-button-density-normal-rtl-320.png)
- [Compact density, 8px grid gutters](evidence/component-lab-advanced-button-density-compact-rtl-320.png)

Images are current-api browser evidence, NOT mockups, approved
Penpot/Fluent2 design, named Windows AT or completed v3 components.
#421 remains In progress and 0/66 families accepted; #428 Backlog.
## 2026-10-18 — sixth live family: existing public TextField

A **sixth representative-only existing API** family has a live
sample. The source is the current public TextField.razor + .razor.cs
and original demo /components/fields; the v3 redesign #432 remains
Backlog and this work does NOT change production TextField CSS/API.

The real Component Lab renders three native Bluent states: single-line
Value/ValueChanged with BindValueEvent=oninput; multiline TextField
Rows=3 with ResizeTextarea=false (real textarea and no-resize class);
and a native disabled TextField. Real associated HTML labels focus
the correct enabled input, and the disabled input remains unfocusable.
Copyable Razor contains all three actual specimens and the model.
All three sample cards are visibly separated and responsive in
RTL 320px Preview, using the established Lab Compact gap.

The source-generated work queue remains 66 families, with SIX live
representative pilots, 60 not yet demonstrated and **ZERO fully
accepted final v3 component families**. Current TextField specific
specialized properties GainFocus, DigitOnly, AsciiDigits, conversion
of Arabic to Persian, StartAddon and EndAddon, inherited form
validation, all sizes, themes, native OS screen readers, and full
focus/RTL/forced-colors matrices are NOT claimed complete.

Actual isolated Dev01 Chromium runs: Chrome and Edge x real
WebAssembly and production-published InteractiveServer **103/103
each (412/412 total)**; no QA failures, browser errors=[],
QA-owned Chrome/Edge processes remaining=0. Real native CDP text
entry updates the Blazor model and Value status; textarea/native
disabled render and work-queue launch plus code copy source passed.

The initial browser test had a test harness error: CDP evaluation of
a raw DOM Element returned no by-value result, so a poll timed out
even though the actual TextField had rendered. Fixed by explicitly
converting DOM existence to Boolean, then all four fresh modes
passed. No false product failure or fake green result claimed.

[View the REAL Chrome 375px RTL TextField live input screenshot](evidence/component-lab-textfield-live-rtl-chrome-wasm.png).
The screenshot was captured from hydrated Blazor after native typing
Ada-Live and shows the current input underline, textarea and
disabled state. It is NOT an approved Fluent2/Penpot parity reference
or named native Windows assistive-tech evidence. #421 In progress,
#432 Backlog, no protected v3/Dev merge or NuGet release.
## 2026-10-18 — seventh live family: current public Checkbox

A SEVENTH source-backed, existing-API-only representative pilot
was added to the #421 Component Lab. Component source:
src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor and cs.
The original public demo is /components/checkboxes. This is
NOT the #434 Fluent2 product implementation (#434 still Backlog).

Three actual Bluent Checkbox states render in visibly separated,
RTL/320px responsive, properly padded Lab cards:
1. bool initially unchecked then native keyboard Space checks it,
   updates Blazor bool model and the displayed Checked: True status.
2. bool? initially null with visual Indeterminate and specific
   IndeterminateLabel Not decided. Native Space checks it and
   updates the bound nullable bool model and visible status.
3. Disabled checked state uses the native input disabled property;
   native focus is denied and a REAL hit-tested CDP pointer on the
   indicator cannot change its checked state.

The copyable source includes both bind Value models and disabled.
The generated queue of 66 source candidates now has 7 live pilots,
59 unrepresented and ZERO accepted exhaustive v3 components.
Queue row #434 launches the representative Checkbox pilot without
marking its redesign issue completed.

Independent actual Dev01 browser matrix:
Chrome/WebAssembly, Edge/WebAssembly, Chrome/published
InteractiveServer and Edge/published InteractiveServer each
**113/113** (452/452 across 4 runs), browser errors=[], and
QA-owned Chromium browser cleanup remaining=0. Real native Space
and hit-tested mouse events were used, not fake JS click assertions.

[Actual Chrome 375px RTL Checkbox screenshot with spaced cards](evidence/component-lab-checkbox-live-rtl-chrome-wasm.png)
is from live hydrated Blazor after native Space. It is NOT a mockup.

Known unaccepted #434 work: explicit native mixed ARIA and Windows
screen-reader evidence for the indeterminate source (currently a
CSS indeterminate class and visual SVG, not demonstrated ARIA mixed);
all Circular/Size/LabelPosition/Required variants; forced colors,
native AT, complete keyboard/disabled/RTL and Fluent2 Penpot
visual parity, docs, migration and reviewer signoff.

#421 stays In progress/PR Draft; #434 stays Backlog. No
bluent-v3 or stable Dev merges, and no NuGet package published.
## 2026-10-18 — eighth live family: existing public Switch

Added the EIGHTH current-API representative source-backed family
to #421 Component Lab. Switch inherits existing Checkbox<bool>
and currently renders native checkbox input; this does not
implement or approve #435 future Fluent2 Switch (still Backlog).

Live, responsive RTL 320px examples are displayed in three
spaced, padded cards:
1. Current on/off Switch bound to Blazor bool; native Space
   twice verifies off -> on -> off, model status and its
   state-specific Label / UncheckedLabel remain synchronized.
2. LabelPosition.Before on a second separately bound Switch,
   verifying existing label-before public API/class and label.
3. HTML native disabled checked Switch, which cannot be focused
   via keyboard and remains true after an actual hit-tested
   CDP native pointer click on its visible indicator.

The actual generated Razor snippet includes two bound bool model
properties, state-specific labels, LabelPosition and native
disabled, not a fake screenshot/JSON widget.

The source census remains all 66 families with EIGHT live
representative demos, 58 not represented, and ZERO final accepted
v3 component families. Issue #435 queue entry launches only
the existing API pilot and does not advance its Backlog status.

Independent actual Dev01 Chrome/Edge x WebAssembly and production
published InteractiveServer all **123/123 browser checks each**,
**492/492 total**, browser errors=[] and QA-owned process
cleanup remaining=0. Tests include real native Space on the
input, real pointer hit-test, binding/label synchronization,
and canonical queue launch with no fake completion.

[Real hydrated Chrome 375px RTL Switch screenshot](evidence/component-lab-switch-live-rtl-chrome-wasm.png)
was captured after a native Space toggled the current Switch on;
three separate cards remain spaced in the narrow preview.
Not a design mockup and NOT human Penpot/Fluent2 parity signoff.

Remaining #435 product/acceptance: current public Switch derives
from Checkbox<bool> and renders input type=checkbox, not
a verified role=switch; accessible role, mixed/unavailable
semantics, native Windows assistive-tech wording, forced-colors,
focus, theme, RTL, visual Fluent2 design and migration are
all unaccepted. #421 remains In progress / PR Draft; #435
remains Backlog. Nothing merged into bluent-v3 or Dev, and
NuGet unchanged.
## 2026-10-18 — ninth live family: existing public NumericField

Added NINTH representative-only public Bluent component pilot to
#421 Component Lab. NumericField of TValue inherits the current
BluentFieldComponentBase, unchanged by this Lab-only work. The
future Fluent 2 redesign #433 stays Backlog.

Live native input scenarios, separated in padded RTL 320px cards:
1. int initialized to 5 with BindValueEvent=oninput, Min=1
   Max=99; a real Chromium Input.insertText("7") updates the
   native field AND Blazor model to 57. Native focus and
   blur each invoke their handler exactly once.
2. Decimal initialized to 12.5 rendered with Format=G29.
3. Native disabled int initialized to 3, rejects focus and
   preserves its input value.

Copyable Razor includes actual Value bindings, Min, Max, Format,
oninput and Focus/Blur handlers with backing code. Real browser
geometry validates that all cards stack in ONE column within
RTL 320px Lab canvas, separated by >=8px, no horizontal overflow.
Default wide desktop grid remains unchanged.

Crucial scope: Min/Max are DECLARED and the 57 in-range result
was tested. The out-of-range, parse errors, overflow, Step,
cultural formatting and thorough validation/AT are UNTESTED.
This is NOT an accepted Fluent2 NumericField implementation.

Canonical queue remains 66 source families, now 9 with
representative live demos, 57 without, and ZERO final accepted
v3 families. Issue #433 row launches this incomplete current
API pilot; it does not change its Backlog status.

Independent Dev01 actual Chrome/Edge x WebAssembly and published
InteractiveServer each passed 133/133 strict real CDP checks:
532/532 combined. Native keyboard/input and native focus/blur,
RTL layout and source queue navigation verified; browser
errors=[] and QA-owned Chromium cleanup remaining=0.

[Real hydrated RTL Chrome NumericField input screenshot](evidence/component-lab-numeric-live-rtl-chrome-wasm.png)
shows typed integer 57, decimal 12.5 and disabled value 3 in
three separated cards. This is a browser screenshot, not a
Penpot design mockup or an accepted Windows OS AT test.

#421 remains In progress / Draft; #433 Backlog.
Nothing merged to protected bluent-v3 or stable Dev and
no NuGet release.
## 2026-10-18 — tenth live family: existing RadioGroup and Radio

TENTH source-backed representative-only #421 Component Lab pilot
is the current public RadioGroup<TValue> and Radio<TValue> API.
#436 (future Fluent2 radio redesign) remains Backlog and no
production library code/CSS was modified by this Lab work.

Three real source component cards are padded, spaced and adapt to
one true column in RTL narrow 320px canvas:
1. RadioGroup bound to a string, initially no selection. Real
   native Space selects Morning, updates the Blazor group model.
   A REAL CDP hit-tested pointer on the Afternoon indicator
   selects Afternoon and unchecks Morning. Value binding correct.
2. Vertical Orientation with ItemsLabelPosition.Before, High
   initially selected; native pointer chooses Low and unchecks
   High with the rendered group model updated.
3. Disabled Closed radio plus available Open. Real native
   focus cannot activate Closed; a hit-tested indicator click
   cannot change the group model or disabled checked state.

Copyable Razor contains real RadioGroup Value binding, actual
Radio option values, orientation, label-before, native disabled.
No mocks or test-only state assignment substituted for actual
native user interactions.

After inspecting live RTL screenshot, English group status labels
had incorrect colon direction (Availability). All three status
texts now declare language en and direction ltr, with scoped
right alignment in RTL and left alignment in LTR. A native
browser computed-style geometry check verifies LTR punctuation,
right alignment, full card containment and no default margins.
Only Lab demo CSS was changed; library production components
are untouched.

Independent actual Dev01 Chrome/Edge x WebAssembly and
production-published InteractiveServer all passed 148/148 strict
browser checks each (592/592 total), errors=[], QA-owned
Chromium processes cleanup remaining=0. This includes the final
bilingual caption correction in all four modes.

[Actual 375px RTL RadioGroup screenshot after native Space](evidence/component-lab-radio-live-rtl-chrome-wasm.png)
is from hydrated Blazor, with three visibly separated cards
and correct English punctuation. Not a Penpot mockup/signoff.

Critical unaccepted accessibility work for #436: current
RadioGroup markup is a div plus plain label/items-list rather
than demonstrated native fieldset/legend or semantic radiogroup.
Radio input markup does not explicitly assign a group name.
Arrow-key traversal, roving tab, name announcements, OS Windows
screen readers and full Fluent2 RTL/forced-colors/visual parity
have NOT been tested or approved. The successful current
Space/pointer tests must not be mistaken for this acceptance.

Source inventory remains 66 families, TEN runnable
representative-only live scenarios, 56 families without a Lab
pilot, and ZERO finally accepted exhaustive v3 families.
#421 In progress/PR Draft; #436 Backlog; no protected
bluent-v3 or stable Dev merge; no NuGet release.