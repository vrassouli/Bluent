# #418 · Existing typography token and error-state research

**Update 2026-10-15:** The formerly unavailable native editable
Persian/Latin research board now EXISTS in the correct Penpot Bluent v3
Design System file: page 42
(e775e67c-d9da-804b-8008-cb84059cbdab), board
(e775e67c-d9da-804b-8008-cb8405b790a5).
It was exported and visually reviewed; eight size-token bindings pass.
This resolves the *missing editable board* subtask, NOT the human approval
of the final font stack, glyph shaping, native OS Contrast Themes or AT.
See [the updated typography research evidence](PERSIAN-TYPOGRAPHY-RESEARCH.md).
An independent native Penpot font-family serialization defect also remains:
unquoted Segoe UI resolves to Segoe,UI; quoted multiword family resolves
correctly in an isolated experiment (which was removed after testing).
**This is not a runtime CSS issue; the existing CSS source correctly quotes
multiword family names.** Do not change the original #419 draft token
without review.


**Date:** 2026-10-11. **Status:** measured source contract and opt-in browser research only, **not approved final font/token values**. The original Penpot accessibility decisions remain at file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, page `acf5f619-7d81-80da-8008-c5ef1089ac94`. A separate editable Persian typography page is **not yet available**: the connected Penpot tab was suspended and the authorized Figma fallback returned a Starter-plan MCP quota limitation.

**Decision 2026-10-16:** Keep the existing Segoe UI-first system-font
stack; do **not** bundle new fonts. Penpot's original draft multiword
family token has been corrected to the quoted value and verified as
resolving exactly Segoe UI. This fixes token serialization only; Persian
glyph optics, final fallback, native OS and AT still need acceptance.
See the linked Persian typography research evidence.

## Verifiable source typography inventory

Run `python scripts/quality/check_v3_typography_source_contract.py` from the existing Bluent root. This deliberately imports the **same strict CSS parser** used to generate #418's scoped-brand aliases, reading all 10 emitted source brands × 2 modes. The check currently passes with:

- **20 brand/mode combinations**, each with **17 existing typography variables** whose values are equal in every combination.
- The family stacks `--fontFamilyBase`, `--fontFamilyMonospace`, `--fontFamilyNumeric`; regular/semibold weights; six `--fontSizeBase100..600` sizes and six `--lineHeightBase100..600` heights.
- Current existing Button-size pair: `--fontSizeBase300: 14px`, `--lineHeightBase300: 20px`. Family stack begins with Segoe UI.
- There are **no source `Base700..1000` tokens** in these theme files; the validator intentionally does not invent them or count them as failures.
- Each source size/line-height is a length with a `px` unit, and each existing line height is at least the corresponding font size. This checks source consistency, **not actual glyph or Fluent typography parity**.

The browser evidence in [Persian typography research](PERSIAN-TYPOGRAPHY-RESEARCH.md) separately shows why one family stack does not guarantee identical Persian glyph fallback on every host; Tahoma was reported for a 50-glyph paragraph in the WebAssembly run, and Segoe UI in the published InteractiveServer run on Dev01.

## Real accessible state examples and evidence

The opt-in `/v3/styling-lab` now includes:

- A real natively disabled Bluent `Button` with an ID for automated inspection: the DOM disabled flag is set and invoking its native `focus()` cannot focus it.
- A labeled Persian `TextField` with `aria-invalid="true"`, `aria-describedby` pointing to a separate visible description, and source-backed danger border/foreground styles scoped **only inside the v3 research page**.
- In simulated forced-colors, the invalid state remains semantically exposed and the error border uses the system `CanvasText` color in the research CSS. This is a CSS/system-color smoke, **not** validation of native High Contrast or assistive-technology announcements.

The updated Chrome/CDP test passes **144/144 in both actual WebAssembly and published InteractiveServer**. The same expanded 144-check suite was also rerun in **Microsoft Edge 144/144 on both hosts**, making four separate executions (Chrome WASM, Chrome InteractiveServer, Edge WASM, Edge InteractiveServer). Edge and Chrome share Chromium: this is NOT Firefox/Safari/native OS proof. Results use CSS computed styles and semantic DOM, not screenshots.

## Remaining formal acceptance gates

- The editable Persian/Latin typography board has been authored, exported and inspected in the **correct Penpot file**. Still required: explicitly approve the fallback-family policy, resolve the native multiword font-token formatting defect, review optical glyph/shaping and line heights on actual systems, and accept the typography scale without assuming preview fonts are runtime fonts or redistributing files.
- Accessibility evaluation on actual devices, including screen-reader error descriptions, forced-color native OS rendering, focus navigation across real overlays, optical glyph baseline, 200/400% text and zoom across complete applications.
- Component-specific invalid/disabled/focus/hover visuals and design approval, real cross-engine browsers, and a migration/Skills contract. The scoped demo error styles are **not** an approved public TextField API or shipped CSS.
- PR #500 remains Draft targeting `bluent-v3`; do not merge v3 work to `Dev` or publish the stable NuGet package.
