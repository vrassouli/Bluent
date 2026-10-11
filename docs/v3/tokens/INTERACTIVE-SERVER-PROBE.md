# #418 · Interactive Server (published SSR) browser parity

**Date: 2026-10-11. Status: repeatable integration proof, not final v3 acceptance.**

The existing `/v3/styling-lab` route renders in the ordinary SSR application for static asset checks. That alone does **not** prove Blazor Server interaction. The v3 task branch now includes a distinct research route:

- `src/Bluent.UI.Demo.SSR/Components/Pages/V3InteractivePortalLab.razor` at **`/v3/interactive-portal-lab`**.
- `@rendermode InteractiveServer` creates an actual interactive server circuit.
- The page renders the same Blazor `V3StylingLab` and a matching `<Containers />` **inside the same interactive component tree**. This is essential for injected `IDialogService` / `IPopoverService` ownership and to avoid testing a detached static SSR Layout.

## Reproduce

From the existing Dev01 Bluent workspace:

```powershell
dotnet build src/Bluent.UI.Demo.SSR/Bluent.UI.Demo.SSR.csproj -c Debug --no-restore --nologo
$env:BLUENT_V3_LAB_MODE = "server"
node scripts/quality/probe_v3_blazor_runtime.mjs
Remove-Item Env:BLUENT_V3_LAB_MODE
```

The same browser script defaults to **standalone Blazor WebAssembly** when the env setting is omitted, also with 126/126 checks.

**How the server test actually runs:** the probe makes a *temporary local Release publish*, starts the published `Bluent.UI.Demo.SSR.dll` with `ASPNETCORE_ENVIRONMENT=Production` and a loopback URL from the **publish output working directory**, then uses real headless Chrome/CDP to exercise click handlers and read CSS/computed DOM. It stops the app and removes the temporary publish and Chrome profile. Nothing is remotely deployed or NuGet-published.

This is intentional: attempting the same direct `dotnet run -c Debug --no-build` from the repository root produced HTTP 500 for static web asset endpoints in this environment, so no genuine interactivity existed. Those requests were not counted as component failures or passing evidence. The published server host succeeds with the exact site assets included in the Release publish.

## Verified results

| Actual browser execution | Passed | Failed |
| --- | ---: | ---: |
| Blazor WebAssembly (Debug localhost; browser + event handlers) | 126 | 0 |
| Blazor Interactive Server (published Release/Production localhost; browser + server circuit) | 126 | 0 |

Both runs test ten legacy brand stylesheets in both Light/Dark modes; nested simultaneous Excel and Word host palettes; independent global Dialog and Popover brand/mode/direction; live owner updates; legacy unscoped Dialog fallback; Forced Colors token roles, reduced-motion portal behavior and actual Dialog dismissal; 320px RTL / 200% root-font reflow, plus primary Button text contrast arithmetic (minimum 5.552:1).

The same .NET test suite passes **40/40**, source CSS generator detects drift (450 variables per mode, 49 brand-sensitive), and the published SSR **static-assets smoke remains separately 4/4**.

## What this does NOT establish

This test verifies **Interactive Server behavior inside the newly isolated probe island**, *not* every existing static SSR route, route transitions, RenderMode.Auto, persistence after disconnection, full native high contrast, screen reader flows, formal Fluent compliance or all keyboard interactions. Stable `Dev`/2.x and publicly released NuGet were not changed.

See [concurrent brand design + source contract](BRAND-SCOPES-PREVIEW.md) and [proposed portal owner API](PORTAL-THEME-SCOPE-PREVIEW.md). Final type names, per-component specs and accessibility sign-off remain gating work under issue #418; PR #500 stays Draft to `bluent-v3`.
