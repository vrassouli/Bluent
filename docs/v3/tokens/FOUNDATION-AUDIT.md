# #418 — Native typography / density / motion alias research

**Design-only contract candidate, 2026-10-11.** The governing CSS [ADR #417](../architecture/ADR-0001-styling-boundaries.md) is Accepted, but these exact aliases/fonts/dimensions are **not** accepted product APIs. No existing Bluent 2.x Sass, CSS bundles or NuGet are modified.

## Genuine design location

- Project-owned Penpot file: `Bluent v3 Design System`, ID `b64f6665-c9ab-80b5-8008-c4ac99d9d000`.
- New editable page `31 · Typography density and motion foundations · #418`, ID `acf5f619-7d81-80da-8008-c5e09d3a050f`.
- Main board `#418 · Type density motion alias foundation · DRAFT`, ID `acf5f619-7d81-80da-8008-c5e0d7a2fbf9`. A real PNG export was visually inspected: English and Persian text remain readable without clipping; Small/Medium/Large height specimens and motion-policy notes remain distinct.
- Shared **additive** real Penpot TokenSet `bluent-v3/418/foundation/aliases` ID `acf5f619-7d81-80da-8008-c5e09d49cf8a`, active in existing Light/Dark draft themes. The set **aliases** pre-existing #419 source draft tokens; it does not copy/replace their values, or create a runtime stylesheet.

| Native proposed alias | Existing #419 source token | Actual resolved value |
| --- | --- | --- |
| `bluent.semantic.type.bodySize` (fontSizes) | `bluent.type.size.300` | **14** |
| `bluent.semantic.type.bodyLineHeight` (number) | `bluent.type.lineHeight.300` | **20** |
| `bluent.semantic.space.controlGap` (spacing) | `bluent.space.m` | **12** |
| `bluent.component.button.heightMedium` (sizing) | `bluent.control.mediumHeight` | **32** |
| `bluent.semantic.motion.fastMs` (number) | `bluent.motion.fastMs` | **150** |
| `bluent.semantic.motion.reducedMs` (number) | `bluent.motion.reducedMs` | **0** |

Real Penpot token binding drives **both Latin/Persian font size specimens** and the **Medium Button-height** specimen, not just source values in text. The other numbers are annotated reference properties, not active animation behavior.

## Verified repeatable design test

Run [`scripts/quality/penpot_v3_foundation_alias_audit.js`](../../../scripts/quality/penpot_v3_foundation_alias_audit.js) in the **connected Penpot plug-in context**, never by inventing a test result from the JSON alone. The live audit at observed Penpot revision **219** inspected both Light and Dark mode token resolution plus actual font-size/height specimen properties, **18 checks / zero errors**, and restored Light when done.

Recovery version `Bluent v3 · #418 20 brands contrast and foundations audited 2026-10-11` (observed rev **220**): the file contains **32 pages, 38 native TokenSets, 195 token entries and 22 themes**, including the 20 brand-mode experimental themes and both real contrast-design sets. Imported Microsoft Fluent kit was not edited.

## Type/accessible-motion acceptance limitations

- The source Fluent reference declares Segoe UI, but **Segoe UI is unavailable in the connected Penpot font catalog**; the Latin sample uses Inter. Persian preview uses available Noto Sans Arabic. Neither proves a cross-OS Windows/macOS/Persian runtime font stack or redistribution license.
- Medium native design face height 32px is **not** a final interactive touch target minimum. Source candidate Small/Medium/Large are 24/32/40px and require density, keyboard focus and 200–400% zoom/reflow testing in Blazor.
- The 0ms reduced-motion alias is only an annotated token. Existing v2 Overlay animation was previously observed running at ~0.25s under reduced-motion; a real CSS/Blazor behavior change and browser re-test are required later.
- Forced-colors and system color tokens, layout-direction and theme-portal ownership, all control states, actual accessible names and assistive technology verification are not yet covered.
- Final token names/types/values, generator integration and component adoption require a separate acceptance step; keep #418 In progress, PR #500 Draft, stable `Dev`/NuGet intact.

Related evidence: [10-brand opt-in CSS](README.md), [Danger contrast candidate](CONTRAST-AUDIT.md), [Penpot source-to-Razor handoff on #419 branch](https://github.com/vrassouli/Bluent/blob/v3/issue-419-penpot-library/docs/v3/design/DESIGN-TO-RAZOR-HANDOFF.md).

## 2026-10-14 independent real-Blazor media regression

The previous all-in-one browser laboratory already tested emulated forced-colors in several places. An additional experimental media toggle previously disturbed later UI-state tests and was reverted. To prevent this class of test interference, a **separate short-lived browser process** now runs `scripts/quality/probe_v3_forced_colors_runtime.mjs` against the actual Blazor WebAssembly styling-lab route. It does not share a browser session, emulation settings, or DOM state with the comprehensive CDP suite.

The standalone test checks the two actual source-derived default modes (Light/Dark). For each mode it verifies native Button keyboard `:focus-visible` and geometry, emulated CSS system-color tokens (ButtonFace/Highlight), reduced-motion token resolution, focused TextField's **bottom underline without an added outer frame**, and exact baseline restoration after media reset. The local Dev01 Chrome run passed **12/12 assertions**. GitHub's existing Chrome/Edge WASM matrix gains the standalone test as an additional step; browser CI result must be read from the PR after push, not inferred from local success.

**Scope limit:** CDP `Emulation.setEmulatedMedia` is a browser emulation result, NOT Windows High Contrast, a screen-reader session, an approved final semantic token API, or full multi-brand/OS conformance. No released 2.x assets or public Button defaults changed.


## 2026-10-14 deterministic dual-media matrix and negative control

The original standalone real-Blazor forced-colors check used an unset browser media-emulation state for its baseline. On Dev01, that host reports `prefers-reduced-motion: reduce` even without any explicit CDP preference, so the previous 12 assertions could not independently prove the normal-motion (150ms) branch. This **coverage gap was found without claiming that production CSS had failed**.

The test now explicitly selects `forced-colors: none` and `prefers-reduced-motion: no-preference` for the baseline; independently checks reduced-motion-only (0ms, original color tokens), forced-colors-only (system ButtonFace/Highlight, **normal 150ms** and unchanged keyboard Button dimensions), and both features together (system colors + 0ms). For **Light and Dark** it also verifies the actual focused TextField retains its bottom underline with no extra outer ring, resets the source tokens/geometry, and restores the machine's original media preference before exiting. The same new script passed **18/18 in real Blazor WebAssembly Chrome and 18/18 in Edge** on Dev01. These are 36 assertions over two browsers, not a claim of native Windows Contrast Themes or screen-reader coverage.

A **temporary, intentionally failing control** was performed: an inline highest-priority test-only override forced the lab's `--bui-v3-motion-duration-fast` to `0ms` while the explicit baseline required `150ms`. The probe failed immediately at the expected `light normal CSS media baseline` assertion with `motion: 0ms`; the override was removed and the original test script restored **byte-for-byte**. This proves that the test detects this representative CSS regression, not only that it reports green on the current code. The negative control was not committed into runtime/product CSS. CI re-runs the positive case on actual Chrome/Edge WASM builds.

Scope remains **#418 experimental opt-in token CSS** and real Blazor demo, not final public Button behavior, not native OS/AT or WCAG 2.2 AA certification. Work remains isolated in #418's task branch; no stable `Dev`/2.x/NuGet release.

## 2026-10-14 10-brand × 2-mode independent media regression

The isolated real-Blazor WASM probe now derives its **ten source brand identifiers** from `docs/v3/tokens/issue-418-token-schema.preview.json`, and the **expected brand/mode source colors** from `issue-418-brand-matrix.preview.json`. This catches a false positive where only `data-bui-brand` changes but computed CSS does not. All 20 Brand×Mode scopes exercise: normal 150ms motion and generated source colors; reduced-motion-only 0ms; forced-colors-only system `ButtonFace`/`Highlight` and 150ms; forced plus reduced (0ms); keyboard Button focus visibility/unchanged face dimensions; and explicit restoration of normal host values. Existing two-mode TextField underline/no-outer-ring checks remain intact.

**Dev01 real Blazor WASM: Chrome 139/139 and Edge 139/139, zero failures.** Run `node scripts/quality/probe_v3_forced_colors_runtime.mjs` with `CHROME_PATH` pointing to either browser. The existing `.github/workflows/v3-browser-lab.yml` WASM browser matrix already invokes the script; inspect current head's checks separately after pushing.

Provenance is the **project-owned Bluent v3 Design System Penpot** token/focus design referenced above, not the imported Microsoft Fluent kit. These are browser-computed CSS/media-emulation results, **not** Windows native high contrast/assistive-technology sign-off, full WCAG conformance, final semantic-token approval or released Button behavior. Stable `Dev`/2.x untouched.
