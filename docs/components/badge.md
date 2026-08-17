# Badge

`Badge` displays a compact text or icon marker for a count, category, status, or notification.

## When to use

Use `Badge` when:

- a short count or status needs to be visible beside other content;
- a compact visual marker helps distinguish a category or severity;
- a button or other control needs a small notification indicator.

Use normal text or a `MessageBar` when the message needs explanation or action. Do not rely on color alone to communicate meaning.

## Package and namespace

```bash
dotnet add package Bluent.UI
```

```razor
@using Bluent.UI.Components
```

Follow [Getting Started](../getting-started/index.md) to call `AddBluentUI()` and include the packaged theme and component stylesheets. A basic Badge does not need an overlay container; inherited tooltip parameters use the tooltip service and `<Containers />`.

## Minimal example

```razor
<Badge Text="3"
       Color="BadgeColor.Informative"
       Shape="BadgeShape.Rounded"
       aria-label="3 unread notifications" />
```

The shared Badge demo compiles examples for every current appearance, size, shape, and color enum value. This minimal example is source verified; Badge-specific browser behavior was not exercised for this page.

## Parameters

| Parameter | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `Appearance` | `BadgeAppearance` | `BadgeAppearance.Filled` | No | Visual treatment. Values: `Filled`, `Ghost`, `Outlined`, `Tint`. |
| `Size` | `BadgeSize` | `BadgeSize.Medium` | No | Badge dimensions. Values: `Tiny`, `ExtraSmall`, `Small`, `Medium`, `Large`, `ExtraLarge`. |
| `Shape` | `BadgeShape` | `BadgeShape.Circular` | No | Border-radius treatment. Values: `Square`, `Rounded`, `Circular`. |
| `Color` | `BadgeColor` | `BadgeColor.Brand` | No | Color treatment. Values: `Brand`, `Danger`, `Important`, `Informative`, `Sever`, `Subtle`, `Success`, `Warning`. `Sever` is the current public enum spelling. |
| `Icon` | `string?` | `null` | No | Passed to an `Icon` component rendered before `Text`. The Icon component interprets the string as SVG markup, an image path, or a CSS class according to its existing rules. |
| `Text` | `string?` | `null` | No | Text rendered inside the badge. Badge does not accept arbitrary child content. |
| `DropShadow` | `bool` | `false` | No | Adds a color-derived drop shadow. |
| `AnimateShadow` | `bool` | `false` | No | Pulses the shadow when `DropShadow` is also `true`. It has no effect by itself. |
| `Tooltip` | `string?` | `null` | No | Inherited plain-text tooltip content. |
| `TooltipContent` | `RenderFragment?` | `null` | No | Inherited rendered tooltip content; takes precedence over `Tooltip`. |
| `TooltipPlacement` | `Placement` | `Placement.Top` | No | Inherited tooltip placement. |
| `TooltipAppearance` | `PopoverAppearance` | `PopoverAppearance.Default` | No | Inherited tooltip appearance. |
| `DisplayTooltipArrow` | `bool` | `false` | No | Shows an arrow on the inherited tooltip. |
| `Class` | `string?` | `null` | No | Adds CSS classes to the badge root. |
| `Style` | `string?` | `null` | No | Adds inline styles to the badge root. |
| Unmatched attributes | `Dictionary<string, object>?` | `null` | No | Applied to the root `<div>`, including attributes such as `aria-label`, `role`, and `data-*`. |

`BadgeColor.Sever` is implemented as a dark-orange severity treatment. Documentation preserves the actual public name and does not silently rename it.

## Events and binding

Badge exposes no component-specific event or bindable value. It is display-only.

## Child content and composition

Badge renders, in order:

1. an `Icon` component when `Icon` is non-empty;
2. a text container containing `Text`.

There is no `ChildContent` parameter. Use `Text` and `Icon`; nested markup inside `<Badge>...</Badge>` is not a supported composition API. The current demo contains a nested Badge example in its button-integration section, but that markup is not backed by the component's public source and should not be copied.

An empty Badge is supported by the render logic and produces the size/shape marker without text. `Tiny` and `ExtraSmall` are fixed dot-like sizes in the current stylesheet.

## Services and containers

Call `AddBluentUI()` because Badge inherits tooltip service injection from `BluentUiComponentBase`. A basic Badge does not add content to `<Containers />`.

When `Tooltip` or `TooltipContent` is used, place one `<Containers />` in the active interactive layout so the inherited tooltip service has its tooltip container.

## Styling and theming

Include the standard theme and component bundles from [the theming and assets guide](../guides/theming-localization-rtl-and-assets.md).

- `Appearance` selects filled, transparent ghost, outlined, or tinted styling.
- `Color` selects a source-defined theme-token combination.
- `Shape` selects square, rounded, or circular corners.
- `Size` selects one of six dimensions; `Medium` uses the base 20-pixel style.
- `DropShadow` and `AnimateShadow` add static or pulsing color-derived shadow styling.

The styles use Bluent theme tokens and therefore follow the active token set. Color and appearance combinations share the current CSS cascade; not every combination has a separately defined color override. Use `Class` and `Style` for application-specific adjustments, and do not treat internal generated classes as a stable public contract.

## Localization and RTL

Badge has no built-in localized strings or culture-sensitive formatting. The application supplies `Text` and any accessible name.

The root uses inline flex layout and inherits document direction. There is no Badge-specific RTL selector, and the combinations of icon, text, shape, and surrounding controls have not been visually verified in RTL.

## Accessibility and keyboard interaction

The source renders a non-focusable `<div>` with no default semantic role or live-region behavior. Visible `Text` is exposed as text content, but color, shape, an empty marker, or a CSS icon alone does not provide an accessible name or meaning.

For meaningful status or notification badges, provide adjacent explanatory text or appropriate unmatched attributes such as `aria-label` and a role selected for the application's semantics. Do not assume count changes are announced automatically.

Badge has no keyboard interaction. The pulsing shadow animation does not include a component-specific reduced-motion rule, so avoid `AnimateShadow` when motion would be inappropriate. Complete assistive-technology, color-contrast, reduced-motion, and RTL accessibility verification has not been recorded.

## Hosting and render modes

See [Hosting models and render modes](../compatibility/hosting-and-render-modes.md) for the repository-wide evidence and setup.

| Render mode | Status | Notes |
| --- | --- | --- |
| Standalone WebAssembly | Unverified | The demo compiles, but Badge-specific runtime evidence was not recorded. |
| Interactive Server | Unverified | The representative mode baseline passed, but Badge-specific behavior was not separately recorded. |
| Interactive WebAssembly | Unverified | The representative mode baseline passed, but Badge-specific behavior was not separately recorded. |
| Interactive Auto | Unverified | The representative mode baseline passed, but Badge-specific behavior was not separately recorded. |
| Static SSR | Limited | Basic display markup does not require interaction; Badge-specific static output was not separately runtime verified. Tooltips require an interactive mode. |

## JavaScript and static assets

A basic Badge imports no component-specific JavaScript and requires no manual script tag. It requires:

- `_content/Bluent.UI/bluent.ui.theme.default.min.css` or another packaged Bluent theme;
- `_content/Bluent.UI/bluent.ui.components.min.css`.

Inherited tooltips use the base package's tooltip service and dynamically imported module. The base component removes a registered tooltip during async disposal.

## Common mistakes

### Nested content does not render as Badge content

Badge has no `ChildContent` parameter. Set `Text` and `Icon` instead.

### The shadow does not animate

Set both `DropShadow="true"` and `AnimateShadow="true"`. `AnimateShadow` only adds the animation class inside the `DropShadow` branch.

### A status is conveyed only by color

Add meaningful `Text`, nearby explanatory content, or an accessible name appropriate to the surrounding UI.

## Known limitations

- No child-content slot is exposed.
- There is no default status role, live-region behavior, or accessible name for icon-only and empty badges.
- The public color value is spelled `BadgeColor.Sever`; changing that name would be a public API change.
- Animated shadows have no Badge-specific reduced-motion fallback.
- Component-specific runtime, visual, color-contrast, assistive-technology, and RTL verification is not recorded.

## Related components

- `MessageBar`, `Icon`, and `Button` are listed in the [component inventory](inventory.md).
- [Getting Started](../getting-started/index.md)
- [Theming, localization, RTL, and browser assets](../guides/theming-localization-rtl-and-assets.md)

## Source and verification

- Component source: `src/Bluent.UI/Components/BadgeComponent/Badge.razor`
- Component logic: `src/Bluent.UI/Components/BadgeComponent/Badge.razor.cs`
- Public enums: `src/Bluent.UI/Components/BadgeComponent/`
- Icon behavior: `src/Bluent.UI/Components/IconComponent/Icon.cs`
- Styles: `src/Bluent.UI/Styles/Components/_badge.scss`
- Compiled demo: `src/Bluent.UI.Demo.Pages/Pages/Components/Badges.razor`
- Source verified against `Dev` commit `07e61ed8552176c1719ec94c81ea3fda867bae9e`
- Verification date: 2026-07-26

The API, enum values, render order, styling rules, and example are source verified. The example participates in the solution build; no new browser, visual, keyboard, or assistive-technology verification was performed for this page.
