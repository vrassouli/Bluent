# Bluent

**Fluent-inspired Blazor components for building modern, component-rich business applications.**

[![NuGet](https://img.shields.io/nuget/v/Bluent.UI.svg)](https://www.nuget.org/packages/Bluent.UI)
[![NuGet downloads](https://img.shields.io/nuget/dt/Bluent.UI.svg)](https://www.nuget.org/packages/Bluent.UI)
[![Demo](https://img.shields.io/badge/live-demo-visit-2563eb)](https://vrassouli.github.io/Bluent/)
[![.NET](https://img.shields.io/badge/.NET-10-512bd4)](https://dotnet.microsoft.com/)

Bluent is a Blazor UI toolkit designed for developers building real-world web applications with a Fluent look and feel. It combines everyday form and navigation components with more advanced building blocks such as charts, diagrams, overlays, dialogs, and desktop-style application patterns.

> Bluent is independently developed and is not affiliated with or endorsed by Microsoft.

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
| `Bluent.UI.Utilities` | Shared UI utilities |

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

Install the main package:

```bash
dotnet add package Bluent.UI
```

Import the component and extension namespaces in `_Imports.razor`:

```razor
@using Bluent.UI
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

For complete examples and component behavior, see the [demo application](https://vrassouli.github.io/Bluent/) and the source under [`src/Bluent.UI.Demo.Pages`](src/Bluent.UI.Demo.Pages).

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
```

## Project direction

The current focus is to make Bluent easier to evaluate, adopt, and contribute to:

1. Improve component documentation and runnable examples.
2. Clarify package boundaries and supported application models.
3. Strengthen release notes, versioning, and upgrade guidance.
4. Expand automated testing and accessibility checks.
5. Build a welcoming contributor workflow and public roadmap.

See [`ROADMAP.md`](ROADMAP.md) for the working plan.

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
