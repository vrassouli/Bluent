# #418 — High contrast, system colors and reduced-motion design acceptance

> **Design-only policy; not tested native OS high contrast or Blazor runtime.**
> Native Penpot source of truth: `Bluent v3 Design System` (file ID `b64f6665-c9ab-80b5-8008-c4ac99d9d000`), editable page `32 · High contrast and reduced motion policy · #418` (ID `acf5f619-7d81-80da-8008-c5ef1089ac94`), board `#418 · Forced colors and motion acceptance contract` (ID `acf5f619-7d81-80da-8008-c5ef2f9a3158`). PNG was exported and **visually inspected**. Named recovery version `Bluent v3 · #418 opt-in scope and accessible motion rules 2026-10-11` at observed revision **223**, **33 pages**, 38 native token sets.

## Browser-verified scope (separate from the design board)

The new [computed-style nested-theme probe](../../../scripts/quality/probe_v3_token_nested_theme_scope.py) loads **real emitted Light and Dark CSS for each of ten brands**, plus the separate opt-in #418 preview bridge. It checks **10 expectations per brand**, with actual Chrome getComputedStyle:
- non-opted-in normal and Dark subtrees have no v3 alias (fallback is used);
- an opt-in Light host resolves its action colors from the correct legacy Light source;
- a nested Dark section resolves a different Dark Brand color;
- a re-nested Light section restores Light values;
- the existing `--colorBrandBackground` still resolves correctly in the Light and Dark hosts.

**Verified 100/100, 0 failures** in ten brands. The separate previous browser probe still passes **140/140** across 20 individual brand/mode sets. The opt-in CSS is not imported into public Bluent 2.x bundles or NuGet, so this is a strict non-release preview.

**These tests do NOT validate a global Dialog/Popover portal outside the ancestor DOM**, because D2 still requires a concrete theme-host propagation strategy. They also do not exercise native OS forced-colors, actual user focus, keyboard, assistive technologies, RTL caret/order or reduced-motion runtime animations.

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

This file records an **acceptance specification and limited real DOM-regression evidence**, not implementation completion. #418 remains **In progress**, [PR #500](https://github.com/vrassouli/Bluent/pull/500) **Draft**, target `bluent-v3`.