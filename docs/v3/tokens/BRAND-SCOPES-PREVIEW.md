# #418 · Concurrent source-brand scopes (research-only)

**Date:** 2026-10-11. **Status:** implemented as an opt-in browser and Blazor prototype; final v3 API and design approval are still pending. [Issue #418](https://github.com/vrassouli/Bluent/issues/418), Draft [PR #500](https://github.com/vrassouli/Bluent/pull/500) → `bluent-v3`.

## Correct design source

Editable **Bluent v3 Design System** in Penpot, file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`. Created a standalone editable `34 · Concurrent brand-scoped theme hosts · #418` page (`acf5f619-7d81-80da-8008-c60b3680e7e2`) and `#418 · Two brands, two modes, independent portals` board (`acf5f619-7d81-80da-8008-c60b36beac74`). It illustrates Excel/Light next to Word/Dark and two independent service-hosted portals. This is a *proposed design* and does not constitute approval of the final C# contract.

## Source/CSS strategy

The current emitted CSS for every brand/mode has **450 declared variables**; the source-backed `scripts/quality/generate_v3_scoped_brands.py` generator found **49 names that actually change across the ten brands within at least one mode**. The preview generator:

- Reads the existing `src/Bluent.UI/Styles/Themes/theme-{brand}-{light|dark}.css` source files rather than inventing palette values or scraping minified output.
- Rejects mode/selector mismatches, incompatible variable inventory and conflicting declarations; emits a deterministic **20-combination × 49-variable** override stylesheet (980 declarations, about 46 kB unminified).
- Uses the strictly opt-in selector `[data-bui-v3-tokens][data-bui-brand="<brand>"][data-bui-theme="<mode>"]`. Each one of the twenty combinations declares the **same complete union** of brand-sensitive variables so that a theme stylesheet for a *different* active document brand cannot leak values into a nested owner.
- Deliberately does not duplicate the other 401 brand-invariant variables. Those remain governed by the existing Light/Dark theme declarations, reducing drift while retaining existing Fluent CSS variables used in real components.
- Does not change generated production files, `bundleconfig.json`, current 2.x NuGet, `Dev`, or global stylesheet selection.

The preview output is `docs/v3/tokens/issue-418-brand-scopes.preview.css`. `scripts/quality/sync_v3_token_demo_asset.py` adds it to the **Demo.Pages-only** opt-in research CSS. Run:

```powershell
python scripts/quality/generate_v3_scoped_brands.py
python scripts/quality/generate_v3_scoped_brands.py --check
python scripts/quality/sync_v3_token_demo_asset.py --check
node scripts/quality/probe_v3_blazor_runtime.mjs
```

## Runtime model and ownership

The experimental `PortalThemeScope` constructor now optionally accepts `brand: "excel"` or any of the ten existing supported brand identifiers. Invalid brands throw `ArgumentOutOfRangeException`; omission leaves source brand inherited as before. The record still carries mode, direction, density and opt-in permission, and `Brand` contributes to immutable value equality.

The real Blazor lab uses **Excel / Light** as an explicitly branded main host, and **Word / Dark** as an independently branded nested host. Both use actual Bluent `Button`. Their service-hosted Popovers and Dialogs set `data-bui-brand` on the owned portal element, in addition to scoped mode/RTL/density. No global theme or DOM heuristics are used. An existing unscoped Dialog remains unmodified.

## Evidence and precise limits

**126/126 real Chrome/Blazor WASM checks passed** as of this checkpoint. This includes:

- 20 actual Button brand×Light/Dark source-palette samples with stylesheet switching;
- **another 20 checks** verifying the live Word nested Button retains *its own* Dark brand color as the document's active stylesheet changes to every other brand;
- **20 concurrent isolated-host combinations** where the nested brand/mode swaps while Excel/Light remains constant;
- 20 numeric contrast checks of primary opaque button foreground/background (minimum **5.552:1**, not blanket WCAG compliance);
- 20 checks that opt-in alias variables do not leak into the unscoped document root;
- remaining real Blazor assertions for mode/direction, owner propagation, two independent service-hosted Dialogs, Popover source-color inheritance, live brand reset/restoration, no-scope fallback, forced-colors roles and reduced motion, mobile and 200% text reflow.

**40/40 NUnit checks** pass, including brand allowed-list/validation tests. The 126 browser checks are narrow observable behavior, **not** native OS High Contrast, assistive technology, screen-reader, WCAG certification, full reflow or all interaction-state coverage. Runtime tests use 20 single-theme document swaps in one section **and concurrently different brands in two hosts** in another section; do not conflate these test types.

**Remaining:** final API/type naming and ownership approval, full 450-variable cross-layer contract sign-off, complete 10×2 visual parity, multiple independent applications beyond the tested Interactive Server probe, keyboard and accessibility testing on native devices, Persian typography, disabled/error/hover state coverage, full design-to-code review and migration/Skills before #418 is eligible for Review.

The experimental CSS is intentionally **not** a production or stable NuGet asset, and the issue must stay **In progress** until the full gate is satisfied.

## Published Interactive Server browser validation
The separate SSR interactive page /v3/interactive-portal-lab uses an actual Blazor InteractiveServer island with service Containers in the same circuit. A temporary published Release/Production host passed the full identical Chrome/CDP suite **126/126**, in addition to WASM **126/126**. See INTERACTIVE-SERVER-PROBE.md for exact reproduction, initial Development static-asset HTTP 500 isolation, and residual SSR/Auto/AT limitations.
