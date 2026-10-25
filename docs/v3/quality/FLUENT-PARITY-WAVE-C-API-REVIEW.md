# Wave C Fluent API review — DateField, TimeField, MaskedField and OtpField

Review date: 2026-10-22. Status: **API mapping reviewed with gaps; not parity-approved**.

This ledger manually classifies the **40 source-known direct and locally inherited parameter occurrences** across Wave C. It is separate from the machine-generated candidate queue, which remains unchanged and unreviewed. Supported means a source/API mapping is identified; it does not imply DOM, visual, keyboard, Blazor render-mode, ARIA, native screen-reader or Fluent parity acceptance.

## Frozen reference hierarchy

- Primary WC API contract: @fluentui/web-components@3.1.3, extracted from the published custom-elements.json in the pinned crosswalk.
- React v9 is not substituted for a missing WC counterpart. The exact crosswalk snapshot remains @fluentui/react-components@9.74.10; latest tag 9.74.11 is not silently substituted.
- Source candidates: docs/v3/quality/FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.md. This manual ledger does not edit its comparisonStatus or featureSupport fields.

## Wave C summary

| Family | Owner | Parameters reviewed | Supported | Missing | Bluent extension | N/A | API disposition |
|---|---:|---:|---:|---:|---:|---:|---|
| DateField | #438 | 13 | 5 | 2 | 6 | 0 | audited_gaps |
| TimeField | #439 | 9 | 5 | 1 | 3 | 0 | audited_gaps |
| MaskedField | #440 | 9 | 5 | 1 | 3 | 0 | audited_gaps |
| OtpField | #441 | 9 | 1 | 3 | 5 | 0 | audited_gaps |

## Pinned WC API surface

- **DateField**: fluent-text-input (attributes: appearance, autocomplete, control-size, current-value, dirname, disabled, form, list, maxlength, minlength, multiple, name, pattern, placeholder, readonly, required, size, spellcheck, type, value; slots: default, end, start; CSS parts: control, label, root; events: change, select).
- **TimeField**: fluent-text-input (attributes: appearance, autocomplete, control-size, current-value, dirname, disabled, form, list, maxlength, minlength, multiple, name, pattern, placeholder, readonly, required, size, spellcheck, type, value; slots: default, end, start; CSS parts: control, label, root; events: change, select).
- **MaskedField**: fluent-text-input (attributes: appearance, autocomplete, control-size, current-value, dirname, disabled, form, list, maxlength, minlength, multiple, name, pattern, placeholder, readonly, required, size, spellcheck, type, value; slots: default, end, start; CSS parts: control, label, root; events: change, select).
- **OtpField**: fluent-text-input (attributes: appearance, autocomplete, control-size, current-value, dirname, disabled, form, list, maxlength, minlength, multiple, name, pattern, placeholder, readonly, required, size, spellcheck, type, value; slots: default, end, start; CSS parts: control, label, root; events: change, select).

## Locally inherited parameters

These contracts appear in one or more Wave C families. Family-specific overrides (for example, Switch inherits Checkbox properties) are recorded in the per-family ledger.

| Parameter | Default disposition | Mapping and rationale |
|---|---|---|
| StartAddon | Supported | fluent-text-input start slot. DateField, TimeField and MaskedField forward this fragment to MaskedField, which renders a leading addon region; OtpField does not render this inherited property and overrides it below. |
| EndAddon | Supported | fluent-text-input end slot. DateField, TimeField and MaskedField forward this fragment to MaskedField, which renders a trailing addon region; OtpField does not render this inherited property and overrides it below. |
| Size | Supported | fluent-text-input control-size. DateField, TimeField and MaskedField forward FieldSize to MaskedField, which adds the corresponding size class; OtpField does not apply a size class and overrides it below. |
| BindValueEvent | Bluent extension | Blazor bind-value:event selector. This is a Blazor input-binding event setting rather than an upstream custom-element attribute; each composite component must be checked for actual wiring. |
| Class | Supported | Caller class forwarded to the rendered control wrapper. DateField, TimeField and MaskedField forward Class to the MaskedField wrapper. OtpField applies Class to its inner OTP group rather than the outer root and overrides it below. |
| Style | Supported | Caller style on the rendered root/wrapper. DateField, TimeField and MaskedField forward Style to the MaskedField wrapper; OtpField applies Style to its outer root. |

## Per-family parameter ledger

### DateField — #438

Pinned counterpart kind: related_only; referenced tags: fluent-text-input.

| Component / parameter | Kind / source type | Origin | Disposition | Upstream mapping | Rationale / value-level gaps | Source |
|---|---|---|---|---|---|---|
| DateField.Culture | value / CultureInfo | declared | Bluent extension | Culture-aware date parse/format and calendar configuration | The pinned family counterpart is fluent-text-input, not a date-picker tag. Culture is passed to date formatting, parsing and the embedded picker; this is composite Bluent behavior. | [DateField.razor.cs:24](../../../src/Bluent.UI/Components/DateFieldComponent/DateField.razor.cs#L24) |
| DateField.Mode | value / CalendarMode | declared | Bluent extension | Day/Month/Year calendar mode | No dedicated date-picker tag exists in the pinned WC crosswalk. Source also exposes a YearSelect inconsistency: formatting uses yyyy/MM while the mask accepts four digits only. | [DateField.razor.cs:25](../../../src/Bluent.UI/Components/DateFieldComponent/DateField.razor.cs#L25) |
| DateField.DateClass | value / Func<DateTime, string>? | declared | Missing | Declared per-date CSS callback is not forwarded to DateFieldPicker | The current DateField source declares DateClass but never reads or passes it to the embedded picker; the public parameter has no effect. | [DateField.razor.cs:26](../../../src/Bluent.UI/Components/DateFieldComponent/DateField.razor.cs#L26) |
| DateField.Max | value / DateTime? | declared | Bluent extension | DateFieldPicker upper date boundary | Max is passed to the embedded calendar picker, but TryParseValueFromString only parses the typed text and does not enforce the boundary. The pinned text-input CEM has no date-picker contract. | [DateField.razor.cs:27](../../../src/Bluent.UI/Components/DateFieldComponent/DateField.razor.cs#L27) |
| DateField.Min | value / DateTime? | declared | Bluent extension | DateFieldPicker lower date boundary | Min is passed to the embedded calendar picker, but TryParseValueFromString only parses the typed text and does not enforce the boundary. The pinned text-input CEM has no date-picker contract. | [DateField.razor.cs:28](../../../src/Bluent.UI/Components/DateFieldComponent/DateField.razor.cs#L28) |
| DateField.DisplayCalendar | value / bool | declared | Bluent extension | Optional embedded calendar picker button | This controls whether DateField renders its calendar picker addon; there is no dedicated date-picker counterpart in the pinned WC catalog. | [DateField.razor.cs:29](../../../src/Bluent.UI/Components/DateFieldComponent/DateField.razor.cs#L29) |
| DateField.ParsingErrorMessage | value / string | declared | Bluent extension | Blazor InputBase date parsing validation | Custom parsing copy is part of Blazor form validation and has no matching property on the related fluent-text-input tag. | [DateField.razor.cs:35](../../../src/Bluent.UI/Components/DateFieldComponent/DateField.razor.cs#L35) |
| DateField.StartAddon | slot / RenderFragment? | local_inherited | Supported | fluent-text-input start slot | DateField, TimeField and MaskedField forward this fragment to MaskedField, which renders a leading addon region; OtpField does not render this inherited property and overrides it below. | [BluentFieldComponentBase.cs:9](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L9) |
| DateField.EndAddon | slot / RenderFragment? | local_inherited | Supported | fluent-text-input end slot | DateField, TimeField and MaskedField forward this fragment to MaskedField, which renders a trailing addon region; OtpField does not render this inherited property and overrides it below. | [BluentFieldComponentBase.cs:10](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L10) |
| DateField.Size | value / FieldSize | local_inherited | Supported | fluent-text-input control-size | DateField, TimeField and MaskedField forward FieldSize to MaskedField, which adds the corresponding size class; OtpField does not apply a size class and overrides it below. | [BluentFieldComponentBase.cs:11](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L11) |
| DateField.BindValueEvent | value / string | local_inherited | Missing | Inherited BindValueEvent is not forwarded to the nested MaskedField | DateField binds CurrentValueAsString to a MaskedField component but does not pass its own BindValueEvent; the parent parameter has no effect on the visible input event. | [BluentFieldComponentBase.cs:12](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L12) |
| DateField.Class | value / string? | local_inherited | Supported | Caller class forwarded to the rendered control wrapper | DateField, TimeField and MaskedField forward Class to the MaskedField wrapper. OtpField applies Class to its inner OTP group rather than the outer root and overrides it below. | [BluentInputComponentBase.cs:16](../../../src/Bluent.UI/Components/BluentInputComponentBase.cs#L16) |
| DateField.Style | value / string? | local_inherited | Supported | Caller style on the rendered root/wrapper | DateField, TimeField and MaskedField forward Style to the MaskedField wrapper; OtpField applies Style to its outer root. | [BluentInputComponentBase.cs:17](../../../src/Bluent.UI/Components/BluentInputComponentBase.cs#L17) |

### TimeField — #439

Pinned counterpart kind: related_only; referenced tags: fluent-text-input.

| Component / parameter | Kind / source type | Origin | Disposition | Upstream mapping | Rationale / value-level gaps | Source |
|---|---|---|---|---|---|---|
| TimeField.ParsingErrorMessage | value / string | declared | Bluent extension | Blazor InputBase time parsing validation | Custom parsing copy is part of Blazor form validation and has no matching property on the related fluent-text-input tag. | [TimeField.razor.cs:18](../../../src/Bluent.UI/Components/TimeFieldComponent/TimeField.razor.cs#L18) |
| TimeField.Seconds | value / bool | declared | Bluent extension | Time mask and display precision toggle | Seconds changes the accepted mask and formatted value; the pinned crosswalk has no dedicated time-picker tag. | [TimeField.razor.cs:19](../../../src/Bluent.UI/Components/TimeFieldComponent/TimeField.razor.cs#L19) |
| TimeField.Culture | value / CultureInfo | declared | Bluent extension | Culture-aware time parsing | Culture is passed to BindConverter parsing, but TimeOnly/DateTime formatting calls ToString without the Culture argument, so display formatting follows current culture rather than the supplied Culture. | [TimeField.razor.cs:20](../../../src/Bluent.UI/Components/TimeFieldComponent/TimeField.razor.cs#L20) |
| TimeField.StartAddon | slot / RenderFragment? | local_inherited | Supported | fluent-text-input start slot | DateField, TimeField and MaskedField forward this fragment to MaskedField, which renders a leading addon region; OtpField does not render this inherited property and overrides it below. | [BluentFieldComponentBase.cs:9](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L9) |
| TimeField.EndAddon | slot / RenderFragment? | local_inherited | Supported | fluent-text-input end slot | DateField, TimeField and MaskedField forward this fragment to MaskedField, which renders a trailing addon region; OtpField does not render this inherited property and overrides it below. | [BluentFieldComponentBase.cs:10](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L10) |
| TimeField.Size | value / FieldSize | local_inherited | Supported | fluent-text-input control-size | DateField, TimeField and MaskedField forward FieldSize to MaskedField, which adds the corresponding size class; OtpField does not apply a size class and overrides it below. | [BluentFieldComponentBase.cs:11](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L11) |
| TimeField.BindValueEvent | value / string | local_inherited | Missing | Inherited BindValueEvent is not forwarded to the nested MaskedField | TimeField binds CurrentValueAsString to a MaskedField component but does not pass its own BindValueEvent; the parent parameter has no effect on the visible input event. | [BluentFieldComponentBase.cs:12](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L12) |
| TimeField.Class | value / string? | local_inherited | Supported | Caller class forwarded to the rendered control wrapper | DateField, TimeField and MaskedField forward Class to the MaskedField wrapper. OtpField applies Class to its inner OTP group rather than the outer root and overrides it below. | [BluentInputComponentBase.cs:16](../../../src/Bluent.UI/Components/BluentInputComponentBase.cs#L16) |
| TimeField.Style | value / string? | local_inherited | Supported | Caller style on the rendered root/wrapper | DateField, TimeField and MaskedField forward Style to the MaskedField wrapper; OtpField applies Style to its outer root. | [BluentInputComponentBase.cs:17](../../../src/Bluent.UI/Components/BluentInputComponentBase.cs#L17) |

### MaskedField — #440

Pinned counterpart kind: related_only; referenced tags: fluent-text-input.

| Component / parameter | Kind / source type | Origin | Disposition | Upstream mapping | Rationale / value-level gaps | Source |
|---|---|---|---|---|---|---|
| MaskedField.Mask | value / string | declared | Bluent extension | Bluent regex mask lexer and literal insertion | A regex-driven partial-input mask has no one-to-one fluent-text-input property. Actual Chrome and Edge typed-input evidence reproduced a literal-prefix corruption: entering 09123456789 yields 0991-234-5678 for the configured 09xx-xxx-xxxx mask. | [MaskedField.razor.cs:16](../../../src/Bluent.UI/Components/MaskedFieldComponent/MaskedField.razor.cs#L16) |
| MaskedField.AsciiDigits | value / bool | declared | Bluent extension | Normalize accepted digits to ASCII | Digit normalization is a Bluent-specific input transformation and has no matching upstream text-input attribute. | [MaskedField.razor.cs:17](../../../src/Bluent.UI/Components/MaskedFieldComponent/MaskedField.razor.cs#L17) |
| MaskedField.ArabicToPersianConversion | value / bool | declared | Bluent extension | Convert Arabic digits to Persian digits | Culture-specific digit conversion is a Bluent input transformation; when both conversion flags are enabled, source applies ASCII conversion first and Persian conversion second, so the final output is Persian digits. | [MaskedField.razor.cs:18](../../../src/Bluent.UI/Components/MaskedFieldComponent/MaskedField.razor.cs#L18) |
| MaskedField.StartAddon | slot / RenderFragment? | local_inherited | Supported | fluent-text-input start slot | DateField, TimeField and MaskedField forward this fragment to MaskedField, which renders a leading addon region; OtpField does not render this inherited property and overrides it below. | [BluentFieldComponentBase.cs:9](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L9) |
| MaskedField.EndAddon | slot / RenderFragment? | local_inherited | Supported | fluent-text-input end slot | DateField, TimeField and MaskedField forward this fragment to MaskedField, which renders a trailing addon region; OtpField does not render this inherited property and overrides it below. | [BluentFieldComponentBase.cs:10](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L10) |
| MaskedField.Size | value / FieldSize | local_inherited | Supported | fluent-text-input control-size | DateField, TimeField and MaskedField forward FieldSize to MaskedField, which adds the corresponding size class; OtpField does not apply a size class and overrides it below. | [BluentFieldComponentBase.cs:11](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L11) |
| MaskedField.BindValueEvent | value / string | local_inherited | Missing | Inherited BindValueEvent is not used by MaskedField | MaskedField handles DOM input explicitly with @oninput and does not bind through BindValueEvent; changing this inherited parameter has no effect on the visible input. | [BluentFieldComponentBase.cs:12](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L12) |
| MaskedField.Class | value / string? | local_inherited | Supported | Caller class forwarded to the rendered control wrapper | DateField, TimeField and MaskedField forward Class to the MaskedField wrapper. OtpField applies Class to its inner OTP group rather than the outer root and overrides it below. | [BluentInputComponentBase.cs:16](../../../src/Bluent.UI/Components/BluentInputComponentBase.cs#L16) |
| MaskedField.Style | value / string? | local_inherited | Supported | Caller style on the rendered root/wrapper | DateField, TimeField and MaskedField forward Style to the MaskedField wrapper; OtpField applies Style to its outer root. | [BluentInputComponentBase.cs:17](../../../src/Bluent.UI/Components/BluentInputComponentBase.cs#L17) |

### OtpField — #441

Pinned counterpart kind: related_only; referenced tags: fluent-text-input.

| Component / parameter | Kind / source type | Origin | Disposition | Upstream mapping | Rationale / value-level gaps | Source |
|---|---|---|---|---|---|---|
| OtpField.Length | value / int | declared | Bluent extension | Number of one-character OTP cells | The control is a multi-cell interaction with one hidden bound value; it is not equivalent to one fluent-text-input field. | [OtpField.razor.cs:13](../../../src/Bluent.UI/Components/OtpFieldComponent/OtpField.razor.cs#L13) |
| OtpField.Password | value / bool | declared | Bluent extension | Switch OTP cells between text and password input types | Per-cell password masking is a composite OTP behavior, not a property of a single upstream text input. | [OtpField.razor.cs:14](../../../src/Bluent.UI/Components/OtpFieldComponent/OtpField.razor.cs#L14) |
| OtpField.AutoSubmit | value / bool | declared | Bluent extension | OTP interop submits the enclosing form after all cells are filled | The interop reads data-otp-auto-submit and calls requestSubmit/submit when the full value is present and an enclosing form exists; this is Bluent form orchestration, not a Fluent input attribute. | [OtpField.razor.cs:15](../../../src/Bluent.UI/Components/OtpFieldComponent/OtpField.razor.cs#L15) |
| OtpField.StartAddon | slot / RenderFragment? | local_inherited | Missing | Inherited StartAddon is not rendered by OtpField | OtpField markup does not render StartAddon despite inheriting the parameter; the public property has no effect. | [BluentFieldComponentBase.cs:9](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L9) |
| OtpField.EndAddon | slot / RenderFragment? | local_inherited | Missing | Inherited EndAddon is not rendered by OtpField | OtpField markup does not render EndAddon despite inheriting the parameter; the public property has no effect. | [BluentFieldComponentBase.cs:10](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L10) |
| OtpField.Size | value / FieldSize | local_inherited | Missing | Inherited Size is not applied by OtpField | OtpField.GetClasses emits only bui-otp-field and the markup has no size-class binding; changing the inherited Size parameter has no effect. | [BluentFieldComponentBase.cs:11](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L11) |
| OtpField.BindValueEvent | value / string | local_inherited | Bluent extension | OTP interop dispatches the configured DOM event to the hidden bound input | The JS interop reads data-otp-blazor-event and dispatches the selected event after updating the hidden input; this is Blazor-specific glue rather than an upstream custom-element attribute. | [BluentFieldComponentBase.cs:12](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L12) |
| OtpField.Class | value / string? | local_inherited | Bluent extension | Caller class applied to inner OTP group | OtpField applies Class to the inner .otp element, not the outer component root; this differs from the standard field-wrapper placement and needs an explicit API/design decision. | [BluentInputComponentBase.cs:16](../../../src/Bluent.UI/Components/BluentInputComponentBase.cs#L16) |
| OtpField.Style | value / string? | local_inherited | Supported | Caller style on the rendered root/wrapper | DateField, TimeField and MaskedField forward Style to the MaskedField wrapper; OtpField applies Style to its outer root. | [BluentInputComponentBase.cs:17](../../../src/Bluent.UI/Components/BluentInputComponentBase.cs#L17) |

## Out-of-band public/base findings

| Item | Disposition | Finding |
|---|---|---|
| InputBase<TValue> binding/validation surface | Bluent extension | Value, ValueChanged, ValueExpression and EditContext/validation integration are framework-owned binding contracts. The local inherited census intentionally stops at the external framework boundary. This ledger does not claim the complete emitted public API or complete EditContext/form behavior; reconcile the framework surface separately before public API acceptance. |

## Family-level feature disposition

- **DateField (#438): audited_gaps** — the pinned counterpart is only a related text input, not a date picker. DateClass is declared but unused, YearSelect formatting and mask disagree, and manual typed dates bypass Min/Max range enforcement.
- **TimeField (#439): audited_gaps** — there is no dedicated time-picker tag in the pinned WC crosswalk. Seconds and parsing are Bluent-specific, Culture is not used consistently for formatting, and inherited BindValueEvent is not forwarded to the visible mask input.
- **MaskedField (#440): audited_gaps** — regex masks and digit conversion are Bluent extensions; browser evidence reproduces leading-literal corruption (09123456789 becomes 0991-234-5678) in Chrome and Edge. The two digit-conversion flags also have order-dependent combined behavior. See [typed-field browser audit](FLUENT-PARITY-TYPED-FIELDS-BROWSER-AUDIT.md), [Chrome evidence](evidence/BLUENT-TYPED-FIELDS-CHROME.json) and [Edge evidence](evidence/BLUENT-TYPED-FIELDS-EDGE.json).
- **OtpField (#441): audited_gaps** — multi-cell OTP, password mode and auto-submit are composite Bluent behavior. Inherited StartAddon, EndAddon and Size are declared but not rendered/applied; Class targets the inner OTP group, and native AT/form acceptance remains open.

## Acceptance boundary

No product source, CSS, public API or component design was changed. This manual ledger does not modify the machine-generated candidate file, does not approve Fluent parity, and does not replace runtime/browser/OS/AT tests. Wave C feature dimensions may be recorded as audited_gaps; every family designApproval remains pending and evidenceBundle remains null. External InputBase binding/validation APIs are explicitly outside the 40 local occurrences. See the canonical 18-family matrix and independent visual/behavior/accessibility reports.
