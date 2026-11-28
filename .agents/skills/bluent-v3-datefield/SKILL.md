# Bluent v3 DateField — #438 task handoff

> **In progress · design direction approved · implementation not accepted or merged · unreleased.** This Skill applies only to `v3/issue-438-datefield` targeting `bluent-v3`. The released 2.x DateField API and consumer guidance remain authoritative for shipped packages.

## Source of truth

1. [Canonical DateField v3 record](../../../docs/v3/components/date-field.md) for current API, examples and evidence limits.
2. [Issue #438](https://github.com/vrassouli/Bluent/issues/438) for scope and acceptance criteria.
3. Owned Penpot file **Bluent v3 Design System**, file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, page 61 `39bbee31-a6cb-801d-8008-feba6ea9ebf9`; boards `39bbee31-a6cb-801d-8008-febae0873e1e`, `39bbee31-a6cb-801d-8008-febb41bcbc3a`, `39bbee31-a6cb-801d-8008-febb591e6012`. Design direction is approved. Agent parity self-review on 2026-11-27 found no concrete visual or placement defect; screenshot captures remain evidence, not an approved baseline.
4. Source: `src/Bluent.UI/Components/DateFieldComponent/` and `src/Bluent.UI/Components/CalendarComponent/`.
5. Demo: `/components/fields` and interactive `/component-lab`; the DateField Component Lab sample now covers all modes, DateTime/DateOnly values, bounds, DateClass, parser feedback, EndAddon replacement and disabled state. Isolated QA fixtures: `/compatibility/datefield-probe` (WebAssembly) and `/compatibility/datefield-server` (InteractiveServer).
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

- Earlier local Chrome/Edge × WebAssembly/InteractiveServer matrix: **140/140** checks (35/35 per cell) on the source revision before the latest API-surface and binding-cascade refinements. Four per-cell reports are retained; this is historical evidence, not an exact-source matrix.
- Optional Chrome/WebAssembly responsive and popup run: **33/33** checks, including 320/390px Light/Dark LTR/RTL geometry, browser-emulated forced colors and reduced motion, a bottom-right RTL edge-popover case, an arrow-free popup with no horizontal overflow, settled animations, previous/next arrow directions, three-column MonthSelect/YearSelect layouts and three-option ArrowUp/ArrowDown movement; seven screenshot captures and the report are retained in docs/v3/quality/evidence/BLUENT-DATEFIELD-VISUAL/. Browser emulation is not native OS high-contrast verification.
- Native Windows High Contrast Black and White were visually checked in Edge with the calendar open. Text, boundary and focused-day indicator remained visible. The original disabled state and scheme were restored and verified. This is local visual evidence only.
- The duplicate visible heading was fixed with a scoped .sr-only rule in _calendar.scss, then regenerated into components.css and the shipped minified CSS. The live fixture now shows a single visible month title; this does not establish page 61 parity.
- Local migration review found no mechanical public API migration. V3 now rejects manually typed dates outside inclusive Min/Max and forwards existing DateClass callbacks. See [the parity/migration review](../../../docs/v3/quality/evidence/BLUENT-DATEFIELD-PARITY-MIGRATION-REVIEW-2026-11-26.md).
- Full Release build/test totals and focused test evidence are in the canonical record; do not repeat them without a reason.
- Use node scripts/quality/probe_v3_datefield.mjs <origin> with BLUENT_DATEFIELD_ROUTE and BLUENT_DATEFIELD_RENDER_MODE set for InteractiveServer runs. For the local demo host, include its /Bluent base path in the origin because the probe appends the fixture route directly. Set BLUENT_DATEFIELD_SELECTION_GRID_CHECK=1 to include the six DateField month/year grid checks.

- Earlier source checkpoint on 2026-11-27: Release build 0 warnings/errors, tests 219/219 and the DateField probe 35/35. This historical single-cell run is superseded by the 2026-11-28 current-source two-render-mode verification below.
## Agent self-review and remaining acceptance

Agent source, migration and page-61 self-review completed on 2026-11-27 at the verified source head. The user directed that no human reviewer be involved. The review used the three approved Penpot boards, current source, the 2.x source on `origin/Dev`, retained runtime captures, Fluent 2 accessibility/Popover guidance and WAI-ARIA APG grid guidance. No concrete visual, placement, public-contract or migration gap emerged. See the [parity and migration review](../../../docs/v3/quality/evidence/BLUENT-DATEFIELD-PARITY-MIGRATION-REVIEW-2026-11-26.md). This is an agent self-review, not a separate human approval.

The viewport-constrained 360 × 396 fixture popup uses vertical scrolling without horizontal overflow; this aligns with Fluent Popover guidance for constrained surfaces. The retained product-route image shows the calendar closed and a separate NumericField error, so it remains context evidence, not a clean product screenshot baseline. QA fixture screenshots are not approved baselines.

Spoken screen-reader output remains unverified. Chromium accessibility-tree and Windows UI Automation snapshots do not establish what Narrator or another screen reader speaks. Native Windows High Contrast Black/White visual checks passed locally and settings were restored; this is separate from spoken AT acceptance.

## Current-source verification — 2026-11-28

- Release solution build: 0 warnings / 0 errors; complete Release suite: 219/219.
- Current isolated DateField Chrome runs: WebAssembly 41/41 and production-published InteractiveServer 41/41 (82/82 combined), with Chromium AX-tree and selection-grid checks, no browser exceptions, and responsive/theme/RTL/forced-colors-emulation coverage. Twelve fixture captures are retained under docs/v3/quality/evidence/BLUENT-DATEFIELD-CURRENT-SOURCE-2026-11-28/ and BLUENT-DATEFIELD-INTERACTIVESERVER-2026-11-28/; their READMEs describe scope and limitations.
- Component Lab contract PASS (18/18 source-linked pilot families); live Chrome/WebAssembly Component Lab 289/289; owned browser cleanup 11/0; regression acceptance 12/12.
- Docs contract 0 findings; Skills contract 6 reviewed files / 0 errors; Markdown link scan 254 files.
- These are local current-source results. Exact-head hosted CI for the follow-up commit must be checked after push. Existing 13/13 hosted CI applies only to the previously pushed SHA 6ef93d7528675a22c6e81fa9bffd11df18b2f2d5.
- No human reviewer is claimed, consistent with the user's instruction. Spoken Narrator/NVDA/VoiceOver output remains unverified; AX/UIA snapshots are not spoken-output evidence. The component remains unreleased and the 2.x consumer reference remains authoritative for shipped packages.