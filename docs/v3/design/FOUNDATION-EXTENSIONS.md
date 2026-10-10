# #419 · Extended foundation designs in Penpot (draft)

> **Date:** 2026-10-10. **Design file:** `Bluent v3 Design System` (`b64f6665-c9ab-80b5-8008-c4ac99d9d000`), named saved revision **24**: `Bluent v3 · #419 expanded foundation research 2026-10-10`. This is actual **editable Penpot design work**, not an approved ADR, published UI kit or Blazor implementation. Refer to [the complete workspace manifest](penpot-workspace.manifest.json) for exact page and board IDs.

## New editable foundation pages

| Penpot page | Board ID | Content and evidence |
| --- | --- | --- |
| `04 · Typography & spacing` | `07c521b9-e441-80bd-8008-c4b27d1df98c` | Source-derived font sizes, line heights and spacing ruler; canvas preview uses Inter, NOT Segoe UI rendered parity |
| `05 · Density & responsive` | `07c521b9-e441-80bd-8008-c4b2a95b3527` | Three explicitly **proposed** Compact/Regular/Comfortable business-app list/toolbar densities, not actual component defaults |
| `06 · Motion & elevation` | `07c521b9-e441-80bd-8008-c4b2ead05451` | Duration scale, six native Penpot drop-shadow specimens, reduced-motion policy gap |
| `07 · Accessibility & RTL` | `07c521b9-e441-80bd-8008-c4b32a4e1bec` | Editable English LTR and genuine Persian RTL command surfaces, conceptual forced-colors system-palette focus specimen |
| `08 · Brand inventory` | `07c521b9-e441-80bd-8008-c4b3688e43c6` | All ten legacy Bluent light/dark **source-derived** brand background colors for two-axis design review |

All five new boards were **individually PNG-exported and visually inspected** in Penpot. The boards use editable Penpot rectangles, texts, shadows and native asset references; screenshots do not certify runtime support.

### Type, rhythm and font-language boundary

The old style source of truth remains `src/Bluent.UI/Styles/Themes/theme/maps/{font-families,font-sizes,line-heights,spacings}.scss`:

| Semantic size | Font size | Line height |
| --- | ---: | ---: |
| Base200 | 12px | 16px |
| Base300 | 14px | 20px |
| Base400 | 16px | 22px |
| Base500 | 20px | 28px |
| Base600 | 24px | 32px |

The existing `--fontFamilyBase` stack begins with **Segoe UI**, followed by platform alternatives. Segoe UI itself was not available as a suitable Penpot canvas font in this verified session, so the **visual preview deliberately uses Inter**; its glyph metrics are not accepted Segoe UI parity. A separate RTL specimen uses the available **Noto Sans Arabic** canvas font to show real Persian text and right-aligned bidirectional text. The **application's Persian/Arabic font stack remains an open design decision**, rather than being silently replaced with those preview fonts.

Source spacing steps displayed in the Penpot scale: **2, 4, 6, 8, 10, 12, 16, 20, 24, 32 and 48px**. The legacy SCSS also has 64px; the latest draft's visual ruler stops at 48px, **not** a declaration that 64px is deprecated.

### Density, touch and responsive scope

The new density board compares **proposed** 24 / 32 / 40px control heights, with conceptual gaps 8 / 12 / 16px. This grid is a visual discussion aid, **not** a validated WCAG target-size matrix or a promise that these will be public Bluent density enum values. The prior real Chrome lab recorded ~32px compact and ~40px regular Button heights in one scenario; upstream Fluent Button specimens include 24/32/40px variants. Those are **different evidence types** and must not be conflated.

The mobile command-surface rule is a **proposal**: keep functions accessible even when search and actions collapse. Before approval, test touch targets, 200%/400% zoom, reflow, popover placement, keyboard navigation, RTL order, overflow and virtualized grids.

### Motion and elevation

The actual `theme/maps/durations.scss` values are 50, 100, 150, 200, 250, 300, 400, 500ms. The Penpot motion board depicts all eight; `bluent.motion.reducedMs = 0` is a **draft design-policy candidate**, not a change to v2 animation CSS. The measured current Bluent Overlay keeps its `0.25s` `fade-in` animation even when Chrome emulates `prefers-reduced-motion: reduce` (recorded under [#417](https://github.com/vrassouli/Bluent/issues/417)). An accepted policy should suppress **nonessential** movement, not make content or state changes inaccessible.

The `theme/shadows.scss` source defines **`--shadow2`, `--shadow4`, `--shadow8`, `--shadow16`, `--shadow28`, `--shadow64`** as **two-layer neutral/brand-color shadow composites**. The Penpot elevation swatches are **editable illustrative drop shadows** with the corresponding tier names; they are **not exact renderings** of the compiled two-layer source CSS. The final elevation tokens require light/dark and high-contrast behavior and true shadow parity or an approved difference.

### Accessibility and RTL

The RTL board contains Persian strings rendered right-aligned using `Noto Sans Arabic`, with direction set to `rtl` on the corresponding text shapes. It shows the **reversal of LTR/RTL command ordering**. This verifies an **editable Penpot concept** and that Persian glyphs rendered, not automatic Blazor CSS logical-property support or bidi behavior across input fields/icons. Those must be tested independently.

The black/yellow panel is a clearly labeled **forced-colors illustration, not a Chrome or Windows screenshot**. It intentionally calls for OS system color keywords such as `Canvas`, `CanvasText`, `ButtonText`, `Highlight` and `HighlightText`, with visible keyboard focus indicators. Under forced-colors, actual browser styles and the supported platform determine the computed colors. **Do not ship these illustrative black/yellow hex values as a hard-coded high-contrast palette.**

## Verified existing brand backgrounds

The `08 · Brand inventory` board uses a live source inspection of generated `src/Bluent.UI/Styles/Themes/theme-{brand}-{light,dark}.css` for the **`--colorBrandBackground`** property.

| Brand | Light | Dark |
| --- | --- | --- |
| default | `#1267B4` | `#18599B` |
| excel | `#11783F` | `#146938` |
| office | `#B53406` | `#9C2F09` |
| outlook | `#1267B5` | `#18599C` |
| powerapps | `#8D4D8B` | `#823C81` |
| powerbi | `#7A6519` | `#6B5818` |
| powerpoint | `#B0391A` | `#983318` |
| stream | `#BD1D49` | `#A41B3F` |
| teams | `#5659BA` | `#4B4D9F` |
| word | `#2F61C1` | `#1A54B0` |

These are **20 current brand-background values**, not a complete brand-theme token or contrast matrix. The design-system architecture must separate **Brand** from **Mode** conceptually; final theme selection, CSS variables, nested/dialog semantics and bundling compatibility belong to approved #417 / #418 work. None of the ten existing bundles should be dropped based solely on the existence of this inventory board.

## Actual new local Penpot tokens

Four additional *unapproved* token sets were created in the separate Bluent v3 file:

| Token set | Count | Contents |
| --- | ---: | --- |
| `bluent-v3/draft/typography` | 13 | Family `Segoe UI`; 12–24px scale; line heights 16–32px as numbers; regular/semibold weights |
| `bluent-v3/draft/spacing-scale` | 11 | 2–48px source steps (excludes the existing source 64px upper step for now) |
| `bluent-v3/draft/motion` | 6 | 50, 150, 200, 250, 300ms + draft reduced-motion 0ms; earlier `layout` holds 100ms |
| `bluent-v3/draft/density` | 6 | Draft control sizes 24/32/40px and draft layout gaps 8/12/16px |

Together with the original local `light` (5), `dark` (5) and `layout` (3) sets, the file now contains **7 sets, 49 total token entries and 2 Mode themes**. The five shared sets (layout, typography, spacing-scale, motion, density) are linked into *both* draft Mode themes. A live **Light → Dark → Light** toggle test confirmed that the mode-specific 5-token color set changes while the other **5 shared sets remain active**, and the final active mode was restored to **Light**. These tokens are **design research only**; no CSS variables, public API, Blazor components, published assets or NuGet packages were changed.

## Linked Fluent Button: complete medium 5 × 5 visual-state reference

An additional genuine Penpot **source-linked** reference board was authored in the **separate Bluent v3 file**: page `09 · Fluent Button state reference`, ID `07c521b9-e441-80bd-8008-c4b57568c3ef`; board `07c521b9-e441-80bd-8008-c4b5759995ec`. Instead of asking Penpot to change one existing component with `switchVariant`, it directly instantiated all 25 exact imported upstream variant components for:

- **Styles:** Secondary, Primary, Outline, Subtle, Transparent.
- **States:** Rest, Hover, Pressed, Selected, Disabled.
- **Fixed axes:** Medium (Default), Icon and label (Default).

The live Penpot API returned **25/25 linked source Button instances**, none disconnected; the complete 5×5 board was **PNG-exported and visually inspected**. This is stronger *upstream design-state reference evidence* than the prior single linked Button. It does **not** exercise state interactions, test keyboard focus, implement a Blazor Button, or cover Small/Large and Icon-only axes. Those 25 additional instances were created **inside Bluent's file only**, without modifying the source Fluent kit. A named design recovery version `Bluent v3 · #419 Fluent Button 25-state reference 2026-10-10` was saved at observed file revision **27**.

## Component linkage caveat

The imported upstream Fluent 2 `Button` is a true **linked instance** in the local `02 · Component anatomy` reference board. Its upstream component reports four variant axes and 150 available variant components. A prior experiment calling `switchVariant(3, "Primary")` and `switchVariant(4, "Primary")` did **not** throw, but the linked instance's reported `component().variantProps.Style` **remained `Secondary (Default)`**. In contrast, **direct instantiation** from the 25 upstream source variant components succeeded as a static design reference; it does not prove that in-place `switchVariant` works. The temporary test instance was removed; the prior linked reference remains intact. Therefore, **variant switching is NOT verified** and remains an acceptance task. Do not treat “API call did not throw” as successful behavior.

## Outstanding sign-off gates

1. Review #417 ADR D1–D4 in a traceable Penpot design decision artifact, then approve/revise tokens under #418.
2. Review the full set of imported Fluent typography, focus, spacing, icons and Button variants; verify actual instance variant switching and design-to-Blazor parity.
3. Confirm Persian/Arabic and Latin font stacks, logical layout/RTL direction, dark/high-contrast forced-colors behavior and real keyboard interactions.
4. Determine whether to expose 3-density semantics at all, and test target-size exceptions, touch, zoom, reflow and responsive layouts.
5. Resolve 10-brand × 2-mode token scoping, overlay theme host inheritance, motion policy, real two-layer shadows and utility migration.
6. Keep [PR #499](https://github.com/vrassouli/Bluent/pull/499) as **Draft** and Issue #419 **In progress**, never bypassing Review/Done gates.

The Penpot workspace is an independently editable artifact. All code/documentation remains on `v3/issue-419-penpot-library` targeting `bluent-v3`, and the imported community reference and stable Bluent 2.x remain unchanged.