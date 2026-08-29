# Containers

`Containers` is Bluent's shared consumer-facing host for service-backed overlay surfaces. Place one `<Containers />` in the active interactive layout/scope when the application uses Bluent services that render drawers, dialogs, popovers, tooltips, or toasts.

This is infrastructure documentation, not a separate component-family API catalog entry.

## Package and namespace

- Package: `Bluent.UI`
- Namespace: `Bluent.UI.Components`
- Services: register Bluent with `builder.Services.AddBluentUI()`

For full installation and asset setup, use the canonical [Getting Started](../getting-started/index.md) guide rather than duplicating setup here.

## Usage

```razor
@Body
<Containers />
```

Use one shared host in the active layout rather than adding a new host beside each service call.

## Exact hosted containers

Current `Containers.razor` renders these five specialized hosts:

- `DrawerComponent.DrawerContainer`
- `DialogComponent.DialogContainer`
- `PopoverComponent.PopoverContainer`
- `TooltipComponent.TooltipContainer`
- `ToastComponent.ToastContainer`

`Containers` currently derives directly from `ComponentBase` and declares no public parameters, events, child content, IDs, classes, styles, or unmatched-attribute contract of its own.

## What it is for

The shared host is required by service-backed overlay flows documented for components such as `Drawer`, `Dialog`, `Popover`, and `Toast`. It centralizes the specialized renderer/container components so application code does not have to instantiate those internal composition pieces separately.

## What it is not

- It is not the lightweight [`Overlay`](overlay.md) visual component.
- It does not itself open, close, configure, or return results from overlays.
- It is not a generic portal API with consumer parameters.
- It should not be duplicated into every page merely because a page contains a Button or another ordinary component.

## Render modes

`Containers` can emit its component tree wherever it is placed, but the hosted service-backed interactions require an active interactive scope and the corresponding registered services. Do not claim service-backed overlay interaction from static SSR alone.

## Common mistakes

- Forgetting `<Containers />` while injecting `IDialogService`, `IDrawerService`, `IPopoverService`, or `IToastService`.
- Placing multiple hosts in nested layouts without a deliberate reason, which can create ambiguous overlay ownership/lifecycle.
- Instantiating `DrawerContainer`, `DialogContainer`, `PopoverContainer`, `TooltipContainer`, or `ToastContainer` manually when the shared `Containers` host is the intended consumer surface.

## Evidence

Source verified against `src/Bluent.UI/Components/ContainersComponent/Containers.razor` and the current specialized container composition on 2026-08-29.