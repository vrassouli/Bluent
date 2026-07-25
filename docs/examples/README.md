# Runnable examples

The repository's demo projects are the canonical runnable example host:

- `Bluent.UI.Demo` — Blazor WebAssembly host
- `Bluent.UI.Demo.SSR` — Blazor Web App/static SSR host
- `Bluent.UI.Demo.Pages` — shared example pages compiled into both hosts

## Onboarding example

The source-verified onboarding example is:

- Route: `/getting-started`
- Source: `src/Bluent.UI.Demo.Pages/Pages/Components/GettingStarted.razor`

It demonstrates:

- `Label`
- `TextField`
- `NumericField`
- `SelectField`
- `Checkbox`
- primary and standard `Button` usage
- `MessageBar`
- `IDialogService.ShowMessageBoxAsync`

The example is compiled by the Sprint 1 validation workflow as part of the full solution build. Runtime interaction still depends on the host's render mode; Blazor WebAssembly is the verified onboarding host.

## Existing component examples

The shared demo includes focused pages for component families such as Buttons, Fields, Checkboxes, Dialogs, Drawers, Toasts, Toolbars, DataGrid, Charts, Diagrams, and DrawingCanvas.

A demo page counts as:

- **Present** when its source is linked from the component inventory.
- **Compiled** when its host participates in CI.
- **Runtime verified** only when interaction results are recorded for the stated hosting/render mode.

## Validation

The Sprint 1 workflow restores and builds the entire solution in Release configuration, runs tests, packs all five libraries, checks local documentation links, and uploads package artifacts.
