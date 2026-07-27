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
- [`OrderFilterDrawer.razor`](../../../samples/Bluent.TaskExamples/Shared/OrderFilterDrawer.razor)
  consumes the cascading `Drawer` and closes it with a result.

## Expected behavior

The primary action opens an end-positioned drawer. Apply returns the selected
filter state; cancel or dismissal returns no result. The popover appears below
its trigger and matches the trigger width.

## Common mistakes

- Do not name an application-owned component `DrawerContent` when the
  application also imports `Bluent.UI.Components`. Bluent already exposes
  `Bluent.UI.Components.DrawerContent`, so an unqualified type reference can
  fail with `CS0104`.
- Prefer a distinctive, task-specific application name such as
  `OrderFilterDrawer`. The compiled example passes that type to
  `IDrawerService.ShowAsync<OrderFilterDrawer>()`.
- If an existing application component is already named `DrawerContent`, use
  its fully qualified type in the service call:

  ```csharp
  await DrawerService.ShowAsync<MyApp.Components.DrawerContent>(
      "Order filters",
      parameters,
      configuration => configuration.SetPosition(DrawerPosition.End));
  ```

  A Razor alias alone might not remove every generated-code ambiguity, so full
  qualification is the reliable fallback.
- Drawer content closes the cascading `Drawer`; it does not create another
  drawer service request.
- Use logical start/end placement for direction-aware layouts.
- Missing registration, containers, or interactivity prevents overlays from
  working.
- Do not assume static SSR supports placement, dismissal, or focus behavior.

## Render modes and evidence

Both Razor files, the distinctive application component name, and the generic
service overload are build-verified. The focused negative control deliberately
introduces an application-owned `DrawerContent` beside
`Bluent.UI.Components.DrawerContent` and requires the compiler to report
`CS0104`.
Representative drawer disposal and Popover measurement have runtime evidence
in the interactive modes listed by the
[hosting guide](../../compatibility/hosting-and-render-modes.md).
