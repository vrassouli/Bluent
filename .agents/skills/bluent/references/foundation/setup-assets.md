# Setup, assets, packages and render modes

Canonical sources:

- `docs/getting-started/index.md`
- `docs/packages/index.md`
- `docs/compatibility/hosting-and-render-modes.md`

## Main package baseline

Install `Bluent.UI`, import `Bluent.UI.Components` and `Bluent.UI.Extensions`, call `builder.Services.AddBluentUI()`, add the two packaged base stylesheets, and place one `<Containers />` in the active layout tree.

Do not add a global base-package script tag; current base interop loads its packaged ES module through Blazor JS interop.

Specialized packages are optional:

- Charts: `Bluent.UI.Charts`, namespace `Bluent.UI.Charts.Components`
- Diagrams: `Bluent.UI.Diagrams`, namespace `Bluent.UI.Diagrams.Components`, plus its packaged stylesheet
- Utilities: `Bluent.UI.Utilities`, plus `AddBluentUtilities()` where required

## Render-mode rule

Interactive controls, bindings, callbacks, overlays and browser interop require an interactive render mode. Use the canonical compatibility matrix for exact verified status; never infer universal static-SSR support from successful markup rendering.
