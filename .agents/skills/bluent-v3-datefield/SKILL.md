# Bluent v3 DateField — #438 task handoff

> **In progress · design direction approved · implementation not accepted or merged · unreleased.** This Skill applies only to `v3/issue-438-datefield` targeting `bluent-v3`. The released 2.x DateField API and consumer guidance remain authoritative for shipped packages.

## Source of truth

1. [Canonical DateField v3 record](../../../docs/v3/components/date-field.md) for current API, examples and evidence limits.
2. [Issue #438](https://github.com/vrassouli/Bluent/issues/438) for scope and acceptance criteria.
3. Owned Penpot file **Bluent v3 Design System**, file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, page 61 `39bbee31-a6cb-801d-8008-feba6ea9ebf9`; boards `39bbee31-a6cb-801d-8008-febae0873e1e`, `39bbee31-a6cb-801d-8008-febb41bcbc3a`, `39bbee31-a6cb-801d-8008-febb591e6012`. The design direction is approved; runtime parity and visual acceptance remain open.
4. Source: `src/Bluent.UI/Components/DateFieldComponent/` and `src/Bluent.UI/Components/CalendarComponent/`.
5. Demo: `/components/fields`; isolated QA fixtures: `/compatibility/datefield-probe` (WebAssembly) and `/compatibility/datefield-server` (InteractiveServer).
6. [Migration impact ledger](../../../docs/v3/design/MIGRATION-IMPACT-LEDGER.md), [v3 component router](../bluent-v3/COMPONENT-ROUTER.md), and the [2.x consumer reference](../../../docs/components/date-field.md).

## Source-backed contract

- `DateField<TValue>` supports `DateTime`, `DateTime?`, `DateOnly` and `DateOnly?`, and inherits typed binding and `EditContext` validation from `InputBase<TValue>`.
- `Mode` supports `DaySelect` (default), `MonthSelect` and `YearSelect`. The text is year-first (`yyyy/MM/dd`, `yyyy/MM` or `yyyy`), with the active culture's date separator.
- `Culture` controls date formatting and calendar behavior, including calendars with 13 months in leap years. `Min` and `Max` are inclusive and apply to typed input and picker selection.
- A supplied `EndAddon` replaces the default calendar picker. Consumer code supplies the associated label and supporting text.
- Preserve the non-modal Popover dialog and current heading relationship. Anchor it bottom-start without an arrow; let the shared Popover flip and shift within viewport bounds. Do not add a custom calendar popup or assume Fluent React/Web Components DOM or popup-pixel parity.

## Keyboard, focus and direction

- The month grid exposes one selected eligible day in the tab sequence; arrow keys move day focus.
- DateField MonthSelect and YearSelect grids render three columns; ArrowUp/ArrowDown move focus by three options. The shared standalone Calendar retains its four-column movement.
- Escape closes the calendar and restores trigger focus. Tab exits naturally without a focus trap.
- Keep date segments left-to-right while the surrounding field and messages follow host direction.
- DOM assertions and rendered ARIA attributes do not establish spoken screen-reader output or accessibility certification.

## Verification checkpoint

- Local Chrome/Edge × WebAssembly/InteractiveServer browser matrix: **140/140** checks (35/35 per cell), including DateTime and DateOnly selection, focus restoration after asynchronous month/year changes, keyboard paging and grid movement, 320px fit and Chromium accessibility-tree names for both inputs plus the calendar dialog/grid. Four refreshed JSON reports are retained at `docs/v3/quality/evidence/BLUENT-DATEFIELD-*.json`.
- Optional Chrome/WebAssembly responsive and popup run: **33/33** checks, including 320/390px Light/Dark LTR/RTL geometry, browser-emulated forced colors and reduced motion, a bottom-right RTL edge-popover case, an arrow-free popup with no horizontal overflow, settled animations, previous/next arrow directions, three-column MonthSelect/YearSelect layouts and three-option ArrowUp/ArrowDown movement; seven screenshot captures and the report are retained in docs/v3/quality/evidence/BLUENT-DATEFIELD-VISUAL/. Browser emulation is not native OS high-contrast verification.
- Native Windows High Contrast Black and White were visually checked in Edge with the calendar open. Text, boundary and focused-day indicator remained visible. The original disabled state and scheme were restored and verified. This is local visual evidence only.
- The duplicate visible heading was fixed with a scoped .sr-only rule in _calendar.scss, then regenerated into components.css and the shipped minified CSS. The live fixture now shows a single visible month title; this does not establish page 61 parity.
- Local migration review found no mechanical public API migration. V3 now rejects manually typed dates outside inclusive Min/Max and forwards existing DateClass callbacks. See [the parity/migration review](../../../docs/v3/quality/evidence/BLUENT-DATEFIELD-PARITY-MIGRATION-REVIEW-2026-11-26.md).
- Full Release build/test totals and focused test evidence are in the canonical record; do not repeat them without a reason.
- Use `node scripts/quality/probe_v3_datefield.mjs <origin>` with `BLUENT_DATEFIELD_ROUTE` and `BLUENT_DATEFIELD_RENDER_MODE` set for InteractiveServer runs. Set `BLUENT_DATEFIELD_SELECTION_GRID_CHECK=1` to include the six DateField month/year grid checks.

## Remaining acceptance

Independent acceptance of the page-61 parity findings and a clean product-context screenshot baseline, spoken screen-reader acceptance, exact-head hosted CI, independent code review and independent migration review remain open. On 2026-11-27, after the user confirmed Penpot was available, all three page-61 boards were exported and reviewed against retained runtime captures. The master board’s heading, navigation, day-cell and footer anatomy aligns with the reviewed popup; the selection board’s three-column MonthSelect and YearSelect grids are supported by the 140/140 matrix and 33/33 responsive run; and the locale/accessibility board’s RTL field with left-to-right date text and viewport-contained edge behavior align with the retained captures. No concrete visual or placement defect emerged in the reviewed evidence. The fixture popup measures 360 × 396 at 764 × 429 and uses internal scrolling, while the master board is approximately 360 × 560; independent product-context acceptance of this viewport-constrained height remains open. Fixture screenshots are evidence, not an approved baseline. The retained /components/fields screenshot at 1034 × 786 shows the calendar closed and an unrelated NumericField error, so it is context evidence only. Browser forced-colors emulation is not native OS high-contrast verification. A local native Windows Black/White visual check is recorded separately. Chromium accessibility-tree and UI Automation snapshots do not establish spoken screen-reader output.
