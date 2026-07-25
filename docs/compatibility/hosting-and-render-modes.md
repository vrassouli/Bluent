# Hosting models and render modes

This page distinguishes the modes exercised by the repository from broader
component-by-component compatibility claims.

## Current support statement

Bluent's service registration, base components, binding, callbacks, overlay
services, chart module, and diagram module have runtime evidence in:

- standalone Blazor WebAssembly;
- Interactive Server;
- Interactive WebAssembly in a Blazor Web App; and
- Interactive Auto.

Static server-side rendering can produce display-only markup for components
that do not require browser events, overlays, or JavaScript. Static output does
not make an interactive component functional.

This evidence is a representative compatibility baseline, not a guarantee that
every component has been tested in every mode.

## Evidence matrix

| Model | Reproducible consumer | Build | Runtime result | Current status |
| --- | --- | --- | --- | --- |
| Standalone Blazor WebAssembly | `src/Bluent.UI.Demo` | Passed in the full Release solution build | Debug local host rendered the compiled onboarding example; checkbox binding, callback state, dialog overlay, navigation, and clean console were checked | Verified onboarding path |
| Static server-side rendering | `/compatibility/static` in `src/Bluent.UI.Demo.SSR` | Passed | Heading, information message, and styled display-only button rendered without an interactive boundary | Verified for display-only use, not events or browser interop |
| Interactive Server | `/compatibility/server` | Passed | Prerender/hydration, text binding, callback count, dialog, toast, chart canvas, diagram SVG, navigation, disposal, and clean console passed | Representative baseline passed |
| Interactive WebAssembly | `/compatibility/webassembly` | Passed | Prerender/hydration, text binding, callback count, dialog, toast, chart canvas, diagram SVG, and clean console passed | Representative baseline passed |
| Interactive Auto | `/compatibility/auto` | Passed | Initial interactive visit passed binding, callback, dialog, toast, chart, diagram, and clean-console checks | Representative baseline passed; renderer-transition timing was not separately instrumented |

## Reproducible consumer structure

The .NET 10 Blazor Web App host configures both interactive renderers:

```csharp
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents()
    .AddInteractiveWebAssemblyComponents();
builder.Services.AddBluentUI();

app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode()
    .AddInteractiveWebAssemblyRenderMode()
    .AddAdditionalAssemblies(
        typeof(Bluent.UI.Demo.Interactive.Client.Pages.InteractiveServerProbe)
            .Assembly);
```

The client project also calls `AddBluentUI()`. This is required because
Interactive WebAssembly and the WebAssembly phase of Interactive Auto resolve
services from the browser-side service provider.

The host includes:

```razor
@using Bluent.UI.Components
```

and the packaged assets:

```html
<link href="_content/Bluent.UI/bluent.ui.theme.default.min.css" rel="stylesheet" />
<link href="_content/Bluent.UI/bluent.ui.components.min.css" rel="stylesheet" />
<link href="_content/Bluent.UI.Diagrams/bluent.ui.diagrams.min.css" rel="stylesheet" />
```

Each compatibility probe places one `<Containers />` inside its interactive
render boundary. A container rendered only by a static parent layout cannot
host scoped interactive overlay services.

## What was exercised

The shared compatibility probe uses current public APIs to cover:

- a `TextField` with `@bind-Value` and `BindValueEvent="oninput"`;
- a `Button` callback that updates visible state;
- `IToastService` and `IDialogService`;
- a Chart.js-backed `Chart`;
- a JavaScript-backed `Diagram`;
- a `NavLink` from an interactive route to the static SSR route; and
- disposal during navigation away from the interactive component tree.

For the three Blazor Web App interactive modes, the browser observed one chart
`canvas` and one diagram `svg` after interactivity began. Dialog and toast
content appeared in the active overlay container. No warning or error remained
in the fresh-tab console checks.

The standalone WebAssembly demo's compiled Getting Started example exercised
checkbox binding, enabled-state propagation, a save callback, and a dialog. Its
fresh Debug-host browser tab had no warning or error console entries.

## Prerender and lifecycle observations

- All three interactive Blazor Web App pages produced their initial heading,
  controls, and display markup before the interaction assertions.
- Binding, callbacks, overlays, charts, and diagrams worked after the renderer
  became interactive.
- Navigating from the Interactive Server probe to the static route completed
  without a browser-console warning or error, providing representative disposal
  evidence.
- A process restart during the first test intentionally broke the existing
  circuit and produced expected stale connection errors in that original tab.
  Fresh-tab checks were used for the clean-console results.
- Server-circuit reconnection across a transient network interruption was not
  automated in this pass. A process restart is not a valid successful
  reconnection test because server memory and circuit state are lost.

## Static SSR limitations

Static SSR is appropriate only where display markup is sufficient. Without an
interactive render mode:

- event callbacks do not run;
- two-way binding does not update application state;
- dialogs, drawers, popovers, toasts, and tooltips cannot behave interactively;
- focus, measurement, resizing, charts, and diagrams cannot complete their
  browser-module lifecycle.

Keep these features inside an Interactive Server, Interactive WebAssembly, or
Interactive Auto boundary.

## Service scopes

`AddBluentUI()` registers theme, DOM, dialog, drawer, popover, toast, tooltip,
and dock services as scoped by default.

- In standalone and interactive WebAssembly, the scoped lifetime is effectively
  browser-application scoped.
- In Interactive Server, it follows the server circuit scope.
- In Interactive Auto, both the server and client service providers must
  register Bluent because execution can occur on either side.
- `<Containers />` must resolve from the same interactive service scope as the
  page or component requesting an overlay.

## Environment and commands

Evidence collected on 2026-07-25:

- source commit: `ef0be8fae32b50b8b21a180e826ee0104a4be1d1`;
- operating system: macOS 26.5 on Apple Silicon;
- .NET SDK: 10.0.300;
- runtime: .NET 10.0.8;
- browser: Codex in-app browser using its Chromium-based engine; the exact
  browser build was not exposed by the automation surface;
- Blazor Web App host:
  `http://127.0.0.1:5054` with `ASPNETCORE_ENVIRONMENT=Development`;
- standalone WebAssembly host:
  `http://127.0.0.1:5055` in Debug configuration.

Build commands:

```bash
dotnet restore Bluent.sln --disable-parallel
dotnet build Bluent.sln --configuration Release --no-restore -warnaserror
```

Runtime host commands:

```bash
ASPNETCORE_ENVIRONMENT=Development \
  dotnet run \
  --project src/Bluent.UI.Demo.SSR/Bluent.UI.Demo.SSR.csproj \
  --configuration Release \
  --no-build \
  --no-launch-profile \
  --urls http://127.0.0.1:5054

dotnet run \
  --project src/Bluent.UI.Demo/Bluent.UI.Demo.csproj \
  --configuration Debug \
  --no-launch-profile \
  --urls http://127.0.0.1:5055
```

## Known limitations and follow-up

- The standalone demo's Release index uses the deployed `/Bluent/` base path.
  Running that Release output directly at a local root URL caused expected
  base-path/service-worker failures. Use Debug for local runtime validation or
  validate the published Release output under `/Bluent/`.
- Exact Interactive Auto server-to-WebAssembly transition timing was not
  instrumented; the public behavior passed.
- Transient Interactive Server reconnection remains a focused follow-up.
- Drawer, popover, tooltip, focus restoration, and every component-specific
  disposal path were not exhaustively retested in all modes.
- This representative baseline does not claim complete browser coverage or
  complete WCAG conformance.
- CI performs focused rendered-markup checks for a language declaration, one
  main landmark, one level-one heading, labeled form controls, named buttons
  and links, and duplicate IDs on the four compatibility routes. These checks
  are regression smoke tests, not an accessibility audit.

## Verification sources

- `src/Bluent.UI.Demo/Program.cs`
- `src/Bluent.UI.Demo/wwwroot/index.html`
- `src/Bluent.UI.Demo.Interactive.Client/Program.cs`
- `src/Bluent.UI.Demo.Interactive.Client/Shared/CompatibilityProbe.razor`
- `src/Bluent.UI.Demo.Interactive.Client/Pages/`
- `src/Bluent.UI.Demo.SSR/Program.cs`
- `src/Bluent.UI.Demo.SSR/Components/App.razor`
- `src/Bluent.UI.Demo.SSR/Components/Pages/StaticCompatibilityProbe.razor`
- `src/Bluent.UI/Extensions/ServiceCollectionExtensions.cs`
