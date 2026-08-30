# Tooltip capability

Bluent tooltips are primarily a cross-component capability inherited by components based on `BluentUiComponentBase`; there is not a normal consumer-facing `<Tooltip>` wrapper component in the current source. Use the inherited tooltip parameters on the component that should act as the trigger.

## Package and namespace

```razor
@using Bluent.UI.Components
```

Package: `Bluent.UI`

Normal Bluent service registration and one shared `<Containers />` host are required for service-backed tooltip surfaces.

## Basic usage

```razor
<Button Text="Save"
        Tooltip="Save changes"
        TooltipPlacement="Placement.Bottom" />
```

Rich tooltip content can be supplied through `TooltipContent` on components that inherit the common base.

## Common tooltip parameters

`BluentUiComponentBase` defines:

| Parameter | Type | Default | Notes |
| --- | --- | --- | --- |
| `Tooltip` | `string?` | `null` | Simple text tooltip. |
| `TooltipContent` | `RenderFragment?` | `null` | Rich tooltip content; takes precedence over `Tooltip`. |
| `TooltipPlacement` | `Placement` | `Top` | Requested popover placement. |
| `TooltipAppearance` | `PopoverAppearance` | `Default` | Tooltip surface appearance. |
| `DisplayTooltipArrow` | `bool` | `false` | Whether the tooltip surface renders an arrow. |

These parameters are inherited by `BluentUiComponentBase` descendants, not by every arbitrary Blazor component.

## Trigger behavior

On first render, a component with tooltip content registers itself with `ITooltipService` using its Bluent component `Id` as the trigger id.

Current source configures:

- show events: `mouseenter`, `focus`;
- hide events: `mouseleave`, `blur`;
- a popover offset/gap through `PopoverSettings`;
- optional arrow and appearance values from the inherited parameters.

On async disposal, a component that has tooltip content calls `ITooltipService.Destroy(Id)`.

## Surface infrastructure

The shared `<Containers />` component includes `TooltipContainer`. That container derives from the same popover-container infrastructure used by anchored surfaces and renders a `TooltipSurface` for visible tooltip contexts.

`TooltipSurface` derives from `PopoverSurface`, renders the configured content and optional arrow, and calls `ITooltipService.Show(triggerId)` on first render.

Therefore tooltips are service-/popover-backed infrastructure, not native browser `title` attributes.

## Important source limitations

- Tooltip registration occurs only on first render in the common base. Current source does not re-register the tooltip when tooltip text/content/placement parameters change after that first render. Do not promise live tooltip-configuration updates without runtime/source evidence.
- A component whose tooltip is added only after first render will not be registered by this code path unless another implementation path exists.
- Source-defined show/hide events cover mouse enter/leave and focus/blur. Do not invent long-press, touch-specific, click-to-pin, delay, or escape-key behavior.
- The source composition does not by itself establish complete accessible-description wiring such as `aria-describedby` on every trigger. Verify assistive-technology behavior before making stronger accessibility guarantees.
- Tooltip service surfaces require interactive/browser behavior for full positioning and visibility; static SSR alone only renders the trigger component's initial markup.

## Choosing between Tooltip and Popover

Use inherited tooltip parameters for short contextual help attached to an existing Bluent component. Use the canonical [Popover](popover.md) API when the application needs an explicit anchored surface with consumer-authored trigger/surface composition, visibility lifecycle, placement behavior, or richer interaction.

## Evidence boundary

Source verified from `BluentUiComponentBase.cs`, `TooltipContainer.razor`, and `TooltipSurface.razor`, plus shared popover infrastructure. Do not emit a consumer `<Tooltip>` tag unless a future/released API explicitly introduces one.
