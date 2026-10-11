# #418 — Blazor runtime and D2 portal ownership checkpoint

**2026-10-11 · In progress / PR #500 Draft.** Research only; not a public v3 API or WCAG/AT certification.

## Design source

Authoritative editable Penpot `Bluent v3 Design System` file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`.

- High contrast and motion policy: page `acf5f619-7d81-80da-8008-c5ef1089ac94`, board `acf5f619-7d81-80da-8008-c5ef2f9a3158`.
- New D2 ownership **proposal**, not accepted: page `acf5f619-7d81-80da-8008-c5fec09d9837`, board `acf5f619-7d81-80da-8008-c5fec0b7ec61`, 28 editable shapes, exported for visual review. Current: page Dark + detached global Layout/DialogContainer Light. Candidate: explicit app/theme-host ownership captured by service, copied to detached Dialog/Popover wrapper with SSR/no-owner fallback. No API contract is finalized.

## Demo implementation

`/v3/styling-lab` now uses actual Bluent `Button`, `TextField`, `Overlay` and `IDialogService` with opt-in `data-bui-v3-tokens`. The [source alias CSS](issue-418-opt-in.preview.css) and [accessibility overlay](issue-418-accessibility.preview.css) are deterministically combined by `scripts/quality/sync_v3_token_demo_asset.py` into the **Demo.Pages-only** static asset `wwwroot/v3/issue-418.opt-in.preview.css`. The CSS remains excluded from Bluent.UI public bundles, stable NuGet and `Dev`; run the sync command with `--check` to prevent drift.

## Actual verification — Dev01

Run:

```shell
python scripts/quality/generate_v3_token_preview.py --check
python scripts/quality/sync_v3_token_demo_asset.py --check
dotnet build src/Bluent.UI.Demo/Bluent.UI.Demo.csproj -c Debug --no-restore
node scripts/quality/probe_v3_blazor_runtime.mjs
pwsh -NoProfile -File scripts/quality/probe_v3_ssr_publish.ps1 -Port 5108
```

**9/9 real Blazor WebAssembly Chrome/CDP checks passed:** existing Button and CSS loaded; real TextField background/border read; interactive Light→Dark and LTR→RTL; reduced-motion `0s` on real Overlay; 150ms no-preference token via explicit media emulation; live forced-colors `ButtonFace` and `Highlight` roles; injected keyboard Tab produced `:focus-visible` with 2px outline; and detached service Dialog ownership defect reproduced. **The last check passes by detecting the bug, not by fixing it.** The Dialog wrapper was outside the opted-in subtree and inherited Light while the page was Dark. Real Popover propagation was not exercised.

Published **SSR Production static-asset smoke 4/4**: page, package CSS, demo research CSS and Blazor script all HTTP 200 with content-type checks. This is not interactive SSR validation.

The standalone WASM Release index intentionally uses GitHub Pages `/Bluent/` as its base, so launching Release at local root produces 404s. The automated interactive probe deliberately runs the **Debug** host with base `/`; no public release/index configuration was modified.

## Remaining acceptance gates

Review and approve D2 theme-host ownership semantics and #420 API boundaries before modifying service/container APIs. Prove real Dialog **and Popover** propagation, independently nested hosts, SSR fallback, ten brands × two modes, real OS high contrast, screen readers, Persian metrics, zoom/reflow, mobile and cross-browser behavior. This nine-check test is narrowly scoped and cannot establish Fluent/WCAG parity.

**Branch:** `v3/issue-418-design-tokens` → Draft PR #500 targeting `bluent-v3` only. No `Dev` merge or stable release.
