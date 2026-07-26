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
| Interactive Server | `/compatibility/server` | Passed | Prerender/hydration, stateful binding, callbacks, dialog, toast, drawer, popover, tooltip focus/cleanup, chart canvas, diagram SVG, navigation, disposal, transient circuit reconnection, and post-reconnect interaction passed | Verified representative baseline; not an exhaustive component matrix |
| Interactive WebAssembly | `/compatibility/webassembly` | Passed | Prerender/hydration, binding, callbacks, drawer, popover placement, tooltip focus/cleanup, chart canvas, diagram SVG, navigation, disposal, and clean console passed | Verified representative baseline; not an exhaustive component matrix |
| Interactive Auto | `/compatibility/auto` | Passed | The tested interactive instance reported WebAssembly and passed drawer, popover placement, tooltip focus/cleanup, navigation, disposal, and clean-console checks | Verified representative baseline for the observed renderer; exact renderer-transition timing was not instrumented |

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
- `IDrawerService`, including close and navigation from drawer content;
- a bottom-placed, same-width `Popover`;
- a focus-activated `Tooltip`;
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

## Follow-up status vocabulary

The focused follow-up matrix uses these terms:

- **Verified** — the stated representative behavior was exercised at runtime
  in the named mode.
- **Limited** — a narrower behavior was verified, but a related behavior such
  as focus restoration was not exposed or measured.
- **Unsupported** — the behavior requires browser interactivity and therefore
  cannot function in static SSR.
- **Unverified** — no runtime evidence was collected for the specific
  combination.

These labels apply only to the scenarios below. They do not generalize from one
representative component to every Bluent component.

## Overlay, focus, and DOM-measurement follow-up

Evidence was collected from the probe source at commit
`848a083e4341b26fbf4d394ffea123157b03aa6c`.

| Scenario | Interactive Server | Interactive WebAssembly | Interactive Auto | Static SSR |
| --- | --- | --- | --- | --- |
| Drawer open and close | **Verified.** The service-backed drawer opened, its content rendered, its close action returned `closed`, and its DOM detached. | **Verified.** Same result. | **Verified.** Same result with the interactive instance reporting WebAssembly. | **Unsupported.** Service-backed open/close requires an interactive boundary. |
| Drawer navigation and disposal | **Verified.** Navigation from inside the reopened drawer reached `/compatibility/static`; no `.bui-drawer` remained. | **Verified.** Same result. | **Verified.** Same result with the observed WebAssembly renderer. | **Unsupported.** There is no interactive drawer to dispose. |
| Popover placement and dismissal | **Verified.** The bottom popover rendered 6 px below its trigger, matched the trigger width, then dismissed and detached on an outside click. | **Verified.** Same measured result. | **Verified.** Same measured result with the observed WebAssembly renderer. | **Unsupported.** Placement, event handling, and cleanup require JavaScript and interactivity. |
| Tooltip activation and cleanup | **Verified.** Focusing the trigger displayed the tooltip; moving focus to the Increment button removed it. | **Verified.** Same result. | **Verified.** Same result with the observed WebAssembly renderer. | **Unsupported.** Focus-driven activation and cleanup require interactivity. |
| Focus behavior or restoration | **Limited.** Trigger focus and focus moving to another button were observed. No focus-restoration contract was exercised. | **Limited.** Same result. | **Limited.** Same result with the observed WebAssembly renderer. | **Unsupported** for interactive focus management. |
| DOM measurement | **Verified.** Floating UI produced a 6 px vertical gap and a 0 px width difference for `Placement.Bottom` plus `SameWidth`. | **Verified.** Same measurements. | **Verified.** Same measurements with the observed WebAssembly renderer. | **Unsupported.** Static markup does not run the measurement lifecycle. |
| Meaningful display-only output | Not the purpose of this interactive row. | Not the purpose of this interactive row. | Not the purpose of this interactive row. | **Verified.** The heading, information message, and styled display-only button rendered. |

The placement measurements were identical in the three tested interactive
tabs: trigger bottom `376.1875`, surface top `382.1875`, vertical gap `6`, and
trigger/surface width `200.890625`. Those coordinates are observations from
one browser surface and viewport, not a guarantee of fixed coordinates.

Each interactive scenario used a fresh tab. After drawer navigation, the
static-route heading was visible and the drawer count was zero. The fresh-tab
warning/error console was empty in all three interactive modes and in the
static SSR display-only check. No server-side component or circuit exception
was logged during this matrix.

Interactive Auto's runtime marker used `OperatingSystem.IsBrowser()` in the
interactive component instance. It reported `WebAssembly` for the recorded
matrix run. This identifies the renderer that executed the tested instance; it
does not instrument or claim the time at which Auto selected or transitioned
to that renderer.

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
- A later focused test validated transient Interactive Server reconnection
  without restarting the server, as detailed below.

## Transient Interactive Server reconnection

**Status: Verified representative scenario.** The source tree exercised at
runtime is commit `848a083e4341b26fbf4d394ffea123157b03aa6c`.

Expected behavior was that a short transport outage would show Blazor's
reconnection UI, automatically rejoin the existing circuit after transport
restoration, preserve circuit state, and leave Bluent overlays and
JavaScript-backed behavior usable.

The exact procedure was:

1. Start the Release-built ASP.NET host on `127.0.0.1:5054` and leave that
   process running.
2. Start a local TCP forwarding process on `127.0.0.1:5056` and open
   `/compatibility/server` through that forwarding port.
3. Change the bound value from `ready` to `circuit-state-387`, increment the
   event count to `1`, show and dismiss a dialog, show a toast, and confirm one
   chart canvas and one diagram SVG.
4. Send `SIGUSR1` to the forwarding process. This destroyed its active sockets
   and stopped its listener without signaling or terminating the ASP.NET host.
5. Keep the forwarding port unavailable through several automatic reconnect
   attempts, for approximately 10 seconds.
6. Send `SIGUSR2` to the same forwarding process to restore its listener, then
   wait for automatic reconnection without reloading the page.
7. Confirm that the reconnection UI disappeared, the bound value remained
   `circuit-state-387`, the event count remained `1`, and the chart and diagram
   DOM remained present.
8. Increment again to `2`, show a new toast, show and dismiss a new dialog, and
   open and dismiss the JavaScript-backed popover.

Actual behavior matched that expectation. The circuit rejoined automatically;
the stateful value and callback count were preserved rather than reset; both
overlay services remained functional; and the post-reconnect popover measured
and rendered 6 px below its trigger with the same `200.890625` px width before
cleanly detaching.

During the interruption, the UI reported `Rejoin failed... trying again in 3
seconds`. The browser console recorded the expected WebSocket close `1006`,
`Failed to fetch`, and failed negotiation/start messages while the forwarding
port was unavailable. No additional Bluent component error was recorded after
recovery. The server log contained only the existing startup warning that an
HTTPS redirect port could not be determined; it contained no circuit,
component, or unhandled exception, and the same server PID remained alive.

This is a single-circuit, short-interruption test. It does not validate process
restart, circuit retention beyond the framework retention window, scale-out,
multi-node routing, proxy buffering, load, or chaos behavior.

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

Follow-up evidence for Issues
[#387](https://github.com/vrassouli/Bluent/issues/387) and
[#388](https://github.com/vrassouli/Bluent/issues/388) was collected on
2026-07-26 with:

- source commit:
  `848a083e4341b26fbf4d394ffea123157b03aa6c`;
- base commit:
  `782ddad1f082ead94d020e03e95a4c803d4bbbb9` from the latest fetched `Dev`;
- macOS 26.5.2 (`25F84`) on Apple Silicon (`arm64`);
- .NET SDK `10.0.300`;
- .NET and ASP.NET Core runtime `10.0.8`;
- Codex in-app browser using its Chromium-based engine; the automation surface
  did not expose the exact Chromium build;
- an observed browser viewport of 580 x 905 CSS pixels for the recorded
  placement measurement;
- ASP.NET Core `Development` environment.

The follow-up host was built and launched with:

```bash
dotnet build src/Bluent.UI.Demo.SSR/Bluent.UI.Demo.SSR.csproj \
  --configuration Release \
  --no-restore \
  -warnaserror

ASPNETCORE_ENVIRONMENT=Development \
  dotnet run \
  --project src/Bluent.UI.Demo.SSR/Bluent.UI.Demo.SSR.csproj \
  --configuration Release \
  --no-build \
  --no-launch-profile \
  --urls http://127.0.0.1:5054
```

The transient-interruption forwarding process used Node's `net` module. It
printed its PID, destroyed all tracked sockets and closed its listener on
`SIGUSR1`, and listened again on `SIGUSR2`:

```bash
node -e '
const net = require("net");
const sockets = new Set();
let server;
function listen() {
  server = net.createServer(client => {
    const upstream = net.connect(5054, "127.0.0.1");
    sockets.add(client);
    sockets.add(upstream);
    client.pipe(upstream);
    upstream.pipe(client);
    const done = () => {
      sockets.delete(client);
      sockets.delete(upstream);
      client.destroy();
      upstream.destroy();
    };
    client.on("error", done);
    upstream.on("error", done);
    client.on("close", done);
    upstream.on("close", done);
  });
  server.on("error", error => console.error("proxy error", error.message));
  server.listen(5056, "127.0.0.1",
    () => console.log(`proxy listening pid=${process.pid}`));
}
process.on("SIGUSR1", () => {
  console.log("proxy interrupted");
  for (const socket of sockets) socket.destroy();
  sockets.clear();
  if (server) server.close();
});
process.on("SIGUSR2", () => {
  console.log("proxy restored");
  listen();
});
listen();
setInterval(() => {}, 1000);
'

kill -USR1 <proxy-pid>
kill -USR2 <proxy-pid>
```

## Known limitations and follow-up

- The standalone demo's Release index uses the deployed `/Bluent/` base path.
  Running that Release output directly at a local root URL caused expected
  base-path/service-worker failures. Use Debug for local runtime validation or
  validate the published Release output under `/Bluent/`.
- Exact Interactive Auto server-to-WebAssembly transition timing was not
  instrumented; the public behavior passed.
- Focus restoration was not verified because the tested Drawer, Popover, and
  Tooltip scenarios did not expose a documented restoration contract.
- Only the representative Drawer, Popover, and Tooltip scenarios described
  above were checked; other overlays and component-specific disposal paths
  remain unverified.
- The follow-up used one Chromium-based browser surface and one viewport. Other
  browsers, viewport sizes, input methods, assistive technologies, and
  long-lived circuit interruptions remain unverified.
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
- `src/Bluent.UI.Demo.Interactive.Client/Shared/CompatibilityDrawerContent.razor`
- `src/Bluent.UI.Demo.Interactive.Client/Shared/CompatibilityProbe.razor`
- `src/Bluent.UI.Demo.Interactive.Client/Pages/`
- `src/Bluent.UI.Demo.SSR/Program.cs`
- `src/Bluent.UI.Demo.SSR/Components/App.razor`
- `src/Bluent.UI.Demo.SSR/Components/Pages/StaticCompatibilityProbe.razor`
- `src/Bluent.UI/Extensions/ServiceCollectionExtensions.cs`
