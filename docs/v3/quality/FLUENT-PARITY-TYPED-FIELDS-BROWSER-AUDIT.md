# #552 browser audit — typed field families

**Partial runtime evidence only; no Fluent parity acceptance.** The Bluent UI Demo WebAssembly app was built from the task-branch source baseline `73155f02` and exercised in headless Chrome and Edge through Chromium DevTools Protocol (CDP). Each engine completed **45/45 instrumentation checks**, with 21 screenshots per engine. No product component source or design file was changed.

## Scope and limitations

- Route: `/components/fields`, viewport 1280 × 960.
- Families inspected: TextField #432, NumericField #433, SelectField #437, DateField #438, TimeField #439 and MaskedField #440. The probe also reruns the OTP smoke interactions as a shared route/setup regression guard; OTP's acceptance disposition remains in the [control semantics audit](FLUENT-PARITY-CONTROL-SEMANTICS-BROWSER-AUDIT.md).
- Modes: Light/LTR and Dark/RTL applied through the demo's real header switches; forced-colors is **CDP-emulated**, not native Windows Contrast Themes.
- The browser accessibility tree, rendered input/select attributes, accessible names, keyboard interactions and Blazor-bound output were captured. Native screen readers, OS clipboard/paste, published InteractiveServer, native contrast, IME/composition, mobile input and editable-design approval were not tested.

| Evidence | Result |
| --- | --- |
| [Chrome structured evidence](evidence/BLUENT-TYPED-FIELDS-CHROME.json) | 45/45 checks; 0 failed |
| [Edge structured evidence](evidence/BLUENT-TYPED-FIELDS-EDGE.json) | 45/45 checks; 0 failed |
| Chrome screenshots | [TextField · Light/LTR](evidence/BLUENT-TYPED-FIELDS-CHROME-FIELD-TEXT-FIELD-LIGHT-LTR.png) · [MaskedField · Light/LTR](evidence/BLUENT-TYPED-FIELDS-CHROME-FIELD-MASKED-FIELD-LIGHT-LTR.png) · [TimeField · Light/LTR](evidence/BLUENT-TYPED-FIELDS-CHROME-FIELD-TIME-FIELD-LIGHT-LTR.png) · [DateField · Light/LTR](evidence/BLUENT-TYPED-FIELDS-CHROME-FIELD-DATE-FIELD-LIGHT-LTR.png) · [NumericField · Light/LTR](evidence/BLUENT-TYPED-FIELDS-CHROME-FIELD-NUMERIC-FIELD-LIGHT-LTR.png) · [SelectField · Light/LTR](evidence/BLUENT-TYPED-FIELDS-CHROME-FIELD-SELECT-FIELD-LIGHT-LTR.png) · [MaskedField · Dark/RTL](evidence/BLUENT-TYPED-FIELDS-CHROME-FIELD-MASKED-FIELD-DARK-RTL.png) · [DateField · forced colors](evidence/BLUENT-TYPED-FIELDS-CHROME-FIELD-DATE-FIELD-FORCED-COLORS.png) |
| Edge screenshots | [TextField · Light/LTR](evidence/BLUENT-TYPED-FIELDS-EDGE-FIELD-TEXT-FIELD-LIGHT-LTR.png) · [MaskedField · Light/LTR](evidence/BLUENT-TYPED-FIELDS-EDGE-FIELD-MASKED-FIELD-LIGHT-LTR.png) · [TimeField · Light/LTR](evidence/BLUENT-TYPED-FIELDS-EDGE-FIELD-TIME-FIELD-LIGHT-LTR.png) · [DateField · Light/LTR](evidence/BLUENT-TYPED-FIELDS-EDGE-FIELD-DATE-FIELD-LIGHT-LTR.png) · [NumericField · Light/LTR](evidence/BLUENT-TYPED-FIELDS-EDGE-FIELD-NUMERIC-FIELD-LIGHT-LTR.png) · [SelectField · Light/LTR](evidence/BLUENT-TYPED-FIELDS-EDGE-FIELD-SELECT-FIELD-LIGHT-LTR.png) · [MaskedField · Dark/RTL](evidence/BLUENT-TYPED-FIELDS-EDGE-FIELD-MASKED-FIELD-DARK-RTL.png) · [DateField · forced colors](evidence/BLUENT-TYPED-FIELDS-EDGE-FIELD-DATE-FIELD-FORCED-COLORS.png) |

The JSON files contain the full 21-screenshot lists for both engines, including all five field families in all three modes.

## Confirmed browser observations

### Demo-level duplicate DOM IDs in repeated field bindings

- A new whole-page DOM scan in both Chrome and Edge finds duplicate IDs in all three tested display modes: _timeOnly occurs twice, _timeSpan occurs twice, and _dateField occurs twice.
- The Fields.razor showcase binds two TimeField controls to the same _timeOnly and two to _timeSpan; the DateTime-backed TimeField and medium DateField also share _dateField. The generated IDs therefore collide in this demo composition.
- This can make label-for resolution ambiguous and is a concrete accessibility/markup defect in the current showcase. It does not by itself prove every isolated component instance generates duplicate IDs; use distinct explicit IDs when rendering multiple controls for one model field, then re-run the live audit.

### TextField #432

- The representative default input is exposed in both browser AX trees as a **textbox** named `Example text field`. Its `id` is `_textField` and the rendered label is associated with that input; the inspected element is `type="text"`.
- The inspected input has an empty `name` attribute and no explicit `autocomplete` or `inputmode`. This is an observation, not a confirmed form-serialization failure; actual form submission and EditContext mapping were not tested.
- This run did not exercise addon buttons, disabled/size variants, `Rows` textarea mode, `DigitOnly` / `AsciiDigits` / Arabic-to-Persian conversion, `GainFocus`, or alternate `BindValueEvent` values.

**Disposition:** the default field has a discoverable AX name and working label association in this fixture. Form serialization, conversion flags and alternate binding events remain open under #432.
### NumericField #433

- The representative `Nullable int` control is exposed in Chrome and Edge AX as a **textbox** named `Nullable int`, not a spinbutton. The rendered element is `type="text"`; no native `inputmode`, `step`, `min` or `max` attribute is present on the inspected input.
- Keyboard-entering `123` and leaving the control updates the bound demo output to `Value: 123` in both engines. This confirms the tested integer-entry path only; decimal separators, localized digits, range constraints, `Step` behavior and invalid-value recovery remain open.

**Disposition:** basic integer entry works in this demo path; source-confirmed `Step` no-op and missing explicit numeric input-mode semantics remain open under #433.

### SelectField #437

- The native `<select>` is exposed in both AX trees as a **combobox** named `Select field`. The initial selected value is `Green`.
- Native ArrowDown changes the selected value to `Blue` in both browsers.
- The fixture exercises single-select only. It does not validate array binding/multiple selection, form serialization, validation, or the inherited `BindValueEvent` contract.

**Disposition:** native single-select keyboard behavior works in the tested path. Multiple-select and inherited event-selector behavior remain open under #437.

### DateField #438

- The representative `Small date field` is exposed as a named textbox. The demo's inspected date/month variants render text inputs with `autocomplete="off"`; the disabled date variant is actually disabled.
- The representative value is formatted as `yyyy/MM/dd` in the demo. This run did not exercise typed Min/Max boundaries, YearSelect, picker-button activation or calendar-trigger accessible naming.

**Disposition:** labels and the disabled fixture are present in the browser tree; source-confirmed range bypass, YearSelect format/mask inconsistency and calendar-trigger naming remain open under #438.

### TimeField #439

- The representative `Time only` input is exposed as a named textbox. Time and time-with-seconds examples render text inputs with `autocomplete="off"`, not native `type="time"` controls.
- The demo currently renders time strings such as `21:44` and `21:44:52`. This run did not verify Culture switching, parsing, seconds edge cases or the inherited `BindValueEvent` parameter.

**Disposition:** tested fields are discoverable and named in browser AX. Culture/format and event-selector contracts remain open under #439.

### MaskedField #440 — reproduced prefix-literal defect

- The representative field is exposed as a textbox named `Masked field`. The actual input has no native `pattern` attribute or `maxlength`; validation is implemented by the component's regex logic and custom input handling.
- The configured regex is `^09\d{2}-\d{3}-\d{4}$`. Sequentially entering the intended digits `09123456789` produces **`0991-234-5678`**, and the bound demo output becomes `Typed value: 0991-234-5678`. The same result reproduced in Chrome and Edge.
- This is a concrete runtime behavior mismatch: the fixed `9` in the regex prefix is inserted as a literal after the leading `0`, then the user-entered `9` is entered as well; the final digit is lost from the accepted length. This is consistent with `AppendLiterals()` and `GetLiteralAt()` treating a digit literal like a punctuation separator. This diagnosis is source-supported but still belongs to the owning component issue for remediation.
- This run did not validate native paste, caret placement, IME composition, undo/redo, mobile keyboards, or Persian/Arabic digit normalization.

**Disposition:** the fixed-digit-prefix mismatch is reproduced in both browsers and must be tracked as an open behavior gap under #440. Do not fix product code in this retrospective audit; the owning issue must first satisfy its design/API workflow.

## Acceptance boundary

These results establish browser DOM/AX observations and a narrow set of keyboard paths only. Forced-colors is emulated, not native OS contrast; AX trees are not native screen-reader output. They do not establish full Fluent parity, design approval, or completion of the six families' nine-dimension audits. The canonical matrix must remain `researching`, `designApproval=pending`, `evidenceBundle=null`, and `noneApproved=true` until each family's full acceptance evidence is reviewed.

Related reports: [typed-field source/API audit](FLUENT-PARITY-TYPED-FIELDS-AUDIT.md) · [Checkbox/Switch/RadioGroup/OtpField browser audit](FLUENT-PARITY-CONTROL-SEMANTICS-BROWSER-AUDIT.md) · [18-family retrospective matrix](FLUENT-PARITY-RETRO-AUDIT.md).
