# #418 — High contrast, system colors and reduced-motion design acceptance

> **Current evidence (2026-11-10):** A real Windows 11 Desert Contrast Theme run and opt-in Blazor portal/reduced-motion browser checks are now recorded below. They validate only those preview hosts; they do not approve public token mappings, a released component contract, or spoken screen-reader behavior.
> Native Penpot source of truth: `Bluent v3 Design System` (file ID `b64f6665-c9ab-80b5-8008-c4ac99d9d000`), editable page `32 · High contrast and reduced motion policy · #418` (ID `acf5f619-7d81-80da-8008-c5ef1089ac94`), board `#418 · Forced colors and motion acceptance contract` (ID `acf5f619-7d81-80da-8008-c5ef2f9a3158`). PNG was exported and **visually inspected**. Named recovery version `Bluent v3 · #418 opt-in scope and accessible motion rules 2026-10-11` at observed revision **223**, **33 pages**, 38 native token sets.



## 2026-11-01 — actual Windows 11 Contrast Theme validation

A real Windows 11 Pro **Desert** Contrast Theme was applied while running the #418 Styling Lab in Interactive Server (not merely DevTools emulation). The Windows High Contrast API reported the feature enabled and Edge reported `matchMedia('(forced-colors: active)') === true`.

- The live Light/Dark switch and LTR/RTL direction switch were exercised while forced colors remained active; all four combinations retained the OS palette.
- Keyboard focus remained visible with a **2px system `Highlight`** outline.
- The Popover opened; Escape closed it and restored focus to its trigger.
- In the actual Desert palette, surface text measured **10.43:1** and primary action text **15.65:1** against their backgrounds.

**Scope:** this is real OS Contrast Theme plus browser/computed-style evidence for the #418 Styling Lab only. It does not accept the draft token mappings or Penpot semantic design, certify every component/brand combination, or record spoken Narrator/NVDA output. The token and public API review remains open.

## Opt-in portal and reduced-motion runtime evidence

The later [portal theme-scope prototype](PORTAL-THEME-SCOPE-PREVIEW.md) extends the earlier CSS-only nested-scope checks. Its real Blazor Chrome probe covers concurrent opposite-mode Dialogs, nested independent Popovers, a live Popover theme change, an unscoped legacy Dialog, scoped Dialog close/removal, forced-colors role propagation without leakage and **0s motion** in the opted-in scoped transition. It passes **126/126** in WebAssembly and separately **126/126** in Production-published InteractiveServer; its NUnit contract suite passes **40/40**. The concurrent multi-brand scenario and two portal hosts are documented in [BRAND-SCOPES-PREVIEW.md](BRAND-SCOPES-PREVIEW.md).

This evidence is limited to the opt-in prototype and its Styling Lab host. It does not make the prototype a public API or demonstrate that every legacy/global Overlay transition honors reduced motion. The previously observed approximately 0.25s legacy Overlay transition remains a separate compatibility risk until a scoped product-wide policy is accepted and verified.

## Browser-verified scope (separate from the design board)

The new [computed-style nested-theme probe](../../../scripts/quality/probe_v3_token_nested_theme_scope.py) loads **real emitted Light and Dark CSS for each of ten brands**, plus the separate opt-in #418 preview bridge. It checks **10 expectations per brand**, with actual Chrome getComputedStyle:
- non-opted-in normal and Dark subtrees have no v3 alias (fallback is used);
- an opt-in Light host resolves its action colors from the correct legacy Light source;
- a nested Dark section resolves a different Dark Brand color;
- a re-nested Light section restores Light values;
- the existing `--colorBrandBackground` still resolves correctly in the Light and Dark hosts.

**Verified 100/100, 0 failures** in ten brands. The separate previous browser probe still passes **140/140** across 20 individual brand/mode sets. The opt-in CSS is not imported into public Bluent 2.x bundles or NuGet, so this is a strict non-release preview.

**This particular nested-scope CSS probe does NOT validate a global Dialog/Popover portal outside the ancestor DOM**, because D2 needs a governed theme-host strategy. Native OS Contrast Theme, actual keyboard focus and portal behavior are covered only by the separate, narrowly scoped evidence above; this CSS probe itself does not exercise assistive-technology speech or RTL caret/order.

## Native editable policy board (three design columns)

| Design concept | Visually documented draft | Runtime acceptance gate still required |
| --- | --- | --- |
| Normal Light/Dark | Current brand Button shape/label and semantic role | 10 Brand × Light/Dark CSS values, focus-visible and theme inheritance within app host |
| Forced colors | System palette illustration and labels: `Canvas`, `CanvasText`, `Highlight`, `HighlightText`, `ButtonText`, `GrayText` | Native `forced-colors: active` browser/OS tests and system-color-based borders, focus/disabled indicators; **illustrative swatch is not a screenshot or guaranteed system palette** |
| Reduced motion | A static Button example and explicit decorative animation policy | Native `prefers-reduced-motion: reduce` test on the real Overlay/Dialog, with zero/minimal decorative fades and preserved state feedback |

The board is a **native editable local Penpot document**, not an invented finished token implementation or an actual functioning interaction. Existing #419 and #418 source tokens and the imported reference library were not modified by this policy board.

## Next engineering gates before #418 Review

1. **Fonts:** actual Windows/macOS/mobile UI families; Segoe UI reference versus locally rendered Inter, Persian fallback and weight/line-height/IME behavior. Never package third-party proprietary fonts without appropriate rights.
2. **Forced colors:** create a real opt-in component runtime host and verify system-color roles and visible `:focus-visible` in a browser running forced colors. Avoid hardcoded palette pictures as acceptance.
3. **Reduced motion:** test real Blazor Overlay/Popover/Dialog transitions under reduced motion. Prior #417 observation: legacy Overlay still has a 0.25s animation.
4. **Portal theme:** owned host/theme ancestry and CSS alias propagation across isolated/nested themes, including real interactive Dialog markup.
5. **Scoped token compatibility:** keep legacy CSS untouched, D1–D5 ADR accepted, no global `@layer` default, opt-in path and browser rollback available, and separate stable `Dev`/NuGet release unaffected.

This file records an **acceptance specification plus scoped real OS and Blazor preview evidence**, not implementation completion. As of 2026-11-11, #418 is **Review** in GitHub Project #5 and [PR #500](https://github.com/vrassouli/Bluent/pull/500) is **open, non-draft and mergeable** against `bluent-v3`; exact-head CI on `fe991e92` is green (11/11 workflows). The Penpot design and public token decision remain under review.
