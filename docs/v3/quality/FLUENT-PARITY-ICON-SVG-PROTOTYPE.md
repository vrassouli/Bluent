# #552 / Icon #429 — isolated SVG/ARIA candidate (2026-10-20)

**Research-only; not product code, approved design, or Fluent parity.** This complements [live original Chrome/Edge observations](FLUENT-PARITY-ICON-BROWSER.md).

## Design-tool access and approval boundary

- Penpot currently points to the unrelated **PuyaStudio Runner** file (ID b64f6665-c9ab-80b5-8008-c44ed391c0c4), not the required Bluent v3 Design System (b64f6665-c9ab-80b5-8008-c4ac99d9d000). No unrelated Penpot asset was touched.
- Figma fallback in owned working file JfxkDgSbNr8W0ppUZPQPHc returned the **Starter plan tool-call limit** on read-only inspection. No Icon board was edited or approved. This candidate does not clear #429 design-first approval.

## Real unchanged Blazor WASM component and isolated CSS injection

- Original Icon with 32×32 inline size yields a nested SVG **377×377 CSSpx** in both Chrome and Edge; inline span's layout fragment is **377×16** (original baseline).
- [Isolated research stylesheet](../../../scripts/quality/fixtures/v3-icon-svg-size-candidate.css): only direct-child SVG wrappers use inline-flex sizing and 1em default; SVG child uses 100% width/height. Explicit inline 32px width/height overrides the proposed default. The stylesheet is **not** imported into source, product styles, or shipping bundles.
- Run from isolated audit worktree with dotnet-built original demo: node scripts/quality/probe_v3_icon_browser.mjs chrome candidate, and again with edge candidate. The browser harness injects CSS after hydration into its **temporary browser only**.
- **Chrome 31/31, Edge 31/31** positive fixture/sizing/ARIA-option observations. SVG and wrapper are **32×32 CSSpx** in each Light/LTR, Dark/RTL, Forced Colors emulation, and 320px-width viewport run. Built-in Regular/Filled font icons remain 28px wide; Image remains 32×32. Mobile candidate document width is 320px. Browser checks are not OS HC/AT approvals or normalized Fluent comparisons.

## Saved real browser comparison

| Scenario | Chrome candidate screenshot | Edge candidate screenshot |
| --- | --- | --- |
| Light/LTR | [PNG](evidence/BLUENT-ICON-CHROME-CANDIDATE-LIGHT-LTR.png) | [PNG](evidence/BLUENT-ICON-EDGE-CANDIDATE-LIGHT-LTR.png) |
| Dark/RTL | [PNG](evidence/BLUENT-ICON-CHROME-CANDIDATE-DARK-RTL.png) | [PNG](evidence/BLUENT-ICON-EDGE-CANDIDATE-DARK-RTL.png) |
| Forced Colors (Chromium emulation only) | [PNG](evidence/BLUENT-ICON-CHROME-CANDIDATE-FORCED-COLORS.png) | [PNG](evidence/BLUENT-ICON-EDGE-CANDIDATE-FORCED-COLORS.png) |
| Narrow 320px | [PNG](evidence/BLUENT-ICON-CHROME-CANDIDATE-MOBILE-320.png) | [PNG](evidence/BLUENT-ICON-EDGE-CANDIDATE-MOBILE-320.png) |

[Chrome measurements + AX](evidence/BLUENT-ICON-CHROME-CANDIDATE-BROWSER.json) · [Edge measurements + AX](evidence/BLUENT-ICON-EDGE-CANDIDATE-BROWSER.json). Baseline screenshots are in the original [Icon browser report](FLUENT-PARITY-ICON-BROWSER.md).

## Actual Chromium AX policy experiment, not a default decision

- Original image without alt is an exposed **unnamed image** in Chrome/Edge partial AX tree.
- Setting alt to an empty string **on the disposable browser node** made the image ignored (decorative option). Setting a meaningful alt of PowerPoint file type exposed a **named image** (informative option). The browser harness removed the experimental attribute afterward.
- The *intent* (decorative vs informative) and precedence with AdditionalAttributes belong to #429/#420 design decisions. Icon-only action **controls** need accessible control names; an icon label must not replace Button labeling. No native NVDA/JAWS/VoiceOver run.

## Next owner-specific gates

- #429 needs an editable **Bluent v3 Penpot/Figma** component and review of 16/20/24/28 sizes, intrinsic 1em default, supplied SVG with/without viewBox, CSS :has support, all themes, RTL, native AT and keyboard, Windows Contrast Themes, real zoom, published InteractiveServer, and security of supplied SVG markup.
- #418/#420 decide token/size semantics and accessible-attribute policy. Only then make product changes on owner #429 branch and rerun before/after acceptance.

**Current lifecycle:** #552 In progress / PR #553 Draft; #429 Backlog. Stable 2.x Dev untouched. Positive observation guards do not mean the underlying defect is repaired.
