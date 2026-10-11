# Bluent v3 — Penpot alignment and layout quality sweep (#419)

> **2026-10-11 · Actual connected Penpot correction, not a speculative design review.**
> Working file: `Bluent v3 Design System` (Penpot ID `b64f6665-c9ab-80b5-8008-c4ac99d9d000`), named recovery version **`Bluent v3 · #419 Button and control alignment verified 2026-10-11`**, observed revision **122**. All modifications were made in the locally owned v3 design file. The upstream imported Microsoft Fluent 2 kit and stable Bluent 2.x `Dev` were not modified.

## Why this audit was required

A maintainer inspected our Penpot Button designs and spotted misaligned text/icons. The problem was not limited to Button. The earlier screenshots had been reviewed visually but did not have a **measurable alignment acceptance gate**. We measured source-component geometry in the live Penpot API first and found 37 initial flags:

| Native design family | Variants | Initial center/frame flags | Concrete root cause |
| --- | ---: | ---: | --- |
| Button appearance/state | 25 | 0 | Label almost centered, but horizontally off by 3.5px in source geometry; not counted in the initial vertical-only 37 flags |
| Button size/layout | 6 | **7** | Text glyph used as icon, 33px-tall icon box placed inside a 24–40px Button; Small icon extends **9px below** the Button face |
| TextField | 10 | **10** | Placeholder's frame center was 4px above the input surface center |
| Checkbox | 12 | **8** | Checked/Mixed glyph boxes were 3px above center and extended 2px above the indicator |
| Switch | 12 | **12** | Label box center was 3px above the track center |
| **Total** | **65** | **37** | Counts above reflect the **initial vertical/overflow measurement**, not an exhaustive pre-fix visual audit |

Additionally, the broader board review uncovered **one text frame** extending beyond an authored board: `FILLED` column heading (`Appearance column 1`) on page `16 · Bluent TextField variants`. Its original right edge was 1355 while the board right edge was 1300; it was resized to end at 1276, leaving a 24px margin.

## Corrections made inside the actual Penpot file

### Button sizing/content (6 native variants)

- Replaced the decorative `+` **text glyph** with a local editable vector cross (two centered, perpendicular Penpot rectangles) in a fixed **16 / 18 / 20px** icon slot for Small / Medium / Large.
- Replaced independent hard-coded glyph/label offsets with a **deterministic centered content group**, computed from Button face width, icon slot, label width and fixed gap. Text is vertically centered inside its actual Button height. Icon-only content is centered on both axes.
- Kept the old icon/text source shapes **hidden for traceability**; these are not the rendered contents of the updated variants.
- Tested a native Penpot FlexLayout on a Small Button first. The Penpot plugin returned a pending/zero-position text layout and the live PNG did **not** render the caption correctly. That attempt was deliberately **reverted**, and explicit center geometry was used instead. **Do not claim the final components are auto-layout powered.** Their centers are deterministic at the authored design sizes, but resizing still needs separate testing.
- Corrected the original single-state `DRAFT · Primary Button` text frame to align to its source board center.

### Button appearance/state (25 variants)

- Reflowed all `Button label` text frames to the face's horizontal **and vertical center**, `verticalAlign=center`, without changing state color tokens or source variant axis labels.
- Reflowed all eight button-API **editable illustration** labels; fixed compound `Text + SecondaryText` overlap by giving each its own vertical band, centered the Circular "+" placeholder, and removed duplicate dropdown arrows from the Split example.
- The linked upstream Fluent 2 source components were not touched.

### TextField (10 variants + original single-state prototype)

- Placeholder frames now match their input surface's vertical center with deterministic left inset and valid containment.
- Focus caret illustration centered on the input face in its applicable variant.
- The original local `DRAFT · TextField` instance also received corrected input/placeholder geometry.

### Checkbox (12 variants + original single-state prototype)

- The Checked/Mixed glyphs now occupy the exact 24×24 indicator box with centered text and alignment, instead of an offset glyph box.
- All labels vertically align with indicator centers; focus-outline frames are centered around indicators.
- The original local `DRAFT · Checkbox` check glyph and label were aligned too.

### Switch (12 variants + original single-state prototype)

- Label boxes now match the track's vertical center in **both LTR and genuine Persian RTL** examples; the label remains on the correct logical side.
- Knob positions vertically center inside tracks; Focus outlines also align to tracks.
- The original local `DRAFT · Switch` label/knob were corrected.

## Repeatable quality gate — real Penpot API

**Source:** [`scripts/quality/penpot_v3_alignment_audit.js`](../../../scripts/quality/penpot_v3_alignment_audit.js)

Run the **raw contents** of this script inside the connected **Penpot execute_code** context while the correct v3 working file is active. The script deliberately relies on the actual live `penpot` and `penpotUtils` objects. It is **not** a Node/browser command and is **not executed** by the offline JSON manifest validator.

The test inspects:

- **65** native variants in five project-owned VariantContainer families; verifies all **65** linked preview instances have a valid local source component and unique axis tuples.
- Center alignment, containment, icon/text gap, icon stroke centering, text placement, Checkbox status glyph and focus-ring positions, Switch knob/label/focus geometry and RTL label side, original four single-state prototypes, and Compound two-line overlap.
- A broader pass over **23 authored `#419` root boards**, measuring all **632 visible text layer bounds** against their authored board.
- Last live result after all fixes: **910 geometric checks, 0 errors, PASS** at observed Penpot revision **122**. The earlier 37 design flags and one board heading overflow are now corrected.

The five corrected native matrix boards (Button appearance × state, Button size × layout, TextField, Checkbox, Switch), original local control preview board, and Bluent-specific Button API sketch board were **PNG-exported and reviewed** after repairs. This was also checked on source variants rather than patching only visual copy instances, preserving the instance source links.

## Follow-up after linked parity and resize pages

After adding **two new project-owned Penpot pages** (Fluent Button comparison and responsive resize stress laboratory) and correcting the six Button size/layout native variants with actual Penpot horizontal constraints, the live source alignment script was rerun against saved file revision **138**. Its expanded results: **25 authored root boards**, **712 visible text frames**, **65 native variants and 65 linked native matrix instances**, **990 geometric checks / 0 errors**. The earlier **910 checks / 23 boards / 632 text frames** were the historically verified baseline at revision 122, not the latest full scan.

A separate [Button parity linked-source audit](BUTTON-PARITY-REVIEW.md) found ten real reference/native pairs with ten content/icon mismatches; it deliberately does **not** claim pixel parity. The [Button resize audit](BUTTON-RESIZE-REVIEW.md) verified 18 linked samples, 145 design geometry checks and 0 errors, distinguishing stretchable icon+label buttons from fixed-square icon-only controls. All source and presentation research remains Draft; browser/Blazor behavior is not established.

## What this does *not* establish

A zero-failure geometry audit proves only the checked **Penpot frame geometry**, not precise optical centering across OS font renderers. It also does **not** certify:

- Segoe UI or the final Persian font metrics; canvas previews use available substitute fonts.
- Runtime Blazor CSS Flexbox/Grid, touch target size, Responsive zoom/reflow, Fluent-pixel-by-pixel parity, or final 10-brand × 2-mode contrast.
- Keyboard/screen reader semantics, actual `aria-checked`, focus-visible in forced colors, Popover/Dialog behavior, reduced motion and SSR interactivity.
- Every decorative image or nested imported Fluent asset: the **23 authored root boards** and local source families were in the sweep; imported Fluent assets are **reference-only and not modified**.
- Fully responsive local design components. Their geometry is verified at the specific authored sizes; stretch/reflow should be tested separately before sign-off.

For all subsequent component issues, an alignment audit should be a **mandatory design acceptance gate** before `Review`, alongside actual image inspection, state/font/RTL/contrast validation, runtime tests, docs, full-feature demos, Skills and migration documentation.

This task remains in **Issue #419 In progress**, [Draft PR #499](https://github.com/vrassouli/Bluent/pull/499) targeting **`bluent-v3`**. No merge/publish to stable Bluent v2.x.