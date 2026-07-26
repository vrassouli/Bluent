# OrderDesk reference application

OrderDesk is the canonical production-pattern Bluent reference application. It
uses a coherent customer and order operations workflow to show how current
public Bluent APIs compose outside a component catalog.

- Source: [`samples/Bluent.OrderDesk`](../../samples/Bluent.OrderDesk/)
- Runbook and architecture:
  [`samples/Bluent.OrderDesk/README.md`](../../samples/Bluent.OrderDesk/README.md)
- Tracking: [Issue #393](https://github.com/vrassouli/Bluent/issues/393)

## Scenario and scope

The application supports:

- a responsive application shell with dashboard, customer, and order routes;
- customer list, detail, create, edit, and archive operations;
- a virtualized order `DataGrid` backed by an `ItemsProvider`;
- data-annotation form validation and visible invalid-submit feedback;
- an awaited confirmation dialog before customer archival;
- persistent `MessageBar` and transient toast feedback;
- an order-filter drawer;
- fulfilled-revenue charting and a meaningful order-lifecycle diagram;
- light/dark theme and LTR/RTL controls;
- loading, empty, validation-error, archived, and save-success states.

Authentication, a production database, remote APIs, and external services are
intentionally excluded. Application state is held by a singleton in-memory
repository and resets on reload.

## Packages, namespaces, and setup

OrderDesk uses project references while it is maintained in this repository.
A package consumer uses the aligned `Bluent.UI`, `Bluent.UI.Charts`, and
`Bluent.UI.Diagrams` packages.

The host imports:

```razor
@using Bluent.UI.Components
@using Bluent.UI.Charts.Components
@using Bluent.UI.Diagrams.Components
@using Bluent.UI.Services.Abstractions
```

It registers the base services:

```csharp
builder.Services.AddBluentUI();
```

The shared layout contains one `<Containers />` host. The host document loads:

```html
<link href="_content/Bluent.UI/bluent.ui.theme.default.min.css" rel="stylesheet" />
<link href="_content/Bluent.UI/bluent.ui.components.min.css" rel="stylesheet" />
<link href="_content/Bluent.UI.Diagrams/bluent.ui.diagrams.min.css" rel="stylesheet" />
```

See [Getting Started](../getting-started/index.md) and
[package selection](../packages/index.md) for the canonical installation path.

## Architecture

| Area | Purpose |
| --- | --- |
| `Models/` | Application-owned domain records, filter state, and form validation |
| `Data/OrderDeskRepository.cs` | In-memory query and command boundary |
| `Components/Layout/` | Navigation, global containers, theme, and direction |
| `Components/Shared/` | Application-level loading and drawer content |
| `Pages/` | Task-oriented business workflows composed from public Bluent APIs |
| `wwwroot/` | Host assets and application-specific responsive styling |

The split keeps the business model independent of Bluent. A real application
can replace the repository with an API client while preserving most page
composition. OrderDesk does not reference any Bluent demo project or use a
demo-only service or asset.

## Run

From the repository root:

```bash
dotnet restore samples/Bluent.OrderDesk/Bluent.OrderDesk.csproj
dotnet run --project samples/Bluent.OrderDesk/Bluent.OrderDesk.csproj
```

Open the local HTTP URL printed by the development server.

## Verification route

Use the maintained route in the
[sample runbook](../../samples/Bluent.OrderDesk/README.md#representative-verification-route)
to exercise the dashboard, list/detail/create/edit workflow, invalid and valid
submits, confirmation, toast, drawer filtering, theme, RTL, responsive layout,
and fresh-tab console.

## Hosting and limitations

- OrderDesk is a standalone Blazor WebAssembly application, matching the
  verified onboarding path.
- Theme and direction changes affect the current document but are not persisted.
- Delays are deliberate local stand-ins that make loading states visible; they
  are not evidence of a server-loading implementation.
- The data set is illustrative, deterministic, and contains no real customer
  information.
- Static SSR and other interactive render modes are outside this sample's
  scope. See the [hosting and render-mode matrix](../compatibility/hosting-and-render-modes.md).

## Evidence

Verification ran on 2026-07-26 from base commit `dd9d9d96d9f9` on macOS
26.5.2, Apple Silicon, with .NET SDK `10.0.300`.

- Source verification confirmed current public APIs, package boundaries,
  registration, static assets, and separation from demo projects.
- The focused and full-solution Release builds passed with warnings treated as
  errors: 0 warnings and 0 errors.
- Existing application tests passed 19/19, release-tool tests passed 13/13,
  the canonical example positive/negative compilation gate passed, all 49
  maintained Markdown files passed link validation, workflow YAML parsed, and
  `git diff --check` passed.
- Runtime verification in the Codex in-app browser exercised customer search
  and empty results, invalid and valid create, edit, canceled and confirmed
  archive, MessageBar and toast feedback, DataGrid loading, drawer filters,
  empty order results, chart and diagram rendering, and light/dark plus LTR/RTL
  changes.
- Visual review used explicit 1440 × 1000 desktop and 390 × 844 mobile
  viewport overrides. The rendered document reported no horizontal overflow
  at either size.
- A final fresh dashboard tab rendered one chart canvas and the complete
  lifecycle SVG, kept the Blazor error UI hidden, and recorded no browser
  console warning or error.

Deployment, package, and non-WebAssembly render-mode validation were not run or
claimed. External Quality CI remains pending until the branch is pushed and a
pull request exists.
