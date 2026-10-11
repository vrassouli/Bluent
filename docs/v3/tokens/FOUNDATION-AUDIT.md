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
