# #418 — Focus2 design token acceptance decision record (DRAFT)

**2026-10-13 · Reviewer decision required, not an accepted public API.** Epic #416, opt-in research [PR #500](https://github.com/vrassouli/Bluent/pull/500), native Button design [#501](https://github.com/vrassouli/Bluent/issues/501). The shipped version 2.x and its CSS are unaffected.

## 2026-10-13 explicit maintainer review — brand Button ring / underline-only TextField

The maintainer tested the interactive three-way preview and prefers the **existing brand-colored Button focus outline**, not either black/white Focus2 proposal. Brand focus remains the default; Focus2 simple and double-ring stay opt-in design experiments, **not a public default or approved production API**. Double-ring is relabeled Focus2 دولایه (آزمایشی), not پیشنهادی. The visual preference **does not resolve** the previously measured 1.94–2.15:1 ring/surface contrast in tested Dark brand modes; a brand-faithful accessible alternative must still be designed and approved before release.

The maintainer rejected the full rectangular focus outline around TextField because the actual library has an existing animated, brand-colored 2px bottom underline. The styling lab previously applied one focus rule to both Button and Field; it now applies the full ring **only to Buttons** and lets fields retain their native focus-within pseudo-element underline. In forced-colors the field underline receives OS Highlight, but no additional frame. Neither core Bluent Field styles nor released NuGet changed.

Real Chromium WASM tests measured normal Light, Dark and emulated Forced Colors: field outline-style none, fully extended underline transform, solid visible 2px bottom stroke, with 592/592 full browser assertions passing after the new state-changing field checks were moved to the end of the suite. Native OS/AT and final brand-dark contrast approval remain separate gates. D1/D2 below now concern the **unselected Focus2 research alternatives**, not the default visual direction.

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

**D1 — Semantic source and naming (unselected research alternative).** Candidate uses existing Fluent-like `--colorStrokeFocus2` as the accessible outer ring across all 20 tested brand/modes; neutral dark gets white, light gets black. **Accept or revise** before removing the suffix `-candidate` or integrating the token in a production Button selector. Names in this document are *experiment names*, not public contract. Retain the existing brand-focus variable for backward compatibility. If a differentiated focus ring is desired on colored/translucent surfaces, specify separate source/semantic roles and test those backgrounds before adoption.

**D2 — Two-stroke geometry and pointer/keyboard semantics (unselected research alternative).** Proposed separate 2px outer + 1px contrast gap, outer at 1px outline-offset and shadow gap painted without changing Button box dimensions. Only `:focus-visible` should show keyboard ring, and Disabled must not show a misleading keyboard focus specimen. For Split/adjacent buttons, a separately approved inset variant is required to avoid obscuring the sibling button. **Accept or revise** as the v3 Focus primitive, not an unconditional global CSS change.

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
- **Focus2 دولایه (آزمایشی)** — separate 2px outer ring and canvas-colored 1px inner gap with corrected symmetric face offsets and overlap z-index.

Choose a preview, use **Tab** (not only pointer click) to keyboard-focus the six appearance buttons, then use top-level **Switch to dark/light** and **Switch to RTL/LTR** to compare. A live status sentence identifies the chosen preview. These controls are an opt-in demo affordance, *not* a public shipping Button property or token approval. The keyboard reviewer selection itself is exercised by the real Chromium CDP test and reset to baseline before the existing focus/browser matrix.

**Direct test evidence:** Dev01 Debug WASM host was built with **0 warnings / 0 errors**; the actual Chromium real-Blazor CDP suite including four newly added clickable selector checks passed **589/589** with 0 failures. This proves that the Lab selector swaps experimental DOM attributes via a real Blazor render without disturbing existing browser tests; it does **not** approve the final token names or prove actual native OS/screen-reader behavior.

## 2026-10-13 Penpot page-07 three-way brand contrast review

With the canonical Penpot file connected, page 07 received selected underlines on existing LTR and RTL TextField specimens and an independent editable Light/Dark comparison board. The board directly contrasts the current Dark brand ring with existing Fluent compound-brand Dark focus stroke while preserving the accepted single-ring shape. Live Penpot audit **28/28**; exported PNG visually inspected. Separate source CSS audit checks all **10 brands x Light/Dark**, with the Dark neutral-host candidate meeting **3.55–3.89:1** versus current **1.94–2.15:1**. Both variants remain research until colors on filled/interactive surfaces and OS/AT are accepted. See [source-owned page-07 evidence](BRANDED-FOCUS-PENPOT-PAGE07-REVIEW.md).

## User-preferred brand focus: live alternative and known hover contrast gap (2026-10-13)

The real Blazor Styling Lab now has a fourth experimental selector for the SAME-brand brighter Dark focus treatment, using the emitted compound-brand stroke color. Current branded focus remains the default; neutral Focus2 remains a research alternative. The real browser probe passed 613/613, including 20 brand/mode computed CSS samples and five interactive selector modes. Source audit extension found a counterexample: in all ten Dark brand modes, NeutralBackground1Hover has only 2.65–2.91:1 with the candidate (versus 3.55–3.89:1 on ordinary NeutralBackground1). New Python tests and a real Penpot page-07 visual warning record this unresolved accessibility blocker. Do NOT approve the candidate as a universal Button style; actual filled/hover states, native OS and AT review remain required.

## 2026-10-13 stronger Dark brand hue research candidate (not public)

The fourth, optional real Blazor focus-preview selector was updated from the original compoundBrandStroke color to existing emitted colorBrandForeground2 in Dark only; Light and baseline remain unchanged. Across ten real brand themes, this source candidate has 4.294–4.689:1 on the neutral normal Dark host and 3.206–3.501:1 on the neutral Dark Hover host, while the earlier compoundBrandStroke candidate failed Hover. The source-owned Penpot page-07 board 94a03b1b-8cb6-8091-8008-c8efa7fd2435 compares both on a normal and hover host, exports visually and passes 22/22 native checks. Full Chrome/WASM Blazor regression 633/633. This does not approve universal focus behavior on colored or translucent surfaces or native OS/AT. See BRANDED-FOCUS-HOVER-CANDIDATE.md.

The comparison now has a separate focused-Button computed-outline audit: ten actual emitted brands × Light/Dark, 20 assertions with an actual keyboard :focus-visible target. The expanded local Chrome/WASM suite passed **653/653**; 20 extra assertions confirm source token role, computed outlineColor, stroke width and normal/Hover neutral-host ratios. This is not painted-pixel OS/AT certification, and final public token selection remains a reviewer decision.

**2026-10-14 focus host-surface review:** a single brand ring passes on the studied neutral hosts but fails on colored brand/danger surrounding containers; an inverse white source passes those colored hosts but fails in Dark inverted white hosts. Across 100 source-host cases the behavior is explicitly documented and guarded by five new tests. Two ACTUAL editable Penpot page-07 research boards were exported/visually reviewed and six rings have exact #501 symmetric vector geometry. Real Chrome/WASM six-appearance browser regression: 673/673 pass. No public focus token approved. See [focus host-context evidence](FOCUS-HOST-CONTEXT-REVIEW.md).

2026-10-14 mounted-host evidence: Actual keyboard-focused Bluent Button host backgrounds were switched among emitted Brand, BrandHover, Danger and Inverted roles for all ten brands in Light/Dark; **80 new real Chromium CSS observations** reproduced **70 selected-branded ring shortfalls** and **10 inverse Dark-inverted failures**. Complete Chrome/WASM lab suite: **753/753 passed**, zero failures, with the known failures asserted as research findings (not waived as conformant). See [focus host-context evidence](FOCUS-HOST-CONTEXT-REVIEW.md). The two actual Penpot board PNGs were inspected and six symmetric ring geometry values directly read back, but the combined live audit is pending a waking Penpot tab.

**Updated Penpot result:** after the tab reconnected, the actual combined page-07 native audit of the two context-focus boards PASSED **40/40** editable-shape/color/geometry/caption checks, zero failures. Earlier descriptions of a suspended plugin were accurate at that earlier checkpoint and are now superseded. Source/Chrome/Edge proof remains bounded; final cross-surface token API approval and native OS/AT are still open.
