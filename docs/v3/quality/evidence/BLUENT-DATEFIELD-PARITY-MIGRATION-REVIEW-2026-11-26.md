# DateField parity, native contrast and migration review (#438)

Updated: 2026-11-27 (review opened 2026-11-26)
Branch: `v3/issue-438-datefield`
Recorded base head: `add8d519a75432a9a990a4dafbed06aa33590356`
Review state: draft PR #569; targeted local checks pass; exact-head CI and independent acceptance pending.

## Penpot page 61 and screenshot findings

The approved design source is the Bluent v3 Design System Penpot file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, page 61 `39bbee31-a6cb-801d-8008-feba6ea9ebf9`, boards `39bbee31-a6cb-801d-8008-febae0873e1e`, `39bbee31-a6cb-801d-8008-febb41bcbc3a`, and `39bbee31-a6cb-801d-8008-febb591e6012`. The design direction is approved; implementation parity is still an open acceptance gate.

The seven retained screenshots in [the responsive evidence folder](BLUENT-DATEFIELD-VISUAL/) come from the intentionally unlinked /compatibility/datefield-probe QA fixture. They show DateTime and DateOnly samples without the production Fields showcase context, and remain evidence captures rather than an approved screenshot baseline. The production Fields route also has an unrelated NumericField rendering exception, so the isolated fixture is appropriate for behavior checks but cannot stand in for a design-approved product-context capture.

A live fixture inspection found that the current-view heading was initially duplicated. A scoped visually-hidden rule was added to _calendar.scss and compiled into components.css and bluent.ui.components.min.css. The corrected popup presents the month title once while keeping its live heading relationship in the accessibility tree.

Penpot is now connected. I exported and compared all three approved page-61 boards with a stable Chrome/WebAssembly fixture capture; the capture waits for calendar animations to settle. The main anatomy aligns: live month heading, outlined 44 × 44 navigation controls, weekday row, 30 × 30 outlined day circles, selected day and footer. The previous and next arrows initially both pointed left because their source glyphs had different base directions. DateField styles now rotate both by -90 degrees, and the probe confirms the previous arrow points left and the next points right. The compact fixture popup measures 360 × 396 in a 764 × 429 viewport, compared with approximately 360 × 560 on the Penpot board; it fits the compact viewport with the month title visible and an internal scrollbar. This size and scroll difference still needs independent review in product context. Fixture captures are not an approved baseline.

The selection-mode board also shows three-column month and year grids. Their keyboard handlers previously moved vertically by four options; DateField now uses a three-option step for ArrowUp/ArrowDown while standalone Calendar keeps four. Chrome/WebAssembly confirmed both grids render 12 options in three columns and both vertical directions move focus by exactly three options. The responsive probe now passes 33/33 checks. This does not establish independent visual or accessibility acceptance.

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

The v3 popup markup and ARIA relationships also differ and may affect application CSS or DOM selectors. No source or docs change to the released 2.x package is proposed. This is a local migration audit, not independent migration approval.

## Current-source follow-up — 2026-11-27

After the API-surface and binding-cascade refinements, the exact current source passed the Release solution build with 0 warnings and 0 errors, the full Release suite with 219/219 tests, and the compiled public API contract without changing its official snapshot. The contract check reports 140 public CLR component types and 795 declared component properties.

The isolated Chrome/WebAssembly DateField probe passed 35/35 checks with selection-grid and Chromium accessibility-tree checks enabled. It includes selected-day focus, Escape restoration to the trigger, and natural Tab exit. The live WebAssembly Component Lab run also passed the native DateField typing check and updated the bound date from 2026/10/18 to 2026/10/19. The exact-head hosted browser matrix remains pending.

## Acceptance still required

- Independent visual acceptance must confirm the page-61 comparison findings and accept a real product-context capture; the QA-fixture captures are not a baseline.
- Spoken screen-reader acceptance remains open. Chromium accessibility-tree and Windows UI Automation snapshots do not establish what Narrator or another screen reader speaks, and no audio/listener verification is available in this session.
- Exact-head hosted CI, independent code review and independent migration approval remain outstanding.


## Follow-up visual parity review — 2026-11-27

Page 61 specifies the DateField popup without an arrow. The implementation had inherited Popover's default arrow, which added horizontal overflow to the calendar surface. DateField now sets `DisplayArrow="false"`. The updated Chrome/WebAssembly responsive run passes **33/33**, including an assertion that the popup has no arrow and `scrollWidth` does not exceed `clientWidth`; the fixture surface measures **360 × 396** at 764 × 429.

I also inspected the real `/components/fields` route in Chrome at 1034 × 786 with the small DateField calendar open. The product-context surface measured **360 × 396** and showed neither an arrow nor a horizontal scrollbar. The Fields page still displays its unrelated NumericField `InvalidCastException` error banner below the DateField section. A product-route capture is retained as `BLUENT-DATEFIELD-PRODUCT-ROUTE-2026-11-27.png`; it includes the unrelated NumericField error, so it is context evidence rather than a clean or approved screenshot baseline. The seven fixture screenshots also remain review evidence only. The board's popup is approximately 360 × 560; the product-context height is constrained by the trigger's available viewport space. Independent visual acceptance still needs to confirm the height behavior and accept a clean product-context baseline.


## Final browser focus and evidence refresh — 2026-11-27

An InteractiveServer keyboard check exposed a focusout race: paging asynchronously replaces the focused month grid, and the previous observer treated that temporary focus loss as Tab exit and closed the popup before focus returned. `bluent.ui.calendar.js` now invokes `HandleCalendarTabExit` only after an actual Tab keydown followed by focusout, and clears that request after focusout or a short timeout. This preserves natural Tab exit while allowing month/year paging to finish. The probe waits for restored focus after paging.

An earlier local source revision passed the Chrome/Edge × WebAssembly/InteractiveServer matrix at **35/35 checks per cell (140/140 total)**. It covered PageUp/PageDown and Shift variants, Escape, Space open, natural Tab exit, selection-focus return, three-column month/year grids and three-option vertical movement, popup arrow/overflow behavior, and Chromium accessibility-tree names. Its four per-cell JSON reports were regenerated on 2026-11-27. This matrix predates the latest API-surface and binding-cascade refinements and is historical evidence, not an exact-source matrix. The separate responsive/popup run remains 33/33 with seven retained fixture screenshots.

The page-61 comparison remains a local parity record, not independent acceptance. On 2026-11-27, after the user confirmed Penpot availability, all three approved boards were exported and reviewed alongside the retained runtime captures. The master board’s heading, navigation, day-cell and footer anatomy aligns with the reviewed popup. The selection board specifies three-column MonthSelect and YearSelect grids; their 12-option geometry and three-option vertical movement were covered by the earlier 140/140 browser matrix and 33/33 responsive run. The locale/accessibility board specifies an RTL Persian field with left-to-right date text and responsive edge placement; the retained RTL and edge captures align with those expectations. No concrete visual or popup-placement defect emerged in the reviewed evidence. The fixture popup measures 360 × 396 at 764 × 429 and uses internal scrolling, compared with approximately 360 × 560 on the master board; independent product-context acceptance of this viewport-constrained height remains open. The retained /components/fields screenshot at 1034 × 786 shows the calendar closed and the unrelated NumericField error banner, so it is context evidence only. The QA fixture captures remain evidence and are not an approved screenshot baseline.

Spoken screen-reader acceptance remains open. Chromium accessibility-tree and Windows UI Automation snapshots do not establish what Narrator or another screen reader speaks. Exact-head hosted CI, independent code review and independent migration approval also remain outstanding. The local native Windows High Contrast Black/White visual check is recorded above and does not constitute accessibility certification.
