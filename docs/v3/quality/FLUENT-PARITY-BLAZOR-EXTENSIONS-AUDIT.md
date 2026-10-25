# Blazor extension surface audit - Issue #552

Review date: 2026-10-22. Source baseline: 73155f02.

## Scope

This cross-family audit covers Blazor binding, validation, EventCallback and JavaScript interop. It distinguishes InputBase-backed fields from native event callbacks, custom value models and file/OTP interop. Source anchors and selected browser evidence are linked per family.

**Status: audited gaps, not accepted.** Selected WebAssembly and published-server probes do not establish a complete cross-render-mode contract. No native OS or assistive-technology certification is claimed.

## Family findings

| Family | Blazor contract | Source finding / evidence gap | Remaining acceptance |
|---|---|---|---|
| [Button](#button) | EventCallback-driven button; no InputBase value binding. | Click/toggle/focus evidence is selective, not a complete callback + disabled + state + native-AT matrix. | Published InteractiveServer callback lifecycle and native AT remain unaccepted. |
| [Icon](#icon) | IconDefinition and inline SVG composition; no InputBase. | Cross-icon/browser alignment is tested; accessible-name, SVG semantics and native AT are not certified. | Decorative versus informative semantics and native screen-reader behavior remain open. |
| [Label](#label) | Native label association plus display-only required marker; no value binding. | Required is visual decoration; it is not automatically connected to target required state or EditContext validation. | Dynamic label-for association and required-state consistency remain open. |
| [Link](#link) | Native anchor navigation plus optional EventCallback; no InputBase. | Href + callback/default-navigation ordering is not accepted across keyboard and published server mode. | Modifier clicks, callback ordering and native AT remain open. |
| [Badge](#badge) | Display/animation component; no InputBase. | AnimateShadow continues infinitely under reduced-motion emulation; native AT and interactive semantics remain open. | Reduced-motion and any interactive-variant semantics remain open. |
| [TextField](#textfield) | InputBase<TValue> binding/validation with configurable bind event. | Browser DOM reports an empty input name; form serialization and EditContext validation are not covered. | Native name/form submission, validation and full InteractiveServer binding remain open. |
| [NumericField](#numericfield) | InputBase<TValue> numeric parse/format binding. | Step has no effective behavior; only integer typing is tested, not decimal/float parsing, invalid input, limits or serialization. | Step, culture, validation and form submission remain open. |
| [Checkbox](#checkbox) | InputBase<TValue> checked-value binding over native checkbox. | Visual indeterminate does not set native input.indeterminate; browser AX reports unchecked; Required is a marker, not native required. | Mixed state, required validation, form serialization and native AT remain open. |
| [Switch](#switch) | Checkbox-derived value binding with switch styling. | Browser AX exposes checkbox rather than switch; inherited Size and Circular have no effect in reviewed source. | Role/state announcements, inherited parameters, EditContext and native AT remain open. |
| [RadioGroup](#radiogroup) | Group value/callback plus child native radios; custom group semantics. | Wrapper is ignored in AX, radio name attributes are empty, and ArrowRight crosses into the next group. | Group naming, one-tab-stop navigation, form serialization and validation remain open. |
| [SelectField](#selectfield) | Native select/InputBase-style binding with Bluent option composition. | Inherited BindValueEvent is not forwarded to the visible native select. | Bind-event contract, form name, validation and server mode remain open. |
| [DateField](#datefield) | InputBase date parsing/validation around nested MaskedField. | BindValueEvent is not forwarded; DateClass is unused; YearSelect mask/format disagree; typed values bypass Min/Max. | Nested event propagation, bounds, date validation and server mode remain open. |
| [TimeField](#timefield) | InputBase time parsing around nested MaskedField. | BindValueEvent is not forwarded; supplied Culture affects parsing but not consistently formatting. | Culture formatting, validation and server mode remain open. |
| [MaskedField](#maskedfield) | Explicit oninput mask engine updates Blazor current value. | BindValueEvent is unused; Chrome/Edge reproduce leading-literal corruption; digit-conversion flags are order-dependent. | Input event contract, paste/backspace, digit conversion and form binding remain open. |
| [OtpField](#otpfield) | Hidden bound value plus JS cell synchronization and event dispatch. | Synthetic paste is tested, not native clipboard/IME; labels are hard-coded English; inherited addons/size are no-ops. | Real form submit, native clipboard/IME, dynamic length, localization and native AT remain open. |
| [Slider](#slider) | ValueChanged callback driven by pointer interop; no InputBase. | Div/thumb composition has no native slider role, tabindex or keyboard behavior. | ARIA values, keyboard, callback order and published server mode remain open. |
| [RangeSlider](#rangeslider) | Two-value ValueRange callback driven by pointer interop; no InputBase. | Two-thumb composition has no native slider role/tabindex/keyboard; crossing and per-thumb focus semantics are unaccepted. | Independent thumb ARIA/keyboard, crossing policy and form integration remain open. |
| [FileSelect](#fileselect) | Native InputFile plus batch/per-file EventCallbacks; no InputBase value model. | MaxFiles=2 accepts three files; Disabled affects trigger only; remove action has glyph-only name; Accept is not upload security. | Limit enforcement, native disabled semantics, callback order, upload security and native AT remain open. |

## Evidence and follow-up

### Button (#428)

**Binding model:** EventCallback-driven button; no InputBase value binding.

**Source finding:** Click/toggle/focus evidence is selective, not a complete callback + disabled + state + native-AT matrix.

**Remaining gate:** Published InteractiveServer callback lifecycle and native AT remain unaccepted.

**Follow-up:** Verify OnClick order, toggle state, disabled behavior and focus in WASM and published server mode.

**Source files:** [Button.razor](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor), [Button.razor.cs](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor.cs)

**Source anchors:** [Button.razor:L7](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor#L7), [Button.razor:L11](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor#L11), [Button.razor:L15](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor#L15)

**Browser evidence:** [BLUENT-BUTTON-STATE-CHROME.json](evidence/BLUENT-BUTTON-STATE-CHROME.json), [BLUENT-BLAZOR-FOCUS-CHROME.json](evidence/BLUENT-BLAZOR-FOCUS-CHROME.json), [BLUENT-LAB-P0-BUTTON-KEYBOARD-SERVER-CHROME.json](evidence/BLUENT-LAB-P0-BUTTON-KEYBOARD-SERVER-CHROME.json)

**Family report:** [FLUENT-PARITY-BUTTON-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-BUTTON-AUDIT.md)

### Icon (#429)

**Binding model:** IconDefinition and inline SVG composition; no InputBase.

**Source finding:** Cross-icon/browser alignment is tested; accessible-name, SVG semantics and native AT are not certified.

**Remaining gate:** Decorative versus informative semantics and native screen-reader behavior remain open.

**Follow-up:** Test labeled/decorative icons with native screen readers and verify aria/title attributes on the rendered SVG/root.

**Source files:** [Icon.cs](../../../src/Bluent.UI/Components/IconComponent/Icon.cs)

**Source anchors:** [Icon.cs:L9](../../../src/Bluent.UI/Components/IconComponent/Icon.cs#L9), [Icon.cs:L56](../../../src/Bluent.UI/Components/IconComponent/Icon.cs#L56)

**Browser evidence:** [BLUENT-CROSS-ICON-CHROME.json](evidence/BLUENT-CROSS-ICON-CHROME.json), [BLUENT-BUTTON-ICON-ALIGN-CHROME.json](evidence/BLUENT-BUTTON-ICON-ALIGN-CHROME.json)

**Family report:** [FLUENT-PARITY-ICON-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-ICON-AUDIT.md)

### Label (#430)

**Binding model:** Native label association plus display-only required marker; no value binding.

**Source finding:** Required is visual decoration; it is not automatically connected to target required state or EditContext validation.

**Remaining gate:** Dynamic label-for association and required-state consistency remain open.

**Follow-up:** Verify changing target IDs and define whether Required is decorative or must track validation semantics.

**Source files:** [Label.razor](../../../src/Bluent.UI/Components/LabelComponent/Label.razor), [Label.razor.cs](../../../src/Bluent.UI/Components/LabelComponent/Label.razor.cs)

**Source anchors:** [Label.razor:L4](../../../src/Bluent.UI/Components/LabelComponent/Label.razor#L4), [Label.razor:L17](../../../src/Bluent.UI/Components/LabelComponent/Label.razor#L17), [Label.razor:L19](../../../src/Bluent.UI/Components/LabelComponent/Label.razor#L19)

**Browser evidence:** [BLUENT-LABEL-LINK-BADGE-CHROME.json](evidence/BLUENT-LABEL-LINK-BADGE-CHROME.json)

**Family report:** [FLUENT-PARITY-LABEL-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-LABEL-AUDIT.md)

### Link (#431)

**Binding model:** Native anchor navigation plus optional EventCallback; no InputBase.

**Source finding:** Href + callback/default-navigation ordering is not accepted across keyboard and published server mode.

**Remaining gate:** Modifier clicks, callback ordering and native AT remain open.

**Follow-up:** Test Href alone, callback alone, and both together in WASM and published server mode.

**Source files:** [Link.cs](../../../src/Bluent.UI/Components/LinkComponent/Link.cs)

**Source anchors:** [Link.cs:L9](../../../src/Bluent.UI/Components/LinkComponent/Link.cs#L9), [Link.cs:L12](../../../src/Bluent.UI/Components/LinkComponent/Link.cs#L12), [Link.cs:L25](../../../src/Bluent.UI/Components/LinkComponent/Link.cs#L25)

**Browser evidence:** [BLUENT-LABEL-LINK-BADGE-CHROME.json](evidence/BLUENT-LABEL-LINK-BADGE-CHROME.json)

**Family report:** [FLUENT-PARITY-LINK-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-LINK-AUDIT.md)

### Badge (#445)

**Binding model:** Display/animation component; no InputBase.

**Source finding:** AnimateShadow continues infinitely under reduced-motion emulation; native AT and interactive semantics remain open.

**Remaining gate:** Reduced-motion and any interactive-variant semantics remain open.

**Follow-up:** Honor prefers-reduced-motion for infinite shadow animation and verify semantics for interactive variants.

**Source files:** [Badge.razor](../../../src/Bluent.UI/Components/BadgeComponent/Badge.razor), [Badge.razor.cs](../../../src/Bluent.UI/Components/BadgeComponent/Badge.razor.cs)

**Source anchors:** [Badge.razor:L4](../../../src/Bluent.UI/Components/BadgeComponent/Badge.razor#L4)

**Browser evidence:** [BLUENT-LABEL-LINK-BADGE-CHROME.json](evidence/BLUENT-LABEL-LINK-BADGE-CHROME.json)

**Family report:** [FLUENT-PARITY-BADGE-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-BADGE-AUDIT.md)

### TextField (#432)

**Binding model:** InputBase<TValue> binding/validation with configurable bind event.

**Source finding:** Browser DOM reports an empty input name; form serialization and EditContext validation are not covered.

**Remaining gate:** Native name/form submission, validation and full InteractiveServer binding remain open.

**Follow-up:** Add a real EditForm fixture for ValueChanged, ValueExpression, validation, submit serialization and bind-event choice.

**Source files:** [TextField.razor](../../../src/Bluent.UI/Components/TextFieldComponent/TextField.razor), [TextField.razor.cs](../../../src/Bluent.UI/Components/TextFieldComponent/TextField.razor.cs)

**Source anchors:** [TextField.razor:L14](../../../src/Bluent.UI/Components/TextFieldComponent/TextField.razor#L14), [TextField.razor:L17](../../../src/Bluent.UI/Components/TextFieldComponent/TextField.razor#L17), [TextField.razor:L19](../../../src/Bluent.UI/Components/TextFieldComponent/TextField.razor#L19)

**Browser evidence:** [BLUENT-LAB-P0-CHROME.json](evidence/BLUENT-LAB-P0-CHROME.json)

**Family report:** [FLUENT-PARITY-TEXTFIELD-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-TEXTFIELD-AUDIT.md)

### NumericField (#433)

**Binding model:** InputBase<TValue> numeric parse/format binding.

**Source finding:** Step has no effective behavior; only integer typing is tested, not decimal/float parsing, invalid input, limits or serialization.

**Remaining gate:** Step, culture, validation and form submission remain open.

**Follow-up:** Test integer/decimal/float, invalid text, limits, culture changes, EditContext and form serialization.

**Source files:** [NumericField.razor](../../../src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor), [NumericField.razor.cs](../../../src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor.cs)

**Source anchors:** [NumericField.razor:L13](../../../src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor#L13), [NumericField.razor:L17](../../../src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor#L17), [NumericField.razor:L19](../../../src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor#L19)

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json)

**Family report:** [FLUENT-PARITY-TYPED-FIELDS-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-AUDIT.md)

### Checkbox (#434)

**Binding model:** InputBase<TValue> checked-value binding over native checkbox.

**Source finding:** Visual indeterminate does not set native input.indeterminate; browser AX reports unchecked; Required is a marker, not native required.

**Remaining gate:** Mixed state, required validation, form serialization and native AT remain open.

**Follow-up:** Set/clear native indeterminate state and verify aria-checked=mixed, required validation, reset and form serialization.

**Source files:** [Checkbox.razor](../../../src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor), [Checkbox.razor.cs](../../../src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor.cs)

**Source anchors:** [Checkbox.razor:L6](../../../src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor#L6), [Checkbox.razor:L10](../../../src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor#L10), [Checkbox.razor:L13](../../../src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor#L13)

**Browser evidence:** [BLUENT-CONTROL-SEMANTICS-CHROME.json](evidence/BLUENT-CONTROL-SEMANTICS-CHROME.json), [BLUENT-CONTROL-SEMANTICS-EDGE.json](evidence/BLUENT-CONTROL-SEMANTICS-EDGE.json)

**Family report:** [FLUENT-PARITY-CHECKBOX-SWITCH-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-CHECKBOX-SWITCH-AUDIT.md)

### Switch (#435)

**Binding model:** Checkbox-derived value binding with switch styling.

**Source finding:** Browser AX exposes checkbox rather than switch; inherited Size and Circular have no effect in reviewed source.

**Remaining gate:** Role/state announcements, inherited parameters, EditContext and native AT remain open.

**Follow-up:** Confirm role strategy; test checked/disabled announcements, keyboard, form binding and native AT.

**Source files:** [Switch.razor](../../../src/Bluent.UI/Components/SwitchComponent/Switch.razor), [Switch.razor.cs](../../../src/Bluent.UI/Components/SwitchComponent/Switch.razor.cs)

**Source anchors:** [Switch.razor:L5](../../../src/Bluent.UI/Components/SwitchComponent/Switch.razor#L5), [Switch.razor:L9](../../../src/Bluent.UI/Components/SwitchComponent/Switch.razor#L9), [Switch.razor:L12](../../../src/Bluent.UI/Components/SwitchComponent/Switch.razor#L12)

**Browser evidence:** [BLUENT-CONTROL-SEMANTICS-CHROME.json](evidence/BLUENT-CONTROL-SEMANTICS-CHROME.json), [BLUENT-CONTROL-SEMANTICS-EDGE.json](evidence/BLUENT-CONTROL-SEMANTICS-EDGE.json)

**Family report:** [FLUENT-PARITY-CHECKBOX-SWITCH-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-CHECKBOX-SWITCH-AUDIT.md)

### RadioGroup (#436)

**Binding model:** Group value/callback plus child native radios; custom group semantics.

**Source finding:** Wrapper is ignored in AX, radio name attributes are empty, and ArrowRight crosses into the next group.

**Remaining gate:** Group naming, one-tab-stop navigation, form serialization and validation remain open.

**Follow-up:** Add group label/name; isolate arrow navigation; test real form serialization and EditContext validation.

**Source files:** [Radio.razor](../../../src/Bluent.UI/Components/RadioGroupComponent/Radio.razor), [Radio.razor.cs](../../../src/Bluent.UI/Components/RadioGroupComponent/Radio.razor.cs), [RadioGroup.razor](../../../src/Bluent.UI/Components/RadioGroupComponent/RadioGroup.razor), [RadioGroup.razor.cs](../../../src/Bluent.UI/Components/RadioGroupComponent/RadioGroup.razor.cs)

**Source anchors:** [Radio.razor:L6](../../../src/Bluent.UI/Components/RadioGroupComponent/Radio.razor#L6), [Radio.razor.cs:L8](../../../src/Bluent.UI/Components/RadioGroupComponent/Radio.razor.cs#L8), [Radio.razor.cs:L26](../../../src/Bluent.UI/Components/RadioGroupComponent/Radio.razor.cs#L26)

**Browser evidence:** [BLUENT-CONTROL-SEMANTICS-CHROME.json](evidence/BLUENT-CONTROL-SEMANTICS-CHROME.json), [BLUENT-CONTROL-SEMANTICS-EDGE.json](evidence/BLUENT-CONTROL-SEMANTICS-EDGE.json)

**Family report:** [FLUENT-PARITY-RADIOGROUP-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-RADIOGROUP-AUDIT.md)

### SelectField (#437)

**Binding model:** Native select/InputBase-style binding with Bluent option composition.

**Source finding:** Inherited BindValueEvent is not forwarded to the visible native select.

**Remaining gate:** Bind-event contract, form name, validation and server mode remain open.

**Follow-up:** Forward or retire BindValueEvent and test callbacks, validation, reset and form serialization.

**Source files:** [SelectField.razor](../../../src/Bluent.UI/Components/SelectFieldComponent/SelectField.razor), [SelectField.razor.cs](../../../src/Bluent.UI/Components/SelectFieldComponent/SelectField.razor.cs)

**Source anchors:** [SelectField.razor:L13](../../../src/Bluent.UI/Components/SelectFieldComponent/SelectField.razor#L13), [SelectField.razor:L16](../../../src/Bluent.UI/Components/SelectFieldComponent/SelectField.razor#L16), [SelectField.razor:L19](../../../src/Bluent.UI/Components/SelectFieldComponent/SelectField.razor#L19)

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json)

**Family report:** [FLUENT-PARITY-TYPED-FIELDS-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-AUDIT.md)

### DateField (#438)

**Binding model:** InputBase date parsing/validation around nested MaskedField.

**Source finding:** BindValueEvent is not forwarded; DateClass is unused; YearSelect mask/format disagree; typed values bypass Min/Max.

**Remaining gate:** Nested event propagation, bounds, date validation and server mode remain open.

**Follow-up:** Align mask/format/parser; forward or retire BindValueEvent; enforce typed Min/Max; test EditContext.

**Source files:** [DateField.razor](../../../src/Bluent.UI/Components/DateFieldComponent/DateField.razor), [DateField.razor.cs](../../../src/Bluent.UI/Components/DateFieldComponent/DateField.razor.cs)

**Source anchors:** [DateField.razor:L13](../../../src/Bluent.UI/Components/DateFieldComponent/DateField.razor#L13), [DateField.razor:L17](../../../src/Bluent.UI/Components/DateFieldComponent/DateField.razor#L17), [DateField.razor.cs:L183](../../../src/Bluent.UI/Components/DateFieldComponent/DateField.razor.cs#L183)

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json)

**Family report:** [FLUENT-PARITY-TYPED-FIELDS-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-AUDIT.md)

### TimeField (#439)

**Binding model:** InputBase time parsing around nested MaskedField.

**Source finding:** BindValueEvent is not forwarded; supplied Culture affects parsing but not consistently formatting.

**Remaining gate:** Culture formatting, validation and server mode remain open.

**Follow-up:** Use Culture for both formatting/parsing; test seconds, locales, invalid input and EditForm validation.

**Source files:** [TimeField.razor](../../../src/Bluent.UI/Components/TimeFieldComponent/TimeField.razor), [TimeField.razor.cs](../../../src/Bluent.UI/Components/TimeFieldComponent/TimeField.razor.cs)

**Source anchors:** [TimeField.razor:L13](../../../src/Bluent.UI/Components/TimeFieldComponent/TimeField.razor#L13), [TimeField.razor:L17](../../../src/Bluent.UI/Components/TimeFieldComponent/TimeField.razor#L17)

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json)

**Family report:** [FLUENT-PARITY-TYPED-FIELDS-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-AUDIT.md)

### MaskedField (#440)

**Binding model:** Explicit oninput mask engine updates Blazor current value.

**Source finding:** BindValueEvent is unused; Chrome/Edge reproduce leading-literal corruption; digit-conversion flags are order-dependent.

**Remaining gate:** Input event contract, paste/backspace, digit conversion and form binding remain open.

**Follow-up:** Fix literal indexing; test typing/paste/deletion and Persian/Arabic digits with combined conversion flags.

**Source files:** [MaskedField.razor](../../../src/Bluent.UI/Components/MaskedFieldComponent/MaskedField.razor), [MaskedField.razor.cs](../../../src/Bluent.UI/Components/MaskedFieldComponent/MaskedField.razor.cs)

**Source anchors:** [MaskedField.razor:L12](../../../src/Bluent.UI/Components/MaskedFieldComponent/MaskedField.razor#L12), [MaskedField.razor:L16](../../../src/Bluent.UI/Components/MaskedFieldComponent/MaskedField.razor#L16), [MaskedField.razor:L18](../../../src/Bluent.UI/Components/MaskedFieldComponent/MaskedField.razor#L18)

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json)

**Family report:** [FLUENT-PARITY-TYPED-FIELDS-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-AUDIT.md)

### OtpField (#441)

**Binding model:** Hidden bound value plus JS cell synchronization and event dispatch.

**Source finding:** Synthetic paste is tested, not native clipboard/IME; labels are hard-coded English; inherited addons/size are no-ops.

**Remaining gate:** Real form submit, native clipboard/IME, dynamic length, localization and native AT remain open.

**Follow-up:** Add EditForm fixture; test event variants, native paste/IME, length changes, password mode and screen readers.

**Source files:** [OtpField.razor](../../../src/Bluent.UI/Components/OtpFieldComponent/OtpField.razor), [OtpField.razor.cs](../../../src/Bluent.UI/Components/OtpFieldComponent/OtpField.razor.cs)

**Source anchors:** [OtpField.razor:L4](../../../src/Bluent.UI/Components/OtpFieldComponent/OtpField.razor#L4), [OtpField.razor:L11](../../../src/Bluent.UI/Components/OtpFieldComponent/OtpField.razor#L11), [OtpField.razor:L33](../../../src/Bluent.UI/Components/OtpFieldComponent/OtpField.razor#L33)

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json)

**Family report:** [FLUENT-PARITY-OTP-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-OTP-AUDIT.md)

### Slider (#442)

**Binding model:** ValueChanged callback driven by pointer interop; no InputBase.

**Source finding:** Div/thumb composition has no native slider role, tabindex or keyboard behavior.

**Remaining gate:** ARIA values, keyboard, callback order and published server mode remain open.

**Follow-up:** Define native slider semantics and keyboard behavior; test bounds, callbacks and focus in WASM/server.

**Source files:** [Slider.razor](../../../src/Bluent.UI/Components/SliderComponent/Slider.razor), [Slider.razor.cs](../../../src/Bluent.UI/Components/SliderComponent/Slider.razor.cs)

**Source anchors:** [Slider.razor:L5](../../../src/Bluent.UI/Components/SliderComponent/Slider.razor#L5), [Slider.razor.cs:L28](../../../src/Bluent.UI/Components/SliderComponent/Slider.razor.cs#L28), [Slider.razor.cs:L306](../../../src/Bluent.UI/Components/SliderComponent/Slider.razor.cs#L306)

**Browser evidence:** [BLUENT-LAB-P0-POINTER-SCROLL-CHROME.json](evidence/BLUENT-LAB-P0-POINTER-SCROLL-CHROME.json), [BLUENT-LAB-P0-POINTER-SCROLL-SERVER-CHROME.json](evidence/BLUENT-LAB-P0-POINTER-SCROLL-SERVER-CHROME.json)

**Family report:** [FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md)

### RangeSlider (#443)

**Binding model:** Two-value ValueRange callback driven by pointer interop; no InputBase.

**Source finding:** Two-thumb composition has no native slider role/tabindex/keyboard; crossing and per-thumb focus semantics are unaccepted.

**Remaining gate:** Independent thumb ARIA/keyboard, crossing policy and form integration remain open.

**Follow-up:** Specify crossing policy and per-thumb semantics; test keyboard, callbacks and form binding in WASM/server.

**Source files:** [RangeSlider.razor](../../../src/Bluent.UI/Components/RangeSliderComponent/RangeSlider.razor), [RangeSlider.razor.cs](../../../src/Bluent.UI/Components/RangeSliderComponent/RangeSlider.razor.cs)

**Source anchors:** [RangeSlider.razor:L5](../../../src/Bluent.UI/Components/RangeSliderComponent/RangeSlider.razor#L5), [RangeSlider.razor.cs:L23](../../../src/Bluent.UI/Components/RangeSliderComponent/RangeSlider.razor.cs#L23), [RangeSlider.razor.cs:L24](../../../src/Bluent.UI/Components/RangeSliderComponent/RangeSlider.razor.cs#L24)

**Browser evidence:** [BLUENT-LAB-P0-POINTER-SCROLL-CHROME.json](evidence/BLUENT-LAB-P0-POINTER-SCROLL-CHROME.json), [BLUENT-LAB-P0-POINTER-SCROLL-SERVER-CHROME.json](evidence/BLUENT-LAB-P0-POINTER-SCROLL-SERVER-CHROME.json)

**Family report:** [FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md)

### FileSelect (#444)

**Binding model:** Native InputFile plus batch/per-file EventCallbacks; no InputBase value model.

**Source finding:** MaxFiles=2 accepts three files; Disabled affects trigger only; remove action has glyph-only name; Accept is not upload security.

**Remaining gate:** Limit enforcement, native disabled semantics, callback order, upload security and native AT remain open.

**Follow-up:** Enforce batch/cumulative policy; disable actual input; localize remove name; test callbacks and server-side upload validation.

**Source files:** [FileSelect.razor](../../../src/Bluent.UI/Components/FileSelectComponent/FileSelect.razor), [FileSelect.razor.cs](../../../src/Bluent.UI/Components/FileSelectComponent/FileSelect.razor.cs)

**Source anchors:** [FileSelect.razor:L6](../../../src/Bluent.UI/Components/FileSelectComponent/FileSelect.razor#L6), [FileSelect.razor:L8](../../../src/Bluent.UI/Components/FileSelectComponent/FileSelect.razor#L8), [FileSelect.razor:L11](../../../src/Bluent.UI/Components/FileSelectComponent/FileSelect.razor#L11)

**Browser evidence:** [BLUENT-LAB-P0-FILE-UPLOAD-CHROME.json](evidence/BLUENT-LAB-P0-FILE-UPLOAD-CHROME.json), [BLUENT-LAB-P0-FILE-UPLOAD-SERVER-CHROME.json](evidence/BLUENT-LAB-P0-FILE-UPLOAD-SERVER-CHROME.json)

**Family report:** [FLUENT-PARITY-FILESELECT-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-FILESELECT-AUDIT.md)

## Acceptance boundary

All 18 BlazorExtensions dimensions are recorded as audited_gaps. Every family design approval remains pending and evidenceBundle remains null. No product source, CSS or public API changed. Form serialization, EditContext validation, callback order, published InteractiveServer behavior and native AT must be tested where applicable before #552 can close.
