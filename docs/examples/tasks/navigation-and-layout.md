# Navigation and layout

Keep application navigation in a shared layout and host Bluent overlay
containers once for the rendered layout tree.

## Requirements

- Package: `Bluent.UI`
- Namespaces: `Bluent.UI.Components`,
  `Microsoft.AspNetCore.Components`, and
  `Microsoft.AspNetCore.Components.Routing`
- Services and assets: the [shared setup](README.md#shared-consumer-setup)

## Complete source

- [`MainLayout.razor`](../../../samples/Bluent.TaskExamples/Layout/MainLayout.razor)
  owns navigation, page content, and `<Containers />`.
- [`NavigationAndLayout.razor`](../../../samples/Bluent.TaskExamples/Pages/Tasks/NavigationAndLayout.razor)
  uses `NavLink` and `NavigationManager`.
- [`App.razor`](../../../samples/Bluent.TaskExamples/App.razor) assigns the
  layout through `RouteView`.

Together these files are the complete compiled navigation pattern.

## Expected behavior

Route links update the main content without duplicating layout markup.
`NavLink` applies active-state semantics, and programmatic navigation returns
to the overview.

## Common mistakes

- Do not add a separate `<Containers />` to every page.
- Avoid hard-coding deployment base paths into internal navigation.
- Use `NavLink` when active-route semantics matter and
  `NavigationManager.NavigateTo` for programmatic navigation.
- Responsive navigation behavior is application layout work, not an implicit
  feature of the router.

## Render modes and evidence

The router, layout, links, and navigation callback are build-verified in the
standalone WebAssembly app. Static SSR can render links and layout markup;
client-side callbacks require interactivity.
