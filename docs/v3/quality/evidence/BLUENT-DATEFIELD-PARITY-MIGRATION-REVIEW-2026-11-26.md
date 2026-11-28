# DateField parity, native contrast and migration review (#438)

Updated: 2026-11-27 (review opened 2026-11-26)
Branch: `v3/issue-438-datefield`
Recorded base head: `add8d519a75432a9a990a4dafbed06aa33590356`
Review state: agent source/design/migration self-review completed on 2026-11-27 with no concrete code or parity defect found. Draft PR #569 passed all 13 workflows on exact head `6ef93d7528675a22c6e81fa9bffd11df18b2f2d5`. The uncommitted local Component Lab/docs follow-up now passes its 18/18 source contract, 289/289 Chrome/WebAssembly run, docs contract (0 findings), Skills contract (6 files/0 errors) and 252-file Markdown link check; it has no new exact-head CI. Spoken screen-reader output remains unverified.

## Penpot page 61 and screenshot findings

The approved design source is the Bluent v3 Design System Penpot file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, page 61 `39bbee31-a6cb-801d-8008-feba6ea9ebf9`, boards `39bbee31-a6cb-801d-8008-febae0873e1e`, `39bbee31-a6cb-801d-8008-febb41bcbc3a`, and `39bbee31-a6cb-801d-8008-febb591e6012`. The design direction is approved; implementation parity is still an open acceptance gate.

The seven retained screenshots in [the responsive evidence folder](BLUENT-DATEFIELD-VISUAL/) come from the intentionally unlinked /compatibility/datefield-probe QA fixture. They show DateTime and DateOnly samples without the production Fields showcase context, and remain evidence captures rather than an approved screenshot baseline. The production Fields route also has an unrelated NumericField rendering exception, so the isolated fixture is appropriate for behavior checks but cannot stand in for a design-approved product-context capture.

A live fixture inspection found that the current-view heading was initially duplicated. A scoped visually-hidden rule was added to _calendar.scss and compiled into components.css and bluent.ui.components.min.css. The corrected popup presents the month title once while keeping its live heading relationship in the accessibility tree.

Penpot is now connected. I exported and compared all three approved page-61 boards with a stable Chrome/WebAssembly fixture capture; the capture waits for calendar animations to settle. The main anatomy aligns: live month heading, outlined 44 × 44 navigation controls, weekday row, 30 × 30 outlined day circles, selected day and footer. The previous and next arrows initially both pointed left because their source glyphs had different base directions. DateField styles now rotate both by -90 degrees, and the probe confirms the previous arrow points left and the next points right. The compact fixture popup measures 360 × 396 in a 764 × 429 viewport, compared with approximately 360 × 560 on the Penpot board; it fits the compact viewport with the month title visible and an internal scrollbar. Agent self-review on 2026-11-27 compared the compact popup with page 61 and found vertical-only scrolling appropriate for a constrained viewport under Fluent Popover guidance. Fixture captures remain evidence, not an approved product screenshot baseline.

The selection-mode board also shows three-column month and year grids. Their keyboard handlers previously moved vertically by four options; DateField now uses a three-option step for ArrowUp/ArrowDown while standalone Calendar keeps four. Chrome/WebAssembly confirmed both grids render 12 options in three columns and both vertical directions move focus by exactly three options. The responsive probe now passes 33/33 checks. The runtime grid checks alone do not establish page-61 parity or spoken screen-reader output; the separate agent page-61 review is recorded below. No human review is claimed.

## Popup placement

The latest Chrome/WebAssembly responsive and popup run passes 33/33 checks and retains seven screenshots, including three-column MonthSelect/YearSelect layout and vertical keyboard movement. Its 320 × 480 RTL edge case places the calendar within the viewport: popup bounds are x=27–315 and y=13–409; the trigger is x=90–138 and y=415–461. The case checks a bottom-edge trigger and right-edge pressure, with no overflow reproduced. It does not reveal a concrete placement defect that warrants another placement case at this checkpoint.

## Native Windows High Contrast

The Dev01 machine began with High Contrast disabled (`flags=126`, scheme `High Contrast Black`). I enabled the native Windows setting and inspected the open Edge calendar in both High Contrast Black and High Contrast White. In both schemes the calendar surface, text, boundary and focused-day indicator remained visible; the live heading stayed visually hidden. The focused day was visibly outlined in both schemes.

The original state was restored and verified: `flags=126`, `enabled=false`, scheme `High Contrast Black`. This is a local native OS visual check; it is not an accessibility certification.

## Migration comparison with 2.x

The existing 2.x package, source and consumer reference remain unchanged. The public DateField parameter names and signatures, four supported value types (`DateTime`, `DateTime?`, `DateOnly`, `DateOnly?`), and normal `InputBase<TValue>` binding contract do not require a mechanical migration.

Two behavior differences are relevant to consumers:

- The v3 parser now applies inclusive `Min`/`Max` bounds to manually typed values. The 2.x reference documents that parsing did not compare typed values with those limits. Inputs that previously committed an out-of-range date may now be rejected and reported through validation.
- The existing `DateClass` callback is now forwarded to calendar rendering through the DateOnly adapter. Calendar-date styling that previously had no established wrapper propagation can now take effect; callback dates are normalized to midnight.
- V3 rejects reversed bounds (`Min > Max`) with `ArgumentException`; the 2.x DateField and Calendar source on `origin/Dev` had no equivalent check, so an invalid-range configuration now fails fast instead of rendering an unusable calendar.

The v3 popup markup and ARIA relationships also differ and may affect application CSS or DOM selectors. No source or docs change to the released 2.x package is proposed. This is a local migration audit, not independent migration approval.

## Current-source follow-up — 2026-11-27

After the API-surface and binding-cascade refinements, the exact current source passed the Release solution build with 0 warnings and 0 errors, the full Release suite with 219/219 tests, and the compiled public API contract without changing its official snapshot. The contract check reports 140 public CLR component types and 795 declared component properties.

The isolated Chrome/WebAssembly DateField probe passed 35/35 checks with selection-grid and Chromium accessibility-tree checks enabled. It includes selected-day focus, Escape restoration to the trigger, and natural Tab exit. The live WebAssembly Component Lab run also passed the native DateField typing check and updated the bound date from 2026/10/18 to 2026/10/19. The Interaction Source Contract now passes 35/35 tests after its stale Calendar source assertions were aligned to the real awaitable controls. Exact-head hosted CI on `6ef93d7528675a22c6e81fa9bffd11df18b2f2d5` passed all 13 workflows on 2026-11-27, including the Real Browser Lab, Interaction Source Contract, Component Lab Pilot and Real Compatibility Browsers workflows; see [PR #569](https://github.com/vrassouli/Bluent/pull/569).

## Current Component Lab and documentation follow-up — 2026-11-27

The expanded DateField sample in `src/Bluent.UI.Demo.Pages/Pages/Components/ComponentLab.razor` now exercises Day/Month/Year selection, nullable and non-nullable DateTime/DateOnly, inclusive bounds with `DateClass` and parser feedback, `EndAddon` replacement and disabled state. The original Lab probe expected four DateField cards and two status messages; after the sample expanded to eight cards and four status messages, its stale cardinality assertions were updated. `python scripts/quality/check_v3_component_lab.py` passes its 18/18 source-linked pilot checks. `pwsh -NoProfile -File scripts/quality/run_v3_component_lab.ps1` rebuilt the current Debug WebAssembly demo and passed 289/289 Chrome checks; all 11 run-owned browser processes were cleaned, with 0 remaining. The docs contract has 0 findings, the Skills contract passes 6 reviewed files with 0 errors, and local Markdown links pass across 252 files. These checks validate the current local representative sample and documentation; they are not full DateField acceptance or hosted exact-head CI.

## Agent self-review status

The user directed the agent to complete the review without involving a human reviewer. I reviewed the current DateField, Calendar, picker and Popover source; the 2.x implementation on `origin/Dev`; the page-61 boards; and the retained current-source and historical browser evidence. The review found no concrete code, migration, visual-anatomy or popup-placement defect. This is an agent self-review, not a separate human approval. The fixture captures remain evidence and are not an approved screenshot baseline.

Spoken screen-reader acceptance remains unverified. Chromium accessibility-tree and Windows UI Automation snapshots do not establish spoken output; no screen-reader audio was captured in this session. The local native Windows High Contrast Black/White visual check is recorded above and does not constitute speech or accessibility certification.


## Follow-up visual parity review — 2026-11-27

Page 61 specifies the DateField popup without an arrow. The implementation had inherited Popover's default arrow, which added horizontal overflow to the calendar surface. DateField now sets `DisplayArrow="false"`. The updated Chrome/WebAssembly responsive run passes **33/33**, including an assertion that the popup has no arrow and `scrollWidth` does not exceed `clientWidth`; the fixture surface measures **360 × 396** at 764 × 429.

The live `/components/fields` route was inspected in Chrome at 1034 × 786 with the small calendar open; the surface measured **360 × 396**, without an arrow or horizontal scrollbar. The retained `BLUENT-DATEFIELD-PRODUCT-ROUTE-2026-11-27.png` instead shows the calendar closed and the unrelated NumericField `InvalidCastException` banner, so that file is context evidence only, not an open-popup image or approved baseline. The seven fixture screenshots also remain evidence captures. The page-61 board popup is about 360 × 560. The compact height is viewport-constrained and scrolls vertically; the Fluent 2 Popover guidance supports dimension constraints and scrolling overflow on preferably one axis. No horizontal overflow or placement defect was found.


## Final browser focus and evidence refresh — 2026-11-27

An InteractiveServer keyboard check exposed a focusout race: paging asynchronously replaces the focused month grid, and the previous observer treated that temporary focus loss as Tab exit and closed the popup before focus returned. `bluent.ui.calendar.js` now invokes `HandleCalendarTabExit` only after an actual Tab keydown followed by focusout, and clears that request after focusout or a short timeout. This preserves natural Tab exit while allowing month/year paging to finish. The probe waits for restored focus after paging.

An earlier local source revision passed the Chrome/Edge × WebAssembly/InteractiveServer matrix at **35/35 checks per cell (140/140 total)**. It covered PageUp/PageDown and Shift variants, Escape, Space open, natural Tab exit, selection-focus return, three-column month/year grids and three-option vertical movement, popup arrow/overflow behavior, and Chromium accessibility-tree names. Its four per-cell JSON reports were regenerated on 2026-11-27. This matrix predates the latest API-surface and binding-cascade refinements and is historical evidence, not an exact-source matrix. The separate responsive/popup run remains 33/33 with seven retained fixture screenshots.

On 2026-11-27, after the user confirmed Penpot availability, I exported and reviewed all three approved page-61 boards against the retained runtime captures. The master board’s heading, navigation, day-cell and footer anatomy align with the popup. The selection board’s three-column MonthSelect/YearSelect grids align with the tested 12-option layout and three-option vertical movement. The locale/accessibility board’s RTL field with left-to-right date text and viewport-contained edge behavior align with the retained RTL/edge captures. No concrete visual or popup-placement defect emerged. The fixture popup measures 360 × 396 at 764 × 429 and uses internal scrolling; the board shows approximately 360 × 560. The constrained-height behavior is consistent with Fluent 2 Popover guidance and stays within the available viewport. The closed-calendar Fields screenshot described above is context evidence only. QA fixture captures remain unapproved evidence, not a screenshot baseline.

The code and migration self-review is complete with no concrete finding. The user requested no human review; none was engaged, and no independent human sign-off is claimed. Spoken screen-reader acceptance remains open: Chromium AX and Windows UI Automation do not establish what Narrator or another screen reader speaks. The native Windows High Contrast Black/White visual check is recorded above and is not an accessibility certification.


## Fluent Design self-review — 2026-11-27

Fluent 2’s published component roadmap lists DatePicker as **Not Started** with a Research target, so I treated the approved Bluent page-61 boards as the component-specific visual contract and used Fluent 2’s general accessibility and Popover guidance for interaction and layout. The WAI-ARIA APG grid guidance informed the one-tab-stop/focus-management review. The APG Date Picker Dialog example is specifically modal; its focus containment is not applied to this non-modal Popover.

- The calendar surface has a dialog role and a stable accessible name linked to a live current-view heading. The grid keeps one eligible day in the tab sequence, supports managed arrow/Home/End/PageUp/PageDown focus movement, restores focus on Escape, and lets Tab leave naturally. This aligns with Fluent’s focus guidance and the APG grid model.
- The popup is arrow-free, anchored bottom-start, and constrained by the shared flip/shift behavior. The 320 × 480 RTL edge case stayed within the viewport. Under a short viewport the calendar uses vertical overflow only; no horizontal overflow was found. Fluent recommends constraining Popover dimensions and scrolling overflow, preferably on one axis.
- Migration review confirms unchanged parameter signatures, supported value types and InputBase<TValue> binding. Consumer-visible differences are typed Min/Max enforcement, DateClass forwarding, reversed-bound rejection, and picker DOM/ARIA changes that can affect selectors.
- No concrete visual, popup-placement, source-contract or migration defect was found. Spoken screen-reader output remains unverified; no human reviewer was involved or represented as having approved this self-review.

References: [Fluent 2 Accessibility](https://fluent2.microsoft.design/accessibility), [Fluent 2 Popover usage](https://fluent2.microsoft.design/components/web/react/core/popover/usage), [Fluent 2 component roadmap](https://fluent2.microsoft.design/component-roadmap/), [WAI-ARIA APG Grid Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/), and [WAI-ARIA APG Date Picker Dialog example](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/).