# #552 / Icon #429 — isolated SVG/ARIA candidate (2026-10-20)

**Research-only; not product code, approved design, or Fluent parity.** This complements [live original Chrome/Edge observations](FLUENT-PARITY-ICON-BROWSER.md).

## Design-tool access and approval boundary

- Penpot currently points to the unrelated **PuyaStudio Runner** file (ID b64f6665-c9ab-80b5-8008-c44ed391c0c4), not the required Bluent v3 Design System (b64f6665-c9ab-80b5-8008-c4ac99d9d000). No unrelated Penpot asset was touched.
- Figma fallback in owned working file JfxkDgSbNr8W0ppUZPQPHc returned the **Starter plan tool-call limit** on read-only inspection. No Icon board was edited or approved. This candidate does not clear #429 design-first approval.

## Real unchanged Blazor WASM component and isolated CSS injection

- Original Icon with 32×32 inline size yields a nested SVG **377×377 CSSpx** in both Chrome and Edge; inline span's layout fragment is **377×16** (original baseline).
- [Isolated research stylesheet](../../../scripts/quality/fixtures/v3-icon-svg-size-candidate.css): only direct-child SVG wrappers use inline-flex sizing and 1em default; SVG child uses 100% width/height. Explicit inline 32px width/height overrides the proposed default. The stylesheet is **not** imported into source, product styles, or shipping bundles.
- Run from isolated audit worktree with dotnet-built original demo: node scripts/quality/probe_v3_icon_browser.mjs chrome candidate, and again with edge candidate. The browser harness injects CSS after hydration into its **temporary browser only**.
- **Initial candidate run (2026-10-20): Chrome 31/31, Edge 31/31** positive fixture/sizing/ARIA-option observations; see the 2026-10-23 follow-up below for the same-branch 48-check extended matrix. SVG and wrapper are **32×32 CSSpx** in each Light/LTR, Dark/RTL, Forced Colors emulation, and 320px-width viewport run. Built-in Regular/Filled font icons remain 28px wide; Image remains 32×32. Mobile candidate document width is 320px. Browser checks are not OS HC/AT approvals or normalized Fluent comparisons.

## Saved real browser comparison

| Scenario | Chrome candidate screenshot | Edge candidate screenshot |
| --- | --- | --- |
| Light/LTR | [PNG](evidence/BLUENT-ICON-CHROME-CANDIDATE-LIGHT-LTR.png) | [PNG](evidence/BLUENT-ICON-EDGE-CANDIDATE-LIGHT-LTR.png) |
| Dark/RTL | [PNG](evidence/BLUENT-ICON-CHROME-CANDIDATE-DARK-RTL.png) | [PNG](evidence/BLUENT-ICON-EDGE-CANDIDATE-DARK-RTL.png) |
| Forced Colors (Chromium emulation only) | [PNG](evidence/BLUENT-ICON-CHROME-CANDIDATE-FORCED-COLORS.png) | [PNG](evidence/BLUENT-ICON-EDGE-CANDIDATE-FORCED-COLORS.png) |
| Narrow 320px Light/LTR | [PNG](evidence/BLUENT-ICON-CHROME-CANDIDATE-MOBILE-320.png) | [PNG](evidence/BLUENT-ICON-EDGE-CANDIDATE-MOBILE-320.png) |
| Narrow 320px Dark/RTL | [PNG](evidence/BLUENT-ICON-CHROME-CANDIDATE-MOBILE-320-DARK-RTL.png) | [PNG](evidence/BLUENT-ICON-EDGE-CANDIDATE-MOBILE-320-DARK-RTL.png) |

[Chrome measurements + AX](evidence/BLUENT-ICON-CHROME-CANDIDATE-BROWSER.json) · [Edge measurements + AX](evidence/BLUENT-ICON-EDGE-CANDIDATE-BROWSER.json). Baseline screenshots are in the original [Icon browser report](FLUENT-PARITY-ICON-BROWSER.md).

## Actual Chromium AX policy experiment, not a default decision

- Original image without alt is an exposed **unnamed image** in Chrome/Edge partial AX tree.
- Setting alt to an empty string **on the disposable browser node** made the image ignored (decorative option). Setting a meaningful alt of PowerPoint file type exposed a **named image** (informative option). The browser harness removed the experimental attribute afterward.
- The *intent* (decorative vs informative) and precedence with AdditionalAttributes belong to #429/#420 design decisions. Icon-only action **controls** need accessible control names; an icon label must not replace Button labeling. No native NVDA/JAWS/VoiceOver run.

## Next owner-specific gates

- #429 needs an editable **Bluent v3 Penpot/Figma** component and review of 16/20/24/28 sizes, intrinsic 1em default, supplied SVG with/without viewBox, CSS :has support, all themes, RTL, native AT and keyboard, Windows Contrast Themes, real zoom, published InteractiveServer, and security of supplied SVG markup.
- #418/#420 decide token/size semantics and accessible-attribute policy. Only then make product changes on owner #429 branch and rerun before/after acceptance.

**Current lifecycle:** #552 In progress / PR #553 Draft; #429 Backlog. Stable 2.x Dev untouched. Positive observation guards do not mean the underlying defect is repaired.

## Same-branch candidate revalidation and 320px Dark/RTL follow-up (2026-10-23)

The isolated candidate was rerun against the current audit-branch build after the newest original-source narrow baseline exposed a **253x253px** SVG (not just the older desktop 377x377px observation). The initial same-branch rerun passed **31/31 checks per engine** in desktop Light/LTR, Dark/RTL, CSS Forced Colors emulation and 320px Light/LTR. After adding the combined-state case, the expanded probe passed **38/38 checks in both Chrome and Edge**. A second test matrix now raises this to **48/48 live browser checks per engine**: 16/20/24/28/32px viewBox sizing, inherited 1em default, direct-child selector behavior, exclusion of font/image icons and non-matching nested SVG. The child SVG and wrapper stay at **32x32 CSSpx** in every candidate scenario. The source-built-in Regular/Filled icons remain 28px wide and the image remains 32x32. The 320px baseline document remains 320px wide but the child SVG is oversized; absence of document overflow does not clear the layout defect.

To avoid treating narrow viewport and RTL/theme independently, the browser harness now adds one further candidate-only scenario: **320x740 CSS px, Dark/RTL**. Both engines have been re-run and the candidate sizing checks cover both 320px Light/LTR and Dark/RTL. The extra screenshot and measurements are linked here: [Chrome Dark/RTL 320px](evidence/BLUENT-ICON-CHROME-CANDIDATE-MOBILE-320-DARK-RTL.png) · [Edge Dark/RTL 320px](evidence/BLUENT-ICON-EDGE-CANDIDATE-MOBILE-320-DARK-RTL.png).

### Measured boundaries: selector support and SVG without viewBox

The candidate uses `span.bui-icon:has(> svg)`. In the actual Chrome and Edge versions used for this run, `CSS.supports('selector(span.bui-icon:has(> svg))')` is true and the selector matches a direct child SVG. It does not match a font-icon `i.bui-icon`, an image `img.bui-icon`, or a wrapper whose SVG is only a descendant of a nested span. This checks the current two browser engines only; it does **not** establish a minimum-version or all-target-browser support policy. If target browsers without `:has()` are supported, product code needs a deliberate alternative, not an assumption.

The matrix also measures explicit 16/20/24/28/32px SVGs with a `0 0 24 24` viewBox and an inherited 20px `1em` default; wrapper and child viewport geometry match at every size. A deliberately similar SVG with no `viewBox` exposes a content-vs-viewport limitation: with a 16px SVG viewport, the test path remains **20×20 CSSpx** and extends outside the viewport; at 32px it fits. The candidate sizes the SVG box but **does not automatically scale the SVG content** when no viewBox maps its authored coordinates. No-viewBox behavior therefore requires an explicit owner/design decision (e.g. require valid viewBox or accept authored user-unit sizing); this prototype does not sanitize or rewrite arbitrary SVG markup.

### Source-review security boundary (not an exploit test)

In the current source path, `IconDefinition.FromSvg(regularSvg, ...)` forwards strings to `IconSource.Svg(...)`, and `Icon.BuildRenderTree` emits `source.Value` as a `MarkupString`. The inspected path contains no SVG sanitization call. This is a **source-review trust-boundary finding**, not a proof of exploitability or a runtime XSS test: no payload was executed. Treat custom SVG strings as trusted application-owned markup unless a reviewed sanitizer/allow-list and threat model establishes that untrusted content may be accepted. A CSS sizing rule neither sanitizes markup nor mitigates script/event attributes; security review remains a separate owner gate.

This remains injected CSS in temporary browser processes only. It does not validate CSS `:has()` support outside the tested Chrome/Edge versions, native browser zoom, Windows Contrast Themes, native assistive technology, security of arbitrary SVG markup, or design parity. **No product component/CSS/API was changed; #429 remains Backlog and PR #553 remains Draft.**
