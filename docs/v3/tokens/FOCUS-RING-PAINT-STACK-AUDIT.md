# #418 — Focus2 painted-outline visibility and stack-order regression

**Checkpoint:** 2026-10-13. **Status:** repeatable browser evidence for an **opt-in-only** v3 Styling Lab proposal; NOT a production Button rewrite, final color-token approval or WCAG/assistive-technology certification.

## Previously missed defect (actual rendered pixels, not just CSS geometry)

The page-38 Penpot #501 native Button design was corrected to put a 2px outer Focus stroke 3px beyond the **actual** Button face with a canvas-colored 1px inner spacer. The source-owned page-32 Light/Dark Focus2 illustration was then updated to the same 3px/1px geometry, with 38/38 live Penpot vector checks passing.

In the earlier real Blazor WebAssembly browser, the CSS preview passed all computed-style and DOM bounding-box assertions, but a **following row of buttons overpainted the lower portion of the outlined focused Button**. A full native screenshot inspection and color pixel measurement at a centerline near the focused Button showed the problem:

| Mode | Before: upper pixels (y=447–448) | Before: lower pixels (near y=490–491) |
| --- | --- | --- |
| Light | Black (#000000), visible | Gray/background instead of black |
| Dark | White (#FFFFFF), visible | Gray/background instead of white |

**Opt-in-only fix**, in `src/Bluent.UI.Demo.Pages/Pages/Scenarios/V3StylingLab.razor.css`, on `:focus-visible` under **`[data-bui-v3-focus-double-ring-candidate]` only**: `position:relative; z-index:1`. This lets the focused real Button's outline paint above the next tightly stacked action row. No global Button component CSS, source brand theme, or stable NuGet was changed.

After rebuild/reload, the same screenshots and pixel measurements show **two exact foreground-colored pixels both at the top and at the bottom**, in both Light and Dark:
- Light: top #000000/#000000, bottom #000000/#000000.
- Dark: top #FFFFFF/#FFFFFF, bottom #FFFFFF/#FFFFFF.

This is stronger than checking `outline-width:2px` or comparing DOM boxes, since neither detected the original overpainted bottom border.

## Repeatable browser assertion

`scripts/quality/probe_v3_blazor_runtime.mjs` now includes a genuine **CDP Page.captureScreenshot full viewport PNG** and browser `Image`/Canvas `getImageData` decode (zero npm/image package dependencies), after actual keyboard Tab enters a Blazor native Default Button:

1. The real Button has `:focus-visible`; theme source scope is set to the default brand, Light or Dark, *only inside the research host*.
2. The opt-in Focus2 candidate has a 2px outline, 1px outline offset (3px total from face), a 1px canvas-colored gap, and a finite relative stacking level `z-index >= 1`.
3. In **both** Light and Dark screenshots, the sampled pixels at the horizontal center and `round(top-2)` / `round(bottom+2)` equal the actual computed outline RGB; both must be visible.
4. Original brand, theme, temporary candidate attributes and viewport overrides are restored after the check. Forced Colors tests run separately with the OS `Highlight` fallback and no shadow.

**Sampling limitation:** Two centerline pixels in two brand modes do not prove every corner anti-aliasing, every platform's drawing order, native 200/400% browser zoom, all ten brands or actual OS forced-color/screen-reader compliance. The CSS preview is not a production component release. Penpot vectors and browser outlines are not certified pixel-identical.

**Captured and verified on real Dev01, after rebuilding the opt-in preview:**

| Browser / actual Blazor host | Full suite | New screenshot-pixel modes |
| --- | ---: | ---: |
| Chrome / WebAssembly | **585 / 585** | Light + Dark both top AND bottom match |
| Edge / WebAssembly | **585 / 585** | Light + Dark both top AND bottom match |
| Chrome / *published InteractiveServer* | **588 / 588** | Light + Dark both top AND bottom match |
| Edge / *published InteractiveServer* | **588 / 588** | Light + Dark both top AND bottom match |

**Total 2,346/2,346 passing real-browser assertions; zero failures, eight screenshot-pixel mode observations, four real-keyboard Tab precondition checks.** The 80-variant×six-appearance per-host native Focus2 geometry matrix stays green (1,920 individual native Button measurements), with ten brands, both modes/directions and 320/400 CSS pixel viewport widths. No stable release/deployment performed.

Screenshot sampling deliberately uses a **full viewport** capture. Chromium's clipped/small-image CDP capture was found unsuitable as a source of absolute screenshot pixel coordinates in this lab with responsive scrollbars; it can shift or display neighboring controls. The DOM focus geometry and page screenshot are therefore correlated through full-viewport CSS pixel positions before sampling, avoiding a false comparison.
