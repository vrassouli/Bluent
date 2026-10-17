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