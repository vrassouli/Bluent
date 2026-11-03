# Bluent v3 #420 - consumer interaction migration review

**DRAFT - not approved production upgrade instructions.** This review
covers task PR #550 into bluent-v3, not frozen Dev or released NuGet.

Design: original editable Penpot Bluent v3 Design System file
b64f6665-c9ab-80b5-8008-c4ac99d9d000, page
ed5216bd-3d5b-8015-8008-cb247e27efb4, board
ed5216bd-3d5b-8015-8008-cb247e906204. Visually exported and reviewed
on 2026-10-16: appended research notes previously overlapped the
footer, other notes and board boundary. Five source-owned QA notes
now use separate white-backed rows under section 05. A source-owned
pale-neutral full-coverage background shape also closes a
transparent margin that made the original title unreadable
in dark-mode PNG previews. Final native Penpot revision 409
has 63 editable shapes; 14/14 independently evaluated
geometry and backdrop rules PASS and a new board PNG was
visually inspected. This verifies **layout legibility**,
not maintainer visual acceptance.

## Consumer behavior changes

| Concern | Original behavior | v3 issue-branch behavior | Consumer review |
| --- | --- | --- | --- |
| Calendar MonthSelect and YearSelect | Private event handlers returned async void, hiding pending work/errors | Private handlers now return Task and await the existing SelectedDateChanged EventCallback | Test slow async consumers and exceptions; no public API changed |
| Calendar MonthChanged on navigation | ViewDate setter scheduled a detached callback Task | Month/year navigation actions await ChangeViewDateAsync and MonthChanged | Consumers can observe completion and errors; avoid indefinitely blocked callbacks |
| Calendar MonthChanged on external SelectedDate | Setter could schedule detached callback during OnParametersSet | OnParametersSet records a changed month, OnParametersSetAsync consumes then awaits once | Test parent-driven updates, callback reentrancy and no same-month duplicate |
| Popover click accessibility | Disclosure state not consistently represented on the trigger | Only missing aria-expanded and aria-controls are owned and synchronized for click triggers; author attrs untouched | Test custom ARIA; hover/focus Tooltip triggers are exempt |
| Popover focus and lifetime | CSS transition cancellation, per-trigger JS resources and multi-surface cleanup could race | LIFO Escape restores opener focus; outside click does not steal it; Destroy removes only one child's resources | Verify nested consumer overlays, rapid removal and trigger rebind |
| Reduced motion and native AT | Prior CSS transitionend was not guaranteed | Reduced-motion CSS and deterministic pending-hide cleanup; Chromium AX and forced-colors emulation tested | Native Windows Contrast Themes and Narrator/NVDA spoken acceptance remain OPEN |

**A public signature can remain unchanged while observable callback
timing changes.** The Calendar MonthChanged notification provides a
DateOnly for the newly *viewed date*, not necessarily the first day of
its month. A changed parent SelectedDate may also notify the consumer;
do not assume MonthChanged is restricted to direct user clicks.

## Existing consumer API example

~~~razor
<Calendar TValue="DateTime?"
          @bind-SelectedDate="_selectedDate"
          MonthChanged="OnMonthChangedAsync" />

@code {
    private DateTime? _selectedDate = DateTime.Today;

    private Task OnMonthChangedAsync(DateOnly viewedDate)
    {
        // Return the asynchronous operation when loading month data.
        // Check for actual month changes before assigning new parent dates.
        return Task.CompletedTask;
    }
}
~~~

No new Calendar properties, enum values or EventCallback signatures
are introduced by this task. A consumer that depended on the previous
detached completion order should explicitly review and retest it.
Likewise, #420 does not invent a generic role=menu, role=dialog,
aria-haspopup or modal Tab trap for arbitrary nonmodal Popovers.

## Source and test traceability

- Calendar implementation: src/Bluent.UI/Components/CalendarComponent/Calendar.razor.cs
- Popover lifetime/ARIA: src/Bluent.UI.Scripts/src/Popover/Popover.ts and
  src/Bluent.UI/Components/PopoverComponent/PopoverContainerBase.cs
- Public API: src/Bluent.UI/Components/CalendarComponent/Calendar.razor.cs
  and src/Bluent.UI/Components/PopoverComponent/Popover.razor
- Implementation decision history: ADR-0002-interaction-primitives.md
- Actual compiled .NET lifecycle tests: 150/150 assertions including
  controlled pending Calendar callbacks, errors and deduplication
- Local real Chrome/InteractiveServer 54/54, Edge/WebAssembly 54/54
  with four actual Calendar QA cases and Popover lifecycle assertions
- Exact task commit ee798e95c145046716960b8b54a2c2ae192d71fe:
  all 9 GitHub PR checks success, including four Chrome/Edge x Server/WASM
  browser combinations, real consumer compile and public CLR census
- Penpot board exported and visually inspected **after** geometry
  repair; still design DRAFT, not final visual parity acceptance

## Remaining gates before Review/Done

1. Maintainer approval of editable Penpot architecture board and
   concrete interaction design-to-code parity, including exceptions.
2. Real Windows native Contrast Themes and UI Automation behavior
   with named Narrator or NVDA spoken/keyboard interaction. Prior
   native UIA snapshot exposed browser chrome only even with forced
   renderer accessibility; this was inconclusive, NOT a pass.
3. Representative consumer integration: slow MonthChanged loader,
   parent-driven SelectedDate changes, rapid navigation and errors;
   confirm new await semantics are acceptable to consumers.
4. Review other component families and modal focus handling under
   their own issues; nonmodal Popover checks are insufficient.

#420 stays In progress, PR #550 remains Draft against bluent-v3.
No merge to Dev, no stable package publication.

## 2026-10-18: #418 / #420 Popover integration compatibility proposal

Maintainer acceptance is still required; this is NOT a released v3
public parameter and does not alter current Popover C# API.

In the isolated four-foundation integration rehearsal, an actual #418
Blazor browser run exposed a semantics collision: explicitly opted-in
KeepSurface Popovers on the #418 branch need stable aria-controls for
their already-mounted surface, even when collapsed. The #420 ordinary
click-trigger contract instead removes aria-controls when closed to
avoid a dangling relationship. The pre-#420 expectation that ordinary
non-opted click triggers never had any ARIA is incompatible with the
intended #420 new auto-managed disclosure behavior.

The #420 task branch now guards the optional #418
accessibleTriggerState using a private TypeScript intersection type.
With #418 not merged, all ordinary behavior remains as before this
compatibility patch: click trigger owns only missing aria-expanded and
aria-controls, controls is present only while open; authored values
are preserved. When the explicit #418 flag is present after approved
foundation integration, that opted-in trigger can keep aria-controls
while collapsed, and Escape from elsewhere inside the owning modal is
not intercepted by the child Popover.

This is a PROPOSED v3 migration behavior requiring owner review.
Integration browser evidence for the final combined source exists in
the isolated Dev01 scratch worktree; the task branch can only test its
currently available C# and TS public surface until #418 is integrated.
The scratch document is
docs/v3/architecture/FOUNDATION-INTEGRATION-REHEARSAL-418-420.md
at local Dev01 commit c5611192 (clarified in a79657c1), not a
published remote source file. Do not call these source tests native
screen-reader acceptance or full Penpot parity.
## 2026-10-18: Native pointer verification for the Overlay reduced-motion QA gate

The earlier browser test dismissed the actual Bluent Overlay using the
synthetic DOM API Element.click(), which does not verify real pointer
hit-testing. The test has been upgraded to require an actual rendered
Overlay backdrop under a safe viewport point via elementFromPoint,
then send exactly one native Chrome DevTools Protocol pointer sequence:
mouseMoved, mousePressed and mouseReleased. Its Blazor OnClick callback
must remove the actual Overlay element without synthetic retries.
If no unobstructed hit target is found, the test fails. If the native
click is not handled within the timeout, the test fails with the live
Overlay CSS/DOM/pointer diagnostic, rather than silently retrying clicks.
The three existing modes (normal, prefers-reduced-motion and normal
restored) are all exercised with the same real pointer contract.

Independent Dev01 task-branch tests using the revised probe:
Chrome/WASM 61/61, Chrome/production-published InteractiveServer 61/61,
Edge/WASM 61/61, Edge/production-published InteractiveServer 61/61:
244/244 on passing runs, all JS errors=[], all QA browser-profile
cleanup remaining=0. Actual report JSON files were separately inspected
for each mode; a new negative Python source guard rejects reintroduction
of the synthetic Overlay element click.

This strengthens evidence, but does NOT establish root cause of the
previous infrequent Overlay hydration/callback timeouts. It does not
change the Overlay component or public API. The earlier red attempts
remain part of the reported investigation, and native Windows AT
approval is still pending before #420 can enter Review.
## 2026-10-18: Fix the Overlay test readiness/click flood

Follow-up investigation found that the original test opener did not only
wait for hydration: the wait loop invoked the synthetic DOM click on
the Open motion overlay Button repeatedly every 300ms until Blazor
responded. That is not a faithful user interaction and may queue stale
opener callbacks competing with the subsequently tested backdrop close
event. This is an identified flaw in the **test**, not proof of a
specific product-side Blazor race.

The source-owned Popovers Razor demo fixture now exposes its interactive
render readiness only after first OnAfterRender (both WebAssembly and
InteractiveServer). Once ready, the test hit-tests the actual opener
Button and sends **one** native CDP mouseMoved/mousePressed/mouseReleased
sequence; it then separately waits for an actual Overlay DOM element.
No opener retries or synthetic .click() calls are used. The already
native-pointer backdrop dismissal remains a single-event gate with
rich diagnostic failures. Product component API unchanged.

At current task-branch source, independent Dev01 browser evidence:
Chrome/WASM 61/61, Chrome/published InteractiveServer 61/61, Edge/WASM
61/61 and Edge/published InteractiveServer 61/61; 244/244 total,
errors=[], QA browser profile cleanup remaining=0. Additional negative
contract checks enforce a real Razor hydration signal, exactly-once
opener behavior and real CDP pointer usage.

This eliminates a known synthetic test-event flood, but intermittent
Overlay hydration/OnClick timeouts from earlier runs remain historical
findings until multi-run CI/real consumer evidence establishes whether
any further root cause exists. No claim of native OS assistive technology
or full integration acceptance is made.
## 2026-10-18 — actual compiled #418 opt-in / #420 managed ARIA contract in Chromium

The source-only private TypeScript compatibility tests for opt-in mounted
KeepSurface ARIA now have **ten additional live runtime checks** in the
existing real Blazor Popover browser probe. After the actual Blazor page
interacts with current library code, the probe imports the **shipped
Bluent.UI ESM asset** from /_content/Bluent.UI/bluent.ui.js and constructs
a separate, temporary source-owned DOM fixture. This does not require
publishing an unfinished #418 C# public parameter or modifying product
HTML attributes.

The actual compiled Popover JS is exercised for:
- Initial, expanded and collapsed aria-expanded/aria-controls values on
  an explicitly opted-in existing surface.
- Escape from a sibling (unrelated target) is left to the owning Modal,
  while Escape from the child trigger dismisses it and restores its focus.
- An ordinary click-trigger disclosure omits dangling aria-controls
  when closed and restores the IDREF only while expanded.
- Consumer-authored aria-expanded/aria-controls remain untouched.
- Fixture teardown explicitly disposes per-trigger listeners and DOM.

Independent Dev01 source-owned actual browser evidence on this updated
#420 task branch: Chrome/WASM **71/71**, Chrome/published Server **71/71**,
Edge/WASM **71/71**, Edge/published Server **71/71**, combined **284/284**.
All successful runs report errors=[] and QA-owned Chromium process
cleanup remaining=0. A fail-closed source test requires the compiled
module import and all behavior assertions. Runtime checks execute the
compiled JS disclosure/keyboard methods directly with real browser DOM
and KeyboardEvent, but are NOT a complete Blazor #418 public integration,
native physical-key or screen-reader certification.

This materially reduces the previous source-only test blind spot.
#420 remains In progress / Draft until approved #418 integration,
Penpot design/actual migration behavior acceptance and native Windows
AT evidence. No product public API or stable Dev/NuGet changes.
## 2026-10-18: eliminate post-merge false-negative in #418 compatibility CI

An exact-current-head integration rehearsal of PRs #500 + #550 +
#549 + #551 exposed a true cross-branch quality-gate collision:
the #420 source test originally asserted that the #418
accessibleTriggerState setting must *never* exist in PopoverSettings.
That assertion is correct only before foundation #418 is merged.
After approved integration, #418 intentionally provides the property.

The compatibility gate now accepts either pre-merge absence or exactly
one OPTIONAL boolean declaration of accessibleTriggerState, but fails
closed for a mandatory flag, wrong type or duplicate declaration.
Private #420 runtime guards, scoped Escape behavior, ARIA IDREF lifecycle,
and author-defined attributes retain their own independent strict tests.

This is a CI integration-contract correction, NOT public API approval or
a relaxation of behavioral assertions. The current #420 task branch does
not add the #418 API; combined foundation source is verified separately.