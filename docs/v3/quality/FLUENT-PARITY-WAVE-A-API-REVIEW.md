# Wave A Fluent API review — Button, Icon, Label, Link and Badge

Review date: 2026-10-22. Status: **API mapping reviewed with gaps; not parity-approved**.

This ledger manually classifies the **82 source-known direct and locally inherited parameter occurrences** across Wave A. It is separate from the machine-generated candidate queue: that queue remains unchanged and unreviewed. `Supported` means a source/API mapping is identified; it does not imply DOM, visual, keyboard, Blazor render-mode, ARIA, native screen-reader or Fluent parity acceptance.

## Frozen reference hierarchy

- Primary WC API contract: `@fluentui/web-components@3.1.3`, extracted from the published `custom-elements.json` in [the pinned crosswalk](FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.md).
- React v9 is used only for the Label `ForExpression` association semantics because the pinned WC Label CEM does not document a `for` attribute; it is a cross-platform reference, not a 1:1 component mapping. The exact crosswalk snapshot is `@fluentui/react-components@9.74.10`; the npm latest tag is 9.74.11 and is not silently substituted.
- Icon uses `@fluentui/react-icons@2.0.344` as an asset catalogue only; there is no generic Icon custom-element counterpart. The current Bluent `IconVariant` remains Regular/Filled; Color is not claimed or approved.
- Source candidates: [machine-generated WC API name candidates](FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.md). This manual ledger does not edit that file's `comparisonStatus` or `featureSupport` fields.

## Wave A summary

| Family | Owner | Parameters reviewed | Supported | Missing | Bluent extension | N/A | API disposition |
|---|---:|---:|---:|---:|---:|---:|---|
| Button | #428 | 30 | 11 | 0 | 19 | 0 | audited_gaps |
| Icon | #429 | 10 | 4 | 0 | 6 | 0 | audited_gaps |
| Label | #430 | 14 | 5 | 0 | 9 | 0 | audited_gaps |
| Link | #431 | 12 | 7 | 0 | 5 | 0 | audited_gaps |
| Badge | #445 | 16 | 9 | 0 | 7 | 0 | audited_gaps |

## Pinned WC API surface

- **Button**: `fluent-button` (attributes: appearance, disabled, disabled-focusable, form, formaction, formenctype, formmethod, formnovalidate, formtarget, icon-only, name, shape, size, type, value; slots: default, end, start; CSS parts: content; events: no custom events documented); `fluent-toggle-button` (attributes: appearance, disabled, disabled-focusable, form, formaction, formenctype, formmethod, formnovalidate, formtarget, icon-only, mixed, name, pressed, shape, size, type, value; slots: default, end, start; CSS parts: content; events: no custom events documented); `fluent-compound-button` (attributes: appearance, disabled, disabled-focusable, form, formaction, formenctype, formmethod, formnovalidate, formtarget, icon-only, name, shape, size, type, value; slots: default, description, end, start; CSS parts: content; events: no custom events documented); `fluent-menu-button` (attributes: appearance, disabled, disabled-focusable, form, formaction, formenctype, formmethod, formnovalidate, formtarget, icon-only, name, shape, size, type, value; slots: default, end, start; CSS parts: content; events: no custom events documented); `fluent-anchor-button` (attributes: appearance, download, href, hreflang, icon-only, ping, referrerpolicy, rel, shape, size, target, type; slots: default, end, start; CSS parts: content, control; events: no custom events documented).
- **Icon**: no dedicated WC tag in 3.1.3; use the Fluent System Icons package as an asset reference only.
- **Label**: `fluent-label` (attributes: disabled, required, size, weight; slots: default; CSS parts: asterisk; events: no custom events documented).
- **Link**: `fluent-link` (attributes: appearance, download, href, hreflang, inline, ping, referrerpolicy, rel, target, type; slots: default, end, start; CSS parts: content, control; events: no custom events documented); `fluent-anchor-button` (attributes: appearance, download, href, hreflang, icon-only, ping, referrerpolicy, rel, shape, size, target, type; slots: default, end, start; CSS parts: content, control; events: no custom events documented).
- **Badge**: `fluent-badge` (attributes: appearance, color, shape, size; slots: default, end, start; CSS parts: none; events: no custom events documented); `fluent-counter-badge` (attributes: appearance, color, count, dot, overflow-count, shape, show-zero, size; slots: end, start; CSS parts: none; events: no custom events documented).

## Common locally inherited parameters

These eight parameters occur in each of the five family ledgers (40 occurrences total). They are not silently equated to WC component props.

| Parameter | Disposition | Mapping and rationale |
|---|---|---|
| `Tooltip` | Bluent extension | BluentUiComponentBase TooltipService; no corresponding WC tooltip API. Tooltip is registered against the generated/provided id with mouseenter/focus triggers and mouseleave/blur hides; native title is not equivalent. |
| `TooltipContent` | Bluent extension | Bluent Popover RenderFragment. Arbitrary tooltip content is a Bluent composition; no tooltip-content slot exists on the referenced WC tags. |
| `TooltipPlacement` | Bluent extension | Bluent Popover Placement. Placement is configured by the Bluent tooltip service, not by a referenced WC attribute. |
| `TooltipAppearance` | Bluent extension | Bluent PopoverAppearance. Popover styling is a Bluent API and has no direct attribute on these WC tags. |
| `DisplayTooltipArrow` | Bluent extension | Bluent tooltip arrow configuration. No matching tooltip component or arrow attribute exists in the pinned WC tag contracts. |
| `AdditionalAttributes` | Supported | Blazor unmatched-attribute bridge to the root HTML element. Source forwards arbitrary attributes; exact DOM, disabled and ARIA behavior remains a separate runtime/AT check. |
| `Class` | Supported | HTML class attribute merged with Bluent classes. BluentComponentBase.GetComponentClass combines component classes with Class; a CSS part is not a direct replacement for this Blazor API. |
| `Style` | Supported | HTML style attribute on the root element. The component forwards Style to the rendered root; CSS token and theme equivalence remain separate review dimensions. |

## Per-family parameter ledger

### Button — #428

Pinned counterpart kind: `tag_present`; referenced tags: `fluent-button`, `fluent-toggle-button`, `fluent-compound-button`, `fluent-menu-button`, `fluent-anchor-button`.

| Parameter | Kind / source type | Disposition | Upstream mapping | Rationale / value-level gaps | Source |
|---|---|---|---|---|---|
| `Text` | value / `string?` | Supported | fluent-button default slot | Bluent Text is rendered as the button's content; the pinned tag exposes a default slot. | [ Button.razor.cs:9 ](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor.cs#L9) |
| `TextClass` | value / `string?` | Bluent extension | Bluent inner text wrapper class; WC exposes CSS part content | A per-text class is not equivalent to styling the whole WC content part. | [ Button.razor.cs:10 ](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor.cs#L10) |
| `SecondaryText` | value / `string?` | Supported | fluent-compound-button description slot (related tag) | The equivalent concept exists on the separate compound-button tag, not as a property of fluent-button. | [ Button.razor.cs:11 ](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor.cs#L11) |
| `Icon` | value / `IconDefinition?` | Supported | fluent-button start slot; end slot for alternate placement | The slot can host icon content; Bluent's paired regular/filled icon rendering and state CSS remain Bluent-specific. | [ Button.razor.cs:12 ](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor.cs#L12) |
| `Toggled` | value / `bool?` | Bluent extension | Related candidate: fluent-toggle-button.pressed | Bluent currently renders a normal button with a toggled class; it does not adopt the toggle-button pressed/mixed or ARIA contract. | [ Button.razor.cs:13 ](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor.cs#L13) |
| `Rotated` | value / `bool` | Bluent extension | Bluent rotated CSS class | No rotation attribute or state is documented for the pinned button tags. | [ Button.razor.cs:14 ](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor.cs#L14) |
| `Orientation` | value / `Orientation` | Bluent extension | Bluent vertical-orientation CSS class | No orientation attribute is documented for the pinned button tags. | [ Button.razor.cs:15 ](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor.cs#L15) |
| `ToggledChanged` | event / `EventCallback<bool>` | Bluent extension | Blazor EventCallback<bool>; no custom event documented in the pinned toggle-button CEM | The callback is paired with Bluent's Toggled parameter; a CEM event or runtime-equivalent callback contract is not established. | [ Button.razor.cs:16 ](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor.cs#L16) |
| `OnClick` | event / `EventCallback` | Supported | Native DOM click event bridged to EventCallback | Click is a standard DOM event, not a custom event listed in the CEM; disabled/navigation callback ordering still needs runtime evidence. | [ Button.razor.cs:17 ](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor.cs#L17) |
| `Shape` | value / `ButtonShape` | Supported | fluent-button.shape | Bluent Rounded/Circular/Square values match the pinned WC shape values. | [ Button.razor.cs:18 ](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor.cs#L18) |
| `Appearance` | value / `ButtonAppearance` | Supported | fluent-button.appearance | Default maps by omitting the attribute; Primary/Outline/Subtle/Transparent match the pinned values. Danger is an extra Bluent appearance. Value-level notes: Danger: Bluent extension (no matching appearance value in the pinned WC CEM) | [ Button.razor.cs:19 ](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor.cs#L19) |
| `Size` | value / `ButtonSize` | Supported | fluent-button.size | Small/Medium/Large match the pinned WC size values. | [ Button.razor.cs:20 ](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor.cs#L20) |
| `Href` | value / `string?` | Supported | fluent-anchor-button.href (related tag; not fluent-button) | Bluent switches to an anchor when Href is non-empty; this is a related-tag mapping, not a single fluent-button API. Disabled-link semantics are separately audited. | [ Button.razor.cs:21 ](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor.cs#L21) |
| `Badge` | slot / `RenderFragment?` | Bluent extension | Positioned nested Badge; no dedicated button badge slot in the pinned CEM | The button renders a positioned wrapper around a Badge; the WC button tags do not expose a badge slot or position API. | [ Button.razor.cs:22 ](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor.cs#L22) |
| `BadgeHorizontalPosition` | value / `HorizontalSides` | Bluent extension | Bluent badge wrapper horizontal-position class | No horizontal badge-position attribute exists on the pinned WC button tags. | [ Button.razor.cs:23 ](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor.cs#L23) |
| `BadgeVerticalPosition` | value / `VerticalSides` | Bluent extension | Bluent badge wrapper vertical-position class | No vertical badge-position attribute exists on the pinned WC button tags. | [ Button.razor.cs:24 ](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor.cs#L24) |
| `Dropdown` | slot / `RenderFragment?` | Bluent extension | Popover/Surface composition; fluent-menu-button is related only | The pinned menu-button CEM does not document a dedicated menu/dropdown slot; Bluent composes a Popover and Surface. | [ Button.razor.cs:25 ](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor.cs#L25) |
| `ShowDropdownIndicator` | value / `bool` | Bluent extension | Bluent-generated caret icons | The indicator is drawn by Bluent Icon instances; no matching WC attribute is documented. | [ Button.razor.cs:26 ](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor.cs#L26) |
| `Compact` | value / `bool` | Bluent extension | Bluent compact CSS class | No compact attribute exists on the pinned WC button tags. | [ Button.razor.cs:27 ](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor.cs#L27) |
| `DropdownPlacement` | value / `Placement` | Bluent extension | Bluent Popover Placement | Dropdown placement belongs to the Bluent Popover composition, not the button tag API. | [ Button.razor.cs:28 ](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor.cs#L28) |
| `ParentPopover` | cascading / `Popover?` | Bluent extension | Blazor CascadingParameter Popover context | This is a Blazor composition contract, not a Fluent WC property. | [ Button.razor.cs:29 ](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor.cs#L29) |
| `Overflow` | cascading / `Overflow?` | Bluent extension | Blazor CascadingParameter Overflow/Toolbar context | This is a Blazor overflow composition contract, not a Fluent WC property. | [ Button.razor.cs:30 ](../../../src/Bluent.UI/Components/ButtonComponent/Button.razor.cs#L30) |
| `Tooltip` | value / `string?` | Bluent extension | BluentUiComponentBase TooltipService; no corresponding WC tooltip API | Tooltip is registered against the generated/provided id with mouseenter/focus triggers and mouseleave/blur hides; native title is not equivalent. | [ BluentUiComponentBase.cs:9 ](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L9) |
| `TooltipContent` | slot / `RenderFragment?` | Bluent extension | Bluent Popover RenderFragment | Arbitrary tooltip content is a Bluent composition; no tooltip-content slot exists on the referenced WC tags. | [ BluentUiComponentBase.cs:10 ](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L10) |
| `TooltipPlacement` | value / `Placement` | Bluent extension | Bluent Popover Placement | Placement is configured by the Bluent tooltip service, not by a referenced WC attribute. | [ BluentUiComponentBase.cs:11 ](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L11) |
| `TooltipAppearance` | value / `PopoverAppearance` | Bluent extension | Bluent PopoverAppearance | Popover styling is a Bluent API and has no direct attribute on these WC tags. | [ BluentUiComponentBase.cs:12 ](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L12) |
| `DisplayTooltipArrow` | value / `bool` | Bluent extension | Bluent tooltip arrow configuration | No matching tooltip component or arrow attribute exists in the pinned WC tag contracts. | [ BluentUiComponentBase.cs:13 ](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L13) |
| `AdditionalAttributes` | value / `Dictionary<string, object>?` | Supported | Blazor unmatched-attribute bridge to the root HTML element | Source forwards arbitrary attributes; exact DOM, disabled and ARIA behavior remains a separate runtime/AT check. | [ BluentComponentBase.cs:8 ](../../../src/Bluent.Core/BluentComponentBase.cs#L8) |
| `Class` | value / `string?` | Supported | HTML class attribute merged with Bluent classes | BluentComponentBase.GetComponentClass combines component classes with Class; a CSS part is not a direct replacement for this Blazor API. | [ BluentComponentBase.cs:9 ](../../../src/Bluent.Core/BluentComponentBase.cs#L9) |
| `Style` | value / `string?` | Supported | HTML style attribute on the root element | The component forwards Style to the rendered root; CSS token and theme equivalence remain separate review dimensions. | [ BluentComponentBase.cs:10 ](../../../src/Bluent.Core/BluentComponentBase.cs#L10) |

### Icon — #429

Pinned counterpart kind: `no_dedicated_tag`; referenced tags: no dedicated WC tag.

| Parameter | Kind / source type | Disposition | Upstream mapping | Rationale / value-level gaps | Source |
|---|---|---|---|---|---|
| `Value` | value / `IconDefinition?` | Bluent extension | IconDefinition source abstraction; Fluent System Icons is asset-level reference only | IconDefinition supports CSS-class, arbitrary SVG and image sources; the pinned WC package has no generic Icon tag and the React icon package is not a component-level counterpart. | [ Icon.cs:9 ](../../../src/Bluent.UI/Components/IconComponent/Icon.cs#L9) |
| `Variant` | value / `IconVariant` | Supported | Fluent System Icons Regular/Filled asset variants | IconVariant exposes Regular/Filled and falls back to Regular when Filled is absent. No Color enum exists; exact Color asset coverage and requirement remain undecided. Value-level notes: Color: N/A (not part of the current public enum; no feature requirement approved) | [ Icon.cs:10 ](../../../src/Bluent.UI/Components/IconComponent/Icon.cs#L10) |
| `Tooltip` | value / `string?` | Bluent extension | BluentUiComponentBase TooltipService; no corresponding WC tooltip API | Tooltip is registered against the generated/provided id with mouseenter/focus triggers and mouseleave/blur hides; native title is not equivalent. | [ BluentUiComponentBase.cs:9 ](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L9) |
| `TooltipContent` | slot / `RenderFragment?` | Bluent extension | Bluent Popover RenderFragment | Arbitrary tooltip content is a Bluent composition; no tooltip-content slot exists on the referenced WC tags. | [ BluentUiComponentBase.cs:10 ](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L10) |
| `TooltipPlacement` | value / `Placement` | Bluent extension | Bluent Popover Placement | Placement is configured by the Bluent tooltip service, not by a referenced WC attribute. | [ BluentUiComponentBase.cs:11 ](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L11) |
| `TooltipAppearance` | value / `PopoverAppearance` | Bluent extension | Bluent PopoverAppearance | Popover styling is a Bluent API and has no direct attribute on these WC tags. | [ BluentUiComponentBase.cs:12 ](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L12) |
| `DisplayTooltipArrow` | value / `bool` | Bluent extension | Bluent tooltip arrow configuration | No matching tooltip component or arrow attribute exists in the pinned WC tag contracts. | [ BluentUiComponentBase.cs:13 ](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L13) |
| `AdditionalAttributes` | value / `Dictionary<string, object>?` | Supported | Blazor unmatched-attribute bridge to the root HTML element | Source forwards arbitrary attributes; exact DOM, disabled and ARIA behavior remains a separate runtime/AT check. | [ BluentComponentBase.cs:8 ](../../../src/Bluent.Core/BluentComponentBase.cs#L8) |
| `Class` | value / `string?` | Supported | HTML class attribute merged with Bluent classes | BluentComponentBase.GetComponentClass combines component classes with Class; a CSS part is not a direct replacement for this Blazor API. | [ BluentComponentBase.cs:9 ](../../../src/Bluent.Core/BluentComponentBase.cs#L9) |
| `Style` | value / `string?` | Supported | HTML style attribute on the root element | The component forwards Style to the rendered root; CSS token and theme equivalence remain separate review dimensions. | [ BluentComponentBase.cs:10 ](../../../src/Bluent.Core/BluentComponentBase.cs#L10) |

### Label — #430

Pinned counterpart kind: `tag_present`; referenced tags: `fluent-label`.

| Parameter | Kind / source type | Disposition | Upstream mapping | Rationale / value-level gaps | Source |
|---|---|---|---|---|---|
| `Text` | value / `string?` | Supported | fluent-label default slot | Text is rendered as label content; the pinned tag exposes a default slot. | [ Label.razor.cs:10 ](../../../src/Bluent.UI/Components/LabelComponent/Label.razor.cs#L10) |
| `ForExpression` | value / `Expression<Func<object?>>?` | Bluent extension | Native label-for association; no for attribute documented on fluent-label | Bluent renders a native label with a derived for value. React v9 Label is a cross-platform reference for association only, not a 1:1 WC component mapping. | [ Label.razor.cs:11 ](../../../src/Bluent.UI/Components/LabelComponent/Label.razor.cs#L11) |
| `RequiredSymbol` | value / `string` | Bluent extension | Custom required-symbol text; fluent-label has required boolean and asterisk CSS part | The upstream component can show its required marker but does not expose a custom marker string. | [ Label.razor.cs:12 ](../../../src/Bluent.UI/Components/LabelComponent/Label.razor.cs#L12) |
| `Info` | slot / `RenderFragment?` | Bluent extension | Bluent Popover plus icon-only Button composition | No information/tooltip slot is documented on fluent-label; accessible naming of the icon-only trigger is a separate open gap. | [ Label.razor.cs:13 ](../../../src/Bluent.UI/Components/LabelComponent/Label.razor.cs#L13) |
| `Size` | value / `LabelSize` | Supported | fluent-label.size | Small/Medium/Large match the pinned WC label size values. | [ Label.razor.cs:14 ](../../../src/Bluent.UI/Components/LabelComponent/Label.razor.cs#L14) |
| `Required` | value / `LabelRequiredState` | Bluent extension | fluent-label.required boolean for explicit states; Auto uses Blazor validation inference | Required/NotRequired map to a boolean, but Auto inspects ForExpression validation metadata and has no direct WC equivalent. Value-level notes: Auto: Bluent extension (infer from ForExpression validation metadata) | [ Label.razor.cs:15 ](../../../src/Bluent.UI/Components/LabelComponent/Label.razor.cs#L15) |
| `Tooltip` | value / `string?` | Bluent extension | BluentUiComponentBase TooltipService; no corresponding WC tooltip API | Tooltip is registered against the generated/provided id with mouseenter/focus triggers and mouseleave/blur hides; native title is not equivalent. | [ BluentUiComponentBase.cs:9 ](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L9) |
| `TooltipContent` | slot / `RenderFragment?` | Bluent extension | Bluent Popover RenderFragment | Arbitrary tooltip content is a Bluent composition; no tooltip-content slot exists on the referenced WC tags. | [ BluentUiComponentBase.cs:10 ](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L10) |
| `TooltipPlacement` | value / `Placement` | Bluent extension | Bluent Popover Placement | Placement is configured by the Bluent tooltip service, not by a referenced WC attribute. | [ BluentUiComponentBase.cs:11 ](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L11) |
| `TooltipAppearance` | value / `PopoverAppearance` | Bluent extension | Bluent PopoverAppearance | Popover styling is a Bluent API and has no direct attribute on these WC tags. | [ BluentUiComponentBase.cs:12 ](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L12) |
| `DisplayTooltipArrow` | value / `bool` | Bluent extension | Bluent tooltip arrow configuration | No matching tooltip component or arrow attribute exists in the pinned WC tag contracts. | [ BluentUiComponentBase.cs:13 ](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L13) |
| `AdditionalAttributes` | value / `Dictionary<string, object>?` | Supported | Blazor unmatched-attribute bridge to the root HTML element | Source forwards arbitrary attributes; exact DOM, disabled and ARIA behavior remains a separate runtime/AT check. | [ BluentComponentBase.cs:8 ](../../../src/Bluent.Core/BluentComponentBase.cs#L8) |
| `Class` | value / `string?` | Supported | HTML class attribute merged with Bluent classes | BluentComponentBase.GetComponentClass combines component classes with Class; a CSS part is not a direct replacement for this Blazor API. | [ BluentComponentBase.cs:9 ](../../../src/Bluent.Core/BluentComponentBase.cs#L9) |
| `Style` | value / `string?` | Supported | HTML style attribute on the root element | The component forwards Style to the rendered root; CSS token and theme equivalence remain separate review dimensions. | [ BluentComponentBase.cs:10 ](../../../src/Bluent.Core/BluentComponentBase.cs#L10) |

### Link — #431

Pinned counterpart kind: `tag_present`; referenced tags: `fluent-link`, `fluent-anchor-button`.

| Parameter | Kind / source type | Disposition | Upstream mapping | Rationale / value-level gaps | Source |
|---|---|---|---|---|---|
| `Text` | value / `string` | Supported | fluent-link default slot | Text is rendered as link content; the pinned tag exposes a default slot. | [ Link.cs:9 ](../../../src/Bluent.UI/Components/LinkComponent/Link.cs#L9) |
| `Href` | value / `string?` | Supported | fluent-link.href | The URL maps directly, but Bluent renders a button when Href is empty and renders an anchor without href when disabled; that composite behavior is not a fluent-link contract. | [ Link.cs:10 ](../../../src/Bluent.UI/Components/LinkComponent/Link.cs#L10) |
| `Appearance` | value / `LinkAppearance` | Supported | fluent-link.appearance | Default maps by omitting the attribute; Subtle maps to the only documented appearance value. | [ Link.cs:11 ](../../../src/Bluent.UI/Components/LinkComponent/Link.cs#L11) |
| `OnClick` | event / `EventCallback` | Supported | Native DOM click event bridged to EventCallback | The pinned CEM documents no custom event; click is a standard DOM event. It does not by itself establish prevent-default or disabled semantics. | [ Link.cs:12 ](../../../src/Bluent.UI/Components/LinkComponent/Link.cs#L12) |
| `Tooltip` | value / `string?` | Bluent extension | BluentUiComponentBase TooltipService; no corresponding WC tooltip API | Tooltip is registered against the generated/provided id with mouseenter/focus triggers and mouseleave/blur hides; native title is not equivalent. | [ BluentUiComponentBase.cs:9 ](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L9) |
| `TooltipContent` | slot / `RenderFragment?` | Bluent extension | Bluent Popover RenderFragment | Arbitrary tooltip content is a Bluent composition; no tooltip-content slot exists on the referenced WC tags. | [ BluentUiComponentBase.cs:10 ](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L10) |
| `TooltipPlacement` | value / `Placement` | Bluent extension | Bluent Popover Placement | Placement is configured by the Bluent tooltip service, not by a referenced WC attribute. | [ BluentUiComponentBase.cs:11 ](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L11) |
| `TooltipAppearance` | value / `PopoverAppearance` | Bluent extension | Bluent PopoverAppearance | Popover styling is a Bluent API and has no direct attribute on these WC tags. | [ BluentUiComponentBase.cs:12 ](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L12) |
| `DisplayTooltipArrow` | value / `bool` | Bluent extension | Bluent tooltip arrow configuration | No matching tooltip component or arrow attribute exists in the pinned WC tag contracts. | [ BluentUiComponentBase.cs:13 ](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L13) |
| `AdditionalAttributes` | value / `Dictionary<string, object>?` | Supported | Blazor unmatched-attribute bridge to the root HTML element | Source forwards arbitrary attributes; exact DOM, disabled and ARIA behavior remains a separate runtime/AT check. | [ BluentComponentBase.cs:8 ](../../../src/Bluent.Core/BluentComponentBase.cs#L8) |
| `Class` | value / `string?` | Supported | HTML class attribute merged with Bluent classes | BluentComponentBase.GetComponentClass combines component classes with Class; a CSS part is not a direct replacement for this Blazor API. | [ BluentComponentBase.cs:9 ](../../../src/Bluent.Core/BluentComponentBase.cs#L9) |
| `Style` | value / `string?` | Supported | HTML style attribute on the root element | The component forwards Style to the rendered root; CSS token and theme equivalence remain separate review dimensions. | [ BluentComponentBase.cs:10 ](../../../src/Bluent.Core/BluentComponentBase.cs#L10) |

### Badge — #445

Pinned counterpart kind: `tag_present`; referenced tags: `fluent-badge`, `fluent-counter-badge`.

| Parameter | Kind / source type | Disposition | Upstream mapping | Rationale / value-level gaps | Source |
|---|---|---|---|---|---|
| `Appearance` | value / `BadgeAppearance` | Supported | fluent-badge.appearance | Filled/Ghost/Tint map directly; Outlined requires normalization to upstream outline and is currently represented by a Bluent outlined CSS class. Value-level notes: Outlined: Bluent extension (translate to appearance=outline; current Bluent class spelling is outlined) | [ Badge.razor.cs:8 ](../../../src/Bluent.UI/Components/BadgeComponent/Badge.razor.cs#L8) |
| `Size` | value / `BadgeSize` | Supported | fluent-badge.size | Tiny/ExtraSmall/Small/Medium/Large/ExtraLarge match the pinned WC size values. | [ Badge.razor.cs:9 ](../../../src/Bluent.UI/Components/BadgeComponent/Badge.razor.cs#L9) |
| `Shape` | value / `BadgeShape` | Supported | fluent-badge.shape | Square/Rounded/Circular match the pinned WC shape values. | [ Badge.razor.cs:10 ](../../../src/Bluent.UI/Components/BadgeComponent/Badge.razor.cs#L10) |
| `Color` | value / `BadgeColor` | Supported | fluent-badge.color | Color semantics align except the Bluent enum value Sever emits the class sever; the pinned WC value is severe. Value-level notes: Sever: Missing (upstream expects severe; source enum/class is sever) | [ Badge.razor.cs:11 ](../../../src/Bluent.UI/Components/BadgeComponent/Badge.razor.cs#L11) |
| `Icon` | value / `IconDefinition?` | Supported | fluent-badge start slot | The Bluent Icon is rendered before the text, which maps conceptually to the start slot; no end-position property is exposed. | [ Badge.razor.cs:12 ](../../../src/Bluent.UI/Components/BadgeComponent/Badge.razor.cs#L12) |
| `Text` | value / `string?` | Supported | fluent-badge default slot | Text is rendered as badge content; the pinned tag exposes a default slot. | [ Badge.razor.cs:13 ](../../../src/Bluent.UI/Components/BadgeComponent/Badge.razor.cs#L13) |
| `DropShadow` | value / `bool` | Bluent extension | Bluent drop-shadow CSS class | The pinned fluent-badge CEM exposes no corresponding attribute, CSS part or custom property. | [ Badge.razor.cs:14 ](../../../src/Bluent.UI/Components/BadgeComponent/Badge.razor.cs#L14) |
| `AnimateShadow` | value / `bool` | Bluent extension | Bluent animated-shadow CSS class | The pinned fluent-badge CEM exposes no corresponding animation API; reduced-motion behavior is a separate confirmed gap. | [ Badge.razor.cs:15 ](../../../src/Bluent.UI/Components/BadgeComponent/Badge.razor.cs#L15) |
| `Tooltip` | value / `string?` | Bluent extension | BluentUiComponentBase TooltipService; no corresponding WC tooltip API | Tooltip is registered against the generated/provided id with mouseenter/focus triggers and mouseleave/blur hides; native title is not equivalent. | [ BluentUiComponentBase.cs:9 ](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L9) |
| `TooltipContent` | slot / `RenderFragment?` | Bluent extension | Bluent Popover RenderFragment | Arbitrary tooltip content is a Bluent composition; no tooltip-content slot exists on the referenced WC tags. | [ BluentUiComponentBase.cs:10 ](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L10) |
| `TooltipPlacement` | value / `Placement` | Bluent extension | Bluent Popover Placement | Placement is configured by the Bluent tooltip service, not by a referenced WC attribute. | [ BluentUiComponentBase.cs:11 ](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L11) |
| `TooltipAppearance` | value / `PopoverAppearance` | Bluent extension | Bluent PopoverAppearance | Popover styling is a Bluent API and has no direct attribute on these WC tags. | [ BluentUiComponentBase.cs:12 ](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L12) |
| `DisplayTooltipArrow` | value / `bool` | Bluent extension | Bluent tooltip arrow configuration | No matching tooltip component or arrow attribute exists in the pinned WC tag contracts. | [ BluentUiComponentBase.cs:13 ](../../../src/Bluent.UI/Components/BluentUiComponentBase.cs#L13) |
| `AdditionalAttributes` | value / `Dictionary<string, object>?` | Supported | Blazor unmatched-attribute bridge to the root HTML element | Source forwards arbitrary attributes; exact DOM, disabled and ARIA behavior remains a separate runtime/AT check. | [ BluentComponentBase.cs:8 ](../../../src/Bluent.Core/BluentComponentBase.cs#L8) |
| `Class` | value / `string?` | Supported | HTML class attribute merged with Bluent classes | BluentComponentBase.GetComponentClass combines component classes with Class; a CSS part is not a direct replacement for this Blazor API. | [ BluentComponentBase.cs:9 ](../../../src/Bluent.Core/BluentComponentBase.cs#L9) |
| `Style` | value / `string?` | Supported | HTML style attribute on the root element | The component forwards Style to the rendered root; CSS token and theme equivalence remain separate review dimensions. | [ BluentComponentBase.cs:10 ](../../../src/Bluent.Core/BluentComponentBase.cs#L10) |

## Out-of-band public/base findings

| Item | Disposition | Finding |
|---|---|---|
| `Id` | Supported | HTML id via AdditionalAttributes; generated identifier when none is supplied. BluentComponentBase reads a caller id from AdditionalAttributes or creates one; TooltipService uses the resulting id. |
| `Disabled` | Bluent extension | AdditionalAttributes['disabled'] and IsDisabled. IsDisabled recognizes only a boolean true value. Link/Button disabled navigation semantics differ from fluent-link/fluent-button and need explicit runtime evidence. |
| `SetStateHasChanged` | N/A | Blazor lifecycle helper. Not a Fluent component feature. |
| `IconVariant.Color` | N/A | No Color enum in the current Bluent IconVariant; do not add one without exact asset-release coverage, license/shipping, theme/forced-colors and design review.. The pinned React icon package is an asset reference, not a generic Icon component; the local 20px font map has no Color entries. |

## Family-level feature disposition

- **Button (#428): `audited_gaps`** — the base Button API combines normal, toggle, anchor, compound and menu-button behavior; multiple props are Bluent compositions/extensions, and `Danger` has no direct WC appearance value.
- **Icon (#429): `audited_gaps`** — no WC Icon tag; the generic CSS/SVG/Image source API is a Bluent abstraction. Regular/Filled asset selection is mapped, but Color is not a current public variant and remains an unapproved requirement.
- **Label (#430): `audited_gaps`** — `for` association, automatic required inference, custom required symbol and Info popover are Bluent-specific; only size and explicit required state map to the documented WC API.
- **Link (#431): `audited_gaps`** — href/appearance map, but the component switches between anchor and button and its disabled-anchor behavior is not the fluent-link contract.
- **Badge (#445): `audited_gaps`** — appearance/size/shape/color mostly map, but Outlined requires normalization, `Sever` does not match `severe`, and shadow animation is a Bluent extension with reduced-motion follow-up.

## Acceptance boundary

No product source, CSS, public API or component design was changed. The ledger does not change the source candidate file, does not approve parity, and does not replace runtime/browser/OS/AT tests. Wave A `feature` dimensions may be recorded as `audited_gaps`; all family `designApproval` values remain pending and `evidenceBundle` remains null. See the [canonical 18-family matrix](FLUENT-PARITY-RETRO-AUDIT.md) and the family reports for the independent visual/behavior/accessibility dimensions.
