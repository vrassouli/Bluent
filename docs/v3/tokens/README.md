# #418 — Source → semantic → component token bridge, first design/implementation checkpoint

**Status:** In progress · **2026-10-11** · **not final v3 token API or release-ready**. [Epic #416](https://github.com/vrassouli/Bluent/issues/416) · [Accepted ADR #417](../architecture/ADR-0001-styling-boundaries.md) · [Issue #418](https://github.com/vrassouli/Bluent/issues/418).

## Real design location and scope

- Authoritative working file (not Microsoft Fluent Community): **`Bluent v3 Design System`**, Penpot file ID `b64f6665-c9ab-80b5-8008-c4ac99d9d000`.
- Native token-layer board: **`27 · v3 token architecture and themes · #418`**, page ID `acf5f619-7d81-80da-8008-c5cad7f94014`, main board ID `acf5f619-7d81-80da-8008-c5cb90d6963b`. Screen exported, inspected, and TextField example's visible border improved.
- Native 10-brand palette review: **`28 · Ten brands Light Dark matrix · #418`**, page ID `acf5f619-7d81-80da-8008-c5cce396e634`, main board ID `acf5f619-7d81-80da-8008-c5cce3bd4593`. Board includes **ten named source brands and 20 color swatches**, each from real emitted CSS. PNG exported and inspected. The preview board shows sourced colors, not individually bound/active 20 Penpot brand themes.
- Penpot named recovery version at **observed revision 174**: `Bluent v3 · #418 native token layers and Light Dark aliases 2026-10-11`, saved after the native 48-token layer construction. The ten-brand page was authored and exported **after** this recovery version; it will require a subsequent saved version/readback while the browser plugin is awake.
- Earlier #419 Penpot library remains separate: its **seven draft sets (49 tokens)** and imported read-only Fluent kit were **not overwritten**. #418 **added six new TokenSets** (48 additional tokens; **97 combined** at this checkpoint). #419 source reference remains read-only and its Review PR has not been merged.

### Native additive #418 TokenSets

| Penpot set | ID | Native tokens |
| --- | --- | ---: |
| `bluent-v3/418/source/light` | `acf5f619-7d81-80da-8008-c5cb4da01659` | 5 |
| `bluent-v3/418/source/dark` | `acf5f619-7d81-80da-8008-c5cb4e0375d0` | 5 |
| `bluent-v3/418/semantic/light` | `acf5f619-7d81-80da-8008-c5cad804962a` | 11 |
| `bluent-v3/418/semantic/dark` | `acf5f619-7d81-80da-8008-c5cb4e03942e` | 11 |
| `bluent-v3/418/component/light` | `acf5f619-7d81-80da-8008-c5cb4da21fea` | 8 |
| `bluent-v3/418/component/dark` | `acf5f619-7d81-80da-8008-c5cb4e03faa3` | 8 |

Each set is included in the matching existing `Bluent v3 / Mode` **Light · Draft / Dark · Draft** theme. The existing default-brand color tokens still supply five source names per mode; #418 adds five more: **onBrand**, accessible stroke, danger foreground, foreground disabled and disabled background, all from existing emitted CSS.

Penpot **real design aliases** use `{bluent.color.brandBackground}` → `{bluent.semantic.action.background}` → component-specific names, **not manually duplicated hex strings**. Actual Penpot theme-switch readback verified **48/48 resolved tokens**, zero unresolved aliases, including `bluent.component.button.backgroundPrimary` resolving to **#1267B4 in Light** and **#18599B in Dark**, and accessible text-field stroke and danger badge colors. Initial #418 presentation board has a token-bound Light specimen, and a literal Dark preview clearly identified as a source-derived static snapshot.

## Source-backed code artifact, opt-in only

[Versioned preview schema](issue-418-token-schema.preview.json) is the explicit crosswalk for the following three layers:

1. **Source:** ten logical tokens per mode — actual existing CSS variables (`--colorNeutralBackground1`, `--colorBrandBackground`, `--colorNeutralStrokeAccessible`, `--colorStatusDangerForeground1`, etc.). Existing #419 Penpot sets contain five of these; the new #418 source sets add five.
2. **Semantic:** eleven aliases such as `--bui-v3-action-background`, `--bui-v3-surface-default`, `--bui-v3-border-strong`, `--bui-v3-text-disabled`. Designed to express purpose rather than a particular color.
3. **Component:** eight aliases such as `--bui-v3-button-background-primary`, `--bui-v3-text-field-stroke`, `--bui-v3-checkbox-checked-fill`, `--bui-v3-switch-checked-track`. These names are **proposals**, not committed API names or exhaustive production component states.

Run from repo root:

```powershell
python scripts/quality/generate_v3_token_preview.py
python scripts/quality/generate_v3_token_preview.py --check
python scripts/quality/probe_v3_token_preview.py
```

[Generator](../../../scripts/quality/generate_v3_token_preview.py) validates existing **20 emitted brand/mode source files**, resolves all 29 logical tokens per combination, rejects missing/conflicting source declarations, forward/cyclic aliases and schema drift. It writes [the deterministic 10×2 source-color matrix](issue-418-brand-matrix.preview.json) and [the opt-in CSS bridge](issue-418-opt-in.preview.css) under `docs/v3/tokens`.

**Important D1 safety:** The CSS is **not included in `bundleconfig.json`, the current static-asset CSS or NuGet release** and never defines or overwrites a preexisting `--color*`, `--spacing*`, `--fui-*` variable. The new aliases exist *only* under `[data-bui-v3-tokens][data-bui-theme]` and descendant `[data-bui-theme]` scopes **when a consumer explicitly includes this research CSS file**.

A [real Chromium computed-style probe](../../../scripts/quality/probe_v3_token_preview.py) uses all **10 actual brand theme files × 2 modes** with the generated opt-in CSS. It verified **100/100 assertions, 0 failures** for Button background/text/border and disabled foreground/background. This is measurable stylesheet interoperability, **not a claim of actual Button Blazor behavior** or WCAG AA compliance.

## Still required before #418 Review

- **Penpot:** final live layer readback/saved version after 10-brand matrix, source→alias schema comparison and designed **true native ten-brand theme switching**. Current matrix is static/visual for brands other than default; do not falsely count it as 20 active Penpot themes.
- **Full token coverage:** typography stacks for Windows/macOS/Persian (Segoe UI vs Inter, Noto Sans Arabic candidate), density, elevation, corners, high contrast/forced-colors, motion/reduced-motion and true RTL/LTR logical dimensions. The 48 color token specimens are only the first independently checked slice; #419 has earlier draft spacing/typography/motion sets.
- **Portal and nested theme ownership:** D2's real Dialog/Popover host-context behavior remains unimplemented; token aliasing alone does not move a DOM portal into its correct Theme ancestry.
- **Actual component consumption:** the CSS is deliberately opt-in research and not yet imported by final Blazor v3 component code. Test real disabled/focus/error/hover, modes, SSR, keyboard, zoom and screen readers, with nonbreaking CSS variable precedence.
- **Quality & migration:** full browser/reflow/forced-colors evidence, documentation/Skills, exhaustive demo, build/pack/SSR validations and [#424](https://github.com/vrassouli/Bluent/issues/424) migration notes before Review/Done. #419 Penpot PR remains under separate acceptance review.

**Isolation:** work on branch `v3/issue-418-design-tokens` based on `bluent-v3`; stable `Dev` and published NuGet untouched. The architecture D1–D5 is accepted; the *exact v3 token vocabulary and complete brand themes have not yet been approved*.
