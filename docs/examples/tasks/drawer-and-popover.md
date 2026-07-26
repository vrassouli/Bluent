# Drawer and Popover interaction

Use a drawer for a larger secondary workflow and a popover for compact content
anchored to a trigger.

## Requirements

- Package: `Bluent.UI`
- Namespaces: `Bluent.UI.Components`,
  `Bluent.UI.Components.DrawerComponent`, and
  `Bluent.UI.Services.Abstractions`
- Services: `builder.Services.AddBluentUI()`
- Layout: one `<Containers />` in the active interactive scope
- Assets: both base stylesheets from the [shared setup](README.md#shared-consumer-setup)

## Complete source

- [`DrawerAndPopover.razor`](../../../samples/Bluent.TaskExamples/Pages/Tasks/DrawerAndPopover.razor)
  opens the service-backed drawer and declares an anchored popover.
- [`DrawerTaskContent.razor`](../../../samples/Bluent.TaskExamples/Shared/DrawerTaskContent.razor)
  consumes the cascading `Drawer` and closes it with a result.

## Expected behavior

The primary action opens an end-positioned drawer. Apply returns the selected
filter state; cancel or dismissal returns no result. The popover appears below
its trigger and matches the trigger width.

## Common mistakes

- Drawer content closes the cascading `Drawer`; it does not create another
  drawer service request.
- Use logical start/end placement for direction-aware layouts.
- Missing registration, containers, or interactivity prevents overlays from
  working.
- Do not assume static SSR supports placement, dismissal, or focus behavior.

## Render modes and evidence

Both Razor files and the generic service overload are build-verified.
Representative drawer disposal and Popover measurement have runtime evidence
in the interactive modes listed by the
[hosting guide](../../compatibility/hosting-and-render-modes.md).
