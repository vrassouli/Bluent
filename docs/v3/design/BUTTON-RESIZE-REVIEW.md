# Bluent v3 — Button Penpot responsive constraints & resize lab (#419)

> **Draft design evidence, not a browser/runtime responsive claim.** Created directly in project-owned Penpot `Bluent v3 Design System` (`b64f6665-c9ab-80b5-8008-c4ac99d9d000`) on 2026-10-11. The imported Microsoft Fluent source library was not edited.

## Why resize testing mattered

The [previous alignment-quality sweep](ALIGNMENT-QUALITY-AUDIT.md) verified 65 native variants were centered **at their authored sizes** (910 geometric checks at Penpot revision 122). It did not prove that a linked native design remains centered if its container is resized.

A live first resize probe used the existing `Medium / Icon and label` Button at source root width **185px**. Stretching a linked instance's root to **300px** left the actual face fixed at **144px** and left-aligned, with no content recentering. This was a **real design constraint failure**, not a Blazor/browser finding.

An experiment setting Penpot source-component constraints on a scratch linked instance confirmed a viable approach: root width normalization, face/container `constraintsHorizontal="leftright"`, and nested icon/text `constraintsHorizontal="center"`. For a Medium text button, after normalizing the source root width to **168px**, we verified a linked instance at **300px root width** had **276px face width**, **12px on each side**, and a centered icon+label group; at **128px root width**, it had **104px face width**, the same 12px side pads and an **8px icon-label gap** with no clipping.

## Design contract implemented in all six native source variants

All six `Size × Layout` variants remain source-linked Penpot components, owned by Bluent. Page `20 · Bluent Button sizes and layout`, true local VariantContainer `e31294c6-7c55-805f-8008-c590d62d466d`.

| Bluent visual size | Face height | Icon slot | Natural root width: icon + label | Natural root width: icon only | Approx. intrinsic text-content minimum root width |
| --- | ---: | ---: | ---: | ---: | ---: |
| Small | 24px | 16px | 146px | 48px | 105px |
| Medium | 32px | 18px | 168px | 56px | 118px |
| Large | 40px | 20px | 190px | 64px | 135px |

The initial source boards were all **185px wide regardless of actual face width**, leaving asymmetric empty padding, and were explicitly normalized to **face width + 24px** root width.

- **Icon + label:** `Face` and `Content / centered geometry` have `constraintsHorizontal=leftright`. The native content icon slot and label have `constraintsHorizontal=center`. The face stretches while preserving **12px left + right** visible shell padding. Icon, label and their deterministic gap remain a centered group at tested widths.
- **Icon only:** source `Face` and content board have `constraintsHorizontal=center`, not `leftright`. The glyph remains in its intrinsic circular 24×24, 32×32 or 40×40 face and the **whole face** stays centered as its parent is widened. This distinction was found in visual review after a first stress export incorrectly rendered wide icon-only **pills**, despite passing earlier geometric-centering checks. The three icon-only source variants were corrected to keep their square shape.
- The icon is a native editable **vector cross**, not a font glyph. The local draft intentionally does **not** claim responsive AutoLayout: a previous Penpot `FlexLayout` experiment failed to render its caption. This implementation uses Penpot's actual **constraints system** and fixed-size content geometry.
- The design's minimum root widths are **design content constraints**, not automatically enforced `min-width` values in Blazor or Penpot. Widths below the intrinsic icon/label minimum may clip; the later component issue must define a policy.

## Actual reusable Penpot resize lab

Page `23 · Button resize stress laboratory`: `e31294c6-7c55-805f-8008-c5aa0da135fb`.

Project-owned preview board `#419 · Button responsive resize stress grid`: `e31294c6-7c55-805f-8008-c5aaa288cc59`.

For all **six** variants, the lab contains **three live linked instances**: original/natural size, wide-stretched container and compact bounded container, for a total of **18 linked design specimens**. The first sweep reported **0 errors across 18** root width/face/padding/center calculations. After inspecting its exported PNG, we corrected the overly-wide icon-only pills and recreated all 18 linked instances from the corrected native source variant. The new icon-only widened examples retain **24px, 32px, 40px** face widths respectively even at 260px container width. The redesigned board was PNG-exported and inspected; row labels were also moved away from the natural column's components to eliminate visual overlap.

**Final, live, post-correction acceptance evidence:** after replacing the three stretched icon-only pills with center-constrained square faces and rebuilding all 18 instances, the repeatable Penpot script was **executed successfully at file revision 138**. It verified all six local sources and **18/18 linked resized instances** (natural, wide, compact), with **145 geometric checks, 0 errors**. The final board was PNG-exported again; icon-only examples retain 24px, 32px or 40px circular faces even when the containing instance is 260px wide. The natural-column row labels no longer overlap the specimens. The named design recovery version is **`Bluent v3 · #419 Button source parity and resize constraints 2026-10-11`**.

The repeatable [read-only Penpot resize audit](../../../scripts/quality/penpot_v3_button_resize_audit.js) checks exact source constraints, linked variants, icon/label centers, equal side spacing, and icon-only shape preservation across natural/wide/compact widths. This script must be run in the *live connected Penpot plugin context* (not Node). The 18-example live geometry sweeps above are separate evidence; no browser CSS measurements are implied.

## Remaining acceptance gaps

- Validate typography metric changes on actual Segoe UI / Persian font stacks, long localized labels, and layouts with badges/secondary text/dropdowns.
- Define and enforce minimum content widths and touch-target policy at product runtime.
- Verify actual Blazor/DOM CSS (including `dir=rtl`, parent width constraints, zoom/reflow, `:focus-visible`, high-contrast, reduced-motion) in each dedicated component issue.
- Full 150-upstream-way Button design coverage and the [exact upstream/local matched-copy parity board](BUTTON-PARITY-REVIEW.md) remain open. Existing public Bluent Button API semantics are preserved, not renamed here.
- This is an active #419 design/library task. Keep [Draft PR #499](https://github.com/vrassouli/Bluent/pull/499) targeting `bluent-v3`; stable `Dev` and NuGet remain untouched.