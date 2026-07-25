# Hosting models and render modes

This page records what the current Bluent repository demonstrates and what still requires validation. It deliberately distinguishes source evidence from a compatibility guarantee.

## Current support statement

**Blazor WebAssembly is the verified onboarding model in the current documentation.**

The repository also contains a .NET 10 Blazor Web App project that can produce static server-rendered markup. However, many Bluent components depend on browser events, scoped UI services, overlays, or JavaScript interop. Those behaviors require interactivity and must not be described as fully supported in static SSR until component-level validation is complete.

## Evidence matrix

| Model | Repository evidence | Current documentation status |
| --- | --- | --- |
| Blazor WebAssembly | Dedicated demo using `WebAssemblyHostBuilder`, `AddBluentUI()`, packaged styles, and layout containers | Verified onboarding path |
| Static server-side rendering | Blazor Web App demo using `AddRazorComponents()`, `MapRazorComponents<App>()`, and packaged styles | Markup may render; interactive behavior is not guaranteed |
| Interactive Server | No dedicated render-mode configuration or validation project identified | Unverified |
| Interactive WebAssembly in a Blazor Web App | No dedicated render-mode configuration or validation project identified | Unverified |
| Interactive Auto | No dedicated render-mode configuration or validation project identified | Unverified |

“Unverified” does not mean incompatible. It means the repository does not yet contain sufficient build and runtime evidence for a support claim.

## Why interactivity matters

The main package registers services for:

- themes
- DOM operations
- dialogs
- drawers
- popovers
- toasts
- tooltips
- docking

Several components and services invoke packaged browser modules through `IJSRuntime`. Event handlers, bindings, overlays, focus management, measurements, and similar behavior therefore need an interactive Blazor renderer.

A component that emits correct initial HTML during static SSR may still be unusable without interactivity.

## Blazor WebAssembly setup

Use the canonical [Getting Started guide](../getting-started/index.md). The required shape is:

- `WebAssemblyHostBuilder`
- `builder.Services.AddBluentUI()`
- both `Bluent.UI` stylesheets in `wwwroot/index.html`
- one `<Containers />` in the active layout
- the `Bluent.UI.Components` namespace

The repository's WebAssembly demo is the reference implementation for this model.

## Blazor Web App setup

The repository's server project currently uses:

```csharp
builder.Services.AddRazorComponents();
builder.Services.AddBluentUI();

app.MapRazorComponents<App>()
    .AddAdditionalAssemblies(typeof(Bluent.UI.Demo.Pages._Imports).Assembly);
```

Its root `App.razor` includes the packaged styles and renders `<Routes />`.

This proves the repository has a static SSR host shape. It does not establish that every Bluent component is functional under static SSR, because no interactive render mode is configured in that demo.

## Guidance for adopters

- Use Blazor WebAssembly when following the currently verified path.
- For Blazor Web Apps, enable an appropriate interactive render mode for components that handle events or use browser interop.
- Do not use prerendered markup alone as evidence that a component is fully functional.
- Validate overlays, input controls, focus behavior, resize/position logic, and JavaScript-backed features in the chosen render mode.
- Keep `<Containers />` inside the interactive component tree used by overlay services.
- Keep service lifetimes aligned with the interactive scope. `AddBluentUI()` defaults its UI services to scoped.

## Validation plan

Before expanding the support statement, add small consumer applications or test pages for:

1. Blazor WebAssembly
2. Interactive Server
3. Interactive WebAssembly
4. Interactive Auto
5. Static SSR for display-only candidates

For each model, verify:

- application build and publish
- first render and hydration
- event callbacks and two-way binding
- dialogs, drawers, popovers, toasts, and tooltips
- JavaScript module loading
- navigation and enhanced navigation
- reconnect behavior where applicable
- prerender behavior and duplicate initialization
- disposal of interop-backed components

Results should record the .NET version, Bluent package version or commit, browser, render mode, and failing components.

## Verification sources

Reviewed on 2026-07-25:

- `src/Bluent.UI.Demo/Program.cs`
- `src/Bluent.UI.Demo/wwwroot/index.Release.html`
- `src/Bluent.UI.Demo.Pages/Layout/MainLayout.razor`
- `src/Bluent.UI.Demo.SSR/Program.cs`
- `src/Bluent.UI.Demo.SSR/Components/App.razor`
- `src/Bluent.UI.Demo.SSR/Components/Routes.razor`
- `src/Bluent.UI/Extensions/ServiceCollectionExtensions.cs`
- `src/Bluent.UI/Bluent.UI.csproj`

No runtime test was executed through the GitHub connector. This page is source-verified, not release-validation evidence.
