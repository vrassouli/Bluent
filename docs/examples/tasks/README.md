# Canonical task-oriented examples

These examples are complete Blazor WebAssembly tasks backed by the standalone
[`Bluent.TaskExamples`](../../../samples/Bluent.TaskExamples/) consumer. The
documentation links to the compiled source instead of copying it into Markdown,
so a code change cannot leave a second snippet silently out of date.

## Task index

| Task | Packages | Canonical source |
| --- | --- | --- |
| [Basic form input](basic-input.md) | `Bluent.UI` | [`BasicInput.razor`](../../../samples/Bluent.TaskExamples/Pages/Tasks/BasicInput.razor) |
| [Form validation](form-validation.md) | `Bluent.UI` | [`FormValidation.razor`](../../../samples/Bluent.TaskExamples/Pages/Tasks/FormValidation.razor) |
| [Confirmation dialog](confirmation-dialog.md) | `Bluent.UI` | [`ConfirmationDialog.razor`](../../../samples/Bluent.TaskExamples/Pages/Tasks/ConfirmationDialog.razor) |
| [Toast and MessageBar feedback](feedback.md) | `Bluent.UI` | [`Feedback.razor`](../../../samples/Bluent.TaskExamples/Pages/Tasks/Feedback.razor) |
| [DataGrid with paging](data-grid-paging.md) | `Bluent.UI` | [`DataGridPaging.razor`](../../../samples/Bluent.TaskExamples/Pages/Tasks/DataGridPaging.razor) |
| [Navigation and layout](navigation-and-layout.md) | `Bluent.UI` | [`NavigationAndLayout.razor`](../../../samples/Bluent.TaskExamples/Pages/Tasks/NavigationAndLayout.razor) |
| [Drawer and Popover](drawer-and-popover.md) | `Bluent.UI` | [`DrawerAndPopover.razor`](../../../samples/Bluent.TaskExamples/Pages/Tasks/DrawerAndPopover.razor) and [`OrderFilterDrawer.razor`](../../../samples/Bluent.TaskExamples/Shared/OrderFilterDrawer.razor) |
| [Chart dashboard](chart-dashboard.md) | `Bluent.UI`, `Bluent.UI.Charts` | [`ChartDashboard.razor`](../../../samples/Bluent.TaskExamples/Pages/Tasks/ChartDashboard.razor) |
| [Simple diagram](simple-diagram.md) | `Bluent.UI.Diagrams` | [`SimpleDiagram.razor`](../../../samples/Bluent.TaskExamples/Pages/Tasks/SimpleDiagram.razor) |
| [Theme, dark mode, and RTL](theme-dark-mode-and-rtl.md) | `Bluent.UI` | [`ThemeAndRtl.razor`](../../../samples/Bluent.TaskExamples/Pages/Tasks/ThemeAndRtl.razor) |

## Shared consumer setup

The consumer project uses project references so every change is compiled
against the current repository source. A normal application installs the
matching released packages instead:

```bash
dotnet add package Bluent.UI
dotnet add package Bluent.UI.Charts
dotnet add package Bluent.UI.Diagrams
```

The main UI package does not transitively install Charts or Diagrams. Charts
and Diagrams do not transitively install the main UI package. Prefer aligned
versions for every directly installed Bluent package.

The consumer's [`_Imports.razor`](../../../samples/Bluent.TaskExamples/_Imports.razor)
contains the public component namespaces:

- `Bluent.UI.Components`
- `Bluent.UI.Charts.Components`
- `Bluent.UI.Diagrams.Components`

Its [`Program.cs`](../../../samples/Bluent.TaskExamples/Program.cs) calls
`builder.Services.AddBluentUI()`. The
[`MainLayout.razor`](../../../samples/Bluent.TaskExamples/Layout/MainLayout.razor)
contains one `<Containers />` for service-backed overlays. The
[`index.html`](../../../samples/Bluent.TaskExamples/wwwroot/index.html) loads:

```html
<link href="_content/Bluent.UI/bluent.ui.theme.default.min.css" rel="stylesheet" />
<link href="_content/Bluent.UI/bluent.ui.components.min.css" rel="stylesheet" />
<link href="_content/Bluent.UI.Diagrams/bluent.ui.diagrams.min.css" rel="stylesheet" />
```

The base package loads its ES module through JavaScript interop. Do not add a
global base-package script tag. The chart package also manages its packaged
JavaScript through its component lifecycle.

## Run the examples

From the repository root:

```bash
dotnet run --project samples/Bluent.TaskExamples/Bluent.TaskExamples.csproj
```

This is a standalone consumer and does not inherit registration, imports,
containers, or assets from either demo host.

## Compilation and drift protection

Quality CI runs
[`check_task_examples.sh`](../../../scripts/quality/check_task_examples.sh).
The script builds the entire consumer with warnings treated as errors. It then
enables an opt-in source that declares an application-owned `DrawerContent`
beside `Bluent.UI.Components.DrawerContent`. The build must fail with `CS0104`
and name the collision source. This negative control keeps the documented
naming risk visible while the normal `OrderFilterDrawer` example proves the
recommended pattern compiles.

When adding an example:

1. Put its complete runnable source under `samples/Bluent.TaskExamples`.
2. Link that source from its task page; do not copy a divergent code block.
3. Add its route to the sample navigation.
4. Build the sample project and run the task-example validation script.
5. Run the repository Markdown link check, Release build, and tests.

## Evidence and limitations

The sources were checked against current `Dev` APIs and build as one standalone
Blazor WebAssembly application. Compilation verifies Razor, C#, project
references, imports, component names, parameters, events, registration code,
and static-asset paths present in the source. It does not by itself prove every
interactive browser behavior or every render mode. Use the
[hosting and render-mode evidence](../../compatibility/hosting-and-render-modes.md)
for runtime-qualified claims.
