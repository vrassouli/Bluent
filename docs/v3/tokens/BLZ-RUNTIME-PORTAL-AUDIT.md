> **2026-10-11 latest implementation checkpoint:** The original D2/D5 failure observations below are **historical pre-fix baselines**. An additive opt-in runtime prototype now transfers a per-item mode/direction/density snapshot into both global Dialog and Popover. The current [prototype guide](PORTAL-THEME-SCOPE-PREVIEW.md) records **82/82 actual Chrome/Blazor assertions** and **26/26 NUnit tests**, including real multi-host isolation, reduced motion and unscoped v2 fallback. The final API and independent brand scopes are NOT approved. The prior "still-unfixed" statements below refer to the **unscoped baseline and earlier commits**, not the current opted-in demo.
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

**Initial 9/9 real Blazor WebAssembly Chrome/CDP checks passed:** existing Button and CSS loaded; real TextField background/border read; interactive Light→Dark and LTR→RTL; reduced-motion `0s` on real Overlay; 150ms no-preference token via explicit media emulation; live forced-colors `ButtonFace` and `Highlight` roles; injected keyboard Tab produced `:focus-visible` with 2px outline; and detached service Dialog ownership defect reproduced. **The last check passes by detecting the bug, not by fixing it.** The Dialog wrapper was outside the opted-in subtree and inherited Light while the page was Dark. A subsequent revision added a real triggered Popover and reproduced **the same unfixed D2 scope defect**: it renders in the global Light layout instead of its initiating Dark subtree.

Published **SSR Production static-asset smoke 4/4**: page, package CSS, demo research CSS and Blazor script all HTTP 200 with content-type checks. This is not interactive SSR validation.

The standalone WASM Release index intentionally uses GitHub Pages `/Bluent/` as its base, so launching Release at local root produces 404s. The automated interactive probe deliberately runs the **Debug** host with base `/`; no public release/index configuration was modified.

## Remaining acceptance gates

Review and approve D2 theme-host ownership semantics and #420 API boundaries before modifying service/container APIs. Prove real Dialog **and Popover** propagation, independently nested hosts, SSR fallback, ten brands × two modes, real OS high contrast, screen readers, Persian metrics, zoom/reflow, mobile and cross-browser behavior. This nine-check test is narrowly scoped and cannot establish Fluent/WCAG parity.

**Branch:** `v3/issue-418-design-tokens` → Draft PR #500 targeting `bluent-v3` only. No `Dev` merge or stable release.


## Expanded live browser matrix (2026-10-11)
The same executable Chrome/CDP test now passes **74/74 assertions**: 10 shipped brand stylesheets x Light/Dark (20 real Blazor primary Button computed colors), 20 explicit root-token isolation checks, 20 computed Button white-on-brand numeric contrast pairs (minimum **5.552:1**, restricted to opaque primary Button text), plus 14 runtime assertions including both **expected-unfixed** D2 Dialog and Popover findings, compact density actual height 40px → 32px, 390px RTL lab no horizontal overflow, keyboard Tab focus, forced-colors aliases and reduced motion. The test swaps the stylesheet in the *temporary browser tab*, so **simultaneous multi-brand host isolation is not demonstrated**. Use BLUENT_V3_PROBE_VERBOSE=1 for individual assertion detail.
The explicit **[proposed theme ownership contract](PORTAL-THEME-OWNERSHIP-PROPOSAL.md)** documents why inheriting or copying the last-click DOM theme is unsafe, and how scoped host context should be handed to each service portal without touching global roots. It is not yet accepted or implemented.

### D5 detached portal motion regression
The live Chrome probe explicitly enables prefers-reduced-motion: reduce **while the global Popover and Dialog are open**, reads computed transition/animation durations and confirms that both are still **nonzero**. These extra two assertions pass by **reproducing the accessibility gap**, not by certifying or correcting it. The v3 opt-in local Overlay does correctly report 0s in the same run; its policy does not automatically cross the global service-host boundary. Future portal-owner implementation must address both style scope and motion.
