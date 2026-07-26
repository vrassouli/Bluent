# Runnable examples

## Production-pattern reference application

[OrderDesk](reference-application.md) is the canonical small business
application. It composes customer list/detail/create/edit workflows, a
virtualized order grid, validation, confirmation, notifications, a filter
drawer, charting, a lifecycle diagram, theme switching, and RTL using current
public Bluent APIs. Its local in-memory domain layer is separate from the
component composition and requires no external infrastructure.

## Canonical task examples

The [task-oriented example index](tasks/README.md) contains ten complete
business-application patterns for inputs, validation, confirmation, feedback,
data presentation, navigation, overlays, charts, diagrams, theming, and RTL.

Their source lives in the standalone `Bluent.TaskExamples` WebAssembly
consumer. Quality CI compiles that project and exercises a negative control so
invalid API references produce a focused failure. The task documentation links
to the compiled source rather than maintaining duplicate snippets.

## Demo examples

The repository's demo projects remain the broader component-gallery and
scenario hosts:

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

The durable Quality workflow restores and builds the entire solution in
Release configuration, compiles the canonical task consumer, demonstrates
invalid-sample rejection, runs tests, packs all five libraries, checks local
documentation links, and uploads package artifacts.
