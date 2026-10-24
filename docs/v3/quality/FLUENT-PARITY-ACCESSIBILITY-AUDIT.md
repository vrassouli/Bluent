# Accessibility semantics audit - Issue #552

Review date: 2026-10-22. Source baseline: 73155f02.

## Scope

This audit inventories accessible names, roles, state announcements, native control semantics, labels, validation associations and remaining assistive-technology gates for all 18 pilot families. It uses selected browser accessibility-tree snapshots plus source review.

**Status: audited gaps, not accepted.** Chromium/Edge AX snapshots are useful evidence but do not substitute for native screen-reader tests. Forced-colors emulation is not native OS high contrast.

## Family findings

| Family | Observed semantics | Known gap / evidence limit | Next acceptance step |
|---|---|---|---|
| [Button](#button) | The tested toggle specimen has a native button role and visible text; its browser snapshot records ariaPressed=None. | Toggle-state announcement is not represented by aria-pressed in the tested specimen; icon-only naming and native AT are not accepted. | Define toggle semantics and test accessible name, pressed/disabled state, focus indication and native screen-reader output. |
| [Icon](#icon) | Cross-icon evidence covers SVG rendering and inherited color, not native AT certification. | Decorative versus informative SVG semantics and icon-only accessible naming do not have a complete documented/tested contract. | Define decorative/meaningful icon rules; test aria-hidden, title/name propagation and icon-only controls with native AT. |
| [Label](#label) | The browser demo renders labels; the sample label snapshot has an empty for attribute. | The current demo sample does not prove label-to-control association; required marker is not connected to native required/invalid state. | Use a real form fixture to test click-to-focus, dynamic target IDs, required/invalid state and localized marker announcements. |
| [Link](#link) | Browser AX evidence exposes the demo anchor as a native link with text and href. | Modified clicks, visited/focus states and callback/default-navigation semantics are not fully accepted; no native AT test exists. | Test Enter, modifier clicks, link name/context, focus and navigation behavior in browser and native AT. |
| [Badge](#badge) | The empty badge specimen is a div with no role, accessible name or live region; count badges render visible text. | The design contract does not state when a badge is decorative versus an announced count; infinite animation lacks reduced-motion handling. | Document decorative/count semantics; test count announcements, surrounding context and reduced-motion behavior. |
| [TextField](#textfield) | Browser AX exposes the tested field as a named textbox: Example text field. | The visible native input name attribute is empty; invalid/describedby association, validation announcements and form submission are not covered. | Test label, name, aria-describedby, aria-invalid, required state and validation announcements in a real EditForm. |
| [NumericField](#numericfield) | Browser AX exposes the tested numeric field as a named textbox: Nullable int. | It is exposed as textbox rather than spinbutton in the tested browser; confirm intended parity semantics and validate limits/Step announcements. | Compare role, value/limits, stepper keyboard and validation semantics against the pinned Fluent NumberField. |
| [Checkbox](#checkbox) | AX exposes a focusable native checkbox with its label. | Visual indeterminate is not native indeterminate; aria-checked is absent and AX reports checked=false, so mixed state is announced incorrectly. | Synchronize native indeterminate/aria-checked=mixed and test checked, mixed, disabled, required and reset announcements. |
| [Switch](#switch) | AX exposes a focusable checkbox with the label Light and checked state. | The tested switch is announced as checkbox rather than switch; state announcements and disabled behavior need explicit parity review. | Confirm intended role strategy, then test switch role/state announcements, keyboard, disabled and native AT. |
| [RadioGroup](#radiogroup) | Individual radio inputs have names, but the group wrapper is ignored by browser AX. | The group has no accessible group name; radio name attributes are empty and arrow navigation can cross into another group. | Provide group naming/field name, isolate arrow-key navigation and verify one-tab-stop behavior with native AT. |
| [SelectField](#selectfield) | Browser AX exposes the native select as a named combobox: Select field. | Popup/listbox announcements, selected option changes, invalid/required descriptions and form-field name are not fully verified. | Test expanded/selected states, option count/name, validation associations and native screen-reader behavior. |
| [DateField](#datefield) | Browser AX exposes the sample date field as a named textbox: Small date field. | Date-picker popup semantics, bounds, invalid state and date-format announcements are not covered by a native AT test. | Test picker navigation, selected date, min/max, invalid state and localized announcements with native AT. |
| [TimeField](#timefield) | Browser AX exposes the sample time field as a named textbox: Time only. | Time-picker and locale-specific formatting/announcements are not accepted; invalid/describedby semantics remain untested. | Test time entry/picker, locale, seconds, validation and native AT in both themes and RTL. |
| [MaskedField](#maskedfield) | Browser AX exposes a named textbox: Masked field. | Mask formatting has a reproduced input corruption and no complete invalid/describedby announcement test. | Fix mask behavior first, then test accessible name, helper/error text, caret, input mode and digit conversion. |
| [OtpField](#otpfield) | AX exposes a group named Verification code and four textboxes named Digit 1 of 4 through Digit 4 of 4. | Cell labels are hard-coded English; incomplete/invalid code state, native clipboard/IME, and form-submit announcements are not tested. | Localize group/cell labels and test incomplete/invalid state, paste/IME, focus movement and form submission with native AT. |
| [Slider](#slider) | Browser snapshot finds a div root and thumb; both have no role, tabindex or aria-valuenow. | No native slider semantics, keyboard focus or value announcement is exposed. | Add/define slider role, focusability, value/min/max/orientation and keyboard semantics, then test with native AT. |
| [RangeSlider](#rangeslider) | Browser snapshot finds a div root and two thumbs; the thumbs have no role, tabindex or aria-valuenow. | Neither thumb exposes an independent slider role/value or keyboard focus; crossing and range announcements are undefined. | Define per-thumb role/value/labels, keyboard interaction and crossing policy; test range announcements with native AT. |
| [FileSelect](#fileselect) | Browser probes exercise file selection and upload; the file input and remove action have separate semantics. | The remove action has a glyph-only accessible name; native disabled state, file count announcement and upload error announcements are not accepted. | Give remove actions localized names, expose file count/errors, test disabled input and upload progress/errors with native AT. |

## Evidence and follow-up

### Button (#428)

**Observed semantics:** The tested toggle specimen has a native button role and visible text; its browser snapshot records ariaPressed=None.

**Known gap / evidence limit:** Toggle-state announcement is not represented by aria-pressed in the tested specimen; icon-only naming and native AT are not accepted.

**Follow-up:** Define toggle semantics and test accessible name, pressed/disabled state, focus indication and native screen-reader output.

**Source files:** [Button.razor](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor), [Button.razor.cs](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor.cs)

**Source anchors:** [Button.razor:L7](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor#L7), [Button.razor:L105](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor#L105)

**Browser evidence:** [BLUENT-BUTTON-STATE-CHROME.json](evidence/BLUENT-BUTTON-STATE-CHROME.json), [BLUENT-BLAZOR-FOCUS-CHROME.json](evidence/BLUENT-BLAZOR-FOCUS-CHROME.json), [BLUENT-LAB-P0-BUTTON-KEYBOARD-SERVER-CHROME.json](evidence/BLUENT-LAB-P0-BUTTON-KEYBOARD-SERVER-CHROME.json)

**Family audit:** [FLUENT-PARITY-BUTTON-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-BUTTON-AUDIT.md)

### Icon (#429)

**Observed semantics:** Cross-icon evidence covers SVG rendering and inherited color, not native AT certification.

**Known gap / evidence limit:** Decorative versus informative SVG semantics and icon-only accessible naming do not have a complete documented/tested contract.

**Follow-up:** Define decorative/meaningful icon rules; test aria-hidden, title/name propagation and icon-only controls with native AT.

**Source files:** [Icon.cs](../../../src/Bluent.UI/Components/IconComponent/Icon.cs)

**Source anchors:** [Icon.cs:L9](../../../src/Bluent.UI/Components/IconComponent/Icon.cs#L9)

**Browser evidence:** [BLUENT-CROSS-ICON-CHROME.json](evidence/BLUENT-CROSS-ICON-CHROME.json), [BLUENT-BUTTON-ICON-ALIGN-CHROME.json](evidence/BLUENT-BUTTON-ICON-ALIGN-CHROME.json)

**Family audit:** [FLUENT-PARITY-ICON-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-ICON-AUDIT.md)

### Label (#430)

**Observed semantics:** The browser demo renders labels; the sample label snapshot has an empty for attribute.

**Known gap / evidence limit:** The current demo sample does not prove label-to-control association; required marker is not connected to native required/invalid state.

**Follow-up:** Use a real form fixture to test click-to-focus, dynamic target IDs, required/invalid state and localized marker announcements.

**Source files:** [Label.razor](../../../src/Bluent.UI/Components/LabelComponent/Label.razor), [Label.razor.cs](../../../src/Bluent.UI/Components/LabelComponent/Label.razor.cs)

**Source anchors:** [Label.razor:L4](../../../src/Bluent.UI/Components/LabelComponent/Label.razor#L4), [Label.razor:L17](../../../src/Bluent.UI/Components/LabelComponent/Label.razor#L17), [Label.razor:L19](../../../src/Bluent.UI/Components/LabelComponent/Label.razor#L19)

**Browser evidence:** [BLUENT-LABEL-LINK-BADGE-CHROME.json](evidence/BLUENT-LABEL-LINK-BADGE-CHROME.json)

**Family audit:** [FLUENT-PARITY-LABEL-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-LABEL-AUDIT.md)

### Link (#431)

**Observed semantics:** Browser AX evidence exposes the demo anchor as a native link with text and href.

**Known gap / evidence limit:** Modified clicks, visited/focus states and callback/default-navigation semantics are not fully accepted; no native AT test exists.

**Follow-up:** Test Enter, modifier clicks, link name/context, focus and navigation behavior in browser and native AT.

**Source files:** [Link.cs](../../../src/Bluent.UI/Components/LinkComponent/Link.cs)

**Source anchors:** [Link.cs:L9](../../../src/Bluent.UI/Components/LinkComponent/Link.cs#L9), [Link.cs:L25](../../../src/Bluent.UI/Components/LinkComponent/Link.cs#L25), [Link.cs:L58](../../../src/Bluent.UI/Components/LinkComponent/Link.cs#L58)

**Browser evidence:** [BLUENT-LABEL-LINK-BADGE-CHROME.json](evidence/BLUENT-LABEL-LINK-BADGE-CHROME.json)

**Family audit:** [FLUENT-PARITY-LINK-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-LINK-AUDIT.md)

### Badge (#445)

**Observed semantics:** The empty badge specimen is a div with no role, accessible name or live region; count badges render visible text.

**Known gap / evidence limit:** The design contract does not state when a badge is decorative versus an announced count; infinite animation lacks reduced-motion handling.

**Follow-up:** Document decorative/count semantics; test count announcements, surrounding context and reduced-motion behavior.

**Source files:** [Badge.razor](../../../src/Bluent.UI/Components/BadgeComponent/Badge.razor), [Badge.razor.cs](../../../src/Bluent.UI/Components/BadgeComponent/Badge.razor.cs)

**Source anchors:** [Badge.razor:L1](../../../src/Bluent.UI/Components/BadgeComponent/Badge.razor#L1)

**Browser evidence:** [BLUENT-LABEL-LINK-BADGE-CHROME.json](evidence/BLUENT-LABEL-LINK-BADGE-CHROME.json)

**Family audit:** [FLUENT-PARITY-BADGE-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-BADGE-AUDIT.md)

### TextField (#432)

**Observed semantics:** Browser AX exposes the tested field as a named textbox: Example text field.

**Known gap / evidence limit:** The visible native input name attribute is empty; invalid/describedby association, validation announcements and form submission are not covered.

**Follow-up:** Test label, name, aria-describedby, aria-invalid, required state and validation announcements in a real EditForm.

**Source files:** [TextField.razor](../../../src/Bluent.UI/Components/TextFieldComponent/TextField.razor), [TextField.razor.cs](../../../src/Bluent.UI/Components/TextFieldComponent/TextField.razor.cs)

**Source anchors:** [TextField.razor:L1](../../../src/Bluent.UI/Components/TextFieldComponent/TextField.razor#L1)

**Browser evidence:** [BLUENT-LAB-P0-CHROME.json](evidence/BLUENT-LAB-P0-CHROME.json)

**Family audit:** [FLUENT-PARITY-TEXTFIELD-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-TEXTFIELD-AUDIT.md)

### NumericField (#433)

**Observed semantics:** Browser AX exposes the tested numeric field as a named textbox: Nullable int.

**Known gap / evidence limit:** It is exposed as textbox rather than spinbutton in the tested browser; confirm intended parity semantics and validate limits/Step announcements.

**Follow-up:** Compare role, value/limits, stepper keyboard and validation semantics against the pinned Fluent NumberField.

**Source files:** [NumericField.razor](../../../src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor), [NumericField.razor.cs](../../../src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor.cs)

**Source anchors:** [NumericField.razor:L1](../../../src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor#L1)

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json)

**Family audit:** [FLUENT-PARITY-TYPED-FIELDS-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-AUDIT.md)

### Checkbox (#434)

**Observed semantics:** AX exposes a focusable native checkbox with its label.

**Known gap / evidence limit:** Visual indeterminate is not native indeterminate; aria-checked is absent and AX reports checked=false, so mixed state is announced incorrectly.

**Follow-up:** Synchronize native indeterminate/aria-checked=mixed and test checked, mixed, disabled, required and reset announcements.

**Source files:** [Checkbox.razor](../../../src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor), [Checkbox.razor.cs](../../../src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor.cs)

**Source anchors:** [Checkbox.razor:L15](../../../src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor#L15), [Checkbox.razor:L18](../../../src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor#L18), [Checkbox.razor:L22](../../../src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor#L22)

**Browser evidence:** [BLUENT-CONTROL-SEMANTICS-CHROME.json](evidence/BLUENT-CONTROL-SEMANTICS-CHROME.json), [BLUENT-CONTROL-SEMANTICS-EDGE.json](evidence/BLUENT-CONTROL-SEMANTICS-EDGE.json)

**Family audit:** [FLUENT-PARITY-CHECKBOX-SWITCH-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-CHECKBOX-SWITCH-AUDIT.md)

### Switch (#435)

**Observed semantics:** AX exposes a focusable checkbox with the label Light and checked state.

**Known gap / evidence limit:** The tested switch is announced as checkbox rather than switch; state announcements and disabled behavior need explicit parity review.

**Follow-up:** Confirm intended role strategy, then test switch role/state announcements, keyboard, disabled and native AT.

**Source files:** [Switch.razor](../../../src/Bluent.UI/Components/SwitchComponent/Switch.razor), [Switch.razor.cs](../../../src/Bluent.UI/Components/SwitchComponent/Switch.razor.cs)

**Source anchors:** [Switch.razor:L14](../../../src/Bluent.UI/Components/SwitchComponent/Switch.razor#L14), [Switch.razor:L18](../../../src/Bluent.UI/Components/SwitchComponent/Switch.razor#L18), [Switch.razor:L20](../../../src/Bluent.UI/Components/SwitchComponent/Switch.razor#L20)

**Browser evidence:** [BLUENT-CONTROL-SEMANTICS-CHROME.json](evidence/BLUENT-CONTROL-SEMANTICS-CHROME.json), [BLUENT-CONTROL-SEMANTICS-EDGE.json](evidence/BLUENT-CONTROL-SEMANTICS-EDGE.json)

**Family audit:** [FLUENT-PARITY-CHECKBOX-SWITCH-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-CHECKBOX-SWITCH-AUDIT.md)

### RadioGroup (#436)

**Observed semantics:** Individual radio inputs have names, but the group wrapper is ignored by browser AX.

**Known gap / evidence limit:** The group has no accessible group name; radio name attributes are empty and arrow navigation can cross into another group.

**Follow-up:** Provide group naming/field name, isolate arrow-key navigation and verify one-tab-stop behavior with native AT.

**Source files:** [Radio.razor](../../../src/Bluent.UI/Components/RadioGroupComponent/Radio.razor), [Radio.razor.cs](../../../src/Bluent.UI/Components/RadioGroupComponent/Radio.razor.cs), [RadioGroup.razor](../../../src/Bluent.UI/Components/RadioGroupComponent/RadioGroup.razor), [RadioGroup.razor.cs](../../../src/Bluent.UI/Components/RadioGroupComponent/RadioGroup.razor.cs)

**Source anchors:** [Radio.razor:L7](../../../src/Bluent.UI/Components/RadioGroupComponent/Radio.razor#L7), [Radio.razor:L8](../../../src/Bluent.UI/Components/RadioGroupComponent/Radio.razor#L8), [Radio.razor:L10](../../../src/Bluent.UI/Components/RadioGroupComponent/Radio.razor#L10)

**Browser evidence:** [BLUENT-CONTROL-SEMANTICS-CHROME.json](evidence/BLUENT-CONTROL-SEMANTICS-CHROME.json), [BLUENT-CONTROL-SEMANTICS-EDGE.json](evidence/BLUENT-CONTROL-SEMANTICS-EDGE.json)

**Family audit:** [FLUENT-PARITY-RADIOGROUP-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-RADIOGROUP-AUDIT.md)

### SelectField (#437)

**Observed semantics:** Browser AX exposes the native select as a named combobox: Select field.

**Known gap / evidence limit:** Popup/listbox announcements, selected option changes, invalid/required descriptions and form-field name are not fully verified.

**Follow-up:** Test expanded/selected states, option count/name, validation associations and native screen-reader behavior.

**Source files:** [SelectField.razor](../../../src/Bluent.UI/Components/SelectFieldComponent/SelectField.razor), [SelectField.razor.cs](../../../src/Bluent.UI/Components/SelectFieldComponent/SelectField.razor.cs)

**Source anchors:** [SelectField.razor:L1](../../../src/Bluent.UI/Components/SelectFieldComponent/SelectField.razor#L1)

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json)

**Family audit:** [FLUENT-PARITY-TYPED-FIELDS-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-AUDIT.md)

### DateField (#438)

**Observed semantics:** Browser AX exposes the sample date field as a named textbox: Small date field.

**Known gap / evidence limit:** Date-picker popup semantics, bounds, invalid state and date-format announcements are not covered by a native AT test.

**Follow-up:** Test picker navigation, selected date, min/max, invalid state and localized announcements with native AT.

**Source files:** [DateField.razor](../../../src/Bluent.UI/Components/DateFieldComponent/DateField.razor), [DateField.razor.cs](../../../src/Bluent.UI/Components/DateFieldComponent/DateField.razor.cs)

**Source anchors:** [DateField.razor.cs:L183](../../../src/Bluent.UI/Components/DateFieldComponent/DateField.razor.cs#L183)

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json)

**Family audit:** [FLUENT-PARITY-TYPED-FIELDS-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-AUDIT.md)

### TimeField (#439)

**Observed semantics:** Browser AX exposes the sample time field as a named textbox: Time only.

**Known gap / evidence limit:** Time-picker and locale-specific formatting/announcements are not accepted; invalid/describedby semantics remain untested.

**Follow-up:** Test time entry/picker, locale, seconds, validation and native AT in both themes and RTL.

**Source files:** [TimeField.razor](../../../src/Bluent.UI/Components/TimeFieldComponent/TimeField.razor), [TimeField.razor.cs](../../../src/Bluent.UI/Components/TimeFieldComponent/TimeField.razor.cs)

**Source anchors:** [TimeField.razor:L1](../../../src/Bluent.UI/Components/TimeFieldComponent/TimeField.razor#L1)

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json)

**Family audit:** [FLUENT-PARITY-TYPED-FIELDS-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-AUDIT.md)

### MaskedField (#440)

**Observed semantics:** Browser AX exposes a named textbox: Masked field.

**Known gap / evidence limit:** Mask formatting has a reproduced input corruption and no complete invalid/describedby announcement test.

**Follow-up:** Fix mask behavior first, then test accessible name, helper/error text, caret, input mode and digit conversion.

**Source files:** [MaskedField.razor](../../../src/Bluent.UI/Components/MaskedFieldComponent/MaskedField.razor), [MaskedField.razor.cs](../../../src/Bluent.UI/Components/MaskedFieldComponent/MaskedField.razor.cs)

**Source anchors:** [MaskedField.razor.cs:L16](../../../src/Bluent.UI/Components/MaskedFieldComponent/MaskedField.razor.cs#L16)

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json)

**Family audit:** [FLUENT-PARITY-TYPED-FIELDS-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-AUDIT.md)

### OtpField (#441)

**Observed semantics:** AX exposes a group named Verification code and four textboxes named Digit 1 of 4 through Digit 4 of 4.

**Known gap / evidence limit:** Cell labels are hard-coded English; incomplete/invalid code state, native clipboard/IME, and form-submit announcements are not tested.

**Follow-up:** Localize group/cell labels and test incomplete/invalid state, paste/IME, focus movement and form submission with native AT.

**Source files:** [OtpField.razor](../../../src/Bluent.UI/Components/OtpFieldComponent/OtpField.razor), [OtpField.razor.cs](../../../src/Bluent.UI/Components/OtpFieldComponent/OtpField.razor.cs)

**Source anchors:** [OtpField.razor:L13](../../../src/Bluent.UI/Components/OtpFieldComponent/OtpField.razor#L13), [OtpField.razor:L14](../../../src/Bluent.UI/Components/OtpFieldComponent/OtpField.razor#L14), [OtpField.razor:L25](../../../src/Bluent.UI/Components/OtpFieldComponent/OtpField.razor#L25)

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json)

**Family audit:** [FLUENT-PARITY-OTP-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-OTP-AUDIT.md)

### Slider (#442)

**Observed semantics:** Browser snapshot finds a div root and thumb; both have no role, tabindex or aria-valuenow.

**Known gap / evidence limit:** No native slider semantics, keyboard focus or value announcement is exposed.

**Follow-up:** Add/define slider role, focusability, value/min/max/orientation and keyboard semantics, then test with native AT.

**Source files:** [Slider.razor](../../../src/Bluent.UI/Components/SliderComponent/Slider.razor), [Slider.razor.cs](../../../src/Bluent.UI/Components/SliderComponent/Slider.razor.cs)

**Source anchors:** [Slider.razor:L1](../../../src/Bluent.UI/Components/SliderComponent/Slider.razor#L1)

**Browser evidence:** [BLUENT-LAB-P0-POINTER-SCROLL-CHROME.json](evidence/BLUENT-LAB-P0-POINTER-SCROLL-CHROME.json), [BLUENT-LAB-P0-POINTER-SCROLL-SERVER-CHROME.json](evidence/BLUENT-LAB-P0-POINTER-SCROLL-SERVER-CHROME.json)

**Family audit:** [FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md)

### RangeSlider (#443)

**Observed semantics:** Browser snapshot finds a div root and two thumbs; the thumbs have no role, tabindex or aria-valuenow.

**Known gap / evidence limit:** Neither thumb exposes an independent slider role/value or keyboard focus; crossing and range announcements are undefined.

**Follow-up:** Define per-thumb role/value/labels, keyboard interaction and crossing policy; test range announcements with native AT.

**Source files:** [RangeSlider.razor](../../../src/Bluent.UI/Components/RangeSliderComponent/RangeSlider.razor), [RangeSlider.razor.cs](../../../src/Bluent.UI/Components/RangeSliderComponent/RangeSlider.razor.cs)

**Source anchors:** [RangeSlider.razor:L1](../../../src/Bluent.UI/Components/RangeSliderComponent/RangeSlider.razor#L1)

**Browser evidence:** [BLUENT-LAB-P0-POINTER-SCROLL-CHROME.json](evidence/BLUENT-LAB-P0-POINTER-SCROLL-CHROME.json), [BLUENT-LAB-P0-POINTER-SCROLL-SERVER-CHROME.json](evidence/BLUENT-LAB-P0-POINTER-SCROLL-SERVER-CHROME.json)

**Family audit:** [FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md)

### FileSelect (#444)

**Observed semantics:** Browser probes exercise file selection and upload; the file input and remove action have separate semantics.

**Known gap / evidence limit:** The remove action has a glyph-only accessible name; native disabled state, file count announcement and upload error announcements are not accepted.

**Follow-up:** Give remove actions localized names, expose file count/errors, test disabled input and upload progress/errors with native AT.

**Source files:** [FileSelect.razor](../../../src/Bluent.UI/Components/FileSelectComponent/FileSelect.razor), [FileSelect.razor.cs](../../../src/Bluent.UI/Components/FileSelectComponent/FileSelect.razor.cs)

**Source anchors:** [FileSelect.razor:L8](../../../src/Bluent.UI/Components/FileSelectComponent/FileSelect.razor#L8), [FileSelect.razor:L16](../../../src/Bluent.UI/Components/FileSelectComponent/FileSelect.razor#L16), [FileSelect.razor.cs:L11](../../../src/Bluent.UI/Components/FileSelectComponent/FileSelect.razor.cs#L11)

**Browser evidence:** [BLUENT-LAB-P0-FILE-UPLOAD-CHROME.json](evidence/BLUENT-LAB-P0-FILE-UPLOAD-CHROME.json), [BLUENT-LAB-P0-FILE-UPLOAD-SERVER-CHROME.json](evidence/BLUENT-LAB-P0-FILE-UPLOAD-SERVER-CHROME.json)

**Family audit:** [FLUENT-PARITY-FILESELECT-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-FILESELECT-AUDIT.md)

## Acceptance boundary

All 18 accessibility dimensions are recorded as audited_gaps. Every family design approval remains pending and evidenceBundle remains null. No product source, CSS or public API changed. Native screen-reader, real OS high-contrast, full keyboard and validation-announcement tests remain required before acceptance.
