# Overflow composition

`Overflow` is an **abstract** Bluent component base used by overflow-aware public controls such as `TabList` and other command surfaces. It renders normal child items in the primary surface and provides a Popover/MenuList path where overflow-capable child items can render an alternate menu representation.

Do not generate `<Overflow>` directly in consumer Razor: the current public type is abstract.

## Package and namespace

- Package: `Bluent.UI`
- Namespace: `Bluent.UI.Components`
- Popover-backed overflow behavior uses normal Bluent service registration and the shared `<Containers />` host.

## Public base parameters

| Parameter | Type | Default | Notes |
| --- | --- | --- | --- |
| `ChildContent` | `RenderFragment?` | `null` | Overflow-aware descendants. |
| `Orientation` | `Orientation` | `Horizontal` | Controls primary orientation and overflow popover placement. |

The base injects `IJSRuntime` and initializes `OverflowInterop` only when `RendererInfo.IsInteractive` is true.

## Render model

The base markup renders children twice under different cascading `OverflowRenderContext` values:

1. normal surface with `RenderOverflowMenuItem = false`;
2. overflow Popover surface with `RenderOverflowMenuItem = true` inside a `MenuList`.

`OverflowItemComponentBase` is the corresponding abstract child base. Its render tree chooses `RenderOverflowItem(...)` or `RenderOverflowMenuItem(...)` from that cascading context. Consumer agents should therefore use a concrete Bluent overflow-aware control/item pair rather than manually reproducing this dual-render protocol.

## Overflow trigger

The built-in trigger is a transparent icon-only Button using `FluentIcons.MoreHorizontal`. The popover uses `KeepSurface` and current placement is:

- horizontal: `Placement.BottomEnd`;
- vertical: `Placement.RightStart`.

After the first interactive render, the base initializes JS overflow measurement. Later renders refresh the overflow popover surface. Concrete derived components call the protected `CheckOverflow()` when appropriate.

## JavaScript and disposal

`OverflowInterop` is component-specific interactive infrastructure. The base disposes it asynchronously and explicitly swallows `JSDisconnectedException` during teardown.

Static SSR can render initial structure, but measurement/reclassification into overflow depends on interactivity and JS. Do not claim functional responsive overflow in static SSR.

## Accessibility and RTL caveats

The base itself does not establish a complete toolbar/tablist/menu accessibility model; semantics belong to the concrete derived control and its items. The overflow trigger is icon-only in this base markup, so its accessible naming must be verified through Button/tooltip composition rather than assumed.

Vertical overflow currently requests `RightStart`; RTL behavior must be runtime-verified before claiming logical mirroring.

## Evidence

Source verified against `Overflow.razor`, `Overflow.razor.cs`, `OverflowRenderContext`, and `OverflowItemComponentBase` on 2026-08-29. This page documents reusable infrastructure and intentionally does not invent a directly-instantiable `<Overflow>` consumer component.