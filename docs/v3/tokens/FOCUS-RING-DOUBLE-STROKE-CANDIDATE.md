# #418 / #501 — two-layer Focus2 browser candidate vs Penpot draft

**Date:** 2026-10-13
**Status:** Explicitly opt-in demo-only; no default v3/2.x Button CSS, token or public API has been changed.

## Verified editable design source

Owned file `Bluent v3 Design System` `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, page `acf5f619-7d81-80da-8008-c5ef1089ac94`, **new Light/Dark Focus2 draft** board `cd054205-a525-80d8-8008-c87438620de4`. Actual PNG exported and visually inspected. Corrected ring alignment: live `scripts/quality/penpot_v3_focus2_proposal_audit.js` checks **38/38 passed**, including source geometry, 2px/1px inner-aligned strokes and corner radii. Board still says `unapproved`.

The board illustrates a 2px outer black Light / white Dark Focus2 stroke and an independently editable canvas-colored inset/gap around a Primary Button. Literal sample colors are **not** aliases connected to live Penpot tokens. Neither the board nor the source token choice is approved as final.

## Browser-only CSS preview

`src/Bluent.UI.Demo.Pages/Pages/Scenarios/V3StylingLab.razor.css` now provides a **second opt-in experiment**, separate from the already-existing single-outline `data-bui-v3-focus-contrast-candidate`. Only a Styling Lab host explicitly carrying `data-bui-v3-focus-double-ring-candidate` gets the experiment:

- `--v3-lab-focus: var(--colorStrokeFocus2)` — an existing Fluent source color. It remains black on Light and white on Dark in the existing ten brands.
- A 2px solid `:focus-visible` outline at `outline-offset: 1px`, plus a **1px** canvas-colored `box-shadow` spacer beneath the outline, so the outer visible ring edge is exactly **3px** beyond the Button border while the inner gap begins **1px** outside. This tests a **two-layer visual treatment** without resizing the face, changing keyboard interaction or touching the normal Button API.
- In `(forced-colors: active)`, use the OS `Highlight` color and **drop the box-shadow**, retaining a 1px outline offset. Shadows are not relied upon for mandatory high-contrast focus visibility.

**After the user-reported alignment defect was corrected on page 38**, the dedicated #418 Penpot sample was also updated directly: its editable outer ring bounds are `(face.x-3, face.y-3, width+6, height+6)` with 2px inside-aligned stroke; the editable canvas-colored gap is `(face.x-1, face.y-1, width+2, height+2)` with 1px inside-aligned stroke. Corner radii are face radius plus the corresponding offset. The opt-in browser CSS now expresses the **same nominal 3px/1px ring edge geometry** with a 2px outline at `outline-offset:1px` and a 1px canvas-colored spread shadow. These are nominal CSS/shape bounds, **not a demonstrated pixel-identical screenshot**, due to different browser outline-radius painting and Penpot vector rendering. Final design acceptance remains open.

## Browser validation

`scripts/quality/probe_v3_blazor_runtime.mjs` adds 20 checks (10 brands × 2 themes) of the real keyboard-focused Blazor Button with the new temporary host attribute. It validates: `:focus-visible` remains true; computed outline width 2px, offset 1px, shadow spread 1px and canvas-color match, ring contrast ≥3:1 against its own host surface, and stable face geometry when the attribute is enabled/disabled. A further Forced Colors check validates `Highlight`, offset 1px and no shadow. The *original* single-outline candidate tests, CSS zoom/RTL, narrow 320/400px viewports (all six appearances), Popover/Dialog tests and old low-contrast baseline evidence remain unchanged.

**Real Dev01 full-suite results after rebuilding the opt-in CSS:** Chrome/WebAssembly **502/502**, Edge/WebAssembly **502/502**, Chrome/published InteractiveServer **505/505**, Edge/published InteractiveServer **505/505**, all **zero failed**. The 21 added two-layer checks increased the prior 481/484 checks to 502/505. **Total: 2,014 passing assertions**. The baseline ring contrast problem remains visible and unmodified; this is candidate CSS, not a release.

## Remaining acceptance gates

Design review of ring geometry/contrast in actual Penpot variants (including Danger, Split, selected+focused); screenshot comparison of the actual two-layer CSS against Penpot; real browser UI Zoom, Safari/Firefox, native Windows High Contrast and assistive-technology validation; final chosen semantic aliases and source/preview mapping. #418 and #501 stay In progress, their PRs remain Draft. #428 remains Backlog pending foundation and design acceptance. All v3 work remains isolated from `Dev` and stable NuGet.


## CI cold-publish timeout finding (not a product regression)

The preceding #418 commit `a9cd3d37` had a failed GitHub Actions Chrome/Server job `38383442431 / 115249273449` despite full Dev01 local browser success. Retrieved job logs showed `spawnSync dotnet ETIMEDOUT` **before any browser checks**, because `dotnet publish -c Release` exceeded the original 120-second hard timeout on a Windows hosted runner. The exact script was corrected to allow **300 seconds** and report bounded `dotnet` stdout/stderr when publish fails. Do **not** misclassify this as a Focus visual/keyboard defect, or assume that the longer timeout alone proves CI will pass; check the latest PR job verdict after pushing this change.

## 2026-10-13 — #501 ring/RTL alignment follow-up and exact geometry matrix

Page 38 #501 was corrected to compute every editable Focus vector from the **actual Button border/face**, not the oversized outer specimen wrapper. That alignment contract is now mirrored by the Light/Dark Penpot Focus2 board on page 32 (shape `cd054205-a525-80d8-8008-c87438620de4`) and the independently opt-in Styling Lab CSS. The original page-32 board had overly detached vector offsets **7px/4px** and a **2px** contrast stroke; these were corrected to symmetric **3px/1px** vectors with **2px/1px** strokes. A fresh actual exported PNG was reviewed, and the revised live Penpot script passed **38/38** checks, including radii and center positioning.

The real Blazor browser probe now additionally measures the 3px/1px opt-in two-layer ring on **six Button appearances** at 320px and 400px native CSS viewports under **ten brands, Light/Dark and LTR/RTL**. Per browser/host that is **80 independent scenarios / 480 real Button ring observations**, *in addition* to the prior 80 samples for the original single-ring candidate and the CSS zoom matrix. Every observation checks keyboard `:focus-visible`, outer ring computed 2px width + 1px offset = 3px outside face, 1px canvas-colored spread shadow, contrast at least 3:1 and no face layout shift.

**Verified Dev01 local results:** Chrome/WebAssembly **582/582**, Edge/WebAssembly **582/582**, Chrome/published InteractiveServer **585/585**, Edge/published InteractiveServer **585/585**; **2,334/2,334 combined, zero failures**. For all four hosts the **additional** Penpot-aligned 80/80 viewport combinations passed, with **480/480 native Button ring observations per host (1,920 in total)**. This increases each previous host test suite by 80 cases. Source theme contract, preview-generation check and token contrast audit also passed. **Fresh GitHub Actions checks on the updated commit must still run**: successful Dev01 runs must not be called CI passes.

Remaining limits: this is a research-only demo CSS attribute, not released Button CSS; real browser UI zoom, full Penpot/native CSS pixel screenshot diff, non-Chromium engines, Windows high contrast and assistive technology remain unverified; the `--colorStrokeFocus2` source-to-semantic token choice and actual native Button rewrite need explicit design review.
## 2026-10-13 — painted stacking regression after exact geometry contract

The new actual rendered browser screenshot, sampled along the upper and lower center of a keyboard-focused Bluent Button, found a real defect that geometry and outline computed styles had missed: the following action row overpainted the lower Focus2 ring. This is now addressed **only inside the opt-in Styling Lab Focus2 selector** with `position:relative; z-index:1`. Full viewport CDP screenshot PNGs are sampled using native Browser Image/Canvas, without image tool dependencies; both Light (black Focus) and Dark (white Focus) retain their two real painted pixels on *both* top and bottom. **Chrome and Edge WebAssembly 585/585, published InteractiveServer 588/588 each (2,346/2,346 local checks, 0 failures)**. See [the actual pixel/paint evidence and limitations](FOCUS-RING-PAINT-STACK-AUDIT.md). This is NOT global Button styling or Pixel-perfect Penpot acceptance.