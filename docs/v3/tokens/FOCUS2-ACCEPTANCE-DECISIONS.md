# #418 — Focus2 design token acceptance decision record (DRAFT)

**2026-10-13 · Reviewer decision required, not an accepted public API.** Epic #416, opt-in research [PR #500](https://github.com/vrassouli/Bluent/pull/500), native Button design [#501](https://github.com/vrassouli/Bluent/issues/501). The shipped version 2.x and its CSS are unaffected.

## What is proven

| Subject | Actual repeatable evidence |
| --- | --- |
| Source candidate across existing 10 brands and Light/Dark | Emitted theme CSS contains `--colorStrokeFocus2`: black Light, white Dark. Browser-computed contrast against corresponding neutral focus hosts meets 3:1 for tested pairings, minimum **14.548:1**. This is a numerical comparison of particular opaque colors, not general WCAG conformance. |
| Existing proposed brand Focus alias | `--bui-v3-border-focus: var(--colorBrandBackground)`, preserved in draft for compatibility; Dark brand rings had **1.94–2.15:1** vs nearby host, inadequate as the sole tested keyboard ring. |
| Actual alias chain used by opt-in demo | `--colorStrokeFocus2` → `--bui-v3-focus-ring-strong-candidate` → `--bui-v3-button-focus-outer-candidate`. Generator 35 logical aliases × 20 brand-mode hosts; **200/200** real computed Chromium style assertions, 22/22 Python v3 tests and 585/585 live Chrome Blazor/WASM assertions on the synchronized demo asset. |
| Native Button design | Correct project-owned Penpot file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, page 38 `535db143-a732-807e-8008-c64d2fb91b9a`; actual ten Appearance×Focus variants and separate Danger family. Six enabled variants have **12 token-bound outer/gap stroke properties**. Actual Dark 6/6 white outer and neutral-dark gap; Light 6/6 black outer and neutral-light gap; 71/71 additional Light native assertions. Confirmed return to `Light · Draft` default. |
| Stroke and layout | 2px outer, 1px canvas-colored inner contrast gap, symmetric 3px/1px offsets from **real face** not oversized specimen wrapper; relative stacking fixes actual lower ring stroke covered by adjacent row in the opt-in browser lab; no Button layout shift. |
| Accessible fallback | Forced-colors research uses system `Highlight` as painted outline and removes decorative box shadow. Separate keyboard focus-visible and source-owned Split independent inset targets have real browser probes. |
| CI / packaging | Chrome/Edge × WASM/InteractiveServer; token-contract; NuGet local package asset isolation are separately passing. No opt-in research CSS is bundled into stable UI NuGet. |

## Decisions to explicitly accept or revise

**D1 — Semantic source and naming.** Candidate uses existing Fluent-like `--colorStrokeFocus2` as the accessible outer ring across all 20 tested brand/modes; neutral dark gets white, light gets black. **Accept or revise** before removing the suffix `-candidate` or integrating the token in a production Button selector. Names in this document are *experiment names*, not public contract. Retain the existing brand-focus variable for backward compatibility. If a differentiated focus ring is desired on colored/translucent surfaces, specify separate source/semantic roles and test those backgrounds before adoption.

**D2 — Two-stroke geometry and pointer/keyboard semantics.** Proposed separate 2px outer + 1px contrast gap, outer at 1px outline-offset and shadow gap painted without changing Button box dimensions. Only `:focus-visible` should show keyboard ring, and Disabled must not show a misleading keyboard focus specimen. For Split/adjacent buttons, a separately approved inset variant is required to avoid obscuring the sibling button. **Accept or revise** as the v3 Focus primitive, not an unconditional global CSS change.

**D3 — Forced colors and color roles.** Under actual OS forced-colors mode, the focus ring should paint with a valid **system color** such as `Highlight` and must not rely on nonpainted box shadows. Browser emulation has been tested; real Windows high contrast and assistive-technology review remains a separate user acceptance gate. **Accept or revise** system-color and contrast-gap mapping.

**D4 — Scope and compatibility.** Current work stays **opt-in research**, has no breaking v2 CSS/API changes, and is outside the released NuGet. `#428` owns the final production Button rewrite, exhaustive demo, Toggled `aria-pressed` semantics and migration. **Accept or revise** whether #418 may become a reusable v3 token contract before #428 is promoted through Backlog → Ready.

## Guardrails and remaining tests

- Do not equate numerical contrast ratios or emulated `forced-colors`/CDP zoom to native OS/screen-reader WCAG certification. Final AT and real browser UI zoom/reflow acceptance remains explicit.
- No public token names, final Persian font or style API change are approved merely because draft CI is green.
- No changes to `Dev`, any released v2.x NuGet, or protection rules; any merge within the project must target `bluent-v3`, and the epic final release requires its own explicit approval.
- When the reviewer approves the decisions, update the canonical token schema, demo/Skill/migration contract and #418/PR before advancing to Review or promoting names to public API.

**Reviewer response requested:** approve or propose edits to **D1 / D2 / D3 / D4**. Technical implementation can then be moved out of draft research under the correct v3 task branch.

## Direct interactive review (2026-10-13)

Open the **WebAssembly demo on Dev01** at `http://127.0.0.1:5080/v3/styling-lab` **while the local demo host is running** (not a published public URL). Scroll to the Persian section headed `پیش‌نمایش آزمایشی Focus دکمه‌ها — #418 / #501`. Three actual Bluent buttons now switch the preview on the real Button appearance matrix:

- **فعلی (رنگ برند)** — existing default candidate, no experimental Focus2 opt-in.
- **Focus2 ساده** — source-backed high-contrast single outline candidate.
- **Focus2 دولایه (پیشنهادی)** — separate 2px outer ring and canvas-colored 1px inner gap with corrected symmetric face offsets and overlap z-index.

Choose a preview, use **Tab** (not only pointer click) to keyboard-focus the six appearance buttons, then use top-level **Switch to dark/light** and **Switch to RTL/LTR** to compare. A live status sentence identifies the chosen preview. These controls are an opt-in demo affordance, *not* a public shipping Button property or token approval. The keyboard reviewer selection itself is exercised by the real Chromium CDP test and reset to baseline before the existing focus/browser matrix.

**Direct test evidence:** Dev01 Debug WASM host was built with **0 warnings / 0 errors**; the actual Chromium real-Blazor CDP suite including four newly added clickable selector checks passed **589/589** with 0 failures. This proves that the Lab selector swaps experimental DOM attributes via a real Blazor render without disturbing existing browser tests; it does **not** approve the final token names or prove actual native OS/screen-reader behavior.
