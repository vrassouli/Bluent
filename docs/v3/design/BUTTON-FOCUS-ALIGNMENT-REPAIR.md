# Button focus ring / accessibility RTL alignment repair — Penpot review

**Date:** 2026-10-13
**Issue:** #501 design, cross-reference to completed #419 page-07 library.
**Status:** Actual project-owned Penpot edit; geometric design repair, NOT a shipping Blazor CSS change, approved Fluent semantic token or accessibility certification.

## Source-owned pages and observed defects

Penpot file `Bluent v3 Design System` `b64f6665-c9ab-80b5-8008-c4ac99d9d000`.

1. Page **`07 · Accessibility & RTL`** `07c521b9-e441-80bd-8008-c4b24ce6f58c`, board `07c521b9-e441-80bd-8008-c4b32a4e1bec`. The **RTL button label** center was 8px above its actual 48px Button face; the RTL search placeholder center was 10px above its input. LTR Button and input also had -2.5px and -1px center offsets. The Forced Colors example label had -1.5px offset.
2. Page **`38 · Button Focus Visible states · #501`** `535db143-a732-807e-8008-c64d2fb91b9a`. The older Rest/Interaction Focus vectors were anchored to their **174×58 specimen wrapper**, rather than the nested **157×35 Button border**. This put the dark/light outer stroke farther from the actual face with unequal top/bottom clearance. Other size/specimen overlays varied in offsets (3–6px), creating inconsistent ring clearance between appearances.

## Actual live Penpot changes

- For 5 affected page-07 text objects: set text bounds to the corresponding Button/Input/Forced Colors control's **exact y and height**, and set native `verticalAlign = center`. Horizontal positioning, widths, font family and content were not replaced. **All five computed center offsets are now 0px.** Penpot PNG export after editing was visually inspected; particularly the Persian RTL button/placeholder.
- For **52 Focus pairs** (104 native editable vectors) on #501: the **outer** vector is anchored to the actual Button *border* or *face* with **3px equal outward padding on all four edges**; the **inner contrast gap** is anchored with **1px equal outward padding on all edges**. Both preserve existing 2px outer and 1px gap stroke thickness, with corresponding corner radii derived from the real face. The following Penpot surfaces were edited:
  - original Light/Dark main candidate board: **10** appearance×surface pairs;
  - native Appearance×Focus family: **5** Focus Visible variants, original Focus Off variants intact;
  - linked source comparison: **5** Focus Visible pairs;
  - source-linked Hover/Pressed/Selected matrix: **15** Focus Visible pairs, **5 Disabled without a ring** preserved;
  - Small/Medium/Large Icon+label/Icon-only and Persian RTL/LTR matrix: **12** pairs;
  - Danger/Rounded, Circular, Square, Compound visual review board: **4** pairs;
  - separately registered native Danger Focus Visible family: **1** pair; native Focus Off remains ring-free.
- Split Button keeps **four independent inset focus target** specimens (Main/Menu × LTR/RTL). Their original 2px inset outer and 5px inset inner ring are deliberately *not changed* because the two sibling actions must not be covered by an outside focus ring.

Existing source-linked components were **not detached or recreated**; the ring vector geometries were corrected instead. No changes were made to original #419 native 25-state family, or to the independent 10-variant Appearance×Focus and two-variant native Danger families.

## Visual, mechanical and workflow checks

- Actual Penpot PNG exports were inspected **before and after** editing on page 07, page-38 Light/Dark main board, combined Hover/Pressed/Selected board, and sizes/Persian RTL board. The revised rings appear tight around the real button border, with symmetric top/bottom inset instead of wrapper-based geometry.
- The repeatable **read-only** helper `scripts/quality/penpot_v3_button_focus_alignment_audit.js` checks all 52 pairs' four edges, center, native strokes and radius, the 5 vertical text centers, 4 independent Split focus targets, absence of Disabled/Focus Off rings and retention of source native variant counts. Because Penpot's browser tab intermittently enters suspended/no-heartbeat state, **do not mark its full result as passed unless it has been actually executed in the live plugin and the output is recorded below.**
- The previous `penpot_v3_button_focus_special_audit.js` contained obsolete asymmetric candidate offsets. Its expected Danger/Circular/Square/Compound and native Danger ring geometry was adjusted from +/-6,+/-3 to +/-3,+/-1. Split's deliberate inset targets were retained.

**Browser parity caveat:** #418 opt-in two-layer CSS continues to use outline+box-shadow at different provisional offsets. This Penpot design review is *not* acceptance of #418 source/semantic tokens or proof of pixel parity with that CSS. Browser Zoom, native Windows High Contrast, assistive technology and #428 Toggled `aria-pressed` production fix remain their own gates. All work remains on the isolated `v3/issue-501-button-focus` branch for draft PR #502, targeting `bluent-v3`, with stable `Dev`/2.x/NuGet untouched.

## Latest live audit

Awaiting next reliable connected Penpot run (the edit and visual exports above were directly performed).
