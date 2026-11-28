# Bluent v3 DateField — #438 task handoff

> **Review · agent technical self-review complete · PR open/unmerged · unreleased.** This Skill applies only to `v3/issue-438-datefield` targeting `bluent-v3`. The released 2.x DateField API and consumer guidance remain authoritative for shipped packages.

## Source of truth

1. [Canonical DateField v3 record](../../../docs/v3/components/date-field.md) for current API, examples and evidence limits.
2. [Issue #438](https://github.com/vrassouli/Bluent/issues/438) for scope and acceptance criteria.
3. Owned Penpot file **Bluent v3 Design System**, file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, page 61 `39bbee31-a6cb-801d-8008-feba6ea9ebf9`; boards `39bbee31-a6cb-801d-8008-febae0873e1e`, `39bbee31-a6cb-801d-8008-febb41bcbc3a`, `39bbee31-a6cb-801d-8008-febb591e6012`. Design direction is approved. Agent parity self-review on 2026-11-27 found no concrete visual or placement defect; screenshot captures remain evidence, not an approved baseline.
4. Source: `src/Bluent.UI/Components/DateFieldComponent/` and `src/Bluent.UI/Components/CalendarComponent/`.
5. Demo: `/components/fields` and interactive `/component-lab`; the DateField Component Lab sample now covers all modes, DateTime/DateOnly values, Small/Medium/Large sizes, StartAddon/EndAddon composition, bounds, DateClass, parser feedback and disabled state. Isolated QA fixtures: `/compatibility/datefield-probe` (WebAssembly) and `/compatibility/datefield-server` (InteractiveServer).
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

The viewport-constrained 360 × 396 fixture popup uses vertical scrolling without horizontal overflow; this aligns with Fluent Popover guidance for constrained surfaces. A clean product-context screenshot is now retained from the actual interactive /component-lab route, with the DaySelect calendar open and all eight DateField pilot specimens visible; see the capture metadata at ../../../docs/v3/quality/evidence/BLUENT-DATEFIELD-PRODUCT-CONTEXT-2026-11-28.md. It is an agent capture, not separate human approval. The canonical /components/fields showcase still has an unrelated NumericField<float> cast failure.

A targeted Windows Narrator + Chrome spoken-output smoke is documented at ../../../docs/v3/quality/evidence/BLUENT-DATEFIELD-NARRATOR-SPEECH-2026-11-28.md: Narrator announced the non-modal October 2026 dialog, 6×7 grid, selected date and visible date cells; after Escape it announced the collapsed Choose a date trigger, and UIA confirmed focus returned. Narrator spoke the focused DaySelect field label/value (Day selection (DateTime), 2026/10/18) and captured ArrowRight moving focus from 18 to 19 October. UIA verified the four-direction sequence 18→19→26→25→18. NVDA and VoiceOver were not run. Chromium AX and UIA snapshots alone are not speech evidence. Native Windows High Contrast Black/White visual checks passed locally and settings were restored.

## Current-source verification — 2026-11-28

- Release solution build: 0 warnings / 0 errors; complete Release suite: 219/219.
- Current isolated DateField Chrome runs: WebAssembly 41/41 and production-published InteractiveServer 41/41 (82/82 combined), with Chromium AX-tree and selection-grid checks, no browser exceptions, and responsive/theme/RTL/forced-colors-emulation coverage. Twelve fixture captures are retained under docs/v3/quality/evidence/BLUENT-DATEFIELD-CURRENT-SOURCE-2026-11-28/ and BLUENT-DATEFIELD-INTERACTIVESERVER-2026-11-28/; their READMEs describe scope and limitations.
- Component Lab contract PASS (18/18 source-linked pilot families); live Chrome/WebAssembly Component Lab 290/290; owned browser cleanup 11/0; regression acceptance 12/12.
- Docs contract 0 findings; Skills contract 6 reviewed files / 0 errors; Markdown link scan 257 files.
- These local results are complemented by exact-head hosted CI on 36dea74a043d5b63e11f1506ccf75c5e95fc36cf: 13/13 workflows passed after retrying the transient NumericField / Chrome / Server forced-colors job. The product-context and Narrator evidence follow-up is included in commit 84e5bd08b1cd516faa6936e90d320260adc43836; exact-head hosted CI passed 13/13.
- No human reviewer is claimed, consistent with the user's instruction. A targeted Narrator/Chrome smoke confirms field label/value, popup open-close speech and ArrowRight spoken date-change feedback. UIA confirms the complete four-direction day-focus sequence. NVDA and VoiceOver remain untested; this is not cross-screen-reader certification. The component remains unreleased and the 2.x consumer reference remains authoritative for shipped packages.

## Review-ready acceptance checkpoint — 2026-11-28

- Exact task head: `cc6d062660660f2284ea204d4166fb24ce1c6b6e`; PR #569 targets `bluent-v3`; exact-head hosted CI 13/13 succeeded.
- Complete inherited/public API inventory, runnable/non-interactive classification, demo/fixture map, Fluent 2/APG crosswalk and known limitations: [DateField public API and acceptance coverage](../../../docs/v3/quality/evidence/BLUENT-DATEFIELD-PUBLIC-API-COVERAGE-2026-11-28.md).
- Current verification: Release build 0 warnings/errors; .NET tests 219/219; DateField Chrome/WASM 41/41 and production-published InteractiveServer 41/41; Component Lab 290/290, acceptance regressions 12/12; docs 0 findings; Skills 6 files / 0 errors; Markdown links 257 files.
- The eight-card demo exercises all three precision modes, all four supported value/nullability shapes, three size tiers, both addon paths, event timing, bounds, DateClass, validation/parsing feedback, disabled and native-attribute paths. The #421 Component Lab census retains `representative_only`; #438 acceptance is tracked in its own matrix.
- Agent technical review found no concrete code, public-contract, parser/range, focus/Popover, visual-placement or migration blocker. This does not constitute independent human approval.
- NVDA and VoiceOver remain untested. Narrator/Chrome speech and Windows UIA evidence is targeted only and must not be represented as cross-screen-reader certification.
- Do not mark Done or merge until PR #569 is accepted and merged into `bluent-v3`; never merge to stable `Dev`/`main`, publish, release or deploy as part of this issue.
