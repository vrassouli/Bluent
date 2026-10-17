# Bluent v3 Interaction Primitives · #420


LATEST 2026-10-15 #420: Real Popover SCSS now respects prefers-reduced-motion, zeroing transition/delay. Tracked compiled components.css and shipped components.min.css have the same rule. CI rebuilds pinned Sass@1.93.2 and rejects stale CSS output along with tracked JS bundles. A real no-arrow Blazor fixture checks DisplayArrow=false, finite geometry and Runtime.exceptionThrown for otherwise hidden JavaScript errors. Actual Dev01 Chrome/Edge x WASM/Server **27/27 per mode = 108/108** on shipped styles incl real computed reduced-motion CSS under emulation, RTL/forced-colors emulation, zero motion Escape, rapid reopen, focus LIFO, independent width/geometry and optional arrow. PNG/JSON are not native Windows Contrast or AT certification. #420 In progress and Draft pending canonical Penpot maintainer signoff, native OS/AT and broader overlays.



LATEST 2026-10-15 #420 transient hide fix: Popover pending hide completion now owned per trigger ID, with cancellable transitionend listener and computed CSS-duration fallback, instant zero-second completion, reopening cancels stale callback, disposal clears all. Actual live Chrome/Edge x Server/WASM **23 checks per mode = 92/92**: two simultaneous SameWidth Popovers, topmost Escape/focus, reduced-motion/forced-colors browser emulation in RTL with zero-second transition, 700ms interrupted hide and rapid reopen without stale cleanup. Separate emulated-contrast PNG + JSON per mode. Rebuilt ESM/global bundles and maps synced to Bluent.UI assets. Source contract rejects missing no-animation/rapid-reopen guards and includes two negative tests. Browser emulation does NOT certify native Windows Contrast Themes or AT; #420 Penpot draft still needs reviewer approval; do not merge stable Dev or release v2.


LATEST 2026-10-15 #420 multi-instance check: Real Bluent Popover JS geometry ownership (trigger/surface ResizeObservers, MutationObserver and Floating UI autoUpdate) is now per triggerId instead of shared singleton fields; hiding one does not stop other surfaces. Real shared Blazor QA fixture opens two SameWidth Popovers concurrently; waits for OnAfterRenderAsync interactive marker and sends OpenBoth once (duplicate clicks caused false race in initial test). Actual Chrome/Edge x Server/WASM 17/17 each = 68/68 browser checks for stacking, LIFO Escape focus and independent resizing, alongside prior click/Set/Show. This is scoped Popover proof, not native Windows Contrast/AT/Fluent parity. Reviewer acceptance of canonical #420 Penpot board still pending.


LATEST 2026-10-15 #420: Real Escape closes topmost Popover and restores trigger focus, outside click does not steal focus. JS trigger/document listeners and ResizeObservers/FloatingUI updates are cleaned in Popover.dispose(), which C# calls before proxy DisposeAsync. Local Chrome/Edge x WASM/Server **40/40 real browser checks**, compiled Bluent.UI fake-JS **123 assertions** including explicit dispose; 19 source tests and four JS asset consistency tests. ESM/global JS/maps are matched to shipped Bluent.UI wwwroot and CI now rebuilds webpack with npm ci and rejects stale tracked bundles. Remaining: native Windows Contrast/AT, other overlays' modal focus behavior and user-approved canonical Penpot board; do NOT mark Done or publish stable v2.


CURRENT 2026-10-15 (older checkpoints below are historical): zero async void/typed catch(Exception)/bare catch across the eight audited UI Interops + DomHelper files. Public IPopoverService and protected Overflow.CheckOverflow signatures remain unchanged. Private Set/Show Popover FIFO is executed sequentially with await in OnAfterRenderAsync, Overflow CheckOverflowAsync is awaited during render. Compiled real Bluent.UI fake JS harness: 115 assertions; Python source guard: 18 tests; local real Popover WASM Chrome 7/7 + Edge 7/7, real InteractiveServer Chrome 7/7 + Edge 7/7 = **28/28** interactive checks with PNG/JSON. Dedicated Windows 4-job Chrome/Edge × Server/WASM Popover CI now in #420 Draft PR. Maintainer Penpot design acceptance, focus return/keyboard Escape/RTL, native OS/AT and reviewer visual parity still pending; no public v2/NuGet release.

Read docs/v3/architecture/ADR-0002-interaction-primitives.md, AGENTS.md and the v3 workflow and branching contracts before changing any component.

This issue is PROPOSED / In progress, not approved public Blazor API. The #417 architecture and #501 Focus board are reference sources. A new source-owned editable #420 board now exists in canonical Penpot Bluent v3 Design System: page ed5216bd-3d5b-8015-8008-cb247e27efb4 and board ed5216bd-3d5b-8015-8008-cb247e906204 (51 native shapes in four flows). This draft still REQUIRES visual inspection and maintainer approval; it is not public API, actual browser or native OS/AT compliance. Figma fallback X6Ima16GAyuk7dVUjGgIkt is limited.

Source audit: python scripts/quality/check_v3_interaction_primitives.py. Unit tests: python -m unittest discover -s scripts/quality -p test_v3_interaction_primitives.py -v and python -m unittest discover -s scripts/quality -p test_v3_interaction_sample.py -v. Compile actual consumer example with dotnet build samples/Bluent.TaskExamples/Bluent.TaskExamples.csproj -c Release -warnaserror.

Original source baseline: five async void methods + eleven broad catch(Exception) sites; after isolated AudioCapture/Overflow fixes **three async void, one typed catch(Exception) and two bare catch{} remain** (current after DomHelper/BluentTheme fixes). These are grandfathered source debts ONLY, not accepted lifecycle design or runtime compliance. New async void and broad Exception catches must fail the guard; reducing debt is allowed. Do not refactor shared base or public callback signature before exact API/migration + browser review.

Working sample V3InteractionConventions.razor uses existing EditContext, TextField and Checkbox two-way binding, Task SaveAsync, disabled+aria-busy, validation messages and live status. It is BUILD evidence only. Actual focus trap/return, JS disconnection/disposal, overlay portals, keyboard/RTL and screen reader behavior still require component-specific runtime tests. Never merge into stable Dev or publish v3 NuGet without separate approval.


2026-10-15 implementation in v3 task branch: await AudioCapture.StopAsync in real click, await Overflow.InitAsync from Blazor OnAfterRenderAsync; independent JS handle Dispose with expected JSDisconnectedException tolerance, no blanket catch. Compiled actual DLL harness scripts/quality/v3_interop_lifecycle/V3InteropLifecycle.csproj tests 55 .NET assertions using fake IJSRuntime for await ordering, JS failures, disposal and circuit loss. Source regression guard freezes remaining three async void and nine catches. This DOES NOT prove actual Chrome/Edge, native focus/AT or safe synchronous Popover event migration; keep #420 In progress.


2026-10-15 OtpField disposal remediation: OptFieldInterop.DisposeAsync now attempts child and imported JS module independently even if child disposal throws, catches only expected JSDisconnectedException and nulls internal handles. 9 additional real compiled assembly fake-JS assertions (37 total) test child/module failures, disconnect, repeated teardown and dispose-before-use. OtpField.InitializeAsync broad catch remains deliberately untouched pending component error-state contract, so 8 broad catches remain alongside 3 async void. No public component parameters/events changed; no live browser/AT claim.


2026-10-15 Popover cleanup verified: PopoverInterop.DisposeAsync now always disposes child, module and managed callback independently; only expected JSDisconnectedException is swallowed. PopoverContainerBase.DisposeAsync finally removes all five PopoverService event handlers even on unexpected JSException. Real compiled harness instantiates actual public PopoverContainerBase with internal service and observes the subscriptions before/after error (47 total assertions). Synchronous service callback signatures and remaining Popover async void methods are UNCHANGED pending approved lifecycle design and live browser tests; current source debt is 3 async void / 7 broad catches.


2026-10-15 DataGrid lifetime: internal DataGridInterop child+module cleanup uses independent finally paths, DotNetObjectReference always disposed, catch expected JSDisconnectedException only. Actual DataGrid<TItem> component DisposeAsync now invokes base.DisposeAsync in finally. Compiled DLL fake-JS harness exercises real DataGrid<string> instance with disconnect, unexpected error, lazy creation and repeated dispose: 55 cumulative checks. Source ledger 3 async void / 6 broad catches. This does not remove DataGrid Initialize catch-all or prove browser/AT behavior.


2026-10-15 source audit blind-spot correction: the baseline has 6 typed catch(Exception) and 2 bare catch{} (DataGrid.Initialize and Popover.SetPopover). The guard and 14 Python negative/positive tests now fail on newly introduced untyped catch{} as well as catch(Exception) and async void. This is a static source ledger, not proof of component error UX. Do not erase existing debt without API/behavior approval; remaining 3 async void require consumer event-contract work.


2026-10-15 pointer helper and theme lifetime: DomHelper now keeps id-keyed owned DotNetObjectReference dictionaries for pointer move/up, frees them at Unregister (even on JS error), frees aborted registers, releases replaced IDs, and always cleans JS proxies/module and callback dictionaries at Dispose. BluentTheme catches JSDisconnectedException only and clears imported module. Overflow component base.DisposeAsync executes in finally. Actual compiled Bluent.UI harness now **89 assertions** for 7 owners, including real disposed-reference access checks; 15 Python source negative/positive tests. The remaining source debt is 3 async void, 1 typed catch(Exception) (OtpField initialization), and 2 bare catches (DataGrid Initialize / Popover SetPopover). Chrome/Edge Server/WASM PR #549 4-way CI passed independently as generic baseline, not as pointer/Popover focus-restore acceptance. Issue remains In progress.


2026-10-15 real InteractiveServer Popover acceptance advance: QA-only server route /compatibility/popover-server with @rendermode InteractiveServer and a scoped Containers host renders the same Popovers demo. Dev01 real Chrome Server 7/7 + Edge Server 7/7; WASM Chrome 7/7 + Edge 7/7; 28/28 total. CI now real Chrome/Edge x WASM/Server matrix (four Windows jobs). Server probe must run Release-published SSR in Production to avoid dev-only missing _content CSS asset paths. Built-in probe self-start for both Server and WASM locally verified. This is real user interaction, not Focus Restoration, keyboard Escape, native OS Contrast/AT or maintainer Penpot signoff.

2026-10-16 #420: canonical Penpot page40 board
ed5216bd-3d5b-8015-8008-cb247e906204 now has a DRAFT
generic click-Popover disclosure ARIA decision. The JS Popover
auto-manages aria-expanded=false/true and aria-controls only for
click triggers and only where author markup did not set those
attributes. Rebind/dispose removes library-owned attributes, Escape
and outside click synchronize state; hover/focus Tooltip triggers
are not given disclosure semantics. No generic aria-haspopup,
role=menu/dialog or new public API. Check real Blazor CDP open/close
DOM + existing focus tests and regenerated ESM/global static assets.
Native Windows screen reader and visual approval remain open.

2026-10-16 #420 actual Chrome/InteractiveServer and Edge/WebAssembly
real Blazor Popover script smoke each PASS 30/30 including initial
aria-expanded=false after real JS hydration, open true and aria-controls
equal visible surface ID, Escape closed false/no dangling aria-controls
and focus return. Built/mirrored ESM/global and sourcemaps; 12
source bundle tests, 21 interaction source tests, Release 0 errors/
warnings, .NET 20/20. Click triggers only, never blanket tooltips.
Individual Blazor child removal/Dispose versus container JS lifecycle
is NOT yet a certified acceptance scenario. Native OS/AT and Penpot
review remain open.

2026-10-16 #420 child JS teardown: Penpot draft page40 board
ed5216bd-3d5b-8015-8008-cb247e906204 (53 shapes) specifies
independent Popover Destroy. C# Popover service callback enqueues
an awaited destroy after Set/Show; JS destroyPopover(triggerId)
cancels only one pending hide, outside click, click handlers,
ResizeObservers, Floating UI and managed ARIA; sibling remains
functional. Compiled fake-JS test 127 assertions, source Python
21+12 PASS, local real Chrome/Server 33/33 with live removal of
first Blazor child from inside second surface and Escape focus
on survivor. Browser harness performs fail-closed cleanup scoped
to its ephemeral temp profile. Design acceptance/native AT pending.

2026-10-16 #420 final four-mode child-removal matrix: Chrome/Server,
Edge/Server, Chrome/WASM and Edge/WASM each 33/33 real assertions,
total 132/132, zero browser test failures. WASM probe now builds
its Debug Blazor fixture (previous --no-build served stale Razor
page with no Remove button). Fresh Chrome/Edge WASM QA cleanup
reported killed=7 remaining=0; no unrelated browser profiles.
Compiled fake-JS 127 assertions, interaction source Python 22
and bundle source Python 13. Native OS/AT and maintainer Penpot
acceptance remain OPEN.

2026-10-16 #420 Chromium browser accessibility tree evidence:
correct live Penpot page40 board ed5216bd-3d5b-8015-8008-cb247e906204
now has 54 editable shapes, last a DRAFT AX verification
requirement. Actual real Blazor CDP harness calls Chromium
Accessibility.getPartialAXTree with the rendered trigger
remote-object ID, checking accessible button role/name,
focusable and collapsed initially, expanded and controls
relationship to the actual surface while open, focused/collapsed
and no stale relation after Escape. Chrome/Server 36/36
passed. Neither real native OS Contrast Themes nor spoken
Narrator/NVDA nor maintainer design acceptance proven.

2026-10-16 #420 draft Penpot page40 board revision402
with 55 editable shapes defines awaited Calendar month/year
events. Calendar used 2 private async void Razor event handlers
(now Task) and 2 unreachable ChangeEventArgs async void
methods (deleted). Public Calendar API unchanged. Compiled
real DLL 139 assertions including controlled pending consumer
EventCallback tasks and propagated exceptions, MonthSelect
and YearSelect. Common QA-only real Blazor CalendarAsyncProbe
with InteractiveServer and WASM routes waits for first actual
interactive OnAfterRender before click. Chrome Server 46/46
after QA prerender hydration race fix. Other browser modes,
native OS/AT and design acceptance require independent checks.

2026-10-16 #420 Penpot page40 board revised 403 / 56 DRAFT
editable shapes for Calendar MonthChanged Task contract:
ViewDate setter side-effect-free, all 7 navigation actions
Task-returning/awaited, external SelectedDate update queued
from OnParametersSet to OnParametersSetAsync with consume-
before-await, same-month no duplicate. Existing public
EventCallback<DateOnly> MonthChanged unchanged; old async
completion timing differs and consumer migration review
still needed. Real compiled .NET 150 assertions, Chrome
InteractiveServer 54/54, Edge WASM 54/54 with actual four
Calendar cases pending/release/complete. GitHub CI and
native AT/Penpot visual approval are separate gates.

2026-10-16 #420 design-artifact and consumer migration QA:
canonical Penpot page40 board
ed5216bd-3d5b-8015-8008-cb247e906204 revision409 now
has 63 native editable shapes after an actual export exposed
overlap of appended notes and clipping outside board. Reflowed
section 05 into five separate white-backed research cards.
A native source-owned neutral export backdrop now covers the
formerly transparent title/footer margins; reran 14/14 live editable Penpot geometry checks, then
re-exported and visually inspected. The new
docs/v3/architecture/INTERACTION-CONSUMER-MIGRATION-REVIEW.md
and M13-M17 in docs/v3/design/MIGRATION-IMPACT-LEDGER.md
distinguish publicly unchanged Calendar/Popover parameters
from actual async callback-timing, ARIA and cleanup differences.
Exact task HEAD ee798e95 passed nine GitHub gates; Penpot
board legibility is NOT maintainer signoff, and native Windows
Contrast Themes/AT remain open.

## Penpot #420 native text-bound geometry safeguard (2026-10-16)

After any edits to the source-owned page40 board
ed5216bd-3d5b-8015-8008-cb247e906204, run
scripts/quality/penpot_v3_420_textbounds_audit.js in the
**actual connected Bluent v3 Design System Penpot plugin**.
The older 14/14 board-placement audit overlooked 30 native
Text boxes 1-2px too short for textBounds; 30 height-only
changes now give 37/37 fitting read-back (63 native shapes).
This is read-only repeatable design integrity QA, **not**
human visual parity or screen-reader certification. Keep
#420 In progress until acceptance and preserve 2.x isolation.

## RightEnd Popover CSS and real browser gate (#420, 2026-10-17)

Public Placement.RightEnd emits the CSS class right-end. The
correct Sass nesting is an ampersand followed by a dot and
right-end, not ampersand-right-end (missing dot). The latter
compiles to an incorrect combined selector. Rebuild compiled
components.css and shipped bluent.ui.components.min.css, and
run test_v3_popover_js_bundle.py to reject the missing selector
and stale shipped artifacts. Source-owned public Popovers demo
now includes a RightEnd KeepSurface specimen.
The real browser probe confirms initial -10px entry
translation, Blazor click/open and Escape focus restoration.
Because the closed KeepSurface is display:none, inspect its
computed transform using temporary display override ONLY,
restoring the exact prior inline display immediately. Do not
set transform inline or claim hidden computed none means an
application failure. Chrome/published InteractiveServer
57/57 PASS. Full four-mode CI is still separate.
Keep Penpot review and native AT acceptance separate.

## Shared Overlay animation / Reduced Motion (#420)

Accepted ADR D5: overlay backdrops must not continue
durationGentle fade in OS prefers-reduced-motion: reduce.
In task-owned v3 Sass _overlay.scss, override only
animation-duration and animation-delay to 0s under
the reduced-motion media query, while preserving
the normal fade, public overlay API, z-index and
backdrop color. Rebuild compiled components.css and
shipped min CSS. Run positive/negative 21-case
test_v3_popover_js_bundle.py contract and actual
probe_v3_popover_runtime.mjs against Chrome/Edge in
both WASM and published Server: the opt-in genuine
Blazor Overlay is opened/removed by real handlers,
computed animation checked in normal, reduced, and
restored browser media. SSR prerender may display a
button before hydration; wait/retry for interactive
handlers. Browser media emulation != native Windows
motion/AT acceptance. No Dev/NuGet merge.

- 2026-10-17 final Dev01 local Chrome/Production-published
  InteractiveServer browser probe **61/61 PASS**, failures=0.
  First prematurely checked prerender static content before
  interactivity (1/1 with timeout); retry on real Blazor
  hydration yielded 60/61 with a first-paint normal
  CSS/media baseline inconsistency; explicit Chromium
  no-preference media baseline then proved normal fade,
  Reduced Motion 0s duration/delay, and restored normal
  fade, all with real Overlay OnClick removal: 61/61.
  Other render modes and exact latest GitHub SHA remain
  separately verified, not inferred from this result.
