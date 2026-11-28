# DateField public API and acceptance coverage — #438

**Snapshot:** 2026-11-28 · branch `v3/issue-438-datefield` · target `bluent-v3` · commit `cc6d062660660f2284ea204d4166fb24ce1c6b6e`

This matrix records #438 component-level acceptance separately from the wider #421 Component Lab census. The #421 row remains `representative_only` because it is one of 18 source-linked pilot families; this is not a claim that the Lab contains every component permutation. #438 acceptance is established by the combined runnable Lab scenarios, isolated browser fixtures, renderer/parser tests, design record and evidence below.

## Public type and inherited contract

| Surface | Source-backed contract | Coverage / disposition |
| --- | --- | --- |
| Public component | `Bluent.UI.Components.DateField<TValue>` in package `Bluent.UI`; inherits `BluentFieldComponentBase<TValue>` and `InputBase<TValue>` | Compiled public-component inventory; renderer/probe tests |
| `TValue` | `DateTime`, `DateTime?`, `DateOnly`, `DateOnly?`; constructor rejects other underlying types | All four supported shapes have live examples and parser/renderer/browser cases |
| `Value`, `ValueChanged`, `ValueExpression` | Inherited `InputBase<TValue>` binding contract | Real `@bind-Value` and browser assertions verify model updates across DateTime/DateOnly nullable/non-nullable paths |
| `EditContext` | Cascading inherited form context and validation lifecycle | Bounded field inside `EditForm`; invalid parsing/range messages and `ValidationMessage` exercised |
| `DisplayName` | Inherited display-name fallback used in localized validation messages | Non-interactive config; validation messages exercised in the EditForm sample and tests |
| `AdditionalAttributes` | Inherited arbitrary native-attribute capture, forwarded to masked text input | Live example includes explicit `id`, `autocomplete` and native `disabled`; renderer test asserts forwarding |
| `Class`, `Style` | Inherited `[Parameter]` values from `BluentInputComponentBase<TValue>` | DaySelect specimen supplies both; renderer and browser style assertions |
| `StartAddon`, `EndAddon` | Inherited `RenderFragment?` slots from `BluentFieldComponentBase<TValue>` | DaySelect shows leading `#`; trailing custom action replaces default calendar trigger |
| `Size` | Inherited `FieldSize`, default `Medium` | Small, default Medium and Large appear in live examples; browser assertion validates all three |
| `BindValueEvent` | Inherited event-name string, default `onchange` | DaySelect uses `oninput`; typed-input browser tests verify immediate model update |
| `Field`, `Id`, `Element` | Public inherited members from `BluentInputComponentBase<TValue>`; `Field` and `Id` are read-only, `Element` is settable; none is `[Parameter]` | Explicitly classified as non-parameter API; `Id` is generated lazily or uses the supplied native `id`; `Element` is the input DOM reference, not a visual option |

## DateField-declared parameters

| Parameter | Type / default | Runnable or test evidence |
| --- | --- | --- |
| `Culture` | `CultureInfo`, defaults to `CultureInfo.CurrentUICulture` | Invariant UI; Persian `fa-IR`, Hebrew calendar/leap-year parser and calendar rendering tests |
| `Mode` | `CalendarMode`, default `DaySelect` | DaySelect, MonthSelect and YearSelect live specimens; parser tests and browser grid navigation |
| `DateClass` | `Func<DateTime, string>?` | Live bounded EditForm highlights weekends; DateTime-to-DateOnly adapter and renderer regression |
| `Min`, `Max` | `DateTime?`, optional | Inclusive bounds on typed text and picker selection; boundary, out-of-range and unavailable period tests; reversed date bounds throw `ArgumentException` |
| `DisplayCalendar` | `bool`, default `true` | Default trigger; `false` in DateOnly and disabled examples; custom `EndAddon` replacement |
| `ParsingErrorMessage` | `string`, default empty (localized fallback) | Custom English range/parser feedback; localized default, Minimum and Maximum messages covered by tests |

The public CLR inventory declares one parameterless `DateField<TValue>()` constructor and no DateField-specific public method or event. The inherited public `SetParametersAsync(ParameterView)` is framework component lifecycle plumbing, not a DateField operation. `ValueChanged` is the inherited binding callback; `DateClass` is a date-to-CSS callback, not an event. Calendar's internal `SelectedDateChanged` / `OnDatePicked` callback is not exposed as DateField API.

## Value, parser and range behavior

- Input precision is year-first: `yyyy/MM/dd` (day), `yyyy/MM` (month), and `yyyy` (year). The active culture's date separator is used; date text remains LTR in an RTL host.
- `Culture.DateTimeFormat.Calendar` defines supported years, months, days and leap-year structure, including calendars with 13 months in a leap year.
- Nullable values accept empty text; non-nullable values reject it. `DateTime` is committed at midnight; `DateOnly` stays `DateOnly`.
- Minimum and maximum are inclusive and compare dates (time-of-day is ignored). Day parsing must fall within the bounds. Month/year input is accepted when the period intersects the range and resolves to its first valid date. A fully excluded period is rejected; picker days/options outside the range are disabled.
- `Min > Max` by calendar date throws `ArgumentException`. This differs from old v2 source, which did not reject reversed bounds; consumers should validate existing configuration.
- Unsupported generic types and calendar modes fail explicitly rather than silently coercing values.

**Test evidence:** `DateFieldValueParserTests` cover precision, nullable empty values, invariant and non-Gregorian calendar parsing, month/year intersection and clamping, inclusive boundaries and periods outside bounds. `DateFieldCalendarRenderSemanticsTests` contain eight renderer scenarios including value precision, headings, calendars, disabled/external trigger behavior, native attributes and inverted ranges.

## Behavioral before/after (2.x → v3)

| Behavior | Released 2.x source | v3 task branch | Migration implication |
| --- | --- | --- | --- |
| Typed text vs `Min`/`Max` | The old `TryParseValueFromString` delegated valid text to `BindConverter.TryConvertTo` and did not apply the configured Min/Max bounds to the parsed value; the calendar picker separately received Min/Max. | `DateFieldValueParser` applies inclusive bounds to typed Day/Month/Year precision; an out-of-range date/period is rejected and an intersecting month/year resolves to its first eligible day. | Inputs that previously committed an out-of-range text value now show validation feedback; test existing forms and automation. |
| Reversed bounds | The old component did not reject `Min > Max` at parameter application. | `OnParametersSet` rejects `Min.Date > Max.Date` with `ArgumentException`. | Validate configuration before rendering; this is a deliberate runtime guard. |
| `DateClass` | The old picker composition declared the public callback but did not forward it into the nested picker/calendar. | The v3 component adapts `Func<DateTime,string>` to calendar `DateOnly` values and provides it to the nested picker through its internal cascading contract. | Existing callbacks now affect calendar date cells; this is additive visible behavior, not a signature change. |
| Binding and declared parameters | Direct DateField parameter names/types and the `InputBase<TValue>` binding contract are retained. | Same seven component-declared parameters and shared inherited binding/field contract; implementation delegates parsing to a dedicated value parser. | No mechanical parameter rename or binding migration is required. |

Source comparison: `origin/Dev:src/Bluent.UI/Components/DateFieldComponent/DateField.razor.cs` versus the task-branch `DateField.razor.cs` and `DateFieldValueParser.cs`. Released 2.x source, package and consumer documentation are unchanged.

## Visual, interaction and composition matrix

| Capability / state | Scenario | Evidence |
| --- | --- | --- |
| Day / Month / Year | Three live specimens; 6×7 DaySelect grid; three-column MonthSelect/YearSelect grids | Component Lab, focused renderer tests, 41/41 Chrome/WASM and 41/41 published InteractiveServer probes |
| Value types / nullability | DateTime and DateOnly, nullable and non-nullable | Four Lab examples plus parser/renderer and browser fixtures |
| Sizing | Small, inherited Medium default, Large | Real 290/290 Component Lab run includes size assertion; screenshot includes all three |
| Composition | Leading StartAddon and custom EndAddon clear action; EndAddon suppresses default picker | Live sample and `CalendarTriggerCanBeHiddenOrReplacedByAConsumerEndAddon` renderer test |
| Popup visibility | Default picker, `DisplayCalendar=false`, `EndAddon` replacement | Eight Lab scenarios and renderer test |
| Bounds | Min/Max, day-level disabled options, month/year periods with no valid dates, partial-period clamping | Parser and calendar renderer tests; current-source browser fixture includes range interaction |
| Styling callback | DateClass weekend emphasis in EditForm | Lab sample, source adapter and renderer regression |
| Parsing and validation | Custom ParsingErrorMessage; localized default/minimum/maximum; EditForm validation | Lab sample and parser/renderer tests |
| Native input attributes | Label association, `id`, `autocomplete`, `disabled`, class/style and input event | Lab sample and `DateFieldPreservesNativeAttributesAndSharedFieldCustomization` renderer test |
| Keyboard | Initial focus, arrows, Home/End/PageUp/PageDown, Space open, Enter/Space selection, Escape close/restore, natural Tab exit | Dedicated Chromium probes; current-source WASM and InteractiveServer each 41/41 |
| Popup semantics | Non-modal `role=dialog`, heading-based name, 6×7 calendar grid, pressed/disabled day controls | Chromium accessibility-tree assertions and targeted Narrator/Chrome speech recap |
| RTL/LTR | Field follows host direction; date segments stay LTR; popup flips/shifts in bottom-right RTL viewport | Current-source responsive evidence plus historical 320px RTL edge placement evidence |
| Responsive | 320px and 390px layouts, no horizontal overflow; constrained popup uses vertical scroll | Current-source WASM and published InteractiveServer runs; retained PNG captures and visual report |
| Theme / motion | Light and Dark; browser-emulated forced colors and reduced motion; native Windows High Contrast Black and White visual checks | Current-source screenshots/emulation and native Windows visual smoke; OS settings restored after test |
| Culture edge cases | `fa-IR`; Hebrew calendar with leap-year month count; date formatting and RTL/LTR | Parser and calendar renderer tests; targeted browser coverage |
| Runtime hosting | WebAssembly and production-published InteractiveServer | 41/41 each, 82/82 total; no browser exceptions |

## Complete demo and fixture map

The eight runnable cards are in `src/Bluent.UI.Demo.Pages/Pages/Components/ComponentLab.razor`, route `/component-lab`. They are: Small DaySelect + StartAddon + oninput + class/style/native attributes; MonthSelect; Large YearSelect; non-nullable DateOnly with hidden calendar; nullable DateOnly; bounded DateTime? EditForm with DateClass and custom parse feedback; nullable DateTime? with custom EndAddon; and disabled DateTime with hidden picker. The copyable Razor specimen mirrors the rendered examples.

The isolated `DateFieldBrowserProbe.razor` (`/compatibility/datefield-probe`) is used for real Chrome/WebAssembly checks. `DateFieldInteractiveServerProbe.razor` is the production-published InteractiveServer fixture. `scripts/quality/probe_v3_datefield.mjs` runs focused interaction, responsive and AX assertions. `DateFieldCalendarRenderSemanticsTests.cs` and `DateFieldValueParserTests.cs` provide focused renderer and parser coverage.

## Rendered component tree, services and JavaScript dependencies

```text
DateField<TValue>
└─ CascadingValue<string> (BluentDateFieldBindValueEvent)
   └─ MaskedField<string?> (inherits the shared field base)
      ├─ StartAddon slot
      ├─ native input[type=text] (LTR date segments, generated/user id, name, autocomplete=off)
      └─ EndAddon slot
         ├─ consumer fragment, when supplied (replaces picker)
         ├─ empty fragment, when DisplayCalendar=false
         └─ CascadingValue<Func<DateOnly,string>?> (BluentDateFieldDateClass)
            └─ DateFieldPicker<TValue>
               └─ shared Popover (non-modal dialog surface)
                  ├─ shared Button trigger
                  └─ Calendar<TValue>
                     └─ selected-date summary (DaySelect with a selected value)
```

The `DateField` template composes `MaskedField<string?>`; its `RenderInput` produces the native text input. The default end adornment builds a private `DateFieldPicker<TValue>`. That picker renders the shared `Popover`, `Button` and `Calendar<TValue>`. A consumer-supplied `EndAddon` intentionally replaces the built-in picker; `DisplayCalendar=false` suppresses it when no replacement is supplied. Calendar's day/month/year grids and heading are the nested content described in the visual matrix. The popup uses the shared non-modal dialog surface, not a bespoke modal or DateField-owned overlay.

| Dependency | Used by | Ownership / lifecycle |
| --- | --- | --- |
| `IStringLocalizer<DateFieldComponent.Resources.DateField>` | DateField and DateFieldPicker | Framework localization dependency for format/error text and trigger name; no DateField-owned registration |
| `IStringLocalizer<CalendarComponent.Resources.CalendarResources>` | Calendar | Calendar's existing localized labels/headings; not declared by DateField |
| `IPopoverService` | Popover and its shared surface/container | Existing shared Bluent Popover service; Popover destroys its trigger registration on `Dispose`, the container base owns shared JS interop and asynchronous disposal |
| `IJSRuntime` + `bluent.ui.calendar.js` module | Calendar | Calendar imports `./_content/Bluent.UI/bluent.ui.calendar.js`, creates a tab-exit observer and .NET callback reference, then disposes listener/module/reference in `IAsyncDisposable.DisposeAsync` |
| `IJSRuntime` + shared Popover interop | Popover container base | Shared overlay behavior and interop disposal; no DateField-specific JS module |
| `DomHelper` (optional inherited dependency) | BluentInputComponentBase | Shared access-key placeholder behavior when `accesskey` is supplied; not a DateField-only service |

`DateField<TValue>` and `DateFieldPicker<TValue>` do not implement their own disposal contract or import a JavaScript module. Their cleanup requirement is inherited through the nested Calendar and shared Popover lifecycles; no extra per-DateField service registration is required. `MaskedField` renders the input and addon slots and introduces no separate JS module.

## Non-interactive and implementation-only classification

- `DisplayName`, `ValueExpression`, `EditContext` and `AdditionalAttributes` are framework/inherited binding or configuration contracts; they are not independent visual controls. Their resulting behavior is tested via binding, EditForm, native attribute and validation scenarios.
- `Field`, `Id` and `Element` are inherited component/reference members, not `[Parameter]` controls. They are documented as non-interactive API rather than demo variations.
- `DateFieldPicker<TValue>`, the `OnDatePicked` callback, `BluentDateFieldBindValue` / `BluentDateFieldDateClass` cascading values, the DateTime-to-DateOnly adapter, mask construction and `IStringLocalizer<DateField>` are internal implementation details, not public API.
- Calendar's JS focus-listener module and shared Popover service/JS interop are dependencies of the composed calendar/overlay implementation. DateField itself does not introduce a separate JS module or service contract. Calendar and Popover lifecycle/focus behavior are covered by browser probes and shared-platform suites.
- Arbitrary consumer content inside StartAddon/EndAddon is consumer-owned; the library guarantees the RenderFragment slot and composition behavior, not semantics of consumer-supplied content.

## Fluent 2 and WAI-ARIA comparison

The current Fluent 2 web component catalog supplies reusable Field, Input and Popover patterns. Its component roadmap lists DatePicker as **Not Started / Research** in this snapshot; therefore this is a Bluent-specific DateField composition, not one-to-one parity with a stable Fluent DatePicker. The design decision record is the owned Bluent v3 Penpot page 61 and its three boards. Field guidance informs associated labels, validation and disabled state; Input guidance informs masked-input limitations. WAI-ARIA APG Grid guidance informs the single-tab-stop grid and managed arrow navigation.

The APG Date Picker Dialog example is explicitly modal. Bluent's approved design is a **non-modal Popover dialog**: it has a named dialog surface and calendar grid, but intentionally does not trap focus; Tab exits naturally, while Escape dismisses and restores trigger focus. Modal focus containment from the APG example is not claimed or copied. Grid keyboard concepts are adapted to the non-modal surface and verified against actual behavior.

References (checked 2026-11-28):
- Fluent 2 web catalog: https://fluent2.microsoft.design/components/web/react/
- Fluent 2 component roadmap (DatePicker state): https://fluent2.microsoft.design/component-roadmap/
- Fluent 2 Field usage/accessibility guidance: https://fluent2.microsoft.design/components/web/react/core/field/usage/
- Fluent 2 Input/mask guidance: https://fluent2.microsoft.design/components/web/react/core/input/usage/
- WAI-ARIA APG Grid Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/grid/
- WAI-ARIA APG Date Picker Dialog example (modal reference, not this popup's modality contract): https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/

## Fluent reference crosswalk (Web Components vs React)

The requested Fluent **Web Components v3 Storybook** is a separate reference surface from Fluent React: https://storybooks.fluentui.dev/web-components/. In the current reviewed Web Components catalogue, a DatePicker story was not surfaced; therefore no Web Components DatePicker API or behavioral parity is claimed. Fluent React Storybook separately exposes a **Compat Components DatePicker** and a Calendar preview: https://storybooks.fluentui.dev/react/?path=%2Fdocs%2Fcompat-components-datepicker and https://storybooks.fluentui.dev/react/?path=%2Fdocs%2Fpreview-components-nav--docs. Those React compatibility examples are informative interaction references, not a Web Components API contract. The Fluent 2 roadmap currently lists DatePicker as Not Started / Research: https://fluent2.microsoft.design/component-roadmap/. Accordingly this implementation composes the available Field/Input/Popover patterns with Bluent's own page-61 decisions; it does not claim parity with a released Fluent 2 Web Components DatePicker.

## Design-to-code self-review

The three native editable boards in the owned Penpot file **Bluent v3 Design System**, page 61, were inspected against source and retained browser captures:
- Master composition: `39bbee31-a6cb-801d-8008-febae0873e1e`
- Selection modes: `39bbee31-a6cb-801d-8008-febb41bcbc3a`
- Accessibility, locale and responsive behavior: `39bbee31-a6cb-801d-8008-febb591e6012`

The reviewed anatomy includes field label/input/addons, trigger, live current-view heading, day grid, selected date, selection modes, three-column option grids, range-disabled states, RTL date segments and constrained popup behavior. The implementation's bottom-start, arrow-free shared Popover uses flip/shift and vertical overflow on constrained viewports. No concrete source, public-contract, parser/range, focus, layout or migration defect was found in the agent review. The visual screenshot is an implementation capture, not a separate human-approved baseline.

## Latest verification and evidence boundary

- Release build with warnings as errors: 0 warnings / 0 errors; full Release tests: 219/219; focused calendar render semantics: 8/8.
- DateField current-source Chrome/WebAssembly: 41/41; Chrome/production-published InteractiveServer: 41/41 (82/82 total), zero browser exceptions.
- Component Lab source contract: 18/18 source-linked pilot families; live Chrome/WebAssembly Component Lab: 290/290, including latest size/StartAddon assertion; 11 owned browser processes cleaned, zero remaining; acceptance regression tests: 12/12.
- Documentation contract: 0 findings; Skills contract: 6 reviewed files, 0 errors; Markdown links checked in 257 files.
- Hosted exact-head GitHub Actions on source/demo commit `cc6d062660660f2284ea204d4166fb24ce1c6b6e`: 13/13 workflows succeeded. The final acceptance/documentation head `895814f286048a4de306c0758bbd0d0453458b5e` also passed 13/13 workflows; Real Compatibility Browsers passed 32/32 jobs.
- Product-context capture: `BLUENT-DATEFIELD-PRODUCT-CONTEXT-2026-11-28.png`, 1440×1200 from actual interactive `/component-lab`, all eight specimens visible and DaySelect popup open; SHA-256 `d7064d7445dd102f0ed97a9cb0b383cae0f838289f8b04909377edec574543e8`.
- Targeted Windows Narrator + Chrome speech recap confirmed field label/value, dialog, grid, selected date, Escape/collapsed trigger and ArrowRight spoken movement from 18 to 19 October. Windows UIA confirmed full Right/Down/Left/Up focus sequence 18→19→26→25→18 October. Transcript: `BLUENT-DATEFIELD-NARRATOR-SPEECH-2026-11-28.md`.
- Native Windows High Contrast Black/White visual checks were performed previously and original settings restored. Browser forced-colors/reduced-motion emulation is separate from native OS contrast checks.

**Known limits (not hidden):** NVDA was not run because it required Windows elevation; VoiceOver was not run because the separate Mac host was offline. This is targeted Narrator evidence, not cross-screen-reader certification, general WCAG conformance or independent human review. The canonical `/components/fields` showcase still has an unrelated `NumericField<float>` cast/render error; DateField's isolated fixture and `/component-lab` route were used for acceptance. The 2.x source, consumer docs and published packages remain authoritative and unchanged. This branch is unreleased.
