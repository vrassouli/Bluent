# #552 family audit — NumericField, SelectField, DateField, TimeField and MaskedField

**Status: partial source/API audit with confirmed contract gaps.** This is not Fluent parity acceptance, design approval, or browser/assistive-technology sign-off. Source facts were reviewed; no product code or canonical component documentation was changed.

## Upstream comparison boundary

The pinned Fluent references provide input/select primitives and separate field patterns; they do not establish one-to-one equivalents for all Bluent typed-field compositions. NumericField is text-backed, SelectField wraps a native select, and DateField/TimeField compose MaskedField. Compare these as separate contracts; do not assume all should become native `type=number/date/time` controls.

## Confirmed source gaps

| Family | Source finding | Disposition |
| --- | --- | --- |
| NumericField #433 | Public `Step` is stored in `_step` but never consumed by markup or behavior. Current input is `type="text"`; no default `inputmode="decimal"`, native `step`, spinbutton role or value-range ARIA is emitted. | `Step` is a confirmed public API no-op. Decide whether it should constrain input/keyboard behavior or be removed through an approved migration. Default numeric input mode/semantics need an explicit contract; no runtime keyboard/AT claim is made. |
| SelectField #437 | Inherited `BindValueEvent` is public on `BluentFieldComponentBase`, but SelectField wires `@onchange` directly. | Confirmed parameter mismatch: changing `BindValueEvent` has no effect. The native `<select>` semantics themselves remain native. |
| SelectField #437 | Array `TValue` enables `multiple` and attempts to convert `ChangeEventArgs.Value` into an array, but current showcase only demonstrates single select. | Multiple-select behavior is unverified; do not claim it is accepted or broken until real browser/form tests run. |
| DateField #438 | Public `DateClass` is not passed by `GetEndAddon()` into `DateFieldPicker`. `Min`/`Max` are passed to the picker, but `TryParseValueFromString()` does not enforce them on typed input. | Confirmed `DateClass` no-op and text-entry range bypass. Calendar selection bounds do not prove typed values are constrained. |
| DateField #438 | `YearSelect` chooses `MonthFormat` (`yyyy/MM`) in `OnParametersSet`, while `GetMask()` accepts four digits and parsing appends month/day segments to the typed value. | Source-confirmed format/mask/parse inconsistency. Add regression tests before choosing the intended YearSelect contract. |
| DateField #438 | `DateFieldPicker.razor` renders an icon-only Calendar Button without Text, `aria-label` or `title`. | Source-confirmed accessible-name gap; capture this exact composition in browser AX and native AT after remediation. |
| TimeField #439 | Inherited `BindValueEvent` is not forwarded to the internal MaskedField, and MaskedField hard-wires `@oninput`. Formatting uses `ToString("H:m")`/`ToString("H:m:s")` without the component's `Culture`. | Confirmed event-selector no-op. Formatting-vs-Culture behavior is a contract distinction to approve/test; do not assume every locale requires different output. |
| MaskedField #440 | Inherited `BindValueEvent` is ignored; markup directly wires `@oninput="OnInput"`. | Confirmed public parameter mismatch: changing `BindValueEvent` does not change the event that updates the mask. |
| MaskedField #440 | Masking combines `@oninput`, `@oninput:preventDefault`, key-up rollback, regex patterns and custom parsing. | IME composition, paste, caret stability, undo/redo and mobile input remain unverified. Source inspection is not runtime acceptance. |

## Supplemental Chrome/Edge browser evidence (initial run 2026-10-22; repeated 2026-10-23)

The live WebAssembly demo was exercised in headless Chrome and Edge on `/components/fields`, with real header-switch changes for Light/LTR and Dark/RTL and CDP-emulated forced-colors. Each engine passed **49/49 instrumentation checks** and produced 21 screenshots. See [the typed-field browser evidence report](FLUENT-PARITY-TYPED-FIELDS-BROWSER-AUDIT.md) and structured [Chrome](evidence/BLUENT-TYPED-FIELDS-CHROME.json) / [Edge](evidence/BLUENT-TYPED-FIELDS-EDGE.json) evidence. The same probe was rerun on 2026-10-23 against the current task-branch build; both engines again passed 49/49 with zero failed checks, and the evidence JSON plus screenshot set was refreshed.

The runtime also verified sequential keyboard entry for DateField (20250115 -> 2025/01/15) and TimeField (0930 -> 9:30), with bound demo outputs updating in both engines. For MaskedField, the full phone digits duplicate the fixed prefix literal, while entering only editable digits yields 0912-345-6789 and a trailing Backspace removes one character. The new whole-page DOM scan also found repeated IDs in the showcase: _timeOnly, _timeSpan, and _dateField each occur twice because multiple TimeField/DateField controls share one model-field-derived ID. This is a confirmed demo-composition markup/accessibility gap; the isolated component behavior still needs distinct-ID coverage. The runtime confirmed the default TextField accessible name and associated label (with HTML `name` still empty and form submission untested), a narrow NumericField integer-entry path (`123` updates the bound output), and native SelectField ArrowDown selection (`Green` to `Blue`). It also reproduced a MaskedField prefix-literal defect in both browsers: typing `09123456789` with `^09\d{2}-\d{3}-\d{4}$` yields `0991-234-5678`. This does not validate multiple-select, DateField typed ranges/YearSelect/calendar activation, TimeField Culture/seconds semantics, mask paste/caret/IME, native screen readers, native OS contrast, or published InteractiveServer. No family approval or product-code change is implied.
## Canonical matrix disposition

- **NumericField:** `feature=audited_gaps`, `behavior=audited_gaps` — `Step` is not consumed; default numeric input-mode semantics need a contract.
- **SelectField:** `feature=audited_gaps`, `behavior=audited_gaps` — inherited `BindValueEvent` is a no-op; multiple-select runtime remains unverified.
- **DateField:** `feature=audited_gaps`, `behavior=audited_gaps`, `accessibility=audited_gaps` — `DateClass` no-op, typed `Min`/`Max` bypass, YearSelect mismatch and unnamed calendar trigger.
- **TimeField:** `feature=audited_gaps`, `behavior=audited_gaps` — inherited event selector is not propagated; culture/format contract remains open.
- **MaskedField:** `feature=audited_gaps`, `behavior=audited_gaps` — inherited event selector is ignored; mask/caret/IME runtime remains open.
- Other dimensions remain `not_reviewed`; all five families remain `researching`, design approval `pending`, full evidence bundle `null`, and `gapDisposition=known_gaps_open`.

## Required owner actions

1. **#433 NumericField:** define and implement `Step` or remove it through an approved migration; define numeric input mode, bounds, decimal separators and localized validation; test integer/decimal types and Persian/Arabic digits.
2. **#437 SelectField:** honor `BindValueEvent` or deprecate the inherited selector with migration guidance; run actual multiple-select tests for string/numeric/enum arrays, selected options, validation and form submission.
3. **#438 DateField:** pass `DateClass` if supported or document/remove it through the owner workflow; enforce range on typed entry as well as picker selection; reconcile YearSelect display/mask/parse; name the calendar trigger.
4. **#439 TimeField / #440 MaskedField:** decide whether `BindValueEvent` should be inherited/forwarded or removed; test caret, composition/IME, paste, undo/redo, mobile input, invalid rollback, digit normalization, Culture and DateTime.Kind preservation.
5. Compare each API to pinned Fluent primitive signatures, then test Chrome/Edge in WebAssembly and published InteractiveServer, Light/Dark, RTL, forced colors, 320px/reflow and native AT. Product fixes stay on owning issues after Ready/design gates.

## Evidence sources

- [NumericField](../../components/numeric-field.md) · [SelectField](../../components/select-field.md) · [DateField](../../components/date-field.md) · [TimeField](../../components/time-field.md) · [MaskedField](../../components/masked-field.md)
- `src/Bluent.UI/Components/NumericFieldComponent/`
- `src/Bluent.UI/Components/SelectFieldComponent/`
- `src/Bluent.UI/Components/DateFieldComponent/` and `Internal/DateFieldPicker.razor`
- `src/Bluent.UI/Components/TimeFieldComponent/`
- `src/Bluent.UI/Components/MaskedFieldComponent/`
- `src/Bluent.UI/Components/BluentFieldComponentBase.cs`
- [Pinned Fluent Web Components 3.1.3 crosswalk](FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.md)
- [Pinned Fluent React semantic triage](FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md)

**Boundary:** these are source-confirmed API/behavior gaps and runtime questions, not proof that every typed-field interaction has been browser-tested or that design/API changes are approved.
