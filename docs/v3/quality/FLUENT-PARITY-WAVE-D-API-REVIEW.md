# Wave D Fluent API review - Slider, RangeSlider and FileSelect

Review date: 2026-10-22. Status: **API mapping reviewed with gaps; not parity-approved**.

This ledger manually classifies the **46 source-known direct and locally inherited parameter occurrences** across Wave D. It is separate from the machine-generated candidate queue, which remains unchanged and unreviewed. Supported means a source/API mapping is identified; it does not imply DOM, visual, keyboard, Blazor render-mode, ARIA, native screen-reader or Fluent parity acceptance.

## Frozen reference hierarchy

- Primary WC API contract: @fluentui/web-components@3.1.3, extracted from the published custom-elements.json in the pinned crosswalk.
- React v9 is not substituted for a missing WC counterpart. The exact crosswalk snapshot remains @fluentui/react-components@9.74.10; latest tag 9.74.11 is not silently substituted.
- Source candidates: docs/v3/quality/FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.md. This manual ledger does not edit its comparisonStatus or featureSupport fields.

## Wave D summary

| Family | Owner | Parameters reviewed | Supported | Missing | Bluent extension | N/A | API disposition |
|---|---:|---:|---:|---:|---:|---:|---|
| Slider | #442 | 13 | 7 | 0 | 6 | 0 | audited_gaps |
| RangeSlider | #443 | 13 | 3 | 0 | 10 | 0 | audited_gaps |
| FileSelect | #444 | 20 | 7 | 0 | 13 | 0 | audited_gaps |

## Pinned WC API surface

- **Slider**: fluent-slider (attributes: disabled, max, min, mode, orientation, size, step, value; slots: thumb; CSS parts: thumb-container, track-container; events: change).
- **RangeSlider**: no dedicated one-to-one WC tag; related reference/subcontrol only: fluent-slider (attributes: disabled, max, min, mode, orientation, size, step, value; slots: thumb; CSS parts: thumb-container, track-container; events: change). This does not establish family equivalence.
- **FileSelect**: no dedicated one-to-one WC tag; related reference/subcontrol only: fluent-button (attributes: appearance, disabled, disabled-focusable, form, formaction, formenctype, formmethod, formnovalidate, formtarget, icon-only, name, shape, size, type, value; slots: default, end, start; CSS parts: content; events: no custom events documented). This does not establish family equivalence.

## Locally inherited parameters

These contracts appear in one or more Wave D families. Family-specific overrides (for example, Switch inherits Checkbox properties) are recorded in the per-family ledger.

| Parameter | Default disposition | Mapping and rationale |
|---|---|---|
| Tooltip | Bluent extension | BluentUiComponentBase TooltipService/Popover composition. Tooltip text and content are registered through Bluent's tooltip service; they are not attributes on fluent-slider or a dedicated file-select tag. |
| TooltipContent | Bluent extension | Bluent tooltip RenderFragment. Arbitrary tooltip content is a Bluent composition, not an upstream control slot on the pinned slider/file-select references. |
| TooltipPlacement | Bluent extension | Bluent Popover Placement. Placement is configured through Bluent tooltip infrastructure, not a pinned slider/file-select attribute. |
| TooltipAppearance | Bluent extension | Bluent PopoverAppearance. Popover styling is a Bluent service/composition, not a pinned slider/file-select attribute. |
| DisplayTooltipArrow | Bluent extension | Bluent tooltip arrow configuration. Arrow display is configured by Bluent tooltip infrastructure, not a pinned slider/file-select attribute. |
| AdditionalAttributes | Supported | Blazor unmatched-attribute bridge on component root. All three components forward unmatched attributes to the outer root wrapper; this does not automatically forward ARIA/name attributes to the slider thumb or hidden file input. |
| Class | Supported | Caller class merged on the outer component root. The current components merge the caller class into their outer root classes; subcontrol-specific class styling remains a separate design decision. |
| Style | Supported | Caller style on the outer component root. The current components apply Style to their outer root; computed visual and token parity remain separate. |

## Per-family parameter ledger

### Slider - #442

Pinned counterpart kind: tag_present; referenced tags: fluent-slider.

| Component / parameter | Kind / source type | Origin | Disposition | Upstream mapping | Rationale / value-level gaps | Source |
|---|---|---|---|---|---|---|
| Slider.Min | value / TValue? | declared | Supported | fluent-slider.min | The scalar lower bound maps to the pinned fluent-slider min attribute conceptually; Bluent still calculates a CSS percentage and does not provide native range semantics. | [Slider.razor.cs:24](../../../src/Bluent.UI/Components/SliderComponent/Slider.razor.cs#L24) |
| Slider.Max | value / TValue? | declared | Supported | fluent-slider.max | The scalar upper bound maps to the pinned fluent-slider max attribute conceptually; Bluent still calculates a CSS percentage and does not provide native range semantics. | [Slider.razor.cs:25](../../../src/Bluent.UI/Components/SliderComponent/Slider.razor.cs#L25) |
| Slider.Value | value / TValue? | declared | Supported | fluent-slider.value | A single scalar value maps to the upstream slider's value concept; current Bluent markup is a div/thumb composition rather than the upstream custom element. | [Slider.razor.cs:26](../../../src/Bluent.UI/Components/SliderComponent/Slider.razor.cs#L26) |
| Slider.ValueChanged | event / EventCallback<TValue?> | declared | Supported | Scalar value updates from upstream input/change interaction | The Blazor EventCallback is the scalar value-change surface; current Bluent updates through pointer interop only, so this mapping does not imply keyboard or native input/change parity. | [Slider.razor.cs:28](../../../src/Bluent.UI/Components/SliderComponent/Slider.razor.cs#L28) |
| Slider.ThumbSize | value / int? | declared | Bluent extension | Bluent custom thumb pixel size | ThumbSize is a custom integer pixel-size parameter; the pinned fluent-slider exposes a thumb CSS part but no equivalent public thumb-size attribute. | [Slider.razor.cs:32](../../../src/Bluent.UI/Components/SliderComponent/Slider.razor.cs#L32) |
| Slider.Tooltip | value / string? | local_inherited | Bluent extension | BluentUiComponentBase TooltipService/Popover composition | Tooltip text and content are registered through Bluent's tooltip service; they are not attributes on fluent-slider or a dedicated file-select tag. | [BluentUiComponentBase.cs:9](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L9) |
| Slider.TooltipContent | slot / RenderFragment? | local_inherited | Bluent extension | Bluent tooltip RenderFragment | Arbitrary tooltip content is a Bluent composition, not an upstream control slot on the pinned slider/file-select references. | [BluentUiComponentBase.cs:10](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L10) |
| Slider.TooltipPlacement | value / Placement | local_inherited | Bluent extension | Bluent Popover Placement | Placement is configured through Bluent tooltip infrastructure, not a pinned slider/file-select attribute. | [BluentUiComponentBase.cs:11](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L11) |
| Slider.TooltipAppearance | value / PopoverAppearance | local_inherited | Bluent extension | Bluent PopoverAppearance | Popover styling is a Bluent service/composition, not a pinned slider/file-select attribute. | [BluentUiComponentBase.cs:12](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L12) |
| Slider.DisplayTooltipArrow | value / bool | local_inherited | Bluent extension | Bluent tooltip arrow configuration | Arrow display is configured by Bluent tooltip infrastructure, not a pinned slider/file-select attribute. | [BluentUiComponentBase.cs:13](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L13) |
| Slider.AdditionalAttributes | value / Dictionary<string, object>? | local_inherited | Supported | Blazor unmatched-attribute bridge on component root | All three components forward unmatched attributes to the outer root wrapper; this does not automatically forward ARIA/name attributes to the slider thumb or hidden file input. | [BluentComponentBase.cs:8](../../../src/Bluent.Core/BluentComponentBase.cs#L8) |
| Slider.Class | value / string? | local_inherited | Supported | Caller class merged on the outer component root | The current components merge the caller class into their outer root classes; subcontrol-specific class styling remains a separate design decision. | [BluentComponentBase.cs:9](../../../src/Bluent.Core/BluentComponentBase.cs#L9) |
| Slider.Style | value / string? | local_inherited | Supported | Caller style on the outer component root | The current components apply Style to their outer root; computed visual and token parity remain separate. | [BluentComponentBase.cs:10](../../../src/Bluent.Core/BluentComponentBase.cs#L10) |

### RangeSlider - #443

Pinned counterpart kind: no_dedicated_tag; referenced tags: no dedicated WC tag.

| Component / parameter | Kind / source type | Origin | Disposition | Upstream mapping | Rationale / value-level gaps | Source |
|---|---|---|---|---|---|---|
| RangeSlider.Min | value / TValue? | declared | Bluent extension | Lower bound of a two-thumb range | The pinned WC crosswalk has no dedicated range-slider tag. The related fluent-slider has a scalar min attribute, but that does not establish an equivalent two-thumb range component. | [RangeSlider.razor.cs:21](../../../src/Bluent.UI/Components/RangeSliderComponent/RangeSlider.razor.cs#L21) |
| RangeSlider.Max | value / TValue? | declared | Bluent extension | Upper bound of a two-thumb range | The pinned WC crosswalk has no dedicated range-slider tag. The related fluent-slider has a scalar max attribute, but that does not establish an equivalent two-thumb range component. | [RangeSlider.razor.cs:22](../../../src/Bluent.UI/Components/RangeSliderComponent/RangeSlider.razor.cs#L22) |
| RangeSlider.Value | value / ValueRange<TValue>? | declared | Bluent extension | ValueRange<TValue> with independent minimum and maximum values | A two-value range is not equivalent to the scalar value property of fluent-slider; the pinned Web Components manifest has no one-to-one RangeSlider tag. | [RangeSlider.razor.cs:23](../../../src/Bluent.UI/Components/RangeSliderComponent/RangeSlider.razor.cs#L23) |
| RangeSlider.ValueChanged | event / EventCallback<ValueRange<TValue>?> | declared | Bluent extension | Two-value ValueRange<TValue> callback | The callback returns a range pair rather than a scalar input value; no dedicated upstream range-slider event contract was found. | [RangeSlider.razor.cs:24](../../../src/Bluent.UI/Components/RangeSliderComponent/RangeSlider.razor.cs#L24) |
| RangeSlider.ThumbSize | value / int? | declared | Bluent extension | Bluent custom thumb pixel size for both thumbs | The parameter sets Bluent's thumb sizing; the pinned WC crosswalk has no range-slider tag or equivalent public thumb-size property. | [RangeSlider.razor.cs:25](../../../src/Bluent.UI/Components/RangeSliderComponent/RangeSlider.razor.cs#L25) |
| RangeSlider.Tooltip | value / string? | local_inherited | Bluent extension | BluentUiComponentBase TooltipService/Popover composition | Tooltip text and content are registered through Bluent's tooltip service; they are not attributes on fluent-slider or a dedicated file-select tag. | [BluentUiComponentBase.cs:9](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L9) |
| RangeSlider.TooltipContent | slot / RenderFragment? | local_inherited | Bluent extension | Bluent tooltip RenderFragment | Arbitrary tooltip content is a Bluent composition, not an upstream control slot on the pinned slider/file-select references. | [BluentUiComponentBase.cs:10](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L10) |
| RangeSlider.TooltipPlacement | value / Placement | local_inherited | Bluent extension | Bluent Popover Placement | Placement is configured through Bluent tooltip infrastructure, not a pinned slider/file-select attribute. | [BluentUiComponentBase.cs:11](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L11) |
| RangeSlider.TooltipAppearance | value / PopoverAppearance | local_inherited | Bluent extension | Bluent PopoverAppearance | Popover styling is a Bluent service/composition, not a pinned slider/file-select attribute. | [BluentUiComponentBase.cs:12](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L12) |
| RangeSlider.DisplayTooltipArrow | value / bool | local_inherited | Bluent extension | Bluent tooltip arrow configuration | Arrow display is configured by Bluent tooltip infrastructure, not a pinned slider/file-select attribute. | [BluentUiComponentBase.cs:13](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L13) |
| RangeSlider.AdditionalAttributes | value / Dictionary<string, object>? | local_inherited | Supported | Blazor unmatched-attribute bridge on component root | All three components forward unmatched attributes to the outer root wrapper; this does not automatically forward ARIA/name attributes to the slider thumb or hidden file input. | [BluentComponentBase.cs:8](../../../src/Bluent.Core/BluentComponentBase.cs#L8) |
| RangeSlider.Class | value / string? | local_inherited | Supported | Caller class merged on the outer component root | The current components merge the caller class into their outer root classes; subcontrol-specific class styling remains a separate design decision. | [BluentComponentBase.cs:9](../../../src/Bluent.Core/BluentComponentBase.cs#L9) |
| RangeSlider.Style | value / string? | local_inherited | Supported | Caller style on the outer component root | The current components apply Style to their outer root; computed visual and token parity remain separate. | [BluentComponentBase.cs:10](../../../src/Bluent.Core/BluentComponentBase.cs#L10) |

### FileSelect - #444

Pinned counterpart kind: no_dedicated_tag; referenced tags: no dedicated WC tag.

| Component / parameter | Kind / source type | Origin | Disposition | Upstream mapping | Rationale / value-level gaps | Source |
|---|---|---|---|---|---|---|
| FileSelect.Text | value / string? | declared | Supported | fluent-button default slot for the trigger button only | Text maps to the button label/content conceptually. This is a related trigger-subcontrol mapping only; neither fluent-button nor React Input is a file-select-plus-file-list component. | [FileSelect.razor.cs:14](../../../src/Bluent.UI/Components/FileSelectComponent/FileSelect.razor.cs#L14) |
| FileSelect.Icon | value / IconDefinition? | declared | Bluent extension | Bluent IconDefinition rendered inside the trigger Button | The icon is a Bluent IconDefinition rendered through the Bluent Button composition; fluent-button has content slots but no equivalent IconDefinition parameter. | [FileSelect.razor.cs:15](../../../src/Bluent.UI/Components/FileSelectComponent/FileSelect.razor.cs#L15) |
| FileSelect.Accept | value / string? | declared | Supported | Native input[type=file].accept hint | The value is forwarded to the native InputFile accept attribute. This is a chooser hint, not server-side type/content/size/authorization validation and not a dedicated Fluent file-select contract. | [FileSelect.razor.cs:16](../../../src/Bluent.UI/Components/FileSelectComponent/FileSelect.razor.cs#L16) |
| FileSelect.ShowFileInfo | value / bool | declared | Bluent extension | Toggle file-card list rendering | The property controls the Bluent file-list composition and whether the picker button remains available; no dedicated upstream file-select component exists. | [FileSelect.razor.cs:17](../../../src/Bluent.UI/Components/FileSelectComponent/FileSelect.razor.cs#L17) |
| FileSelect.AllowRemove | value / bool | declared | Bluent extension | Per-file remove action visibility and behavior | Removal and per-file card composition are Bluent-specific behavior; the current remove button also has a non-semantic private-use glyph accessible name in the browser audit. | [FileSelect.razor.cs:18](../../../src/Bluent.UI/Components/FileSelectComponent/FileSelect.razor.cs#L18) |
| FileSelect.Disabled | value / bool | declared | Bluent extension | Disabled state on the trigger Button only | Disabled is passed to the visible Button, but the hidden InputFile itself does not receive disabled; the composite does not fully express disabled state at the native input boundary. | [FileSelect.razor.cs:19](../../../src/Bluent.UI/Components/FileSelectComponent/FileSelect.razor.cs#L19) |
| FileSelect.Appearance | value / ButtonAppearance | declared | Supported | fluent-button.appearance for the trigger button only | Appearance configures the Bluent Button subcontrol; this does not create a dedicated Fluent file-select counterpart. | [FileSelect.razor.cs:20](../../../src/Bluent.UI/Components/FileSelectComponent/FileSelect.razor.cs#L20) |
| FileSelect.Shape | value / ButtonShape | declared | Supported | fluent-button.shape for the trigger button only | Shape configures the Bluent Button subcontrol; this does not create a dedicated Fluent file-select counterpart. | [FileSelect.razor.cs:21](../../../src/Bluent.UI/Components/FileSelectComponent/FileSelect.razor.cs#L21) |
| FileSelect.OnChange | event / EventCallback<IEnumerable<SelectedFile>> | declared | Bluent extension | Batch callback with IEnumerable<SelectedFile> | The callback exposes the Bluent selected-file collection and batch behavior; no matching custom file-select event exists in the pinned WC manifest. | [FileSelect.razor.cs:22](../../../src/Bluent.UI/Components/FileSelectComponent/FileSelect.razor.cs#L22) |
| FileSelect.OnFileSelected | event / EventCallback<SelectedFile> | declared | Bluent extension | Per-file selection EventCallback | The callback is a Bluent per-file composition event, not a dedicated upstream file-select event. | [FileSelect.razor.cs:23](../../../src/Bluent.UI/Components/FileSelectComponent/FileSelect.razor.cs#L23) |
| FileSelect.OnFileRemoved | event / EventCallback<SelectedFile> | declared | Bluent extension | Per-file removal EventCallback | The callback is a Bluent per-file removal event, not a dedicated upstream file-select event. | [FileSelect.razor.cs:24](../../../src/Bluent.UI/Components/FileSelectComponent/FileSelect.razor.cs#L24) |
| FileSelect.MaxFiles | value / int | declared | Bluent extension | Bluent selected-file count limit | MaxFiles controls whether the picker Button is shown and whether the native input is multiple, but HandleFileChanged appends every file in a batch without enforcing remaining capacity. The existing browser audit reproduced three accepted files with MaxFiles=2 in both a single batch and cumulative selection. | [FileSelect.razor.cs:25](../../../src/Bluent.UI/Components/FileSelectComponent/FileSelect.razor.cs#L25) |
| FileSelect.Tooltip | value / string? | local_inherited | Bluent extension | BluentUiComponentBase TooltipService/Popover composition | Tooltip text and content are registered through Bluent's tooltip service; they are not attributes on fluent-slider or a dedicated file-select tag. | [BluentUiComponentBase.cs:9](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L9) |
| FileSelect.TooltipContent | slot / RenderFragment? | local_inherited | Bluent extension | Bluent tooltip RenderFragment | Arbitrary tooltip content is a Bluent composition, not an upstream control slot on the pinned slider/file-select references. | [BluentUiComponentBase.cs:10](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L10) |
| FileSelect.TooltipPlacement | value / Placement | local_inherited | Bluent extension | Bluent Popover Placement | Placement is configured through Bluent tooltip infrastructure, not a pinned slider/file-select attribute. | [BluentUiComponentBase.cs:11](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L11) |
| FileSelect.TooltipAppearance | value / PopoverAppearance | local_inherited | Bluent extension | Bluent PopoverAppearance | Popover styling is a Bluent service/composition, not a pinned slider/file-select attribute. | [BluentUiComponentBase.cs:12](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L12) |
| FileSelect.DisplayTooltipArrow | value / bool | local_inherited | Bluent extension | Bluent tooltip arrow configuration | Arrow display is configured by Bluent tooltip infrastructure, not a pinned slider/file-select attribute. | [BluentUiComponentBase.cs:13](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L13) |
| FileSelect.AdditionalAttributes | value / Dictionary<string, object>? | local_inherited | Supported | Blazor unmatched-attribute bridge on component root | All three components forward unmatched attributes to the outer root wrapper; this does not automatically forward ARIA/name attributes to the slider thumb or hidden file input. | [BluentComponentBase.cs:8](../../../src/Bluent.Core/BluentComponentBase.cs#L8) |
| FileSelect.Class | value / string? | local_inherited | Supported | Caller class merged on the outer component root | The current components merge the caller class into their outer root classes; subcontrol-specific class styling remains a separate design decision. | [BluentComponentBase.cs:9](../../../src/Bluent.Core/BluentComponentBase.cs#L9) |
| FileSelect.Style | value / string? | local_inherited | Supported | Caller style on the outer component root | The current components apply Style to their outer root; computed visual and token parity remain separate. | [BluentComponentBase.cs:10](../../../src/Bluent.Core/BluentComponentBase.cs#L10) |

## Out-of-band public/base findings

| Item | Disposition | Finding |
|---|---|---|
| InputBase<TValue> binding/validation surface | Bluent extension | Value, ValueChanged, ValueExpression and EditContext/validation integration are framework-owned binding contracts. The local inherited census intentionally stops at the external framework boundary. This ledger does not claim the complete emitted public API or complete EditContext/form behavior; reconcile the framework surface separately before public API acceptance. |

## Family-level feature disposition

- **Slider (#442): audited_gaps** - fluent-slider is a relevant single-value reference, but Bluent renders a div/thumb composition without native slider role, tabindex, keyboard handling or complete ARIA semantics. Orientation and Size are not active public parameters; ThumbSize is a Bluent extension. See [slider/range browser audit](FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md).
- **RangeSlider (#443): audited_gaps** - the pinned WC crosswalk has no dedicated two-thumb range-slider tag. The related fluent-slider is scalar only; Bluent's two-value range has no equivalent upstream contract and remains pointer-driven without native thumb focus/keyboard semantics. See [slider/range browser audit](FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md).
- **FileSelect (#444): audited_gaps** - there is no dedicated file-select tag; only the trigger button has related fluent-button properties. MaxFiles hides the picker but does not enforce remaining batch capacity (three files can be accepted with MaxFiles=2), Disabled is applied to the trigger rather than the hidden InputFile, and the remove action has an inaccessible glyph-only name. See [FileSelect browser audit](FLUENT-PARITY-FILESELECT-AUDIT.md).

## Acceptance boundary

No product source, CSS, public API or component design was changed. This manual ledger does not modify the machine-generated candidate file, does not approve Fluent parity, and does not replace runtime/browser/OS/AT tests. Wave D feature dimensions may be recorded as audited_gaps; every family designApproval remains pending and evidenceBundle remains null. External InputBase binding/validation APIs are explicitly outside the 46 local occurrences. See the canonical 18-family matrix and independent visual/behavior/accessibility reports.
