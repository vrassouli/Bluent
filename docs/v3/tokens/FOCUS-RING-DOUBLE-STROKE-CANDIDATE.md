# #418 / #501 — two-layer Focus2 browser candidate vs Penpot draft

**Date:** 2026-10-13
**Status:** Explicitly opt-in demo-only; no default v3/2.x Button CSS, token or public API has been changed.

## Verified editable design source

Owned file `Bluent v3 Design System` `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, page `acf5f619-7d81-80da-8008-c5ef1089ac94`, **new Light/Dark Focus2 draft** board `cd054205-a525-80d8-8008-c87438620de4`. Actual PNG exported and visually inspected. Live Penpot structural checks: 8/8 passed; full 30-check audit helper `scripts/quality/penpot_v3_focus2_proposal_audit.js` is syntax checked, but **not claimed as fully executed live**. Board still says `unapproved`.

The board illustrates a 2px outer black Light / white Dark Focus2 stroke and an independently editable canvas-colored inset/gap around a Primary Button. Literal sample colors are **not** aliases connected to live Penpot tokens. Neither the board nor the source token choice is approved as final.

## Browser-only CSS preview

`src/Bluent.UI.Demo.Pages/Pages/Scenarios/V3StylingLab.razor.css` now provides a **second opt-in experiment**, separate from the already-existing single-outline `data-bui-v3-focus-contrast-candidate`. Only a Styling Lab host explicitly carrying `data-bui-v3-focus-double-ring-candidate` gets the experiment:

- `--v3-lab-focus: var(--colorStrokeFocus2)` — an existing Fluent source color. It remains black on Light and white on Dark in the existing ten brands.
- A 2px solid `:focus-visible` outline at `outline-offset: 5px`, with a four-pixel canvas-colored `box-shadow` spacing layer behind. This tests a **two-layer visual treatment** without resizing the face, changing keyboard interaction or touching the normal Button API.
- In `(forced-colors: active)`, use the OS `Highlight` color and **drop the box-shadow**, moving outline offset to 2px. Shadows are not relied upon for mandatory high-contrast focus visibility.

The browser CSS is only a **candidate inspired by** the vector board, not pixel-identical geometry: the board uses two native vector strokes at offsets -7 and -4 from the Button face; the browser uses outline/shadow CSS with an offset +5 and 4px spacer. A visual parity screenshot and exact approved geometry remain required before a production Button implementation.

## Browser validation

`scripts/quality/probe_v3_blazor_runtime.mjs` adds 20 checks (10 brands × 2 themes) of the real keyboard-focused Blazor Button with the new temporary host attribute. It validates: `:focus-visible` remains true; computed outline width ≥2px, offset 5px, canvas-colored shadow present, ring contrast ≥3:1 against its own host surface, and stable face geometry when the attribute is enabled/disabled. A further Forced Colors check validates `Highlight`, offset 2px and no shadow. The *original* single-outline candidate tests, CSS zoom/RTL, narrow 320/400px viewports (all six appearances), Popover/Dialog tests and old low-contrast baseline evidence remain unchanged.

**Real Dev01 full-suite results after rebuilding the opt-in CSS:** Chrome/WebAssembly **502/502**, Edge/WebAssembly **502/502**, Chrome/published InteractiveServer **505/505**, Edge/published InteractiveServer **505/505**, all **zero failed**. The 21 added two-layer checks increased the prior 481/484 checks to 502/505. **Total: 2,014 passing assertions**. The baseline ring contrast problem remains visible and unmodified; this is candidate CSS, not a release.

## Remaining acceptance gates

Design review of ring geometry/contrast in actual Penpot variants (including Danger, Split, selected+focused); screenshot comparison of the actual two-layer CSS against Penpot; real browser UI Zoom, Safari/Firefox, native Windows High Contrast and assistive-technology validation; final chosen semantic aliases and source/preview mapping. #418 and #501 stay In progress, their PRs remain Draft. #428 remains Backlog pending foundation and design acceptance. All v3 work remains isolated from `Dev` and stable NuGet.


## CI cold-publish timeout finding (not a product regression)

The preceding #418 commit `a9cd3d37` had a failed GitHub Actions Chrome/Server job `38383442431 / 115249273449` despite full Dev01 local browser success. Retrieved job logs showed `spawnSync dotnet ETIMEDOUT` **before any browser checks**, because `dotnet publish -c Release` exceeded the original 120-second hard timeout on a Windows hosted runner. The exact script was corrected to allow **300 seconds** and report bounded `dotnet` stdout/stderr when publish fails. Do **not** misclassify this as a Focus visual/keyboard defect, or assume that the longer timeout alone proves CI will pass; check the latest PR job verdict after pushing this change.