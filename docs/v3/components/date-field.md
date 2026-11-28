# DateField — v3 implementation record (#438)

> **Review · PR #569 open/unmerged · unreleased v3 task branch.** This page records the current source on `v3/issue-438-datefield` targeting `bluent-v3`. It is not released consumer guidance. The existing [2.x DateField reference](../../components/date-field.md) remains authoritative for shipped packages.

## Identity and design status

| Field | Verified value |
| --- | --- |
| Issue / branch | [#438](https://github.com/vrassouli/Bluent/issues/438) · `v3/issue-438-datefield` → `bluent-v3` |
| Package / namespace | `Bluent.UI` · `Bluent.UI.Components` |
| Source | `src/Bluent.UI/Components/DateFieldComponent/` and `CalendarComponent/` |
| Demo | `/components/fields`; isolated QA routes `/compatibility/datefield-probe` (WebAssembly) and `/compatibility/datefield-server` (InteractiveServer) |
| Design | Penpot file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, page 61 `39bbee31-a6cb-801d-8008-feba6ea9ebf9` |
| Boards | `39bbee31-a6cb-801d-8008-febae0873e1e`, `39bbee31-a6cb-801d-8008-febb41bcbc3a`, `39bbee31-a6cb-801d-8008-febb591e6012` |
| Design gate | **DESIGN APPROVED · AGENT SELF-REVIEW COMPLETE**; actual interactive Component Lab product capture retained; targeted Narrator popup speech smoke recorded. Narrator spoke the focused DaySelect field label/value and the ArrowRight move from 18 to 19 October. A real four-direction ArrowRight/Down/Left/Up sequence moved focus 18→19→26→25→18 October, confirmed with Windows UIA. NVDA and VoiceOver remain untested; no independent human sign-off is claimed |

## Source-backed API

**Complete public API, inherited-member, runnable-scenario and non-interactive classification:** [DateField public API and acceptance coverage](../quality/evidence/BLUENT-DATEFIELD-PUBLIC-API-COVERAGE-2026-11-28.md). The wider #421 Component Lab row remains `representative_only`; it must not be confused with the dedicated #438 acceptance matrix.

`DateField<TValue>` inherits the shared Bluent field and `InputBase<TValue>` binding contract. Supported `TValue` types are `DateTime`, `DateTime?`, `DateOnly` and `DateOnly?`.

| Member | Origin | Current behavior |
| --- | --- | --- |
| `Value`, `ValueChanged`, `ValueExpression`, `EditContext` | `InputBase<TValue>` | Typed binding and form validation |
| `Mode` | DateField | `DaySelect` (default), `MonthSelect` or `YearSelect` |
| `Culture` | DateField | Uses culture date formatting and calendar; defaults to `CultureInfo.CurrentUICulture` |
| `Min`, `Max` | DateField | Inclusive date bounds; time-of-day is ignored |
| `DateClass` | DateField | `Func<DateTime, string>`; dates are passed at midnight |
| `DisplayCalendar` | DateField | Defaults to `true`; `false` hides the picker |
| `ParsingErrorMessage` | DateField | Overrides localized parse error text |
| `Size`, `StartAddon`, `EndAddon`, `BindValueEvent`, `Class`, `Style` | Shared field base | Common sizing, composition, binding event and styling |
| Native input attributes | Shared field base | Consumer attributes are applied to the text input |

A supplied `EndAddon` replaces the default calendar picker. The consumer supplies the associated label and supporting text.

## Value format and range behavior

The input presents year first: `yyyy/MM/dd`, `yyyy/MM` or `yyyy`, depending on mode. The slash format token uses the active culture's date separator; the order remains year/month/day. The text input is explicitly left-to-right so numeric segments remain ordered in an RTL page.

`Culture.DateTimeFormat.Calendar` determines valid years, months and days, including calendars with 13 months in leap years. Nullable values accept empty input; non-nullable values do not. `DateTime` values commit at midnight, and `DateOnly` values remain `DateOnly`.

Bounds apply to manual parsing and calendar selection. A month or year is valid when some date within that period intersects the inclusive bounds; selecting a partial period resolves to its first valid date. Calendar days outside the range are disabled, and periods with no valid dates are disabled. Reversed bounds throw `ArgumentException`.

## Calendar and picker interaction

The picker is a non-modal Popover dialog anchored bottom-start without an arrow; the shared Popover flips and shifts within viewport bounds, and the surface scrolls vertically when space is constrained. Its accessible name references a visually hidden current-view heading with `aria-live="polite"`; the heading follows the displayed month/year or year range. The month view uses a native table with `role="grid"`. Day buttons expose explicit `aria-pressed="true|false"`, and one eligible day is in the tab sequence.

The implementation opens focus inside the calendar, supports arrow-key day movement, closes on Escape and returns focus to the trigger. Tab exits naturally; the popup does not trap focus. The four-cell browser matrix covers these behaviors and pointer selection in both DateTime and DateOnly fields. The DateField MonthSelect and YearSelect grids each render 12 options in three columns; ArrowUp/ArrowDown move by three options. The shared standalone Calendar retains its four-column step.

## Demo and browser fixture

- Existing Fields showcase: `/components/fields` in `src/Bluent.UI.Demo.Pages/Pages/Components/Fields.razor`; it demonstrates nullable DateTime binding, size, `BindValueEvent`, disabled state and MonthSelect.
- Interactive component examples: `/component-lab` in `ComponentLab.razor`; the DateField sample now demonstrates Day/Month/Year selection, DateTime/DateOnly values (nullable and non-nullable), inclusive bounds, `DateClass`, parse feedback, `EndAddon` replacement, disabled state and native attributes. It remains a representative Component Lab sample; the canonical DateField page and QA evidence describe the complete contract.
- Intentionally unlinked QA fixture: `/compatibility/datefield-probe` in `DateFieldBrowserProbe.razor`; it isolates DateTime and DateOnly fields from unrelated showcase components.
- Browser script: `scripts/quality/probe_v3_datefield.mjs`.

The mixed Fields showcase logs a separate `NumericField<float>` InvalidCastException from `NumericFieldValuePipeline.TryStep` during rendering. This is outside #438. Browser selection evidence therefore uses the isolated DateField route, which produced no uncaught browser errors.

## Validation evidence

| Gate | Result |
| --- | --- |
| `DateFieldCalendarRenderSemanticsTests` | 8/8 passed, including live heading and explicit ARIA token values |
| `DateFieldValueParserTests` | Included in the full suite; covers DateTime/DateOnly, limits, all three modes and Hebrew 13-month calendar |
| Full Release build | `dotnet build Bluent.sln --configuration Release --no-restore -warnaserror`: 0 warnings, 0 errors |
| Full Release tests | `dotnet test Bluent.sln --configuration Release --no-build --no-restore`: 219/219 passed |
| Historical four-cell browser matrix | Chrome/Edge × WebAssembly/InteractiveServer: 140/140 checks (35 per cell) on the source before the latest API/binding refinements; not an exact-current-source matrix. Per-cell reports are retained under `docs/v3/quality/evidence/BLUENT-DATEFIELD-*.json` |
| Earlier Chrome/WebAssembly probe | 35/35 on 2026-11-27; superseded by the 2026-11-28 41/41 current-source probe recorded below |
| Component Lab DateField source contract | `python scripts/quality/check_v3_component_lab.py`: PASS; 18/18 source-linked pilot families; no full-component acceptance claim |
| Component Lab live run | `pwsh -NoProfile -File scripts/quality/run_v3_component_lab.ps1`: current Debug WebAssembly build and Chrome run passed 290/290 checks after adding a live assertion for Small/Medium/Large sizing and StartAddon; 11 run-owned browsers cleaned, 0 remaining. The expanded DateField sample has eight cards and four English status messages; stale count expectations were corrected in the probe. This is representative Lab evidence, not full #438 acceptance |
| Documentation follow-up | Docs contract: 0 findings; Skills contract: 6 reviewed files, 0 errors; local Markdown links: 257 files |
| Historical responsive and popup geometry | Chrome/WebAssembly run: 33/33 on an earlier source revision, across 320/390px Light/Dark LTR/RTL layouts, browser-emulated forced colors/reduced motion, three-column MonthSelect/YearSelect grids and a 320px RTL edge-popover case; seven PNGs and details are retained in [the visual report](../quality/evidence/BLUENT-DATEFIELD-VISUAL.json) |

The historical four-cell matrix covered page load, typed values, field and dialog/grid names, selected-day state, initial focus, arrow/Home/End/PageUp/PageDown movement, Space open, Escape focus restoration, natural Tab exit, DateTime and DateOnly selection, 320px fit, three-column MonthSelect/YearSelect grids, arrow direction and clean browser runtime. InteractiveServer focus restoration after asynchronous month/year changes was included.

The four-cell Chrome/Edge × WebAssembly/InteractiveServer matrix and 33/33 responsive run are historical evidence from before the latest API-surface and binding-cascade refinements; neither is an exact-source matrix. The four JSON reports were refreshed on 2026-11-27. Browser forced-colors/reduced-motion emulation does not establish native OS contrast behavior.

Exact-head hosted CI on commit 36dea74a043d5b63e11f1506ccf75c5e95fc36cf passed all 13 workflows on 2026-11-28 after retrying the transient NumericField / Chrome / Server forced-colors job. The product-context and Narrator evidence follow-up is included in exact-head commit 84e5bd08b1cd516faa6936e90d320260adc43836, whose hosted CI passed 13/13. The source/runtime and documentation checks on this working tree pass locally, but do not replace hosted exact-head CI. On 2026-11-27, all three page-61 boards were exported and reviewed against runtime captures. The master board’s heading, navigation, day-cell and footer anatomy align with the popup. The selection board’s three-column MonthSelect and YearSelect grids align with the historical 140/140 matrix and 33/33 responsive run. The locale/accessibility board’s RTL field with left-to-right date text and viewport-contained edge behavior align with retained captures. The agent self-review found no concrete visual or placement defect. The fixture popup measures 360 × 396 at 764 × 429 and uses internal vertical scrolling, compared with approximately 360 × 560 on the master board; this is consistent with Fluent Popover guidance for a constrained viewport. Fixture screenshots are evidence, not an approved screenshot baseline. The retained `/components/fields` screenshot at 1034 × 786 shows the calendar closed and an unrelated NumericField error, so it is context evidence only. Native Windows High Contrast Black/White visual checks were completed and the original setting restored. Browser emulation, Chromium accessibility-tree and UI Automation snapshots do not establish spoken screen-reader output.
## 2.x compatibility boundary

This is a work-in-progress v3 implementation record, not an approved migration guide. The 2.x source, package and [2.x DateField documentation](../../components/date-field.md) remain unchanged. The local migration audit found no mechanical public API migration: parameter names/signatures, supported value types and the InputBase<TValue> binding contract remain. V3 does change manual parsing to enforce inclusive Min/Max bounds, forwards the existing DateClass callback into calendar rendering through the DateOnly adapter, and throws `ArgumentException` when `Min > Max` (the 2.x source on `origin/Dev` had no reversed-bound check). Consumers relying on out-of-range text commits or invalid reversed-range configurations should re-check those values; consumers relying on popup DOM selectors should review the v3 markup. The agent migration self-review found no other migration gap.


## Fluent Design self-review — 2026-11-27

The current Fluent 2 roadmap lists DatePicker as Not Started with a Research target, so this review used page 61 as the component-specific visual contract and Fluent 2 general accessibility/Popover guidance for interaction and layout. WAI-ARIA APG grid guidance informed the one-tab-stop and managed-focus review. The APG Date Picker Dialog example is explicitly modal; its focus containment does not apply to this non-modal Popover.

The named dialog uses a stable live heading; the grid has one eligible day tab stop and managed keyboard movement, Escape restores trigger focus, and Tab exits naturally. Popup placement is arrow-free, bottom-start with shared flip/shift, and scrolls vertically when constrained. The 320 × 480 RTL edge case stayed in the viewport without horizontal overflow. The Fluent 2 Popover guidance recommends constrained dimensions and scrolling overflow, ideally on a single axis. The migration audit confirms unchanged direct parameters, supported types and the InputBase<TValue> binding; the reviewed behavior changes are typed range enforcement, DateClass forwarding, reversed-range rejection and DOM/ARIA selector differences. No concrete visual, source-contract or migration gap was found. This is an agent self-review; no human review or independent approval is claimed. A targeted Narrator popup and DaySelect label/value smoke is recorded; ArrowRight spoken date-change feedback and the four-direction focus sequence are now verified. NVDA and VoiceOver remain untested.

References: [Fluent 2 Accessibility](https://fluent2.microsoft.design/accessibility), [Fluent 2 Popover usage](https://fluent2.microsoft.design/components/web/react/core/popover/usage), [Fluent 2 component roadmap](https://fluent2.microsoft.design/component-roadmap/), [WAI-ARIA APG Grid Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/), and [WAI-ARIA APG Date Picker Dialog example](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/).
## Current-source verification — 2026-11-28

The latest working-tree source was rebuilt and verified after the DateField Component Lab expansion and QA-source-contract correction:

| Gate | Current result |
| --- | --- |
| Release solution build | 0 warnings, 0 errors (dotnet build Bluent.sln --configuration Release --no-restore -warnaserror) |
| Full Release tests | 219/219 (dotnet test Bluent.sln --configuration Release --no-build --no-restore) |
| Focused calendar render semantics | 8/8, included in the full suite |
| DateField Chrome / WebAssembly | 41/41, 0 browser exceptions |
| DateField Chrome / production-published InteractiveServer | 41/41, 0 browser exceptions |
| DateField current-source browser total | 82/82 across both render modes |
| Component Lab source/evidence contract | PASS; 18/18 source-linked pilot families; no completion claim for the other pilot specimens |
| Component Lab Chrome / WebAssembly runtime | 290/290 after the added StartAddon and size specimen assertion; cleanup 11 owned browser processes, 0 remaining |
| Component Lab acceptance regression tests | 12/12 |
| Docs contract | 0 findings |
| Skills contract | 6 reviewed files, 0 errors |
| Markdown links | 257 files |

Both 41-check DateField runs use the isolated current-source fixtures, and include Chromium accessibility-tree names for the fields, dialog and grid; day-grid focus, selection, keyboard movement, Escape restoration and natural Tab exit; DateTime/DateOnly selection; three-column MonthSelect/YearSelect navigation; responsive 320px/390px layouts; Light/Dark LTR/RTL; browser-emulated forced-colors/reduced-motion; and no horizontal overflow. The twelve fixture PNG captures are retained in:
- WebAssembly evidence: quality/evidence/BLUENT-DATEFIELD-CURRENT-SOURCE-2026-11-28/README.md
- InteractiveServer evidence: quality/evidence/BLUENT-DATEFIELD-INTERACTIVESERVER-2026-11-28/README.md

Native Windows High Contrast Black/White visual checks were also previously completed with settings restored. The browser forced-colors setting is only emulation. A targeted Windows Narrator + Chrome Speech Recap smoke and four-direction keyboard-navigation run are now recorded for the real DaySelect popup: Narrator announced the October 2026 dialog, 6×7 table, selected Sunday 18 October 2026 and visible cell dates; after Escape it announced the collapsed Choose a date trigger, and Windows UI Automation confirmed trigger focus returned. See the Narrator Speech Recap report at ../quality/evidence/BLUENT-DATEFIELD-NARRATOR-SPEECH-2026-11-28.md. Narrator spoke the focused DaySelect field label and value (Day selection (DateTime), 2026/10/18) and captured ArrowRight changing focus from 18 to 19 October. Windows UIA confirmed the Right/Down/Left/Up sequence 18→19→26→25→18. NVDA and VoiceOver were not run. A clean agent-reviewed product-context screenshot from the interactive WebAssembly /component-lab route is now retained as ../quality/evidence/BLUENT-DATEFIELD-PRODUCT-CONTEXT-2026-11-28.png, with capture metadata in ../quality/evidence/BLUENT-DATEFIELD-PRODUCT-CONTEXT-2026-11-28.md. The canonical /components/fields showcase still has an unrelated NumericField<float> cast failure; the product-context capture deliberately uses the working interactive Component Lab route. The capture is not separate human approval. No human reviewer is claimed; the current code, migration and page-61 parity work were self-reviewed under the user's direction not to involve a human reviewer.

Exact-head hosted CI on evidence commit 84e5bd08b1cd516faa6936e90d320260adc43836 completed with 13/13 workflows successful. The targeted Narrator/Chrome spoken-output and four-direction keyboard evidence is recorded above. NVDA and VoiceOver remain untested and are explicitly outside this targeted smoke; do not describe the result as cross-screen-reader certification. Issue #438 is ready to advance to Review after this follow-up documentation commit passes exact-head hosted CI and PR metadata is synchronized; do not mark Done or merge to a stable branch. No 2.x source/package, stable branch, release or deployment is changed.
## Product-context and spoken-output evidence — 2026-11-28

- Product-context screenshot: [PNG](../quality/evidence/BLUENT-DATEFIELD-PRODUCT-CONTEXT-2026-11-28.png) and [capture metadata](../quality/evidence/BLUENT-DATEFIELD-PRODUCT-CONTEXT-2026-11-28.md). This is a real interactive Bluent WebAssembly Component Lab capture with the DaySelect calendar open and eight DateField pilot specimens visible; it is an agent capture, not independent human approval.
- Windows Narrator + Chrome spoken-output smoke: [Speech Recap transcript and scope](../quality/evidence/BLUENT-DATEFIELD-NARRATOR-SPEECH-2026-11-28.md). Narrator spoke the dialog, six-by-seven calendar, selected date and visible date cells. Escape closed the popup; Narrator announced the collapsed trigger and Windows UIA confirmed focus return.
- Remaining spoken-AT scope: ArrowRight spoken date-change feedback is verified; the full four-direction focus sequence is confirmed by Windows UIA. NVDA and VoiceOver were not run. This is a targeted Narrator smoke, not accessibility certification.
- The canonical /components/fields showcase still has the separate NumericField<float> rendering failure; the screenshot deliberately comes from the working interactive /component-lab route.


## Current-source acceptance snapshot — 2026-11-28

The latest focused source revision has a dedicated public/inherited API and acceptance matrix at [BLUENT-DATEFIELD-PUBLIC-API-COVERAGE-2026-11-28](../quality/evidence/BLUENT-DATEFIELD-PUBLIC-API-COVERAGE-2026-11-28.md). The revision's dedicated Chrome/WebAssembly and production-published InteractiveServer probes passed 41/41 each (82/82); the full interactive Component Lab passed 290/290 after adding the actual Small/Medium/Large and StartAddon assertions. Release solution build passed with warnings as errors (0 warnings/errors), full Release tests 219/219, focused calendar renderer cases 8/8, docs and skills contracts clean, Markdown links checked across 257 files. Exact-head hosted CI on the preceding sample/evidence commit passed 13/13; this follow-up documentation checkpoint will carry its own exact-head CI.

Targeted Windows Narrator/Chrome speech evidence is recorded separately: field label/value, dialog/grid, Escape close/trigger restoration and ArrowRight (18 to 19 October) were spoken; UI Automation confirmed Right/Down/Left/Up focus movement (18→19→26→25→18). NVDA and VoiceOver were not run, so no cross-screen-reader certification is claimed. The `/components/fields` NumericField<float> cast failure remains unrelated; DateField's isolated fixtures and live `/component-lab` route were used.
