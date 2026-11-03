# Wave B Fluent API review — TextField, NumericField, Checkbox, Switch, RadioGroup and SelectField

Review date: 2026-10-22. Status: **API mapping reviewed with gaps; not parity-approved**.

This ledger manually classifies the **71 source-known direct and locally inherited parameter occurrences** across Wave B. It is separate from the machine-generated candidate queue, which remains unchanged and unreviewed. Supported means a source/API mapping is identified; it does not imply DOM, visual, keyboard, Blazor render-mode, ARIA, native screen-reader or Fluent parity acceptance.

## Frozen reference hierarchy

- Primary WC API contract: @fluentui/web-components@3.1.3, extracted from the published custom-elements.json in the pinned crosswalk.
- React v9 is not substituted for a missing WC counterpart. The exact crosswalk snapshot remains @fluentui/react-components@9.74.10; latest tag 9.74.11 is not silently substituted.
- Source candidates: docs/v3/quality/FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.md. This manual ledger does not edit its comparisonStatus or featureSupport fields.

## Wave B summary

| Family | Owner | Parameters reviewed | Supported | Missing | Bluent extension | N/A | API disposition |
|---|---:|---:|---:|---:|---:|---:|---|
| TextField | #432 | 12 | 5 | 0 | 7 | 0 | audited_gaps |
| NumericField | #433 | 17 | 7 | 1 | 9 | 0 | audited_gaps |
| Checkbox | #434 | 9 | 3 | 0 | 6 | 0 | audited_gaps |
| Switch | #435 | 9 | 2 | 2 | 4 | 1 | audited_gaps |
| RadioGroup | #436 | 17 | 8 | 0 | 9 | 0 | audited_gaps |
| SelectField | #437 | 7 | 3 | 1 | 3 | 0 | audited_gaps |

## Pinned WC API surface

- **TextField**: fluent-text-input (attributes: appearance, autocomplete, control-size, current-value, dirname, disabled, form, list, maxlength, minlength, multiple, name, pattern, placeholder, readonly, required, size, spellcheck, type, value; slots: default, end, start; CSS parts: control, label, root; events: change, select).
- **NumericField**: fluent-text-input (attributes: appearance, autocomplete, control-size, current-value, dirname, disabled, form, list, maxlength, minlength, multiple, name, pattern, placeholder, readonly, required, size, spellcheck, type, value; slots: default, end, start; CSS parts: control, label, root; events: change, select).
- **Checkbox**: fluent-checkbox (attributes: checked, disabled, form, name, required, shape, size, value; slots: checked-indicator, indeterminate-indicator; CSS parts: none; events: change, input).
- **Switch**: fluent-switch (attributes: checked, disabled, form, name, required, value; slots: none; CSS parts: checked-indicator; events: change, input).
- **RadioGroup**: fluent-radio-group (attributes: disabled, name, orientation, required, value; slots: default; CSS parts: none; events: change); fluent-radio (attributes: checked, disabled, form, name, required, value; slots: checked-indicator; CSS parts: none; events: change, disabled, input).
- **SelectField**: fluent-dropdown (attributes: appearance, aria-labelledby, disabled, id, multiple, name, placeholder, required, size, type, value; slots: default, control, indicator; CSS parts: none; events: change); fluent-dropdown-option (attributes: disabled, form, freeform, id, name, selected, text, value; slots: default, checked-indicator, description, start; CSS parts: content, description; events: no custom events documented); fluent-listbox (attributes: none; slots: default; CSS parts: none; events: no custom events documented).

## Locally inherited parameters

These contracts appear in one or more Wave B families. Family-specific overrides (for example, Switch inherits Checkbox properties) are recorded in the per-family ledger.

| Parameter | Default disposition | Mapping and rationale |
|---|---|---|
| StartAddon | Supported | fluent-text-input start slot. TextField and NumericField render this fragment in the leading adornment region; SelectField uses its native-select wrapper and is overridden below. |
| EndAddon | Supported | fluent-text-input end slot. TextField and NumericField render this fragment in the trailing adornment region; SelectField uses its native-select wrapper and is overridden below. |
| Size | Supported | fluent-text-input control-size. FieldSize Small/Medium/Large is a Bluent field-size API; the pinned text-input CEM exposes control-size. Actual visual size parity remains separate. |
| BindValueEvent | Bluent extension | Blazor bind-value:event selector. This selects the DOM event used by Bluent input binding; it is not an upstream custom-element attribute. Verify per-family wiring rather than assuming inheritance means the parameter is honored. |
| Tooltip | Bluent extension | BluentUiComponentBase TooltipService. Tooltip is a Bluent service/popover composition; no tooltip attribute exists on the referenced Wave B tags. |
| TooltipContent | Bluent extension | Bluent Popover RenderFragment. Arbitrary tooltip content is a Bluent composition; no matching tooltip-content slot exists on the referenced tags. |
| TooltipPlacement | Bluent extension | Bluent Popover Placement. Placement is configured by Bluent tooltip infrastructure, not a referenced upstream control attribute. |
| TooltipAppearance | Bluent extension | Bluent PopoverAppearance. Popover styling is a Bluent API, not an attribute on the referenced controls. |
| DisplayTooltipArrow | Bluent extension | Bluent tooltip arrow configuration. No matching tooltip-arrow attribute exists on the referenced controls. |
| AdditionalAttributes | Supported | Blazor unmatched-attribute bridge. Source forwards unmatched attributes; exact role/ARIA/disabled behavior is a separate browser and AT review. |
| Class | Supported | HTML class merged with Bluent classes. The component merges caller class with component classes; a CSS part is not a direct replacement for the Blazor API. |
| Style | Supported | HTML style on the component root. The component forwards Style to its root; token/theme and computed visual parity remain separate. |

## Per-family parameter ledger

### TextField — #432

Pinned counterpart kind: tag_present; referenced tags: fluent-text-input.

| Component / parameter | Kind / source type | Origin | Disposition | Upstream mapping | Rationale / value-level gaps | Source |
|---|---|---|---|---|---|---|
| TextField.Rows | value / int? | declared | Bluent extension | Native textarea mode with rows; pinned family counterpart is fluent-text-input | Rows switches the component from input to textarea. The selected crosswalk does not claim a one-tag mapping for this mode; this ledger does not silently broaden the pinned upstream reference set. | [TextField.razor.cs:9](../../../src/Bluent.UI/Components/TextFieldComponent/TextField.razor.cs#L9) |
| TextField.ResizeTextarea | value / bool | declared | Bluent extension | Bluent textarea resize styling | This controls native textarea resizing; it is not a fluent-text-input attribute. | [TextField.razor.cs:10](../../../src/Bluent.UI/Components/TextFieldComponent/TextField.razor.cs#L10) |
| TextField.GainFocus | value / bool | declared | Bluent extension | Blazor programmatic focus helper | Focus is a Blazor interaction convenience, not a Fluent text-input property. | [TextField.razor.cs:11](../../../src/Bluent.UI/Components/TextFieldComponent/TextField.razor.cs#L11) |
| TextField.DigitOnly | value / bool | declared | Bluent extension | Bluent digit-only input filtering | Character filtering is a Bluent input behavior and has no matching attribute in the pinned text-input CEM. | [TextField.razor.cs:12](../../../src/Bluent.UI/Components/TextFieldComponent/TextField.razor.cs#L12) |
| TextField.AsciiDigits | value / bool | declared | Bluent extension | Bluent digit normalization to ASCII | Digit normalization is a Bluent input behavior and has no matching upstream attribute. | [TextField.razor.cs:13](../../../src/Bluent.UI/Components/TextFieldComponent/TextField.razor.cs#L13) |
| TextField.ArabicToPersianConversion | value / bool | declared | Bluent extension | Arabic digit to Persian digit conversion | Culture-specific digit conversion is a Bluent input behavior and has no matching upstream attribute. | [TextField.razor.cs:14](../../../src/Bluent.UI/Components/TextFieldComponent/TextField.razor.cs#L14) |
| TextField.StartAddon | slot / RenderFragment? | local_inherited | Supported | fluent-text-input start slot | TextField and NumericField render this fragment in the leading adornment region; SelectField uses its native-select wrapper and is overridden below. | [BluentFieldComponentBase.cs:9](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L9) |
| TextField.EndAddon | slot / RenderFragment? | local_inherited | Supported | fluent-text-input end slot | TextField and NumericField render this fragment in the trailing adornment region; SelectField uses its native-select wrapper and is overridden below. | [BluentFieldComponentBase.cs:10](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L10) |
| TextField.Size | value / FieldSize | local_inherited | Supported | fluent-text-input control-size | FieldSize Small/Medium/Large is a Bluent field-size API; the pinned text-input CEM exposes control-size. Actual visual size parity remains separate. | [BluentFieldComponentBase.cs:11](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L11) |
| TextField.BindValueEvent | value / string | local_inherited | Bluent extension | Blazor bind-value:event selector | This selects the DOM event used by Bluent input binding; it is not an upstream custom-element attribute. Verify per-family wiring rather than assuming inheritance means the parameter is honored. | [BluentFieldComponentBase.cs:12](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L12) |
| TextField.Class | value / string? | local_inherited | Supported | HTML class merged with Bluent classes | The component merges caller class with component classes; a CSS part is not a direct replacement for the Blazor API. | [BluentInputComponentBase.cs:16](../../../src/Bluent.UI/Components/BluentInputComponentBase.cs#L16) |
| TextField.Style | value / string? | local_inherited | Supported | HTML style on the component root | The component forwards Style to its root; token/theme and computed visual parity remain separate. | [BluentInputComponentBase.cs:17](../../../src/Bluent.UI/Components/BluentInputComponentBase.cs#L17) |

### NumericField — #433

Pinned counterpart kind: related_only; referenced tags: fluent-text-input.

| Component / parameter | Kind / source type | Origin | Disposition | Upstream mapping | Rationale / value-level gaps | Source |
|---|---|---|---|---|---|---|
| NumericField.ParsingErrorMessage | value / string | declared | Bluent extension | Bluent InputBase parsing validation message | The custom parsing message belongs to Blazor validation; the related fluent-text-input CEM does not expose a NumericField parsing-message property. | [NumericField.razor.cs:25](../../../src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor.cs#L25) |
| NumericField.MinimumErrorMessage | value / string | declared | Bluent extension | Bluent minimum-bound validation message | Custom validation copy is a Bluent feature, not a pinned upstream text-input attribute. | [NumericField.razor.cs:28](../../../src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor.cs#L28) |
| NumericField.MaximumErrorMessage | value / string | declared | Bluent extension | Bluent maximum-bound validation message | Custom validation copy is a Bluent feature, not a pinned upstream text-input attribute. | [NumericField.razor.cs:29](../../../src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor.cs#L29) |
| NumericField.OverflowErrorMessage | value / string | declared | Bluent extension | Bluent numeric overflow validation message | Custom numeric validation copy is a Bluent feature, not a pinned upstream text-input attribute. | [NumericField.razor.cs:30](../../../src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor.cs#L30) |
| NumericField.GainFocus | value / bool | declared | Bluent extension | Blazor programmatic focus helper | Focus is a Blazor interaction convenience, not an upstream text-input property. | [NumericField.razor.cs:31](../../../src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor.cs#L31) |
| NumericField.Format | value / string? | declared | Bluent extension | Bluent numeric display/edit formatting | Formatting is implemented by the Bluent numeric input and is not an upstream text-input attribute. | [NumericField.razor.cs:32](../../../src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor.cs#L32) |
| NumericField.Min | value / TValue? | declared | Bluent extension | Bluent numeric validation bound | The component renders type=text and validates numeric bounds in Blazor; the pinned fluent-text-input CEM has no min attribute and no dedicated number-field tag is mapped. | [NumericField.razor.cs:33](../../../src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor.cs#L33) |
| NumericField.Max | value / TValue? | declared | Bluent extension | Bluent numeric validation bound | The component renders type=text and validates numeric bounds in Blazor; the pinned fluent-text-input CEM has no max attribute and no dedicated number-field tag is mapped. | [NumericField.razor.cs:34](../../../src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor.cs#L34) |
| NumericField.Step | value / TValue? | declared | Missing | Declared Step parameter has no effective source behavior | The current implementation records the parameter but does not apply it to numeric parsing, increment/decrement behavior or the rendered input. This is a source-confirmed owner issue, not a request to change product code in #552. | [NumericField.razor.cs:35](../../../src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor.cs#L35) |
| NumericField.OnBlur | event / EventCallback | declared | Supported | Native blur event bridged to Blazor EventCallback | The component invokes OnBlur from its actual blur handler. This is a standard DOM event mapping, not a custom event claimed by the CEM. | [NumericField.razor.cs:36](../../../src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor.cs#L36) |
| NumericField.OnFocus | event / EventCallback | declared | Supported | Native focus event bridged to Blazor EventCallback | The component invokes OnFocus from its actual focus handler. This is a standard DOM event mapping, not a custom event claimed by the CEM. | [NumericField.razor.cs:37](../../../src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor.cs#L37) |
| NumericField.StartAddon | slot / RenderFragment? | local_inherited | Supported | fluent-text-input start slot | TextField and NumericField render this fragment in the leading adornment region; SelectField uses its native-select wrapper and is overridden below. | [BluentFieldComponentBase.cs:9](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L9) |
| NumericField.EndAddon | slot / RenderFragment? | local_inherited | Supported | fluent-text-input end slot | TextField and NumericField render this fragment in the trailing adornment region; SelectField uses its native-select wrapper and is overridden below. | [BluentFieldComponentBase.cs:10](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L10) |
| NumericField.Size | value / FieldSize | local_inherited | Supported | fluent-text-input control-size | FieldSize Small/Medium/Large is a Bluent field-size API; the pinned text-input CEM exposes control-size. Actual visual size parity remains separate. | [BluentFieldComponentBase.cs:11](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L11) |
| NumericField.BindValueEvent | value / string | local_inherited | Bluent extension | Blazor bind-value:event selector | This selects the DOM event used by Bluent input binding; it is not an upstream custom-element attribute. Verify per-family wiring rather than assuming inheritance means the parameter is honored. | [BluentFieldComponentBase.cs:12](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L12) |
| NumericField.Class | value / string? | local_inherited | Supported | HTML class merged with Bluent classes | The component merges caller class with component classes; a CSS part is not a direct replacement for the Blazor API. | [BluentInputComponentBase.cs:16](../../../src/Bluent.UI/Components/BluentInputComponentBase.cs#L16) |
| NumericField.Style | value / string? | local_inherited | Supported | HTML style on the component root | The component forwards Style to its root; token/theme and computed visual parity remain separate. | [BluentInputComponentBase.cs:17](../../../src/Bluent.UI/Components/BluentInputComponentBase.cs#L17) |

### Checkbox — #434

Pinned counterpart kind: tag_present; referenced tags: fluent-checkbox.

| Component / parameter | Kind / source type | Origin | Disposition | Upstream mapping | Rationale / value-level gaps | Source |
|---|---|---|---|---|---|---|
| Checkbox.Label | value / string? | declared | Bluent extension | External native label associated by for/id | The pinned fluent-checkbox CEM does not document a label attribute or default label slot; Bluent renders a separate native label and changes its text according to state. | [Checkbox.razor.cs:10](../../../src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor.cs#L10) |
| Checkbox.UncheckedLabel | value / string? | declared | Bluent extension | State-specific unchecked label text | A separate label string for the unchecked state is Bluent-specific; no matching upstream attribute is documented. | [Checkbox.razor.cs:11](../../../src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor.cs#L11) |
| Checkbox.IndeterminateLabel | value / string? | declared | Bluent extension | State-specific indeterminate label text | A separate label string for the indeterminate state is Bluent-specific; no matching upstream attribute is documented. | [Checkbox.razor.cs:12](../../../src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor.cs#L12) |
| Checkbox.Required | value / string? | declared | Bluent extension | Custom required-marker string | Required is a string rendered beside the visible label; it is not a boolean required attribute and does not itself establish native required validation. | [Checkbox.razor.cs:13](../../../src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor.cs#L13) |
| Checkbox.Circular | value / bool | declared | Bluent extension | Boolean circular CSS variant | Bluent exposes a bool that adds a circular class; Fluent exposes a shape attribute. The bool/square default is not a direct shape-enum contract. Value-level notes: false: Bluent extension (Bluent square/default shape is not a one-to-one bool value in the Fluent shape API) | [Checkbox.razor.cs:14](../../../src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor.cs#L14) |
| Checkbox.Size | value / CheckboxSize | declared | Supported | fluent-checkbox.size | CheckboxSize Medium/Large map to the documented size attribute conceptually; rendered size and missing enum values remain separate visual/API review. | [Checkbox.razor.cs:15](../../../src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor.cs#L15) |
| Checkbox.LabelPosition | value / LabelPosition | declared | Bluent extension | Bluent label-before layout class | Before/After label placement is implemented as Bluent wrapper layout; the pinned checkbox CEM has no label-position attribute. | [Checkbox.razor.cs:16](../../../src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor.cs#L16) |
| Checkbox.Class | value / string? | local_inherited | Supported | HTML class merged with Bluent classes | The component merges caller class with component classes; a CSS part is not a direct replacement for the Blazor API. | [BluentInputComponentBase.cs:16](../../../src/Bluent.UI/Components/BluentInputComponentBase.cs#L16) |
| Checkbox.Style | value / string? | local_inherited | Supported | HTML style on the component root | The component forwards Style to its root; token/theme and computed visual parity remain separate. | [BluentInputComponentBase.cs:17](../../../src/Bluent.UI/Components/BluentInputComponentBase.cs#L17) |

### Switch — #435

Pinned counterpart kind: tag_present; referenced tags: fluent-switch.

| Component / parameter | Kind / source type | Origin | Disposition | Upstream mapping | Rationale / value-level gaps | Source |
|---|---|---|---|---|---|---|
| Switch.Label | value / string? | local_inherited | Bluent extension | External native label associated by for/id | The pinned fluent-switch CEM has no documented label attribute or slot; Bluent renders a separate label whose text changes with state. | [Checkbox.razor.cs:10](../../../src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor.cs#L10) |
| Switch.UncheckedLabel | value / string? | local_inherited | Bluent extension | State-specific unchecked label text | A separate unchecked-state label string is a Bluent API; no matching upstream switch attribute is documented. | [Checkbox.razor.cs:11](../../../src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor.cs#L11) |
| Switch.IndeterminateLabel | value / string? | local_inherited | N/A | Inherited Checkbox parameter is not applicable to non-nullable Switch<bool> | Switch is bound to bool and its markup has no indeterminate branch; the inherited property cannot affect this control. | [Checkbox.razor.cs:12](../../../src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor.cs#L12) |
| Switch.Required | value / string? | local_inherited | Bluent extension | Custom required-marker string | The string renders a visual marker beside the label; Switch markup does not set native required from this parameter. | [Checkbox.razor.cs:13](../../../src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor.cs#L13) |
| Switch.Circular | value / bool | local_inherited | Missing | Inherited Circular parameter has no effect on Switch | Switch overrides GetClasses without including Checkbox's circular class, so the inherited parameter is present in the CLR surface but not applied by the current component. | [Checkbox.razor.cs:14](../../../src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor.cs#L14) |
| Switch.Size | value / CheckboxSize | local_inherited | Missing | Inherited Size parameter has no effect on Switch | Switch overrides GetClasses without adding the inherited Checkbox size class, and fluent-switch has no size attribute in the pinned CEM. | [Checkbox.razor.cs:15](../../../src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor.cs#L15) |
| Switch.LabelPosition | value / LabelPosition | local_inherited | Bluent extension | Bluent label-before layout class | Before/After placement is a Bluent wrapper behavior; the pinned switch CEM documents no label-position attribute or slot. | [Checkbox.razor.cs:16](../../../src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor.cs#L16) |
| Switch.Class | value / string? | local_inherited | Supported | HTML class merged with Bluent classes | The component merges caller class with component classes; a CSS part is not a direct replacement for the Blazor API. | [BluentInputComponentBase.cs:16](../../../src/Bluent.UI/Components/BluentInputComponentBase.cs#L16) |
| Switch.Style | value / string? | local_inherited | Supported | HTML style on the component root | The component forwards Style to its root; token/theme and computed visual parity remain separate. | [BluentInputComponentBase.cs:17](../../../src/Bluent.UI/Components/BluentInputComponentBase.cs#L17) |

### RadioGroup — #436

Pinned counterpart kind: tag_present; referenced tags: fluent-radio-group, fluent-radio.

| Component / parameter | Kind / source type | Origin | Disposition | Upstream mapping | Rationale / value-level gaps | Source |
|---|---|---|---|---|---|---|
| RadioGroup.ChildContent | slot / RenderFragment? | declared | Supported | fluent-radio-group default slot | The group hosts its radio children. The conceptual default slot matches, but Bluent Radio components are not Fluent custom elements and do not share the same DOM/AX contract. | [RadioGroup.razor.cs:10](../../../src/Bluent.UI/Components/RadioGroupComponent/RadioGroup.razor.cs#L10) |
| RadioGroup.Label | value / string? | declared | Bluent extension | Bluent group label wrapper | The pinned fluent-radio-group CEM exposes no label attribute or named label slot; Bluent renders its own label content. | [RadioGroup.razor.cs:11](../../../src/Bluent.UI/Components/RadioGroupComponent/RadioGroup.razor.cs#L11) |
| RadioGroup.ItemsLabelPosition | value / LabelPosition | declared | Bluent extension | Bluent per-item label positioning | This controls Bluent child layout and has no matching attribute on fluent-radio-group or fluent-radio. | [RadioGroup.razor.cs:12](../../../src/Bluent.UI/Components/RadioGroupComponent/RadioGroup.razor.cs#L12) |
| RadioGroup.Orientation | value / Orientation | declared | Supported | fluent-radio-group.orientation | Horizontal/Vertical map to the documented orientation concept; actual keyboard roving and layout parity remain separate. | [RadioGroup.razor.cs:13](../../../src/Bluent.UI/Components/RadioGroupComponent/RadioGroup.razor.cs#L13) |
| RadioGroup.Class | value / string? | local_inherited | Supported | HTML class merged with Bluent classes | The component merges caller class with component classes; a CSS part is not a direct replacement for the Blazor API. | [BluentInputComponentBase.cs:16](../../../src/Bluent.UI/Components/BluentInputComponentBase.cs#L16) |
| RadioGroup.Style | value / string? | local_inherited | Supported | HTML style on the component root | The component forwards Style to its root; token/theme and computed visual parity remain separate. | [BluentInputComponentBase.cs:17](../../../src/Bluent.UI/Components/BluentInputComponentBase.cs#L17) |
| Radio.RadioGroup | cascading / RadioGroup<TValue> | declared | Bluent extension | Cascading Blazor parent-group association | The Radio child receives a Blazor CascadingParameter to subscribe to its parent; this is not an upstream custom-element attribute. | [Radio.razor.cs:7](../../../src/Bluent.UI/Components/RadioGroupComponent/Radio.razor.cs#L7) |
| Radio.Value | value / TValue | declared | Supported | fluent-radio.value | The child Radio Value identifies that option's value; group selection and native name/form serialization are separate contracts. | [Radio.razor.cs:8](../../../src/Bluent.UI/Components/RadioGroupComponent/Radio.razor.cs#L8) |
| Radio.Label | value / string? | declared | Bluent extension | External native label associated by for/id | The pinned fluent-radio CEM does not document a label attribute or default label slot; Bluent uses a separate associated label. | [Radio.razor.cs:9](../../../src/Bluent.UI/Components/RadioGroupComponent/Radio.razor.cs#L9) |
| Radio.Tooltip | value / string? | local_inherited | Bluent extension | BluentUiComponentBase TooltipService | Tooltip is a Bluent service/popover composition; no tooltip attribute exists on the referenced Wave B tags. | [BluentUiComponentBase.cs:9](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L9) |
| Radio.TooltipContent | slot / RenderFragment? | local_inherited | Bluent extension | Bluent Popover RenderFragment | Arbitrary tooltip content is a Bluent composition; no matching tooltip-content slot exists on the referenced tags. | [BluentUiComponentBase.cs:10](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L10) |
| Radio.TooltipPlacement | value / Placement | local_inherited | Bluent extension | Bluent Popover Placement | Placement is configured by Bluent tooltip infrastructure, not a referenced upstream control attribute. | [BluentUiComponentBase.cs:11](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L11) |
| Radio.TooltipAppearance | value / PopoverAppearance | local_inherited | Bluent extension | Bluent PopoverAppearance | Popover styling is a Bluent API, not an attribute on the referenced controls. | [BluentUiComponentBase.cs:12](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L12) |
| Radio.DisplayTooltipArrow | value / bool | local_inherited | Bluent extension | Bluent tooltip arrow configuration | No matching tooltip-arrow attribute exists on the referenced controls. | [BluentUiComponentBase.cs:13](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L13) |
| Radio.AdditionalAttributes | value / Dictionary<string, object>? | local_inherited | Supported | Blazor unmatched-attribute bridge | Source forwards unmatched attributes; exact role/ARIA/disabled behavior is a separate browser and AT review. | [BluentComponentBase.cs:8](../../../src/Bluent.Core/BluentComponentBase.cs#L8) |
| Radio.Class | value / string? | local_inherited | Supported | HTML class merged with Bluent classes | The component merges caller class with component classes; a CSS part is not a direct replacement for the Blazor API. | [BluentComponentBase.cs:9](../../../src/Bluent.Core/BluentComponentBase.cs#L9) |
| Radio.Style | value / string? | local_inherited | Supported | HTML style on the component root | The component forwards Style to its root; token/theme and computed visual parity remain separate. | [BluentComponentBase.cs:10](../../../src/Bluent.Core/BluentComponentBase.cs#L10) |

### SelectField — #437

Pinned counterpart kind: related_only; referenced tags: fluent-dropdown, fluent-dropdown-option, fluent-listbox.

| Component / parameter | Kind / source type | Origin | Disposition | Upstream mapping | Rationale / value-level gaps | Source |
|---|---|---|---|---|---|---|
| SelectField.ChildContent | slot / RenderFragment? | declared | Bluent extension | Native select option ChildContent | Bluent renders native option children inside a native select; the pinned upstream candidates are fluent-dropdown/listbox custom elements and fluent-dropdown-option, not a one-to-one native select API. | [SelectField.razor.cs:10](../../../src/Bluent.UI/Components/SelectFieldComponent/SelectField.razor.cs#L10) |
| SelectField.StartAddon | slot / RenderFragment? | local_inherited | Bluent extension | Bluent native-select start-addon wrapper | The Fluent dropdown control slot represents the control itself and is not equivalent to an arbitrary leading addon fragment. | [BluentFieldComponentBase.cs:9](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L9) |
| SelectField.EndAddon | slot / RenderFragment? | local_inherited | Bluent extension | Bluent native-select end-addon wrapper | The Fluent dropdown indicator slot is not equivalent to an arbitrary trailing addon fragment. | [BluentFieldComponentBase.cs:10](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L10) |
| SelectField.Size | value / FieldSize | local_inherited | Supported | fluent-dropdown.size | FieldSize Small/Medium/Large maps conceptually to the documented dropdown size attribute; native select appearance is not a visual parity verdict. | [BluentFieldComponentBase.cs:11](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L11) |
| SelectField.BindValueEvent | value / string | local_inherited | Missing | Inherited BindValueEvent is not honored by SelectField | SelectField binds through an explicit @onchange handler rather than using BindValueEvent; the inherited parameter has no effect in the current source. | [BluentFieldComponentBase.cs:12](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L12) |
| SelectField.Class | value / string? | local_inherited | Supported | HTML class merged with Bluent classes | The component merges caller class with component classes; a CSS part is not a direct replacement for the Blazor API. | [BluentInputComponentBase.cs:16](../../../src/Bluent.UI/Components/BluentInputComponentBase.cs#L16) |
| SelectField.Style | value / string? | local_inherited | Supported | HTML style on the component root | The component forwards Style to its root; token/theme and computed visual parity remain separate. | [BluentInputComponentBase.cs:17](../../../src/Bluent.UI/Components/BluentInputComponentBase.cs#L17) |

## Out-of-band public/base findings

| Item | Disposition | Finding |
|---|---|---|
| InputBase<TValue> binding/validation surface | Bluent extension | Value, ValueChanged, ValueExpression and EditContext/validation integration are framework-owned binding contracts. The local inherited census intentionally stops at the external framework boundary. This ledger does not claim the complete emitted public API or complete EditContext/form behavior; reconcile the framework surface separately before public API acceptance. |

## Family-level feature disposition

- **TextField (#432): audited_gaps** — the base input and slot concepts map to fluent-text-input, but textarea mode, resize, programmatic focus and digit normalization are Bluent-specific behaviors.
- **NumericField (#433): audited_gaps** — no dedicated fluent-number-field tag is mapped; Min/Max/Format/custom validation are Bluent behavior, Step is declared but ineffective in current source, and the browser exposes a textbox rather than a spinbutton.
- **Checkbox (#434): audited_gaps** — the upstream tag exists, but state-specific label text, string required markers, label positioning and the bool Circular API are not one-to-one with the pinned CEM.
- **Switch (#435): audited_gaps** — the upstream switch tag exists, but Bluent inherits Checkbox properties; Circular and Size currently have no effect, while IndeterminateLabel is not applicable to the bool control.
- **RadioGroup (#436): audited_gaps** — the group/option tags exist; orientation and option value map conceptually, while cascading group context, labels and item layout remain Bluent-specific. Runtime evidence separately records missing group semantics, native name grouping and arrow isolation.
- **SelectField (#437): audited_gaps** — no one-to-one fluent-select-field tag is mapped; Bluent renders a native select, and its inherited BindValueEvent is not honored by the current explicit onchange handler.

## Acceptance boundary

No product source, CSS, public API or component design was changed. This manual ledger does not modify the machine-generated candidate file, does not approve Fluent parity, and does not replace runtime/browser/OS/AT tests. Wave B feature dimensions may be recorded as audited_gaps; every family designApproval remains pending and evidenceBundle remains null. External InputBase binding/validation APIs are explicitly outside the 71 local occurrences. See the canonical 18-family matrix and the independent visual/behavior/accessibility reports.
