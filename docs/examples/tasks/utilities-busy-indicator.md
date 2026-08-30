# Utilities busy indicator

Use `AppBusyIndicator` with `IBusyIndicator` when application-wide work should surface the Utilities package's shared busy state through Bluent's progress UI.

## Requirements

- Packages: `Bluent.UI` and `Bluent.UI.Utilities`
- Namespaces: `Bluent.UI.Components`, `Bluent.UI.Utilities`, `Bluent.UI.Utilities.Abstractions`
- DI registration: `builder.Services.AddBluentUI();` and `builder.Services.AddBluentUtilities();`

## Complete source

[`UtilitiesBusyIndicator.razor`](../../../samples/Bluent.TaskExamples/Pages/Tasks/UtilitiesBusyIndicator.razor) is the canonical compiled consumer source. The sample project directly references `Bluent.UI.Utilities`, imports its public consumer namespaces, and registers Utilities services in [`Program.cs`](../../../samples/Bluent.TaskExamples/Program.cs).

## Expected behavior

`IBusyIndicator.SetBusy()` raises shared busy state and `AppBusyIndicator` renders its indeterminate `ProgressBar`. `SetIdeal()` clears the shared busy state.

## Common mistakes

- Installing or referencing `Bluent.UI` alone does not make Utilities available.
- Do not forget `AddBluentUtilities()` for service-backed Utilities APIs.
- `AppBusyIndicator` is a visual indicator; do not infer a live-region/status announcement that the underlying `ProgressBar` does not establish.
- Use the `IBusyIndicator` abstraction rather than depending directly on the concrete `BusyIndicator` implementation.

## Validation boundary

The consumer task is included in `Bluent.TaskExamples`, so Quality CI verifies package/project references, DI registration, imports, and component/service API names. Visual timing and assistive-technology behavior remain runtime evidence work.
