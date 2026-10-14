# #418 — Interactive host-aware branded Focus review

**Date: 2026-10-14. Research only: NOT approved Button/TextField public CSS, not a NuGet release, not full WCAG or native OS/AT certification.**

## Design source of truth

The authoritative editable design is in Penpot **Bluent v3 Design System**, file b64f6665-c9ab-80b5-8008-c4ac99d9d000, page **07 · Accessibility & RTL** (07c521b9-e441-80bd-8008-c4b24ce6f58c). The implemented demo comparison directly follows two previously authored native research boards:
- **Branded Focus Ring on Filled Host Surfaces**, board 94a03b1b-8cb6-8091-8008-c96c96ea484f: brand outline succeeds on Neutral but fails on colored surrounding Brand.
- **Inverse Ring by Host Context**, board 94a03b1b-8cb6-8091-8008-c96d09329a0b: inverse OnBrand color passes colored Brand/Danger hosts but fails on white Inverted Dark.

Each board has 29 editable native shapes. Both were PNG-exported and visually inspected. The connected live Penpot native vector audit passed **40/40** checks covering both boards, host colors, labels, stroke widths, 3px symmetric rectangle padding on each edge (corresponding to CSS outline 2px + offset 2px). No new design was silently substituted; these are research artifacts, not approved default library rules.

## Actually implemented in Blazor

The existing real opt-in **/v3/styling-lab** now includes a separate five-card interactive comparison, using native Bluent Buttons within five genuine Fluent theme-background roles:
Neutral, Brand, Brand Hover, Danger and Inverted. One native Bluent Button changes the review mode, initially **unconditional brand-colored ring**, and optionally **explicit contextual source-role mapping**. Only v3 StylingLab Razor and local scoped CSS are altered. No new component parameter or product API was introduced.

The existing single brand ring is retained as the selected default visual; focused TextFields still use only their native animated bottom underline, never an additional enclosing focus rectangle.

| Host type | Light experimental contextual ring | Dark experimental contextual ring |
| --- | --- | --- |
| Neutral | existing colorBrandBackground | existing colorBrandForeground2 |
| Brand / Brand Hover / Danger | existing colorNeutralForegroundOnBrand | existing colorNeutralForegroundOnBrand |
| Inverted | existing colorNeutralForegroundOnBrand | existing colorBrandForeground2 |

This is EXPLICIT host-context selection in an opt-in demo, not algorithmic detection, universal accessible mapping, or an accepted public semantic role. Focus outline is 2px with 2px offset and should be compared against the **surrounding host**, not merely the Button face. There is a forced-colors fallback to system Canvas/CanvasText/Highlight (native Windows testing not yet completed).

## Measured browser outcomes

The actual Chrome and Edge Blazor WebAssembly CDP regressions both returned **796/796 assertions, zero failures**. They include twenty actual brand-mode source sets, five real host cards and two research choices (200 computed ring/host observations), as well as native Blazor user clicks (brand -> adaptive -> brand). Baseline has **70 source-host contrast shortfalls under 3:1** across the tested mode/host combinations; opt-in contextual role achieved **100/100 source-host numerical contrasts >=3:1** on this inventory. Expected baseline failures are represented as explicit source evidence, not incorrectly declared accessibility passes.

The first new run exposed a REAL responsive regression: the extra Persian mode-toggle Bluent Button widened a 320 CSS-pixel RTL host at 200% root text size. Scoped wrapping/width rules were added to that Button, with no global UI changes or diluted test thresholds; the complete 796/796 browser suite reran green. Existing Button states, dialogs, focus modality, RTL/typography, reflow and scoped host checks remain active.

## Remaining acceptance limits

The contextual mode is only tested on five opaque Fluent hosts. Still unresolved: filled selected/pressed nested surfaces, transparency, gradients, photo backgrounds, high contrast native OS/AT, real browser zoom/pixel coverage, and a user-approved public semantic focus-token contract. Do NOT ship a default universal white ring; it fails Dark Inverted. Do NOT ship a universal same-brand ring; it fails colored Brand and Danger hosts. No Dev/stable v2 merge or NuGet release is authorized. #418 remains In progress, PR #500 remains Draft pending approval.
