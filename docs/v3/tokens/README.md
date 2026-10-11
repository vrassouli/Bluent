# #418 — Source → semantic → component token bridge, first design/implementation checkpoint

**Status:** In progress · **2026-10-11** · **not final v3 token API or release-ready**. [Epic #416](https://github.com/vrassouli/Bluent/issues/416) · [Accepted ADR #417](../architecture/ADR-0001-styling-boundaries.md) · [Issue #418](https://github.com/vrassouli/Bluent/issues/418).

## Real design location and scope

- Authoritative working file (not Microsoft Fluent Community): **`Bluent v3 Design System`**, Penpot file ID `b64f6665-c9ab-80b5-8008-c4ac99d9d000`.
- Native token-layer board: **`27 · v3 token architecture and themes · #418`**, page ID `acf5f619-7d81-80da-8008-c5cad7f94014`, main board ID `acf5f619-7d81-80da-8008-c5cb90d6963b`. Screen exported, inspected, and TextField example's visible border improved.
- Native 10-brand palette review: **`28 · Ten brands Light Dark matrix · #418`**, page ID `acf5f619-7d81-80da-8008-c5cce396e634`, main board ID `acf5f619-7d81-80da-8008-c5cce3bd4593`. Board includes **ten named source brands and 20 color swatches**, each from real emitted CSS. PNG exported and inspected. The preview board shows sourced colors, not individually bound/active 20 Penpot brand themes.
- The latest **named recovery version**, observed revision **217**, is `Bluent v3 · #418 20 brand themes and Danger contrast proposal 2026-10-11`. It includes **four #418 design pages** (27–30), source-backed 10-brand theme switching and an independent Danger text contrast candidate board. The static swatch matrix was independently audited (**60 checks, zero errors**), and the **20 genuinely selectable native brand-mode themes** were switched live (**80/80 component-token assertions, zero errors**).
- Earlier #419 Penpot library remains separate: its **seven draft sets (49 tokens)** and imported read-only Fluent kit were **not overwritten**. #418 first added **six default Light/Dark TokenSets (48 tokens)**, then **20 native brand-palette source sets (4 tokens each) plus two shared brand-preview semantic/component sets (4 each)**. A further **two isolated accessibility research sets (two tokens per mode)** bring the design file to **37 total sets / 189 tokens / 22 themes**. The original #419 library PR remains in Review.

### Native 10-brand switching preview

- **Actual native Theme group:** `Bluent v3 / Brand×Mode (Preview)`, 20 options (`default / light`, `default / dark`, `excel / light`, ... `word / dark`), each linking its own source TokenSet plus **shared** `bluent-v3/418/brand-preview/semantic` and `bluent-v3/418/brand-preview/component` sets.
- The 20 new source sets contain **four unique token names each**: `bluent.preview.source.surface`, `bluent.preview.source.foreground`, `bluent.preview.source.brandBackground`, `bluent.preview.source.onBrand`. Shared semantic and component sets contain **4 aliased tokens each**. These use a **separate experiment namespace** so they do not override #419's existing source tokens or falsely finalize the production alias names.
- **Real bound preview board** on `29 · Live brand theme switching · #418`: Penpot page `acf5f619-7d81-80da-8008-c5d06084d4c6`, board `acf5f619-7d81-80da-8008-c5d0608ab738`. The Button fill/label and TextField surface/text have **native Penpot Token binding**. The preview was PNG-reviewed in Default/Light and **Excel/Dark**; after the next Penpot read, actual shape fills updated to `#146938` Button and `#292929` TextField surface, proving this is not just a static swatch.
- **Live theme switching:** [repeatable script](../../../scripts/quality/penpot_v3_native_brand_theme_audit.js) tested all **20 themes × four actual component alias values = 80 checks / zero failures**. It restores `default / light` and `Light · Draft` when finished.
- **Important limitation:** Penpot has **two separate theme groups**: the Brand×Mode source palette and the original neutral/global Mode. The designer must select matching Light/Dark modes; this is a prototype of brand+mode resolution, **not an implemented automatic synchronized theme picker in Blazor**. The static 10-brand board remains useful for side-by-side palette comparison.

### Text contrast candidate and design evidence

A **real source-color defect candidate** was detected for ordinary Danger text on the neutral dark surface: existing `--colorStatusDangerForeground1` `#DC626D` vs `#292929` gives **4.164:1** in **all ten Dark brands**, while the existing `--colorPaletteRedForeground1` `#E37D80` gives **5.204:1**. In Light, the respective ratios are **7.121:1** and **5.848:1**. This is a *specific numerical pairing*, not a declaration that every use of the old Danger variable fails WCAG.

- [Editable Penpot contrast board](CONTRAST-AUDIT.md): page `30 · Danger text contrast comparison · #418` (`acf5f619-7d81-80da-8008-c5ddd53bc436`), board `acf5f619-7d81-80da-8008-c5ddf5c26686`; exported PNG visually reviewed.
- Two new **separate a11y research TokenSets**, Light `acf5f619-7d81-80da-8008-c5ddd546a298` and Dark `acf5f619-7d81-80da-8008-c5ddd54c7980`, with two source-backed color values each; actual mode-readback audit **12/12 pass**.
- [Contrast scanner](../../../scripts/quality/audit_v3_token_preview_contrast.py): **20 modes × 4 numerical pairs = 80 checks**, confirms **10/10** legacy Dark Danger values below 4.5 and **0/20** candidate values below 4.5.
- Added **independent opt-in alias chain**, `--colorPaletteRedForeground1` → `--bui-v3-text-danger-accessible` → `--bui-v3-badge-danger-text-accessible`. Existing `--bui-v3-status-danger` and `--bui-v3-badge-danger-foreground` **remain untouched**; this does not change stable CSS or approve a final badge runtime API.

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

1. **Source:** eleven logical tokens per mode — actual existing CSS variables (`--colorNeutralBackground1`, `--colorBrandBackground`, `--colorNeutralStrokeAccessible`, `--colorStatusDangerForeground1`, etc.). Existing #419 Penpot sets contain five of these; the new #418 source sets add five.
2. **Semantic:** twelve aliases such as `--bui-v3-action-background`, `--bui-v3-surface-default`, `--bui-v3-border-strong`, `--bui-v3-text-disabled`. Designed to express purpose rather than a particular color.
3. **Component:** nine aliases such as `--bui-v3-button-background-primary`, `--bui-v3-text-field-stroke`, `--bui-v3-checkbox-checked-fill`, `--bui-v3-switch-checked-track`. These names are **proposals**, not committed API names or exhaustive production component states.

Run from repo root:

```powershell
python scripts/quality/generate_v3_token_preview.py
python scripts/quality/generate_v3_token_preview.py --check
python scripts/quality/probe_v3_token_preview.py
python scripts/quality/audit_v3_token_preview_contrast.py
```

[Generator](../../../scripts/quality/generate_v3_token_preview.py) validates existing **20 emitted brand/mode source files**, resolves all 32 logical tokens per combination, rejects missing/conflicting source declarations, forward/cyclic aliases and schema drift. It writes [the deterministic 10×2 source-color matrix](issue-418-brand-matrix.preview.json) and [the opt-in CSS bridge](issue-418-opt-in.preview.css) under `docs/v3/tokens`.

**Important D1 safety:** The CSS is **not included in `bundleconfig.json`, the current static-asset CSS or NuGet release** and never defines or overwrites a preexisting `--color*`, `--spacing*`, `--fui-*` variable. The new aliases exist *only* under `[data-bui-v3-tokens][data-bui-theme]` and descendant `[data-bui-theme]` scopes **when a consumer explicitly includes this research CSS file**.

A [real Chromium computed-style probe](../../../scripts/quality/probe_v3_token_preview.py) uses all **10 actual brand theme files × 2 modes** with the generated opt-in CSS. It verified **140/140 assertions, 0 failures** for Button background/text/border, disabled foreground/background and the new opt-in accessible Danger text candidate. This is measurable stylesheet interoperability, **not a claim of actual Button Blazor behavior** or WCAG AA compliance.

## Still required before #418 Review

- **Penpot:** repeat the [default-mode native alias audit](../../../scripts/quality/penpot_v3_token_alias_audit.js) (**48/48 passed**), [static palette source audit](../../../scripts/quality/penpot_v3_brand_matrix_audit.js) (**60/60 passed**) and [true native brand theme-switch audit](../../../scripts/quality/penpot_v3_native_brand_theme_audit.js) (**80/80 passed**, observed revision 193). The selected Brand×Mode palette group requires **matching the separate base Mode Light/Dark selection**. Neither these proofs nor native Penpot preview names approve all runtime semantic aliases.
- **Full token coverage:** typography stacks for Windows/macOS/Persian (Segoe UI vs Inter, Noto Sans Arabic candidate), density, elevation, corners, high contrast/forced-colors, motion/reduced-motion and true RTL/LTR logical dimensions. The 48 color token specimens are only the first independently checked slice; #419 has earlier draft spacing/typography/motion sets.
- **Portal and nested theme ownership:** D2's real Dialog/Popover host-context behavior remains unimplemented; token aliasing alone does not move a DOM portal into its correct Theme ancestry.
- **Actual component consumption:** the CSS is deliberately opt-in research and not yet imported by final Blazor v3 component code. Test real disabled/focus/error/hover, modes, SSR, keyboard, zoom and screen readers, with nonbreaking CSS variable precedence.
- **Quality & migration:** full browser/reflow/forced-colors evidence, documentation/Skills, exhaustive demo, build/pack/SSR validations and [#424](https://github.com/vrassouli/Bluent/issues/424) migration notes before Review/Done. #419 Penpot PR remains under separate acceptance review.

**Isolation:** work on branch `v3/issue-418-design-tokens` based on `bluent-v3`; stable `Dev` and published NuGet untouched. The architecture D1–D5 is accepted; the *exact v3 token vocabulary and complete brand themes have not yet been approved*.