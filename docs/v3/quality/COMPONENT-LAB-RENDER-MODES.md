# #421 Component Lab - render mode QA (DRAFT)

This is the issue #421 Component Lab pilot, PR #551 to bluent-v3.
Four families have real runnable examples (Button, Icon, Label, Link);
the 66-family work queue does NOT mean 66 completed v3 components.

## Canonical Penpot design

Bluent v3 Design System, file b64f6665-c9ab-80b5-8008-c4ac99d9d000,
page e775e67c-d9da-804b-8008-cc7c2dd7ecf7.
Desktop board e775e67c-d9da-804b-8008-cc7c2dec1d15;
mobile board e775e67c-d9da-804b-8008-cc7c2e40c7d2.
Both boards have draft render-mode QA notes. No maintainer parity approval.

## Verified - actual WebAssembly

Run scripts/quality/run_v3_component_lab.ps1 -Mode WebAssembly.
Actual Dev01 Chrome/WebAssembly after hydration guard: 17/17 passed.
This includes real Blazor Button clicks; Icon, Label and Link markup;
four preview controls, search, 66 canonical issue rows, issue-number
queue search, and responsive 320px nonoverflow. Prior exact-head
GitHub Chrome/Edge WebAssembly on 13036b0f succeeded. New HEAD
needs independent CI evidence before claiming success.

## Earlier failed InteractiveServer attempt (historical)

The QA-only route /compatibility/component-lab-server is an
InteractiveServer wrapper hosting the SAME shared ComponentLab.
A first OnAfterRenderAsync sets data-lab-interactive=true so the
real browser runner does not mistake prerendered HTML for clickable UI.

Reproduction on Dev01 2026-10-16:
- Build-only Development SSR served page HTTP200 but framework JS and
  Bluent CSS asset development handlers raised FileNotFoundException.
- Real isolated Production SSR publish served HTTP200 and static
  Component Lab markup; actual Chrome still observed window.Blazor
  undefined and data-lab-interactive=false; app.css returned HTTP404.
- The first-click hydration gate timed out; no interactive Server
  behavior was proven. Cause of bootstrap failure requires further
  diagnosis. Do not report this as passed or as a proven shared
  component-handler defect.

The runner supports -Mode Server for reproducing this in a disposable
published host, but Server is deliberately NOT in the accepted
renderModesVerified array or current GitHub passing browser matrix.
The real WASM browser gate remains independent and green.

## Dependency advisory

The existing SSR project Microsoft.AspNetCore.Components.WebAssembly.Server
10.0.7 emits two high-severity NU1903 advisories:
GHSA-g27p-qf6j-c96c and GHSA-qjpx-jqm5-h2c4.
They are not suppressed; remediation requires independent testing.

No stable Dev merge, v3 release or NuGet publish was authorized.

After Button explorer: Real Chrome and Edge WASM each passed 20/20. The independent SSR Production Published route again served HTTP 200 but remained prerendered-only; window.Blazor undefined, app.css 404, no interactive callback. Server has ZERO acceptance evidence. NU1903 advisories remain visible.

## Verified pilot: InteractiveServer (local Dev01, 2026-10-16)

The QA published host was launched from the repository directory rather than
its isolated publish directory. ASP.NET Core returned HTTP 200 for framework
JavaScript without a usable payload, so the browser never hydrated. The
PowerShell runner now specifies the correct publish WorkingDirectory.
The host also no longer requests nonexistent app.css (previously HTTP 404).

- Chrome/Server: 22/22 actual live checks for shared ComponentLab, click,
  appearance/size/shape binding, queue search, RTL and 320px reflow, cleanup=0.
- Edge/Server: 22/22 live checks including no required JS/CSS HTTP failures
  and no unhandled JavaScript exceptions, cleanup=0.
- Chrome/Edge WebAssembly: 22/22 each with the new asset/JS checks.
- All four local modes now pass 22/22 independently; exact-head GitHub CI remains pending.

Only **four representative pilots** are verified, not 66 complete component
APIs, visual acceptance, named screen readers, or native Windows contrast.
Existing WebAssembly.Server 10.0.7 NU1903 advisories remain unsuppressed.
Stable Dev and existing NuGet releases were not touched.

## 2026-10-16 interactive QA follow-up: 27 checks in each real mode

The previous commit aac0d057 has **two separate passing GitHub Actions
runs**: 38946521658 and 38946530029. Each exercised four Chrome/Edge x
WebAssembly/published InteractiveServer jobs; **8/8 jobs passed**. Those
results are exact to the previous commit and are not reused for the new head.

Five new real-browser checks extend the prior 22 to **27 per mode**:
- CDP pointer hit-testing checks the Copy source button is really under the
  pointer, after an instant scroll; an earlier unsynchronized scroll clicked
  the demo sidebar and navigated away (test-harness bug, not a component failure).
- Dispatch genuine CDP mousePressed/mouseReleased events on Copy source.
  Its Blazor handler calls navigator.clipboard.writeText and the browser
  confirms the success message; clipboard bytes were not independently
  read back, so this is not exhaustive clipboard permission coverage.
- Focus an enabled native Bluent Button and assert DOM focus.
- Dispatch real CDP Enter with Windows virtual key and carriage-return text
  and assert the Blazor click count changes exactly once (1 to 2).
  Sending a keyDown without text failed to activate browser-native Enter
  behavior; the CDP keyboard event was incomplete.
- The native disabled Button must remain unfocusable and carry disabled=true.

Actual local Windows Dev01: **Chrome/WASM 27/27, Edge/WASM 27/27,
Chrome/published InteractiveServer 27/27, Edge/published InteractiveServer
27/27**. Total **108/108** browser assertions, with separate disposable
browser profiles and no remaining owned processes (remaining=0 in each).
The 66-family source queue still has **only four representative pilots**,
not complete per-property/event/state interactive demos.

Canonical source-owned Penpot file b64f6665-c9ab-80b5-8008-c4ac99d9d000,
page e775e67c-d9da-804b-8008-cc7c2dd7ecf7, desktop board
e775e67c-d9da-804b-8008-cc7c2dec1d15: updated the existing evidence
label e775e67c-d9da-804b-8008-cc7c2e2aaca2 and QA annotation
e775e67c-d9da-804b-8008-cca7916d286e with honest local runtime scope.
Live Penpot textBounds checks found no overflow (16/35px and 37/54px).
This is a design annotation update, **not** maintainer approval, visual
parity review, native Windows Contrast Themes or named AT testing.
The new SHA's GitHub CI remains pending until actually run.

## 2026-10-17 Button ToggledChanged and Href source-backed pilots

The existing public Button Component Lab now includes a native Blazor
toggle button with Toggled and ToggledChanged and a real Button Href
rendered as an HTML anchor. A real Chromium CDP Enter twice checks
the parent callback counts 1/2 and the actual toggled CSS class
turns on/off. Another check proves the link specimen is an A with
an actual href, not a fake Button onclick. The copied Razor snippet
now uses dynamic Toggle binding and includes the required @code
method, so it is not a stale literal false-value example.
Five new real-browser checks raise the shared matrix from 27 to
32 per environment. Still a PILOT, not Button completion.

Two initial RED local smoke runs identified defects IN THE HARNESS:
- Chrome/Server first click selector matched the new Toggle status
  rather than the original completed-click counter, because
  the selector used the first role=status element. Added separate
  lab-click-status and lab-toggle-status selectors; rerun passed.
- Edge/WebAssembly first launched old Debug binary using --no-build,
  producing the previous 3 specimens instead of 5. The self-owned
  runner now ALWAYS builds CURRENT Debug Razor before launching
  WebAssembly. Eliminated duplicate CI job prebuild. On fresh source
  the Edge/WASM run passed.
Actual Dev01 current-source evidence: Chrome/Production-published
InteractiveServer 32/32 and Edge/WebAssembly 32/32, no errors,
disposable QA browsers remaining=0. The final copied-source handler
change was included in the latest Edge/WASM passing run. Other
two combinations require new exact-head CI; historical 27/27 evidence
for all four modes is retained with its original dated scope.

IMPORTANT: Real Edge/WASM observed Button Toggle aria-pressed=null
even while the toggled CSS class and callback work. This is a
preexisting ARIA accessibility gap to review in #428, not a reason
to mark Toggle Accessible, Button Done, or WCAG compliant.
Other Button capabilities and complete 66-family demo coverage
are still missing.

Canonical editable Penpot Bluent v3 Design System file ID
b64f6665-c9ab-80b5-8008-c4ac99d9d000, page42 ID
e775e67c-d9da-804b-8008-cc7c2dd7ecf7 supplies the original
Lab concept. No new Penpot review/edit/approval in this step;
the connected tab had been frozen. Stable Dev and v2/NuGet
are untouched. The existing high-severity WebAssembly.Server
10.0.7 NU1903 advisories remain unsuppressed.

## 2026-10-17 advanced existing Button API: Compound / Badge / Dropdown

Source-owned Component Lab remains a PILOT in the original
editable Penpot Bluent v3 Design System page42
e775e67c-d9da-804b-8008-cc7c2dd7ecf7,
desktop board e775e67c-d9da-804b-8008-cc7c2dec1d15.
This increment reuses the existing source-owned live Button
scenario instead of implementing #428 or claiming a new
Fluent 2 Button design. Penpot is currently disconnected,
so no new design-tool edit/reviewer acceptance occurred.

Added to the real public Button sample and its copyable Razor:
- Compound Notifications Button with SecondaryText,
  Compact=true and a real child Badge with End/Bottom
  positioning. Native DOM assertions validate compound,
  compact, badged, badge-wrapper.bottom.end, actual bui-badge,
  and the secondary text.
- More actions native Dropdown Button using public
  ShowDropdownIndicator and DropdownPlacement.BottomEnd,
  MenuList with two MenuItems and parent EventCallback status.
  Real CDP Enter opens the surface; real pointer input
  hit-tests each actual menu row, selects Export report, then
  reopens to select Share summary. Assert 1 then 2 actual
  Blazor callback notifications and exact visible labels.
- Responsive two-column sample grouping (one column at small
  viewports) scoped exclusively to Component Lab CSS.
  No production component API or styling changes.
- Synchronized source snippet with the real Badge and MenuList
  hierarchy and two menu callbacks plus existing Toggle.

Declared public Button API contains 20 Parameter properties.
This representative lab now samples 16 of those 20
(plus disabled via AdditionalAttributes). TextClass, Icon,
Rotated and Orientation are NOT yet represented as interactive
Button specimens here. Compound/Dropdown demos do NOT
cover split Button, menu native AT semantics, high contrast,
visual Fluent 2 parity, migration or reviewer acceptance.
The existing toggled Button aria-pressed=null debt belongs
to #428 design-first review.

First local Dev01 Edge/WebAssembly run, freshly built from
current source: 40/40 actual browser assertions, 0 errors,
15 owned QA browser processes and 0 remaining, including
new dropdown keyboard/pointer tests and 320px mobile check.
Other modes and final copied source must be checked at
their own source revision before claiming new-head success.
Four pilot families / 66 source candidates, zero fully
accepted migrated components. No stable Dev or NuGet release.

### Server runtime boundary correction and independent browser evidence

The first Chrome/InteractiveServer runtime of advanced Button
specimens passed all initial Button controls and Badge checks,
but **timed out waiting for the Dropdown**. Root cause:
the isolated compatibility Server page used a minimal layout
without any PopoverContainer, whereas the full WebAssembly
MainLayout already had a Containers host. Popover trigger
events therefore had no surface container to render into,
despite the Button/Popover being correctly formed. This was
a **test-host fixture defect**, not a product Dropdown fix.

Corrected ONLY
src/Bluent.UI.Demo.SSR/Components/Pages/ComponentLabServerProbe.razor,
placing the existing Bluent Containers component INSIDE
the InteractiveServer render boundary alongside ComponentLab.
The source contract now rejects removing this container
again. The subsequent real **Chrome/Production-published
InteractiveServer passed 40/40**, zero errors, owned
browser remaining=0. The Edge/WebAssembly independently
passed **40/40**, zero errors, remaining=0. Both verified
native CDP Enter for opening the Dropdown, hit-tested
pointer clicks on Export then Share, and callback counts
exactly one then two. The other two combinations and
exact-current-SHA GitHub CI must still be checked separately.

This restores test-host parity and is NOT a claim that
v3 Button design, menu semantics, focus management, RTL
contrast and named assistive-technology testing have
been fully accepted.
