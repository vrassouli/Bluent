# Interactive behavior audit - Issue #552

Review date: 2026-10-22. Source baseline: 73155f02.

## Scope

This audit consolidates source findings and selected browser observations for click/navigation, value binding, keyboard and pointer operation, state transitions, input parsing, file selection and validation. It preserves known failures as findings and separates confirmed defects from untested acceptance gates.

**Status: audited gaps, not accepted.** Browser probes cover selected interactions, not every state, render mode or native assistive technology. The current MaskedField leading-literal failure remains visible in the evidence.

## Family findings

| Family | Observed behavior | Known gap / evidence limit | Next acceptance step |
|---|---|---|---|
| [Button](#button) | Existing browser probes cover representative toggle/state and keyboard-focus paths. | The full OnClick callback-order, disabled/selected state and focus contract is not exercised across every appearance and published render mode. | Run a single state-transition matrix for click, toggle, disabled, focus and callback ordering in WASM and published InteractiveServer. |
| [Icon](#icon) | Cross-icon browser probes compare representative rendered size, alignment and inherited color. | Icon behavior is mostly static composition; dynamic accessible naming and native screen-reader behavior are not accepted by DOM/screenshot evidence. | Test informative versus decorative icons, dynamic icon changes, title/aria propagation and native AT. |
| [Label](#label) | Browser evidence covers representative label rendering and association. | Required is a display marker, not a live EditContext/target-required state; dynamic target-ID changes and click-to-focus are not fully tested. | Exercise label click/focus, dynamic For changes, required/invalid state and localization in a real EditForm. |
| [Link](#link) | Browser evidence covers representative anchor rendering and keyboard semantics. | Href plus OnClick/default-navigation ordering, modified clicks and published-server behavior remain unaccepted. | Test Href alone, callback alone and both together; verify Enter, modifier clicks and default navigation in WASM/server. |
| [Badge](#badge) | Browser evidence covers representative badge variants and animation. | Infinite shadow animation has no component-specific reduced-motion rule; interactive semantics are not accepted. | Test reduced-motion behavior and verify focus/click semantics only for variants intended to be interactive. |
| [TextField](#textfield) | The field probe captures native input attributes and visual states. | A real EditForm value/validation/submit cycle is not in the evidence set; the visible input has an empty name. | Test ValueChanged, ValueExpression, bind event, validation messages, reset and form submission with a real EditForm. |
| [NumericField](#numericfield) | Chrome/Edge browser evidence shows keyboard-entered integer input updates the bound display. | Step has no effective behavior; decimal/float parsing, invalid text, limits, culture and validation remain untested. | Exercise integer/decimal/float values, invalid text, limits, Step, culture changes and EditForm validation. |
| [Checkbox](#checkbox) | Space toggles the native checkbox and the bound state changes. | The visual mixed state does not set native input.indeterminate and AX reports unchecked; required validation is not native. | Test mixed-state transitions, form reset, required validation and serialization; confirm aria-checked=mixed. |
| [Switch](#switch) | Space toggles the switch-like checkbox and bound state changes. | AX exposes checkbox rather than switch; inherited Size/Circular parameters have no effect. | Confirm the role contract, test checked/disabled transitions, keyboard and form binding, then native AT. |
| [RadioGroup](#radiogroup) | Arrow navigation works within the first options of a group. | ArrowRight from the final option moves into the next RadioGroup; group wrapper is ignored and radio name is empty. | Isolate arrow-key navigation per group, provide group name/label and test tab stops, value updates and form submission. |
| [SelectField](#selectfield) | Native ArrowDown changes the selected option from Green to Blue. | Inherited BindValueEvent is not forwarded to the visible select; form name/validation behavior is not accepted. | Test bind-event choice, ValueChanged, disabled/required states, reset, EditContext and native form serialization. |
| [DateField](#datefield) | The browser probe captures the native date input and field state. | Typed values can bypass Min/Max bounds; YearSelect format and mask disagree and nested bind-event behavior is incomplete. | Test typed and picker-selected dates at every bound, invalid input, calendar navigation and EditForm validation. |
| [TimeField](#timefield) | The browser probe captures native time input and field state. | Culture is used for parsing but not consistently for formatting; nested bind-event and seconds behavior remain open. | Test locale-specific formatting/parsing, seconds, invalid input, keyboard/picker operation and EditForm validation. |
| [MaskedField](#maskedfield) | Typing and bound display are exercised in Chrome and Edge. | A real browser failure reproduces leading-literal corruption: 09123456789 becomes 0991-234-5678; paste/backspace and digit conversion combinations remain open. | Fix mask literal indexing, then test typing, paste, backspace, deletion and Persian/Arabic digit conversion. |
| [OtpField](#otpfield) | Browser probes cover sequential typing, Backspace, ArrowLeft, synthetic paste and non-digit filtering. | Native clipboard/IME, dynamic length, localized labels and real form submission are not tested. | Test native paste/IME, length changes, event dispatch, password mode, localized labels and EditForm submission. |
| [Slider](#slider) | Pointer interaction changes the slider value in existing browser probes. | The visible div/thumb composition has no native slider role, tabindex or keyboard behavior. | Define role/ARIA and keyboard semantics; test pointer/keyboard bounds, callbacks, focus and published server mode. |
| [RangeSlider](#rangeslider) | Pointer interaction covers representative two-thumb value updates. | The two-thumb composition lacks native keyboard semantics; crossing/collision and independent thumb focus/value rules are not accepted. | Specify crossing policy and per-thumb role/ARIA/keyboard behavior; test both thumbs and callbacks in WASM/server. |
| [FileSelect](#fileselect) | Browser probes cover file selection and a published-server upload path. | MaxFiles=2 accepts three files; Disabled affects the trigger only and the remove action has a glyph-only accessible name. | Enforce batch/cumulative limits, disable the actual input, add a localized remove label and test callback ordering/security. |

## Evidence and follow-up

### Button (#428)

**Observed behavior:** Existing browser probes cover representative toggle/state and keyboard-focus paths.

**Known gap / evidence limit:** The full OnClick callback-order, disabled/selected state and focus contract is not exercised across every appearance and published render mode.

**Follow-up:** Run a single state-transition matrix for click, toggle, disabled, focus and callback ordering in WASM and published InteractiveServer.

**Source files:** [Button.razor](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor), [Button.razor.cs](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor.cs)

**Source anchors:** [Button.razor:L7](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor#L7), [Button.razor:L15](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor#L15), [Button.razor:L58](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor#L58)

**Browser evidence:** [BLUENT-BUTTON-STATE-CHROME.json](evidence/BLUENT-BUTTON-STATE-CHROME.json), [BLUENT-BLAZOR-FOCUS-CHROME.json](evidence/BLUENT-BLAZOR-FOCUS-CHROME.json), [BLUENT-LAB-P0-BUTTON-KEYBOARD-SERVER-CHROME.json](evidence/BLUENT-LAB-P0-BUTTON-KEYBOARD-SERVER-CHROME.json)

**Family audit:** [FLUENT-PARITY-BUTTON-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-BUTTON-AUDIT.md)

### Icon (#429)

**Observed behavior:** Cross-icon browser probes compare representative rendered size, alignment and inherited color.

**Known gap / evidence limit:** Icon behavior is mostly static composition; dynamic accessible naming and native screen-reader behavior are not accepted by DOM/screenshot evidence.

**Follow-up:** Test informative versus decorative icons, dynamic icon changes, title/aria propagation and native AT.

**Source files:** [Icon.cs](../../../src/Bluent.UI/Components/IconComponent/Icon.cs)

**Source anchors:** [Icon.cs:L9](../../../src/Bluent.UI/Components/IconComponent/Icon.cs#L9)

**Browser evidence:** [BLUENT-CROSS-ICON-CHROME.json](evidence/BLUENT-CROSS-ICON-CHROME.json), [BLUENT-BUTTON-ICON-ALIGN-CHROME.json](evidence/BLUENT-BUTTON-ICON-ALIGN-CHROME.json)

**Family audit:** [FLUENT-PARITY-ICON-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-ICON-AUDIT.md)

### Label (#430)

**Observed behavior:** Browser evidence covers representative label rendering and association.

**Known gap / evidence limit:** Required is a display marker, not a live EditContext/target-required state; dynamic target-ID changes and click-to-focus are not fully tested.

**Follow-up:** Exercise label click/focus, dynamic For changes, required/invalid state and localization in a real EditForm.

**Source files:** [Label.razor](../../../src/Bluent.UI/Components/LabelComponent/Label.razor), [Label.razor.cs](../../../src/Bluent.UI/Components/LabelComponent/Label.razor.cs)

**Source anchors:** [Label.razor:L17](../../../src/Bluent.UI/Components/LabelComponent/Label.razor#L17), [Label.razor:L19](../../../src/Bluent.UI/Components/LabelComponent/Label.razor#L19), [Label.razor.cs:L12](../../../src/Bluent.UI/Components/LabelComponent/Label.razor.cs#L12)

**Browser evidence:** [BLUENT-LABEL-LINK-BADGE-CHROME.json](evidence/BLUENT-LABEL-LINK-BADGE-CHROME.json)

**Family audit:** [FLUENT-PARITY-LABEL-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-LABEL-AUDIT.md)

### Link (#431)

**Observed behavior:** Browser evidence covers representative anchor rendering and keyboard semantics.

**Known gap / evidence limit:** Href plus OnClick/default-navigation ordering, modified clicks and published-server behavior remain unaccepted.

**Follow-up:** Test Href alone, callback alone and both together; verify Enter, modifier clicks and default navigation in WASM/server.

**Source files:** [Link.cs](../../../src/Bluent.UI/Components/LinkComponent/Link.cs)

**Source anchors:** [Link.cs:L9](../../../src/Bluent.UI/Components/LinkComponent/Link.cs#L9), [Link.cs:L12](../../../src/Bluent.UI/Components/LinkComponent/Link.cs#L12), [Link.cs:L25](../../../src/Bluent.UI/Components/LinkComponent/Link.cs#L25)

**Browser evidence:** [BLUENT-LABEL-LINK-BADGE-CHROME.json](evidence/BLUENT-LABEL-LINK-BADGE-CHROME.json)

**Family audit:** [FLUENT-PARITY-LINK-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-LINK-AUDIT.md)

### Badge (#445)

**Observed behavior:** Browser evidence covers representative badge variants and animation.

**Known gap / evidence limit:** Infinite shadow animation has no component-specific reduced-motion rule; interactive semantics are not accepted.

**Follow-up:** Test reduced-motion behavior and verify focus/click semantics only for variants intended to be interactive.

**Source files:** [Badge.razor](../../../src/Bluent.UI/Components/BadgeComponent/Badge.razor), [Badge.razor.cs](../../../src/Bluent.UI/Components/BadgeComponent/Badge.razor.cs)

**Source anchors:** [Badge.razor:L1](../../../src/Bluent.UI/Components/BadgeComponent/Badge.razor#L1)

**Browser evidence:** [BLUENT-LABEL-LINK-BADGE-CHROME.json](evidence/BLUENT-LABEL-LINK-BADGE-CHROME.json)

**Family audit:** [FLUENT-PARITY-BADGE-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-BADGE-AUDIT.md)

### TextField (#432)

**Observed behavior:** The field probe captures native input attributes and visual states.

**Known gap / evidence limit:** A real EditForm value/validation/submit cycle is not in the evidence set; the visible input has an empty name.

**Follow-up:** Test ValueChanged, ValueExpression, bind event, validation messages, reset and form submission with a real EditForm.

**Source files:** [TextField.razor](../../../src/Bluent.UI/Components/TextFieldComponent/TextField.razor), [TextField.razor.cs](../../../src/Bluent.UI/Components/TextFieldComponent/TextField.razor.cs)

**Source anchors:** [TextField.razor:L19](../../../src/Bluent.UI/Components/TextFieldComponent/TextField.razor#L19), [TextField.razor:L29](../../../src/Bluent.UI/Components/TextFieldComponent/TextField.razor#L29), [TextField.razor.cs:L20](../../../src/Bluent.UI/Components/TextFieldComponent/TextField.razor.cs#L20)

**Browser evidence:** [BLUENT-LAB-P0-CHROME.json](evidence/BLUENT-LAB-P0-CHROME.json)

**Family audit:** [FLUENT-PARITY-TEXTFIELD-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-TEXTFIELD-AUDIT.md)

### NumericField (#433)

**Observed behavior:** Chrome/Edge browser evidence shows keyboard-entered integer input updates the bound display.

**Known gap / evidence limit:** Step has no effective behavior; decimal/float parsing, invalid text, limits, culture and validation remain untested.

**Follow-up:** Exercise integer/decimal/float values, invalid text, limits, Step, culture changes and EditForm validation.

**Source files:** [NumericField.razor](../../../src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor), [NumericField.razor.cs](../../../src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor.cs)

**Source anchors:** [NumericField.razor:L19](../../../src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor#L19), [NumericField.razor.cs:L36](../../../src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor.cs#L36), [NumericField.razor.cs:L37](../../../src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor.cs#L37)

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json)

**Family audit:** [FLUENT-PARITY-TYPED-FIELDS-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-AUDIT.md)

### Checkbox (#434)

**Observed behavior:** Space toggles the native checkbox and the bound state changes.

**Known gap / evidence limit:** The visual mixed state does not set native input.indeterminate and AX reports unchecked; required validation is not native.

**Follow-up:** Test mixed-state transitions, form reset, required validation and serialization; confirm aria-checked=mixed.

**Source files:** [Checkbox.razor](../../../src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor), [Checkbox.razor.cs](../../../src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor.cs)

**Source anchors:** [Checkbox.razor:L11](../../../src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor#L11), [Checkbox.razor:L13](../../../src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor#L13), [Checkbox.razor:L14](../../../src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor#L14)

**Browser evidence:** [BLUENT-CONTROL-SEMANTICS-CHROME.json](evidence/BLUENT-CONTROL-SEMANTICS-CHROME.json), [BLUENT-CONTROL-SEMANTICS-EDGE.json](evidence/BLUENT-CONTROL-SEMANTICS-EDGE.json)

**Family audit:** [FLUENT-PARITY-CHECKBOX-SWITCH-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-CHECKBOX-SWITCH-AUDIT.md)

### Switch (#435)

**Observed behavior:** Space toggles the switch-like checkbox and bound state changes.

**Known gap / evidence limit:** AX exposes checkbox rather than switch; inherited Size/Circular parameters have no effect.

**Follow-up:** Confirm the role contract, test checked/disabled transitions, keyboard and form binding, then native AT.

**Source files:** [Switch.razor](../../../src/Bluent.UI/Components/SwitchComponent/Switch.razor), [Switch.razor.cs](../../../src/Bluent.UI/Components/SwitchComponent/Switch.razor.cs)

**Source anchors:** [Switch.razor:L10](../../../src/Bluent.UI/Components/SwitchComponent/Switch.razor#L10), [Switch.razor:L12](../../../src/Bluent.UI/Components/SwitchComponent/Switch.razor#L12), [Switch.razor:L13](../../../src/Bluent.UI/Components/SwitchComponent/Switch.razor#L13)

**Browser evidence:** [BLUENT-CONTROL-SEMANTICS-CHROME.json](evidence/BLUENT-CONTROL-SEMANTICS-CHROME.json), [BLUENT-CONTROL-SEMANTICS-EDGE.json](evidence/BLUENT-CONTROL-SEMANTICS-EDGE.json)

**Family audit:** [FLUENT-PARITY-CHECKBOX-SWITCH-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-CHECKBOX-SWITCH-AUDIT.md)

### RadioGroup (#436)

**Observed behavior:** Arrow navigation works within the first options of a group.

**Known gap / evidence limit:** ArrowRight from the final option moves into the next RadioGroup; group wrapper is ignored and radio name is empty.

**Follow-up:** Isolate arrow-key navigation per group, provide group name/label and test tab stops, value updates and form submission.

**Source files:** [Radio.razor](../../../src/Bluent.UI/Components/RadioGroupComponent/Radio.razor), [Radio.razor.cs](../../../src/Bluent.UI/Components/RadioGroupComponent/Radio.razor.cs), [RadioGroup.razor](../../../src/Bluent.UI/Components/RadioGroupComponent/RadioGroup.razor), [RadioGroup.razor.cs](../../../src/Bluent.UI/Components/RadioGroupComponent/RadioGroup.razor.cs)

**Source anchors:** [Radio.razor:L6](../../../src/Bluent.UI/Components/RadioGroupComponent/Radio.razor#L6), [Radio.razor.cs:L8](../../../src/Bluent.UI/Components/RadioGroupComponent/Radio.razor.cs#L8), [Radio.razor.cs:L26](../../../src/Bluent.UI/Components/RadioGroupComponent/Radio.razor.cs#L26)

**Browser evidence:** [BLUENT-CONTROL-SEMANTICS-CHROME.json](evidence/BLUENT-CONTROL-SEMANTICS-CHROME.json), [BLUENT-CONTROL-SEMANTICS-EDGE.json](evidence/BLUENT-CONTROL-SEMANTICS-EDGE.json)

**Family audit:** [FLUENT-PARITY-RADIOGROUP-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-RADIOGROUP-AUDIT.md)

### SelectField (#437)

**Observed behavior:** Native ArrowDown changes the selected option from Green to Blue.

**Known gap / evidence limit:** Inherited BindValueEvent is not forwarded to the visible select; form name/validation behavior is not accepted.

**Follow-up:** Test bind-event choice, ValueChanged, disabled/required states, reset, EditContext and native form serialization.

**Source files:** [SelectField.razor](../../../src/Bluent.UI/Components/SelectFieldComponent/SelectField.razor), [SelectField.razor.cs](../../../src/Bluent.UI/Components/SelectFieldComponent/SelectField.razor.cs)

**Source anchors:** [SelectField.razor:L19](../../../src/Bluent.UI/Components/SelectFieldComponent/SelectField.razor#L19), [SelectField.razor.cs:L31](../../../src/Bluent.UI/Components/SelectFieldComponent/SelectField.razor.cs#L31), [SelectField.razor.cs:L34](../../../src/Bluent.UI/Components/SelectFieldComponent/SelectField.razor.cs#L34)

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json)

**Family audit:** [FLUENT-PARITY-TYPED-FIELDS-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-AUDIT.md)

### DateField (#438)

**Observed behavior:** The browser probe captures the native date input and field state.

**Known gap / evidence limit:** Typed values can bypass Min/Max bounds; YearSelect format and mask disagree and nested bind-event behavior is incomplete.

**Follow-up:** Test typed and picker-selected dates at every bound, invalid input, calendar navigation and EditForm validation.

**Source files:** [DateField.razor](../../../src/Bluent.UI/Components/DateFieldComponent/DateField.razor), [DateField.razor.cs](../../../src/Bluent.UI/Components/DateFieldComponent/DateField.razor.cs)

**Source anchors:** [DateField.razor:L11](../../../src/Bluent.UI/Components/DateFieldComponent/DateField.razor#L11), [DateField.razor.cs:L60](../../../src/Bluent.UI/Components/DateFieldComponent/DateField.razor.cs#L60), [DateField.razor.cs:L74](../../../src/Bluent.UI/Components/DateFieldComponent/DateField.razor.cs#L74)

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json)

**Family audit:** [FLUENT-PARITY-TYPED-FIELDS-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-AUDIT.md)

### TimeField (#439)

**Observed behavior:** The browser probe captures native time input and field state.

**Known gap / evidence limit:** Culture is used for parsing but not consistently for formatting; nested bind-event and seconds behavior remain open.

**Follow-up:** Test locale-specific formatting/parsing, seconds, invalid input, keyboard/picker operation and EditForm validation.

**Source files:** [TimeField.razor](../../../src/Bluent.UI/Components/TimeFieldComponent/TimeField.razor), [TimeField.razor.cs](../../../src/Bluent.UI/Components/TimeFieldComponent/TimeField.razor.cs)

**Source anchors:** [TimeField.razor:L11](../../../src/Bluent.UI/Components/TimeFieldComponent/TimeField.razor#L11), [TimeField.razor.cs:L36](../../../src/Bluent.UI/Components/TimeFieldComponent/TimeField.razor.cs#L36), [TimeField.razor.cs:L42](../../../src/Bluent.UI/Components/TimeFieldComponent/TimeField.razor.cs#L42)

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json)

**Family audit:** [FLUENT-PARITY-TYPED-FIELDS-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-AUDIT.md)

### MaskedField (#440)

**Observed behavior:** Typing and bound display are exercised in Chrome and Edge.

**Known gap / evidence limit:** A real browser failure reproduces leading-literal corruption: 09123456789 becomes 0991-234-5678; paste/backspace and digit conversion combinations remain open.

**Follow-up:** Fix mask literal indexing, then test typing, paste, backspace, deletion and Persian/Arabic digit conversion.

**Source files:** [MaskedField.razor](../../../src/Bluent.UI/Components/MaskedFieldComponent/MaskedField.razor), [MaskedField.razor.cs](../../../src/Bluent.UI/Components/MaskedFieldComponent/MaskedField.razor.cs)

**Source anchors:** [MaskedField.razor:L18](../../../src/Bluent.UI/Components/MaskedFieldComponent/MaskedField.razor#L18), [MaskedField.razor:L20](../../../src/Bluent.UI/Components/MaskedFieldComponent/MaskedField.razor#L20), [MaskedField.razor:L21](../../../src/Bluent.UI/Components/MaskedFieldComponent/MaskedField.razor#L21)

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json)

**Family audit:** [FLUENT-PARITY-TYPED-FIELDS-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-AUDIT.md)

### OtpField (#441)

**Observed behavior:** Browser probes cover sequential typing, Backspace, ArrowLeft, synthetic paste and non-digit filtering.

**Known gap / evidence limit:** Native clipboard/IME, dynamic length, localized labels and real form submission are not tested.

**Follow-up:** Test native paste/IME, length changes, event dispatch, password mode, localized labels and EditForm submission.

**Source files:** [OtpField.razor](../../../src/Bluent.UI/Components/OtpFieldComponent/OtpField.razor), [OtpField.razor.cs](../../../src/Bluent.UI/Components/OtpFieldComponent/OtpField.razor.cs)

**Source anchors:** [OtpField.razor:L11](../../../src/Bluent.UI/Components/OtpFieldComponent/OtpField.razor#L11), [OtpField.razor:L14](../../../src/Bluent.UI/Components/OtpFieldComponent/OtpField.razor#L14), [OtpField.razor:L25](../../../src/Bluent.UI/Components/OtpFieldComponent/OtpField.razor#L25)

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json)

**Family audit:** [FLUENT-PARITY-OTP-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-OTP-AUDIT.md)

### Slider (#442)

**Observed behavior:** Pointer interaction changes the slider value in existing browser probes.

**Known gap / evidence limit:** The visible div/thumb composition has no native slider role, tabindex or keyboard behavior.

**Follow-up:** Define role/ARIA and keyboard semantics; test pointer/keyboard bounds, callbacks, focus and published server mode.

**Source files:** [Slider.razor](../../../src/Bluent.UI/Components/SliderComponent/Slider.razor), [Slider.razor.cs](../../../src/Bluent.UI/Components/SliderComponent/Slider.razor.cs)

**Source anchors:** [Slider.razor.cs:L28](../../../src/Bluent.UI/Components/SliderComponent/Slider.razor.cs#L28), [Slider.razor.cs:L125](../../../src/Bluent.UI/Components/SliderComponent/Slider.razor.cs#L125), [Slider.razor.cs:L139](../../../src/Bluent.UI/Components/SliderComponent/Slider.razor.cs#L139)

**Browser evidence:** [BLUENT-LAB-P0-POINTER-SCROLL-CHROME.json](evidence/BLUENT-LAB-P0-POINTER-SCROLL-CHROME.json), [BLUENT-LAB-P0-POINTER-SCROLL-SERVER-CHROME.json](evidence/BLUENT-LAB-P0-POINTER-SCROLL-SERVER-CHROME.json)

**Family audit:** [FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md)

### RangeSlider (#443)

**Observed behavior:** Pointer interaction covers representative two-thumb value updates.

**Known gap / evidence limit:** The two-thumb composition lacks native keyboard semantics; crossing/collision and independent thumb focus/value rules are not accepted.

**Follow-up:** Specify crossing policy and per-thumb role/ARIA/keyboard behavior; test both thumbs and callbacks in WASM/server.

**Source files:** [RangeSlider.razor](../../../src/Bluent.UI/Components/RangeSliderComponent/RangeSlider.razor), [RangeSlider.razor.cs](../../../src/Bluent.UI/Components/RangeSliderComponent/RangeSlider.razor.cs)

**Source anchors:** [RangeSlider.razor.cs:L23](../../../src/Bluent.UI/Components/RangeSliderComponent/RangeSlider.razor.cs#L23), [RangeSlider.razor.cs:L24](../../../src/Bluent.UI/Components/RangeSliderComponent/RangeSlider.razor.cs#L24), [RangeSlider.razor.cs:L118](../../../src/Bluent.UI/Components/RangeSliderComponent/RangeSlider.razor.cs#L118)

**Browser evidence:** [BLUENT-LAB-P0-POINTER-SCROLL-CHROME.json](evidence/BLUENT-LAB-P0-POINTER-SCROLL-CHROME.json), [BLUENT-LAB-P0-POINTER-SCROLL-SERVER-CHROME.json](evidence/BLUENT-LAB-P0-POINTER-SCROLL-SERVER-CHROME.json)

**Family audit:** [FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md)

### FileSelect (#444)

**Observed behavior:** Browser probes cover file selection and a published-server upload path.

**Known gap / evidence limit:** MaxFiles=2 accepts three files; Disabled affects the trigger only and the remove action has a glyph-only accessible name.

**Follow-up:** Enforce batch/cumulative limits, disable the actual input, add a localized remove label and test callback ordering/security.

**Source files:** [FileSelect.razor](../../../src/Bluent.UI/Components/FileSelectComponent/FileSelect.razor), [FileSelect.razor.cs](../../../src/Bluent.UI/Components/FileSelectComponent/FileSelect.razor.cs)

**Source anchors:** [FileSelect.razor:L8](../../../src/Bluent.UI/Components/FileSelectComponent/FileSelect.razor#L8), [FileSelect.razor:L11](../../../src/Bluent.UI/Components/FileSelectComponent/FileSelect.razor#L11), [FileSelect.razor:L14](../../../src/Bluent.UI/Components/FileSelectComponent/FileSelect.razor#L14)

**Browser evidence:** [BLUENT-LAB-P0-FILE-UPLOAD-CHROME.json](evidence/BLUENT-LAB-P0-FILE-UPLOAD-CHROME.json), [BLUENT-LAB-P0-FILE-UPLOAD-SERVER-CHROME.json](evidence/BLUENT-LAB-P0-FILE-UPLOAD-SERVER-CHROME.json)

**Family audit:** [FLUENT-PARITY-FILESELECT-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-FILESELECT-AUDIT.md)

## Acceptance boundary

All 18 behavior dimensions are recorded as audited_gaps. Every family design approval remains pending and evidenceBundle remains null. No product source, CSS or public API changed. Confirmed behavior defects must be fixed only after design/API decisions and appropriate owner review; the audit does not authorize implementation.
