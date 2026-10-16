# #421 Component Lab - render mode QA (DRAFT)

This is the issue #421 Component Lab pilot, PR #551 to bluent-v3.
Four families have real runnable examples (Button, Icon, Label, Link);
the 66-family work queue does NOT mean 66 completed v3 components.

## Canonical Penpot design

Bluent v3 Design System, file b64f6665-c9ab-80b5-8008-c4ac99d9d000,
page e775e67c-d9da-804b-8008-cc7c2dd7ecf7.
Desktop board e775e67c-d9da-804b-8008-cc7c2dec1d15;
mobile board e775e67c-d9da-804b-8008-cc7c2e40c7d2.
Both boards have draft render-mode QA notes. No maintainer parity approval.

## Verified - actual WebAssembly

Run scripts/quality/run_v3_component_lab.ps1 -Mode WebAssembly.
Actual Dev01 Chrome/WebAssembly after hydration guard: 17/17 passed.
This includes real Blazor Button clicks; Icon, Label and Link markup;
four preview controls, search, 66 canonical issue rows, issue-number
queue search, and responsive 320px nonoverflow. Prior exact-head
GitHub Chrome/Edge WebAssembly on 13036b0f succeeded. New HEAD
needs independent CI evidence before claiming success.

## NOT accepted: InteractiveServer

The QA-only route /compatibility/component-lab-server is an
InteractiveServer wrapper hosting the SAME shared ComponentLab.
A first OnAfterRenderAsync sets data-lab-interactive=true so the
real browser runner does not mistake prerendered HTML for clickable UI.

Reproduction on Dev01 2026-10-16:
- Build-only Development SSR served page HTTP200 but framework JS and
  Bluent CSS asset development handlers raised FileNotFoundException.
- Real isolated Production SSR publish served HTTP200 and static
  Component Lab markup; actual Chrome still observed window.Blazor
  undefined and data-lab-interactive=false; app.css returned HTTP404.
- The first-click hydration gate timed out; no interactive Server
  behavior was proven. Cause of bootstrap failure requires further
  diagnosis. Do not report this as passed or as a proven shared
  component-handler defect.

The runner supports -Mode Server for reproducing this in a disposable
published host, but Server is deliberately NOT in the accepted
renderModesVerified array or current GitHub passing browser matrix.
The real WASM browser gate remains independent and green.

## Dependency advisory

The existing SSR project Microsoft.AspNetCore.Components.WebAssembly.Server
10.0.7 emits two high-severity NU1903 advisories:
GHSA-g27p-qf6j-c96c and GHSA-qjpx-jqm5-h2c4.
They are not suppressed; remediation requires independent testing.

No stable Dev merge, v3 release or NuGet publish was authorized.
