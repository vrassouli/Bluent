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

## 2026-10-14 forced-colors media emulation regression

The initial forced-colors CDP check detected an actual CSS cascade issue introduced by the study cards. In Chromium emulated forced-colors, the card-local source-role rule with stronger Dark/adaptive specificity sometimes won over the generic system Highlight fallback, leaving normal brand source colors in the focus outline token. The existing accessibility assertion was NOT suppressed: after reproducing the red test, demo-scoped CSS now uses the system Highlight custom-property with explicit importance **inside the five research cards only**. No component library or released stylesheet was altered.

An independent **20-case media emulation test** covers 5 actual Bluent Button host cards x Light/Dark x both fixed/adaptive review modes and checks the card-local computed custom-property resolves to system Highlight. Complete Chrome/WebAssembly browser suite passed **797/797** after the correction (the previous fully green suite was 796/796). This is **CSS media emulation**, NOT certified Windows Contrast Themes, painted-pixel proof or native screen-reader/AT validation.

## 2026-10-14 — New editable #501 host-context review board and frozen source proposal

The correct connected **Bluent v3 Design System** file (b64f6665-c9ab-80b5-8008-c4ac99d9d000), page 38 (535db143-a732-807e-8008-c64d2fb91b9a), now contains a NEW **85-editable-shape** host-context research board **f4136a9a-101d-8004-8008-ca2956fe05f9**. It presents Light/Dark × Neutral / Brand / BrandHover / Danger / Inverted for the source DEFAULT theme and was actually exported to PNG and visually inspected. Native read-only Penpot audit scripts/quality/penpot_v3_button_host_context_audit.js (owned by #501 branch/PR #502) executed live and PASSED **78/78** identity, stroke, geometry and contrast tests, zero failures. Existing selected brand Button focus + TextField bottom underline, Danger states and native variants remain unchanged.

The 10 Penpot Default samples cover source theme colors and host-to-ring ratios **3.247:1–14.548:1**. Independent actual emitted #418 CSS source tests have now been upgraded from 5 to **7**: they assert that explicit contextual source-role selection achieves **100/100 tested combinations at ≥3:1** across 10 brands, two modes and five *opaque* Fluent hosts (observed minimum **3.103:1**). They also explicitly reject unconditional white-on-Dark-inverted and unconditional same-brand-on-filled hosts. Run python -m unittest discover -s scripts/quality -p test_v3_focus_host_surface_matrix.py -v.

**Research only, not approved public API.** On Neutral hosts retain the maintainer's selected brand-colored Focus. For Brand/BrandHover/Danger consider existing OnBrand inverse, and on Light inverted use inverse while Dark inverted uses brandedForeground2. This is an explicit source-role **host-context proposal**, NOT inferred from CSS pixels, not universal contrast certification and NOT permission to change the production Button defaults without approval. No actual Windows Contrast Themes/AT, real zoom, gradients, nested host or arbitrary photo background signoff. #418 and #501 remain separately reviewed; #428 owns final Button implementation.

## 2026-10-14 maintainer acceptance — context-aware review is now the initial lab state

The maintainer explicitly approved the **VISUAL** host-dependent focus design after the ten editable Light/Dark Penpot examples: Brand single ring on Neutral; OnBrand inverse ring on colored Brand/BrandHover/Danger; Inverted uses OnBrand in Light and colorBrandForeground2 in Dark. The #501 approved Penpot page38 board is f4136a9a-101d-8004-8008-ca2956fe05f9; approved design PR #502 merged into bluent-v3, issue #501 is Done.

For #418 isolated v3 Styling Lab, the **real Blazor initial mode** is now the approved **adaptive** host-dependent visual, rather than the historical unconditional brand comparison. The real mounted Blazor toggle still permits the original low-contrast brand-only baseline for side-by-side review, and is tested by clicking approved -> brand-only -> approved. The browser probe now separately asserts that the user initially sees the approved mode without any test click; no product-wide Button CSS, public component parameter or stable NuGet was changed. The previously described adaptive mode as a proposal is **superseded by this visual decision**, but native Windows Contrast Themes/AT, gradients, transparency, nested hosts, zoom, runtime semantic tokens and #428 final Button implementation remain separate and unapproved.

## 2026-10-15 — Removal of duplicate Styling Lab color-selection rules

The five native Blazor Button cards now use the **same generated opt-in candidate** as the versioned source-to-semantic bridge; the CSS no longer has a separate Brand/Danger/Inverted mode-switch rule. The actual Blazor host attributes declare the source-owned host role and bound Light/Dark state; approved-mode CSS delegates to --bui-v3-focus-host-ring-candidate. The prior unconditional-brand comparison remains for deliberate contrast comparison. The keyboard-focused painted ring is tested against real host source roles and outside opt-in leakage on each brand/mode. Full crosswalk: [generated focus host token integration](FOCUS-HOST-TOKEN-CROSSWALK.md). This remains an isolated v3 demonstration, not a public Button contract; latest browser checks must be verified before claiming runtime parity.
