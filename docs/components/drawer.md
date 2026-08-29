# Drawer

`Drawer` is Bluent's sliding side/top/bottom surface. It can be declared inline or created through the drawer service for application workflows that return a result.

## When to use
Use a drawer for a larger secondary workflow that should remain visually attached to the current page. Use `Dialog` for modal confirmation/decision flows and `Popover` for compact anchored content.

## Package and namespace
- Package: `Bluent.UI`
- Component namespace: `Bluent.UI.Components`
- Service-backed examples also use `Bluent.UI.Services.Abstractions` and `Bluent.UI.Components.DrawerComponent` configuration types.

Normal `AddBluentUI()` registration and one `<Containers />` in the active interactive layout are required for service-backed drawers.

## Minimal verified patterns
Inline:
```razor
<Drawer @ref="_drawer" Position="DrawerPosition.End">
    <div>Drawer content</div>
</Drawer>
```

Service-backed usage is compiled in `docs/examples/tasks/drawer-and-popover.md` / `samples/Bluent.TaskExamples` and uses `IDrawerService.ShowAsync<TComponent>()` with configuration.

## Public component API
- `ChildContent`: `RenderFragment?`.
- `Position`: `DrawerPosition`, default `End`.
- `Size`: `DrawerSize`, default `Small`.
- `OnClose`: `EventCallback<dynamic?>` receiving the result passed to `Close`.
- `Breakpoint`: `Breakpoints?`; when set the drawer starts hidden and receives a breakpoint-specific class.
- `Open()` clears hidden/hiding state.
- `Close(dynamic? result = null)` starts the hiding animation and stores the result.

`Drawer` cascades itself to nested content. Consumer drawer content can therefore receive the current Drawer and close it with a result rather than opening another service request.

## Close lifecycle
`Close()` does not invoke `OnClose` immediately. It sets the hiding state; `OnClose` fires from the animation-end handler, then the component becomes hidden. Consumers should not assume synchronous close/result delivery.

## Service/container composition
The canonical task example demonstrates the application-level pattern through `IDrawerService` and `<Containers />`. Prefer the service for globally managed workflows; inline Drawer remains available when lifecycle/placement is owned directly by the page/component.

A public Bluent component named `DrawerContent` already exists. Do not create an application component with the same unqualified name while importing `Bluent.UI.Components`; the repository's negative compile control intentionally proves that this can cause `CS0104`. Use a task-specific name or fully qualify the application type.

## Styling, RTL and placement
`Position` contributes a logical position class; the canonical task recommends logical `Start`/`End` placement for direction-aware layouts. `Size` and optional `Breakpoint` contribute component-defined classes. Do not treat internal CSS class names as a stable customization API.

## Accessibility and keyboard
The verified root markup is a `<div>` and source shown here does not itself establish dialog semantics, focus trapping, escape-key handling, or ARIA modal state. Service/container behavior and focus/dismissal require runtime evidence; do not infer Dialog-like accessibility guarantees from the Drawer component alone.

## Hosting/render modes
Drawer interaction, service orchestration, animation-close results, placement measurement, and dismissal require an interactive render mode. The canonical drawer/popover task records representative runtime evidence for drawer disposal and popover measurement in supported interactive modes. Static SSR can only provide initial markup.

## Common mistakes / limitations
- Do not expect `Close()` to complete synchronously; result delivery is animation-end driven.
- Do not open another drawer from drawer content merely to return a result; close the cascaded Drawer.
- Avoid the application component name `DrawerContent` unless fully qualified where ambiguity can arise.
- Missing `AddBluentUI()`, `<Containers />`, or interactivity breaks service-backed workflows.
- Full Drawer-specific focus/keyboard/accessibility behavior is not established by the component source alone.

## Related components
- `Dialog`: `dialog.md`
- `Popover`: pending canonical reference
- canonical task: [Drawer and Popover](../examples/tasks/drawer-and-popover.md)

## Source and verification
- `src/Bluent.UI/Components/DrawerComponent/Drawer.razor`
- `src/Bluent.UI/Components/DrawerComponent/Drawer.razor.cs`
- `src/Bluent.UI/Components/DrawerComponent/DrawerConfiguration.cs`
- `src/Bluent.UI/Components/DrawerComponent/DrawerConfigurator.cs`
- `src/Bluent.UI/Components/DrawerComponent/DrawerContainer.*`
- compiled task example: `samples/Bluent.TaskExamples/Pages/Tasks/DrawerAndPopover.razor`
- source/task verified against the #406 PR branch on 2026-08-29.
