# Getting started with Bluent

This is the canonical installation and setup guide for the current Bluent source.

## Prerequisites

- .NET 10 SDK
- A Blazor application capable of interactive rendering
- A browser target

The current Bluent projects target `net10.0` and declare browser support.

## 1. Install the main package

From the application project directory:

```bash
dotnet add package Bluent.UI
```

The main package contains the standard Bluent components, services, styles, and browser interop used by most applications.

Specialized packages such as `Bluent.UI.Charts`, `Bluent.UI.Diagrams`, and `Bluent.UI.Utilities` are optional and should only be installed when their features are needed.

## 2. Import the namespaces

Add these imports to the application's `_Imports.razor`:

```razor
@using Bluent.UI.Components
@using Bluent.UI.Extensions
```

- `Bluent.UI.Components` exposes the Razor components, including `Button` and `Containers`.
- `Bluent.UI.Extensions` exposes the `AddBluentUI` service-registration extension.

## 3. Register Bluent services

Add Bluent to the application's service collection in `Program.cs`:

```csharp
using Bluent.UI.Extensions;

builder.Services.AddBluentUI();
```

`AddBluentUI()` registers localization and the theme, DOM, dialog, drawer, popover, toast, tooltip, and dock services. The default service lifetime is scoped.

### Blazor WebAssembly example

```csharp
using Bluent.UI.Extensions;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;

var builder = WebAssemblyHostBuilder.CreateDefault(args);

builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddBluentUI();

await builder.Build().RunAsync();
```

## 4. Add the stylesheets

Add both Bluent stylesheets inside the document `<head>`.

For a Blazor WebAssembly application, this is normally `wwwroot/index.html`:

```html
<link href="_content/Bluent.UI/bluent.ui.theme.default.min.css" rel="stylesheet" />
<link href="_content/Bluent.UI/bluent.ui.components.min.css" rel="stylesheet" />
```

The theme stylesheet defines the default theme tokens. The component stylesheet contains the component styles. Both are required for the standard appearance.

No separate global Bluent script tag is required for the base package. Components that need browser interop load the packaged JavaScript module through Blazor's JavaScript interop.

## 5. Add the shared containers

Place one `Containers` component in a layout that wraps every page that may use dialogs, drawers, popovers, toasts, tooltips, or other overlay services.

A minimal `MainLayout.razor` is:

```razor
@inherits LayoutComponentBase

<main>
    @Body
</main>

<Containers />
```

Do not add a separate `Containers` instance to every page. Add it once per rendered layout tree.

## 6. Use a component

You can now use Bluent components in Razor pages:

```razor
@page "/bluent-example"

<PageTitle>Bluent example</PageTitle>

<h1>Bluent example</h1>

<Button Appearance="Appearance.Primary" @onclick="Save">
    Save changes
</Button>

<p>@_message</p>

@code {
    private string? _message;

    private void Save()
    {
        _message = "Saved.";
    }
}
```

Run the application and verify that the button uses the Bluent primary appearance and that its click handler executes.

## Hosting and render modes

### Blazor WebAssembly

Blazor WebAssembly is represented by the repository demo and is the currently verified onboarding path in this guide.

Use:

- `WebAssemblyHostBuilder`
- `builder.Services.AddBluentUI()`
- the two Bluent stylesheets in `wwwroot/index.html`
- one `<Containers />` in the active layout

### Blazor Web App and server rendering

The repository contains a Blazor Web App demo that registers Bluent through `AddRazorComponents()` and maps Razor components. It also includes the Bluent stylesheets in the root `App.razor`.

Many Bluent controls depend on events, scoped services, overlays, or browser interop. Those behaviors require an interactive render mode. A complete supported-render-mode matrix is still being verified during Sprint 1; until it is published, do not assume that every component supports static server-side rendering without interactivity.

## Optional packages

### Utilities

Install and register the utilities package only when using its higher-level application patterns:

```bash
dotnet add package Bluent.UI.Utilities
```

```razor
@using Bluent.UI.Utilities
@using Bluent.UI.Utilities.Extensions
```

```csharp
builder.Services.AddBluentUI();
builder.Services.AddBluentUtilities();
```

`Bluent.UI.Utilities` depends on `Bluent.UI`. Its registration adds the MDI and busy-indicator services.

### Charts

Install `Bluent.UI.Charts` for chart components:

```bash
dotnet add package Bluent.UI.Charts
```

Import:

```razor
@using Bluent.UI.Charts.Components
```

Chart-specific setup and a verified minimal example will be maintained in the package guide.

### Diagrams

Install `Bluent.UI.Diagrams` for diagramming components:

```bash
dotnet add package Bluent.UI.Diagrams
```

Import:

```razor
@using Bluent.UI.Diagrams.Components
```

Include its packaged stylesheet:

```html
<link href="_content/Bluent.UI.Diagrams/bluent.ui.diagrams.min.css" rel="stylesheet" />
```

Diagram-specific setup and a verified minimal example will be maintained in the package guide.

## Troubleshooting

### Components are not recognized

Confirm that `_Imports.razor` contains:

```razor
@using Bluent.UI.Components
```

The component namespace is not the package ID.

### Components render without Bluent styling

Confirm that both base stylesheets are present and that their paths begin with `_content/Bluent.UI/`.

### Dialogs, popovers, toasts, or tooltips do not appear

Confirm that:

- `builder.Services.AddBluentUI()` is called.
- One `<Containers />` is present in the active layout.
- The component is rendered interactively when it depends on events or browser interop.

### A specialized component is missing

Confirm that its package is installed and its component namespace is imported. Installing `Bluent.UI` does not add the Charts or Diagrams component namespaces.

## Verification sources

This guide was checked against the current Sprint 1 branch on 2026-07-25:

- `src/Bluent.UI/Bluent.UI.csproj`
- `src/Bluent.UI/Extensions/ServiceCollectionExtensions.cs`
- `src/Bluent.UI.Demo/Program.cs`
- `src/Bluent.UI.Demo/wwwroot/index.Release.html`
- `src/Bluent.UI.Demo.Pages/_Imports.razor`
- `src/Bluent.UI.Demo.Pages/Layout/MainLayout.razor`
- `src/Bluent.UI.Demo.SSR/Program.cs`
- `src/Bluent.UI.Demo.SSR/Components/App.razor`
- `src/Bluent.UI.Utilities/Extensions/ServiceCollectionExtensions.cs`
- package project files for Charts, Diagrams, and Utilities

Build and runtime validation remain required before the guide is considered release-validated.
