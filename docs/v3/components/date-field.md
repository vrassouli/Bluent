# DateField — v3 implementation record (#438)

> **In progress · unreleased v3 task branch.** This page records the current source on `v3/issue-438-datefield` targeting `bluent-v3`. It is not released consumer guidance. The existing [2.x DateField reference](../../components/date-field.md) remains authoritative for shipped packages.

## Identity and design status

| Field | Verified value |
| --- | --- |
| Issue / branch | [#438](https://github.com/vrassouli/Bluent/issues/438) · `v3/issue-438-datefield` → `bluent-v3` |
| Package / namespace | `Bluent.UI` · `Bluent.UI.Components` |
| Source | `src/Bluent.UI/Components/DateFieldComponent/` and `CalendarComponent/` |
| Demo | `/components/fields`; isolated QA routes `/compatibility/datefield-probe` (WebAssembly) and `/compatibility/datefield-server` (InteractiveServer) |
| Design | Penpot file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, page 61 `39bbee31-a6cb-801d-8008-feba6ea9ebf9` |
| Boards | `39bbee31-a6cb-801d-8008-febae0873e1e`, `39bbee31-a6cb-801d-8008-febb41bcbc3a`, `39bbee31-a6cb-801d-8008-febb591e6012` |
| Design gate | **DESIGN APPROVED · FOUNDATION GATE OPEN** (maintainer direction recorded 2026-11-25); implementation parity and visual acceptance remain open |

## Source-backed API

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

- Existing Fields showcase: `/components/fields` in `src/Bluent.UI.Demo.Pages/Pages/Components/Fields.razor`.
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
| Chrome / WebAssembly | 35/35 checks passed on 2026-11-27; no uncaught browser errors |
| Edge / WebAssembly | 35/35 checks passed on 2026-11-27; no uncaught browser errors |
| Chrome / InteractiveServer | 35/35 checks passed on 2026-11-27; no uncaught browser errors |
| Edge / InteractiveServer | 35/35 checks passed on 2026-11-27; no uncaught browser errors |
| Combined browser matrix | 140/140 checks across Chrome/Edge × WebAssembly/InteractiveServer (35 per cell), including Chromium accessibility-tree assertions; refreshed per-cell JSON is retained under `docs/v3/quality/evidence/BLUENT-DATEFIELD-*.json` |
| Responsive and popup geometry | Chrome/WebAssembly visual run: 33/33 checks across semantics, stable capture, 320/390px Light/Dark LTR/RTL layouts, browser-emulated forced colors/reduced motion, three-column MonthSelect/YearSelect grids with ArrowUp/ArrowDown movement, and a 320px RTL edge-popover case; seven PNG captures and details are retained in [the visual report](../quality/evidence/BLUENT-DATEFIELD-VISUAL.json) |

Browser checks in all four cells cover page load, both typed fields' initial values, field and dialog/grid accessibility names, selected-day state, initial focus, ArrowLeft/Right/Up/Down, Home/End, PageUp/PageDown and Shift variants, Space to open, Escape with trigger-focus restoration, natural Tab exit, DateTime and DateOnly selection, 320px input fit, three-column MonthSelect/YearSelect grids with three-option vertical movement, arrow direction and a clean browser runtime. InteractiveServer focus restoration after asynchronous month/year changes is included.

The local Chrome/Edge × WebAssembly/InteractiveServer matrix passes 35/35 checks per cell (140/140 total) on the current uncommitted task branch; the four JSON reports were refreshed on 2026-11-27. The optional Chrome/WebAssembly responsive run passes 33/33 and retains seven QA-fixture screenshots across 320/390px Light/Dark LTR/RTL, forced-colors/reduced-motion browser emulation, stable animation settling, edge-positioned calendar checks, and MonthSelect/YearSelect three-column vertical keyboard movement. Browser emulation does not establish native OS contrast behavior.

Still open: independent acceptance of the page-61 parity findings and a clean product-context screenshot baseline, spoken screen-reader acceptance, exact-head hosted CI, independent code review and independent migration review. On 2026-11-27, all three page-61 boards were exported and reviewed against the retained runtime captures. The master board’s heading, navigation, day-cell and footer anatomy aligns with the reviewed popup. The selection board’s three-column MonthSelect and YearSelect grids are supported by the 140/140 browser matrix and 33/33 responsive run. The locale/accessibility board’s RTL field with left-to-right date text and viewport-contained edge behavior align with the retained captures. No concrete visual or placement defect emerged in the reviewed evidence. The fixture popup measures 360 × 396 at 764 × 429 and uses internal scrolling, compared with approximately 360 × 560 on the master board; independent product-context acceptance of this viewport-constrained height remains open. Fixture screenshots are evidence, not an approved baseline. The retained /components/fields screenshot at 1034 × 786 shows the calendar closed and an unrelated NumericField error, so it is context evidence only. Browser forced-colors emulation is not native OS high-contrast verification. A local native Windows Black/White visual check is recorded separately. Chromium accessibility-tree and UI Automation snapshots do not establish spoken screen-reader output.
## 2.x compatibility boundary

This is a work-in-progress v3 implementation record, not an approved migration guide. The 2.x source, package and [2.x DateField documentation](../../components/date-field.md) remain unchanged. The local migration audit found no mechanical public API migration: parameter names/signatures, supported value types and the InputBase<TValue> binding contract remain. V3 does change manual parsing to enforce inclusive Min/Max bounds and forwards the existing DateClass callback into calendar rendering through the DateOnly adapter. Consumers relying on out-of-range text commits should re-check those values; consumers relying on popup DOM selectors should review the v3 markup. Independent migration approval remains open.
