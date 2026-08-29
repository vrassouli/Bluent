# Overlay

`Overlay` is a lightweight visual layer/backdrop component. It renders one Bluent-styled `<div>`, optional child content, and an optional click callback.

Use it when application composition needs a styled overlay surface or click-catching backdrop. Do **not** use it as a replacement for Bluent's service-backed `Dialog`, `Drawer`, `Popover`, or `Toast` infrastructure.

## Package and namespace

- Package: `Bluent.UI`
- Namespace: `Bluent.UI.Components`

## Minimal example

```razor
<Overlay OnClick="ClosePanel">
    <div class="custom-panel">...</div>
</Overlay>
```

## Parameters

| Parameter | Type | Default | Notes |
| --- | --- | --- | --- |
| `ChildContent` | `RenderFragment?` | `null` | Optional content rendered inside the overlay root. |
| `OnClick` | `EventCallback` | empty | Bound directly to the root `<div>` click event. |
| `Class` / `Style` | inherited | `null` | Application class/style on the root. |
| Unmatched attributes | inherited | `null` | Forwarded to the root `<div>`. |

The component contributes the `bui-overlay` CSS class.

## What Overlay does not provide

Current source does not add any of the following:

- service-backed lifecycle or shared-container registration;
- modal semantics;
- focus trapping or focus restoration;
- Escape-key handling;
- background inertness;
- automatic dismissal policy beyond the supplied `OnClick` callback;
- ARIA dialog/alert semantics;
- JavaScript interop.

These are not omissions to fill in with guessed application code. Prefer the dedicated Bluent component/service when the task is a dialog, drawer, popover, tooltip, or toast.

## Click behavior

`OnClick` is attached to the root `<div>`. Because child content is inside that same element, ordinary DOM event bubbling means clicks originating in descendants can reach the root unless child composition stops propagation. Do not assume `OnClick` means "backdrop-only click" without explicit event handling in the child composition.

## Accessibility

The root is a plain `<div>` in current markup. `Overlay` does not establish a landmark, dialog role, focus management, keyboard interaction, or accessible name. Accessibility semantics must come from the actual composed control, or from choosing a more appropriate Bluent component.

## Hosting and render modes

The initial markup can render without interactivity. `OnClick` requires an interactive render mode. There is no component-specific JavaScript or service registration requirement.

## Common mistakes

- Do not treat `Overlay` as Bluent's overlay hosting system; `<Containers />` owns service-backed overlay hosts.
- Do not claim modal/focus behavior based on the component name.
- Do not assume clicks are limited to the visual backdrop when `ChildContent` is present.

## Evidence

Source verified against `src/Bluent.UI/Components/OverlayComponent/Overlay.razor` and `Overlay.razor.cs` on 2026-08-29.