# Token and theme source audit - Issue #552

Review date: 2026-10-22. Source baseline: 73155f02.

## Scope

This audit inventories token references and local CSS custom properties in the 18 pilot families, checks for raw color literals and component-local forced-colors/reduced-motion rules, and links the existing browser evidence. The light/dark theme mixins generate Fluent-named semantic color, typography, spacing, stroke, duration, curve, radius and shadow tokens.

**Status: audited gaps, not accepted.** Matching token names do not prove computed-value parity with the pinned Fluent runtime. This report does not claim native OS high-contrast or screen-reader certification.

## Summary

| Family | Style files | Theme token refs | Local custom props | Raw color declarations | Component forced-colors lines | Reduced-motion lines |
|---|---|---:|---:|---:|---:|---:|
| Button | 1 | 57 | 0 | 0 | 0 | 0 |
| Icon | 0 | 0 | 0 | 0 | 0 | 0 |
| Label | 1 | 12 | 0 | 0 | 0 | 0 |
| Link | 1 | 10 | 0 | 0 | 0 | 0 |
| Badge | 1 | 29 | 1 | 0 | 0 | 0 |
| TextField | 1 | 29 | 4 | 0 | 0 | 0 |
| NumericField | 1 | 29 | 4 | 0 | 0 | 0 |
| Checkbox | 1 | 16 | 3 | 0 | 0 | 0 |
| Switch | 1 | 17 | 0 | 0 | 0 | 0 |
| RadioGroup | 2 | 14 | 1 | 0 | 0 | 0 |
| SelectField | 2 | 29 | 4 | 0 | 0 | 0 |
| DateField | 2 | 43 | 4 | 0 | 0 | 0 |
| TimeField | 1 | 29 | 4 | 0 | 0 | 0 |
| MaskedField | 1 | 29 | 4 | 0 | 0 | 0 |
| OtpField | 1 | 19 | 3 | 0 | 0 | 0 |
| Slider | 1 | 4 | 4 | 0 | 0 | 0 |
| RangeSlider | 1 | 4 | 4 | 0 | 0 | 0 |
| FileSelect | 1 | 2 | 0 | 0 | 0 | 0 |

## Theme sources

- [light-theme.scss](../../../src/Bluent.UI/Styles/Themes/theme/light-theme.scss)
- [dark-theme.scss](../../../src/Bluent.UI/Styles/Themes/theme/dark-theme.scss)
- [color-palette.scss](../../../src/Bluent.UI/Styles/Themes/theme/light/color-palette.scss)
- [color-palette.scss](../../../src/Bluent.UI/Styles/Themes/theme/dark/color-palette.scss)
- [brand-palette.scss](../../../src/Bluent.UI/Styles/Themes/theme/light/brand-palette.scss)
- [brand-palette.scss](../../../src/Bluent.UI/Styles/Themes/theme/dark/brand-palette.scss)
- [status-color-palette.scss](../../../src/Bluent.UI/Styles/Themes/theme/light/status-color-palette.scss)
- [status-color-palette.scss](../../../src/Bluent.UI/Styles/Themes/theme/dark/status-color-palette.scss)

## Family findings

### Button (#428)

**Source note:** Uses Fluent-named semantic color, typography, spacing and radius tokens, but outline is reset and focus/forced-colors parity needs explicit state-by-state verification.

**Style files:** [_button.scss](../../../src/Bluent.UI/Styles/Components/_button.scss)

**Theme tokens:** --borderRadiusCircular, --borderRadiusMedium, --borderRadiusNone, --colorBrandBackground, --colorBrandBackgroundHover, --colorBrandBackgroundPressed, --colorBrandBackgroundSelected, --colorNeutralBackground1, --colorNeutralBackground1Hover, --colorNeutralBackground1Pressed, --colorNeutralBackground1Selected, --colorNeutralBackgroundDisabled, --colorNeutralForeground1, --colorNeutralForeground1Hover, --colorNeutralForeground1Pressed, --colorNeutralForeground1Selected, --colorNeutralForeground2, --colorNeutralForeground2BrandHover

**Local custom properties:** None found in the reviewed family style set.

**Unresolved local property references:** None detected by repository-wide source search.

**Raw color declarations:** None found in the reviewed family stylesheet set.

**Component-specific forced-colors rule lines:** 0; **reduced-motion rule lines:** 0.

**Browser evidence:** [BLUENT-BUTTON-STATE-CHROME.json](evidence/BLUENT-BUTTON-STATE-CHROME.json), [BLUENT-BLAZOR-FOCUS-CHROME.json](evidence/BLUENT-BLAZOR-FOCUS-CHROME.json)

**Decision boundary:** Source token inventory only; compare computed Light/Dark values and states with the pinned Fluent runtime and verify responsive RTL, forced colors and native AT before acceptance.

### Icon (#429)

**Source note:** No dedicated family SCSS was found in the reviewed style map; rendered SVG color depends on inherited currentColor and parent theme context.

**Style files:** No dedicated family SCSS; color is inherited from component/parent rendering.

**Theme tokens:** No direct global theme-token reference found in the family stylesheet set.

**Local custom properties:** None found in the reviewed family style set.

**Unresolved local property references:** None detected by repository-wide source search.

**Raw color declarations:** None found in the reviewed family stylesheet set.

**Component-specific forced-colors rule lines:** 0; **reduced-motion rule lines:** 0.

**Browser evidence:** [BLUENT-CROSS-ICON-CHROME.json](evidence/BLUENT-CROSS-ICON-CHROME.json)

**Decision boundary:** Source token inventory only; compare computed Light/Dark values and states with the pinned Fluent runtime and verify responsive RTL, forced colors and native AT before acceptance.

### Label (#430)

**Source note:** Foreground styling uses semantic color tokens; required-marker contrast and theme behavior are not native AT or computed-Fluent parity acceptance.

**Style files:** [_label.scss](../../../src/Bluent.UI/Styles/Components/_label.scss)

**Theme tokens:** --colorNeutralForeground1, --colorNeutralForegroundDisabled, --colorPaletteRedForeground3, --fontFamilyBase, --fontSizeBase200, --fontSizeBase300, --fontSizeBase400, --fontWeightSemibold, --lineHeightBase200, --lineHeightBase300, --lineHeightBase400, --spacingHorizontalXS

**Local custom properties:** None found in the reviewed family style set.

**Unresolved local property references:** None detected by repository-wide source search.

**Raw color declarations:** None found in the reviewed family stylesheet set.

**Component-specific forced-colors rule lines:** 0; **reduced-motion rule lines:** 0.

**Browser evidence:** [BLUENT-LABEL-LINK-BADGE-CHROME.json](evidence/BLUENT-LABEL-LINK-BADGE-CHROME.json)

**Decision boundary:** Source token inventory only; compare computed Light/Dark values and states with the pinned Fluent runtime and verify responsive RTL, forced colors and native AT before acceptance.

### Link (#431)

**Source note:** Foreground/background styles use semantic token references; hover, focus, visited and high-contrast behavior still need comparison with the pinned Fluent runtime.

**Style files:** [_link.scss](../../../src/Bluent.UI/Styles/Components/_link.scss)

**Theme tokens:** --colorBrandForegroundLink, --colorBrandForegroundLinkHover, --colorBrandForegroundLinkPressed, --colorNeutralForeground2, --colorNeutralForeground2Hover, --colorNeutralForeground2Pressed, --colorNeutralForegroundDisabled, --fontFamilyBase, --fontWeightRegular, --strokeWidthThin

**Local custom properties:** None found in the reviewed family style set.

**Unresolved local property references:** None detected by repository-wide source search.

**Raw color declarations:** None found in the reviewed family stylesheet set.

**Component-specific forced-colors rule lines:** 0; **reduced-motion rule lines:** 0.

**Browser evidence:** [BLUENT-LABEL-LINK-BADGE-CHROME.json](evidence/BLUENT-LABEL-LINK-BADGE-CHROME.json)

**Decision boundary:** Source token inventory only; compare computed Light/Dark values and states with the pinned Fluent runtime and verify responsive RTL, forced colors and native AT before acceptance.

### Badge (#445)

**Source note:** Uses semantic status tokens; its infinite shadow animation has no component-specific reduced-motion rule. This is a motion/acceptance gap, not evidence of a color-token mismatch.

**Style files:** [_badge.scss](../../../src/Bluent.UI/Styles/Components/_badge.scss)

**Theme tokens:** --borderRadiusCircular, --borderRadiusMedium, --borderRadiusNone, --colorBrandBackground, --colorBrandBackground2, --colorBrandForeground1, --colorBrandForeground2, --colorBrandStroke2, --colorNeutralBackground1, --colorNeutralBackground5, --colorNeutralForeground1, --colorNeutralForeground1Static, --colorNeutralForeground3, --colorNeutralForegroundOnBrand, --colorPaletteDarkOrangeBackground3, --colorPaletteGreenBackground3, --colorPaletteRedBackground3, --colorPaletteYellowBackground3

**Local custom properties:** --badge-bg-color

**Unresolved local property references:** None detected by repository-wide source search.

**Raw color declarations:** None found in the reviewed family stylesheet set.

**Component-specific forced-colors rule lines:** 0; **reduced-motion rule lines:** 0.

**Browser evidence:** [BLUENT-LABEL-LINK-BADGE-CHROME.json](evidence/BLUENT-LABEL-LINK-BADGE-CHROME.json)

**Decision boundary:** Source token inventory only; compare computed Light/Dark values and states with the pinned Fluent runtime and verify responsive RTL, forced colors and native AT before acceptance.

### TextField (#432)

**Source note:** Shared field styling uses semantic tokens plus local --fui-text-field-* properties and a fixed 32px minimum height; density and focus behavior need design comparison.

**Style files:** [_field.scss](../../../src/Bluent.UI/Styles/Components/_field.scss)

**Theme tokens:** --borderRadiusMedium, --colorNeutralBackground1, --colorNeutralForeground1, --colorNeutralForegroundDisabled, --colorNeutralStroke1, --colorNeutralStroke1Hover, --colorNeutralStroke1Pressed, --colorNeutralStrokeAccessible, --colorNeutralStrokeAccessibleHover, --colorNeutralStrokeAccessiblePressed, --colorPaletteRedBorder2, --colorPaletteRedForeground1, --colorTransparentBackground, --curveAccelerateMid, --curveDecelerateMid, --durationNormal, --durationUltraFast, --fontFamilyBase

**Local custom properties:** --fui-text-field-font-size, --fui-text-field-line-height, --fui-text-field-min-height, --fui-text-field-padding-x

**Unresolved local property references:** None detected by repository-wide source search.

**Raw color declarations:** None found in the reviewed family stylesheet set.

**Component-specific forced-colors rule lines:** 0; **reduced-motion rule lines:** 0.

**Browser evidence:** [BLUENT-LAB-P0-CHROME.json](evidence/BLUENT-LAB-P0-CHROME.json)

**Decision boundary:** Source token inventory only; compare computed Light/Dark values and states with the pinned Fluent runtime and verify responsive RTL, forced colors and native AT before acceptance.

### NumericField (#433)

**Source note:** Shares field tokens and local sizing properties; Step has no effective behavior and the style inventory does not prove numeric-state parity.

**Style files:** [_field.scss](../../../src/Bluent.UI/Styles/Components/_field.scss)

**Theme tokens:** --borderRadiusMedium, --colorNeutralBackground1, --colorNeutralForeground1, --colorNeutralForegroundDisabled, --colorNeutralStroke1, --colorNeutralStroke1Hover, --colorNeutralStroke1Pressed, --colorNeutralStrokeAccessible, --colorNeutralStrokeAccessibleHover, --colorNeutralStrokeAccessiblePressed, --colorPaletteRedBorder2, --colorPaletteRedForeground1, --colorTransparentBackground, --curveAccelerateMid, --curveDecelerateMid, --durationNormal, --durationUltraFast, --fontFamilyBase

**Local custom properties:** --fui-text-field-font-size, --fui-text-field-line-height, --fui-text-field-min-height, --fui-text-field-padding-x

**Unresolved local property references:** None detected by repository-wide source search.

**Raw color declarations:** None found in the reviewed family stylesheet set.

**Component-specific forced-colors rule lines:** 0; **reduced-motion rule lines:** 0.

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json)

**Decision boundary:** Source token inventory only; compare computed Light/Dark values and states with the pinned Fluent runtime and verify responsive RTL, forced colors and native AT before acceptance.

### Checkbox (#434)

**Source note:** Uses semantic theme tokens and local --bui-checkbox-* properties; mixed/checked/disabled/forced-colors combinations remain unaccepted.

**Style files:** [_checkbox.scss](../../../src/Bluent.UI/Styles/Components/_checkbox.scss)

**Theme tokens:** --borderRadiusCircular, --borderRadiusSmall, --colorNeutralForeground1, --colorNeutralForeground3, --colorNeutralForegroundDisabled, --colorNeutralForegroundInverted, --colorNeutralStrokeAccessible, --colorNeutralStrokeDisabled, --colorPaletteRedForeground3, --fontFamilyBase, --fontSizeBase300, --lineHeightBase300, --spacingHorizontalS, --spacingHorizontalXS, --spacingVerticalS, --strokeWidthThin

**Local custom properties:** --bui-checkbox-indicator-backgroundColor, --bui-checkbox-indicator-borderColor, --bui-checkbox-indicator-color

**Unresolved local property references:** None detected by repository-wide source search.

**Raw color declarations:** None found in the reviewed family stylesheet set.

**Component-specific forced-colors rule lines:** 0; **reduced-motion rule lines:** 0.

**Browser evidence:** [BLUENT-CONTROL-SEMANTICS-CHROME.json](evidence/BLUENT-CONTROL-SEMANTICS-CHROME.json), [BLUENT-CONTROL-SEMANTICS-EDGE.json](evidence/BLUENT-CONTROL-SEMANTICS-EDGE.json)

**Decision boundary:** Source token inventory only; compare computed Light/Dark values and states with the pinned Fluent runtime and verify responsive RTL, forced colors and native AT before acceptance.

### Switch (#435)

**Source note:** Uses semantic tokens for track/thumb states; no component-specific forced-colors override was found in the family stylesheet.

**Style files:** [_switch.scss](../../../src/Bluent.UI/Styles/Components/_switch.scss)

**Theme tokens:** --borderRadiusCircular, --colorNeutralBackgroundDisabled, --colorNeutralForeground1, --colorNeutralForegroundDisabled, --colorNeutralForegroundInverted, --colorNeutralStrokeAccessible, --colorNeutralStrokeDisabled, --colorTransparentStroke, --colorTransparentStrokeDisabled, --curveEasyEase, --durationNormal, --fontFamilyBase, --fontSizeBase300, --lineHeightBase300, --spacingHorizontalS, --spacingHorizontalXS, --spacingVerticalS

**Local custom properties:** None found in the reviewed family style set.

**Unresolved local property references:** None detected by repository-wide source search.

**Raw color declarations:** None found in the reviewed family stylesheet set.

**Component-specific forced-colors rule lines:** 0; **reduced-motion rule lines:** 0.

**Browser evidence:** [BLUENT-CONTROL-SEMANTICS-CHROME.json](evidence/BLUENT-CONTROL-SEMANTICS-CHROME.json), [BLUENT-CONTROL-SEMANTICS-EDGE.json](evidence/BLUENT-CONTROL-SEMANTICS-EDGE.json)

**Decision boundary:** Source token inventory only; compare computed Light/Dark values and states with the pinned Fluent runtime and verify responsive RTL, forced colors and native AT before acceptance.

### RadioGroup (#436)

**Source note:** Group styles rely on the radio subcomponent stylesheet; selected, disabled, focus and forced-colors values need per-state comparison.

**Style files:** [_radio-group.scss](../../../src/Bluent.UI/Styles/Components/_radio-group.scss), [_radio.scss](../../../src/Bluent.UI/Styles/Components/_radio.scss)

**Theme tokens:** --borderRadiusCircular, --colorNeutralForeground1, --colorNeutralForeground3, --colorNeutralForegroundDisabled, --colorNeutralStrokeAccessible, --colorNeutralStrokeDisabled, --colorPaletteRedForeground3, --fontFamilyBase, --fontSizeBase300, --lineHeightBase300, --spacingHorizontalS, --spacingHorizontalXS, --spacingVerticalS, --strokeWidthThin

**Local custom properties:** --bui-checkbox-indicator-backgroundColor

**Unresolved local property references:** None detected by repository-wide source search.

**Raw color declarations:** None found in the reviewed family stylesheet set.

**Component-specific forced-colors rule lines:** 0; **reduced-motion rule lines:** 0.

**Browser evidence:** [BLUENT-CONTROL-SEMANTICS-CHROME.json](evidence/BLUENT-CONTROL-SEMANTICS-CHROME.json), [BLUENT-CONTROL-SEMANTICS-EDGE.json](evidence/BLUENT-CONTROL-SEMANTICS-EDGE.json)

**Decision boundary:** Source token inventory only; compare computed Light/Dark values and states with the pinned Fluent runtime and verify responsive RTL, forced colors and native AT before acceptance.

### SelectField (#437)

**Source note:** Shares field tokens and dropdown-select styling; native popup rendering and high-contrast behavior cannot be established from SCSS inventory.

**Style files:** [_field.scss](../../../src/Bluent.UI/Styles/Components/_field.scss), [_dropdown-select.scss](../../../src/Bluent.UI/Styles/Components/_dropdown-select.scss)

**Theme tokens:** --borderRadiusMedium, --colorNeutralBackground1, --colorNeutralForeground1, --colorNeutralForegroundDisabled, --colorNeutralStroke1, --colorNeutralStroke1Hover, --colorNeutralStroke1Pressed, --colorNeutralStrokeAccessible, --colorNeutralStrokeAccessibleHover, --colorNeutralStrokeAccessiblePressed, --colorPaletteRedBorder2, --colorPaletteRedForeground1, --colorTransparentBackground, --curveAccelerateMid, --curveDecelerateMid, --durationNormal, --durationUltraFast, --fontFamilyBase

**Local custom properties:** --fui-text-field-font-size, --fui-text-field-line-height, --fui-text-field-min-height, --fui-text-field-padding-x

**Unresolved local property references:** None detected by repository-wide source search.

**Raw color declarations:** None found in the reviewed family stylesheet set.

**Component-specific forced-colors rule lines:** 0; **reduced-motion rule lines:** 0.

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json)

**Decision boundary:** Source token inventory only; compare computed Light/Dark values and states with the pinned Fluent runtime and verify responsive RTL, forced colors and native AT before acceptance.

### DateField (#438)

**Source note:** Shares field and calendar styling; calendar popup, selected dates, bounds and dark/forced-colors states need direct browser comparison.

**Style files:** [_field.scss](../../../src/Bluent.UI/Styles/Components/_field.scss), [_calendar.scss](../../../src/Bluent.UI/Styles/Components/_calendar.scss)

**Theme tokens:** --borderRadiusMedium, --colorBrandBackground, --colorBrandBackgroundInvertedHover, --colorBrandBackgroundInvertedPressed, --colorBrandBackgroundInvertedSelected, --colorBrandForegroundOnLightHover, --colorBrandForegroundOnLightPressed, --colorNeutralBackground1, --colorNeutralForeground1, --colorNeutralForeground1Static, --colorNeutralForeground3, --colorNeutralForeground4, --colorNeutralForegroundDisabled, --colorNeutralForegroundOnBrand, --colorNeutralStroke1, --colorNeutralStroke1Hover, --colorNeutralStroke1Pressed, --colorNeutralStrokeAccessible

**Local custom properties:** --fui-text-field-font-size, --fui-text-field-line-height, --fui-text-field-min-height, --fui-text-field-padding-x

**Unresolved local property references:** None detected by repository-wide source search.

**Raw color declarations:** None found in the reviewed family stylesheet set.

**Component-specific forced-colors rule lines:** 0; **reduced-motion rule lines:** 0.

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json)

**Decision boundary:** Source token inventory only; compare computed Light/Dark values and states with the pinned Fluent runtime and verify responsive RTL, forced colors and native AT before acceptance.

### TimeField (#439)

**Source note:** Shares field styling; locale formatting defects are separate from color-token usage and still affect parity.

**Style files:** [_field.scss](../../../src/Bluent.UI/Styles/Components/_field.scss)

**Theme tokens:** --borderRadiusMedium, --colorNeutralBackground1, --colorNeutralForeground1, --colorNeutralForegroundDisabled, --colorNeutralStroke1, --colorNeutralStroke1Hover, --colorNeutralStroke1Pressed, --colorNeutralStrokeAccessible, --colorNeutralStrokeAccessibleHover, --colorNeutralStrokeAccessiblePressed, --colorPaletteRedBorder2, --colorPaletteRedForeground1, --colorTransparentBackground, --curveAccelerateMid, --curveDecelerateMid, --durationNormal, --durationUltraFast, --fontFamilyBase

**Local custom properties:** --fui-text-field-font-size, --fui-text-field-line-height, --fui-text-field-min-height, --fui-text-field-padding-x

**Unresolved local property references:** None detected by repository-wide source search.

**Raw color declarations:** None found in the reviewed family stylesheet set.

**Component-specific forced-colors rule lines:** 0; **reduced-motion rule lines:** 0.

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json)

**Decision boundary:** Source token inventory only; compare computed Light/Dark values and states with the pinned Fluent runtime and verify responsive RTL, forced colors and native AT before acceptance.

### MaskedField (#440)

**Source note:** Shares field styling; input-state tokens do not resolve the mask/bind-event behavior defects.

**Style files:** [_field.scss](../../../src/Bluent.UI/Styles/Components/_field.scss)

**Theme tokens:** --borderRadiusMedium, --colorNeutralBackground1, --colorNeutralForeground1, --colorNeutralForegroundDisabled, --colorNeutralStroke1, --colorNeutralStroke1Hover, --colorNeutralStroke1Pressed, --colorNeutralStrokeAccessible, --colorNeutralStrokeAccessibleHover, --colorNeutralStrokeAccessiblePressed, --colorPaletteRedBorder2, --colorPaletteRedForeground1, --colorTransparentBackground, --curveAccelerateMid, --curveDecelerateMid, --durationNormal, --durationUltraFast, --fontFamilyBase

**Local custom properties:** --fui-text-field-font-size, --fui-text-field-line-height, --fui-text-field-min-height, --fui-text-field-padding-x

**Unresolved local property references:** None detected by repository-wide source search.

**Raw color declarations:** None found in the reviewed family stylesheet set.

**Component-specific forced-colors rule lines:** 0; **reduced-motion rule lines:** 0.

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json)

**Decision boundary:** Source token inventory only; compare computed Light/Dark values and states with the pinned Fluent runtime and verify responsive RTL, forced colors and native AT before acceptance.

### OtpField (#441)

**Source note:** Uses custom cell borders/backgrounds alongside theme tokens; focused, filled, error and disabled cells need full theme/state comparison.

**Style files:** [_otp-field.scss](../../../src/Bluent.UI/Styles/Components/_otp-field.scss)

**Theme tokens:** --borderRadiusMedium, --colorNeutralBackground1, --colorNeutralForeground1, --colorNeutralStroke1, --colorNeutralStroke1Hover, --colorNeutralStroke1Pressed, --colorNeutralStrokeAccessible, --colorNeutralStrokeAccessibleHover, --colorNeutralStrokeAccessiblePressed, --curveAccelerateMid, --curveDecelerateMid, --durationNormal, --durationUltraFast, --fontFamilyBase, --fontSizeBase300, --fontWeightRegular, --lineHeightBase300, --spacingHorizontalM

**Local custom properties:** --fui-text-field-line-height, --fui-text-field-min-height, --fui-text-field-padding-x

**Unresolved local property references:** None detected by repository-wide source search.

**Raw color declarations:** None found in the reviewed family stylesheet set.

**Component-specific forced-colors rule lines:** 0; **reduced-motion rule lines:** 0.

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json)

**Decision boundary:** Source token inventory only; compare computed Light/Dark values and states with the pinned Fluent runtime and verify responsive RTL, forced colors and native AT before acceptance.

### Slider (#442)

**Source note:** Uses custom --bui-slider-* properties and gradients; rail/thumb tokens and forced-colors visibility need explicit verification.

**Style files:** [_slider.scss](../../../src/Bluent.UI/Styles/Components/_slider.scss)

**Theme tokens:** --borderRadiusCircular, --colorNeutralBackground1, --colorNeutralStroke1, --colorNeutralStrokeAccessible

**Local custom properties:** --bui-slider-direction, --bui-slider-progress-color, --bui-slider-rail-color, --bui-slider-thumb-color

**Unresolved local property references:** None detected by repository-wide source search.

**Raw color declarations:** None found in the reviewed family stylesheet set.

**Component-specific forced-colors rule lines:** 0; **reduced-motion rule lines:** 0.

**Browser evidence:** [BLUENT-LAB-P0-POINTER-SCROLL-CHROME.json](evidence/BLUENT-LAB-P0-POINTER-SCROLL-CHROME.json), [BLUENT-LAB-P0-POINTER-SCROLL-SERVER-CHROME.json](evidence/BLUENT-LAB-P0-POINTER-SCROLL-SERVER-CHROME.json)

**Decision boundary:** Source token inventory only; compare computed Light/Dark values and states with the pinned Fluent runtime and verify responsive RTL, forced colors and native AT before acceptance.

### RangeSlider (#443)

**Source note:** Uses custom --bui-slider-* properties; two-thumb active/inactive rails and high-contrast states need explicit verification.

**Style files:** [_range-slider.scss](../../../src/Bluent.UI/Styles/Components/_range-slider.scss)

**Theme tokens:** --borderRadiusCircular, --colorNeutralBackground1, --colorNeutralStroke1, --colorNeutralStrokeAccessible

**Local custom properties:** --bui-slider-direction, --bui-slider-progress-color, --bui-slider-rail-color, --bui-slider-thumb-color

**Unresolved local property references:** None detected by repository-wide source search.

**Raw color declarations:** None found in the reviewed family stylesheet set.

**Component-specific forced-colors rule lines:** 0; **reduced-motion rule lines:** 0.

**Browser evidence:** [BLUENT-LAB-P0-POINTER-SCROLL-CHROME.json](evidence/BLUENT-LAB-P0-POINTER-SCROLL-CHROME.json), [BLUENT-LAB-P0-POINTER-SCROLL-SERVER-CHROME.json](evidence/BLUENT-LAB-P0-POINTER-SCROLL-SERVER-CHROME.json)

**Decision boundary:** Source token inventory only; compare computed Light/Dark values and states with the pinned Fluent runtime and verify responsive RTL, forced colors and native AT before acceptance.

### FileSelect (#444)

**Source note:** Family stylesheet has little/no direct color styling and delegates visuals to child controls; card, remove-action and focus theme parity must be checked compositionally.

**Style files:** [_file-select.scss](../../../src/Bluent.UI/Styles/Components/_file-select.scss)

**Theme tokens:** --spacingVerticalMNudge, --spacingVerticalSNudge

**Local custom properties:** None found in the reviewed family style set.

**Unresolved local property references:** None detected by repository-wide source search.

**Raw color declarations:** None found in the reviewed family stylesheet set.

**Component-specific forced-colors rule lines:** 0; **reduced-motion rule lines:** 0.

**Browser evidence:** [BLUENT-LAB-P0-FILE-UPLOAD-CHROME.json](evidence/BLUENT-LAB-P0-FILE-UPLOAD-CHROME.json), [BLUENT-LAB-P0-FILE-UPLOAD-SERVER-CHROME.json](evidence/BLUENT-LAB-P0-FILE-UPLOAD-SERVER-CHROME.json)

**Decision boundary:** Source token inventory only; compare computed Light/Dark values and states with the pinned Fluent runtime and verify responsive RTL, forced colors and native AT before acceptance.

## Acceptance boundary

All 18 tokenTheme dimensions are recorded as audited_gaps. Global light/dark token mixins exist, but this inventory is not a pixel/contrast parity result. Every family design approval remains pending and evidenceBundle remains null. No product source, CSS or public API changed.
