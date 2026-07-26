# Bluent

**Fluent-inspired Blazor components for building modern, component-rich business applications.**

[![NuGet](https://img.shields.io/nuget/v/Bluent.UI.svg)](https://www.nuget.org/packages/Bluent.UI)
[![NuGet downloads](https://img.shields.io/nuget/dt/Bluent.UI.svg)](https://www.nuget.org/packages/Bluent.UI)
[![Demo](https://img.shields.io/badge/live-demo-visit-2563eb)](https://vrassouli.github.io/Bluent/)
[![.NET](https://img.shields.io/badge/.NET-10-512bd4)](https://dotnet.microsoft.com/)

Bluent is a Blazor UI toolkit designed for developers building real-world web applications with a Fluent look and feel. It combines everyday form and navigation components with more advanced building blocks such as charts, diagrams, overlays, dialogs, and desktop-style application patterns.

> Bluent is independently developed and is not affiliated with or endorsed by Microsoft.

## Demo at a glance

[![Bluent product landing page in the light theme](https://raw.githubusercontent.com/vrassouli/Bluent/56812a0f324a47df51c50e5030cbe696ea3a3e92/docs/demo/screenshots/landing-light-ltr.jpg)](https://vrassouli.github.io/Bluent/)

The demo combines component references with runnable business workflows such as the [operations dashboard](docs/demo/screenshots/operations-dashboard.jpg). See the [Sprint 2 visual gallery](docs/demo/README.md) for the component showcase and validated dark/RTL presentation. For an end-to-end consumer structure, explore the [OrderDesk production-pattern reference application](docs/examples/reference-application.md).

## Why Bluent?

- **Built for Blazor** — Razor components and .NET APIs without wrapping another application framework.
- **Business-application focused** — forms, navigation, feedback, overlays, data presentation, charts, and diagrams.
- **Fluent-inspired design** — a familiar, clean visual language suitable for productivity software.
- **Modular packages** — use the core component library and add specialized packages when needed.
- **Actively developed** — the library continues to receive component improvements and fixes.

## Packages

| Package | Purpose |
| --- | --- |
| [`Bluent.UI`](https://www.nuget.org/packages/Bluent.UI) | Main component library |
| [`Bluent.UI.Charts`](https://www.nuget.org/packages/Bluent.UI.Charts) | Chart components |
| [`Bluent.UI.Diagrams`](https://www.nuget.org/packages/Bluent.UI.Diagrams) | Diagramming components |
| [`Bluent.UI.Utilities`](https://www.nuget.org/packages/Bluent.UI.Utilities) | Shared UI utilities |

## Component areas

Bluent includes components for common application needs, including:

- Buttons and actions
- Text, numeric, date, and time input
- Dropdowns and selection controls
- Dialogs, message boxes, popovers, and tooltips
- Navigation, tabs, lists, and menus
- Cards, layout, and feedback components
- File selection
- Charts
- Diagramming
- MDI-style application interfaces

Explore the available components in the [live demo](https://vrassouli.github.io/Bluent/).

## Installation

For the complete, source-verified setup and troubleshooting path, see the [Getting Started guide](docs/getting-started/index.md).

Install the main package:

```bash
dotnet add package Bluent.UI
```

Import the component and extension namespaces in `_Imports.razor`:

```razor
@using Bluent.UI.Components
@using Bluent.UI.Extensions
```

Register Bluent services in `Program.cs`:

```csharp
builder.Services.AddBluentUI();
```

Add the shared containers near the end of your application layout:

```razor
<Containers />
```

Reference the packaged stylesheets:

```html
<link href="_content/Bluent.UI/bluent.ui.theme.default.min.css" rel="stylesheet" />
<link href="_content/Bluent.UI/bluent.ui.components.min.css" rel="stylesheet" />
```

You can now use Bluent components in your Razor pages.

## Quick example

```razor
<Button Appearance="Appearance.Primary">
    Save changes
</Button>
```

For complete examples and component behavior, see the [demo application](https://vrassouli.github.io/Bluent/), the source under [`src/Bluent.UI.Demo.Pages`](src/Bluent.UI.Demo.Pages), and the standalone [OrderDesk reference application](samples/Bluent.OrderDesk/README.md).

## Repository structure

```text
src/
├── Bluent.Core
├── Bluent.UI
├── Bluent.UI.Charts
├── Bluent.UI.Diagrams
├── Bluent.UI.Utilities
├── Bluent.UI.Demo
└── Bluent.UI.Demo.Pages

samples/
├── Bluent.TaskExamples
└── Bluent.OrderDesk
```

## Project direction

The current focus is to make Bluent easier to evaluate, adopt, and contribute to:

1. Improve component documentation and runnable examples.
2. Clarify package boundaries and supported application models.
3. Strengthen release notes, versioning, and upgrade guidance.
4. Expand automated testing and accessibility checks.
5. Build a welcoming contributor workflow and public roadmap.

## Project documents

- [Vision](VISION.md) — what Bluent is, who it serves, and its product principles.
- [Roadmap](ROADMAP.md) — current phases, outcomes, and exit criteria.
- [Changelog](CHANGELOG.md) — notable changes and release history.
- [Versioning and releases](RELEASING.md) — compatibility and release policy.
- [Contributing](CONTRIBUTING.md) — development setup and contribution workflow.
- [Code of Conduct](CODE_OF_CONDUCT.md) — community participation standards.

## Contributing

Issues, examples, documentation improvements, and pull requests are welcome. Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) before submitting a change.

## Support the project

The most useful ways to help Bluent grow are:

- Star the repository if the project is useful to you.
- Try the library and report reproducible issues.
- Share screenshots or links to applications built with Bluent.
- Improve an example or document an existing component.

## License

Bluent is licensed under the [Apache License 2.0](LICENSE).
