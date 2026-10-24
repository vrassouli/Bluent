# #552 family audit — Slider (#442) and RangeSlider (#443)

**Status: partial source/browser audit with confirmed gaps.** This is not a Fluent parity acceptance, design approval, product implementation, or native OS/assistive-technology sign-off. Existing Bluent source and prior real-browser evidence were reviewed; no product code was changed. Updated 2026-10-24 to reconcile the family report with the canonical matrix and dated design-artifact inventory.

## Upstream comparison decision

The pinned Fluent Web Components 3.1.3 crosswalk contains a dedicated Slider comparator (`fluent-slider`). The same pinned tag inventory does **not** contain a dedicated `fluent-range-slider`. The pinned Fluent React 9.74.10 fallback exposes a single-value `Slider`; that does not establish a two-thumb range control. Therefore:

- **Slider:** a real upstream family exists, but a complete API/feature/state mapping is still outstanding.
- **RangeSlider:** no 1:1 upstream counterpart was found in the checked Web Components manifest; React's single Slider is not equivalent. RangeSlider may be a deliberate Bluent extension, but that classification still needs explicit review/approval and must not be assumed from absence alone.

## Confirmed source and browser gaps

| Dimension | Slider #442 | RangeSlider #443 | Evidence and interpretation |
| --- | --- | --- | --- |
| Native semantics and keyboard | Root and thumb are `div` elements with no native range input, `role="slider"`, focusable `tabindex`, value ARIA, or keyboard handler. A real browser `element.focus()` probe confirms the root is not focused (`tabIndex=-1`); thumb also has `tabIndex=-1`. | Both thumbs are `div` elements without independently focusable slider semantics, accessible names, value/range ARIA, or keyboard handlers. | [Light/Dark/RTL comparison](FLUENT-WC-3.1.3-LIGHT-DARK-RTL-COMPARISON.md) includes actual focus probes; [source semantics findings](FLUENT-PARITY-P0-SEMANTICS.json) record the missing contract. This is a reproduced keyboard/accessibility gap, not merely a source suspicion. |
| Pointer coordinate model | Source passes `PointerEventArgs.ScreenX` to a calculation that subtracts `getBoundingClientRect().left` (viewport-relative). These are different coordinate spaces. | Same mismatch, plus two-thumb selection and dependent-boundary behavior. | [Real pointer/scroll audit](FLUENT-PARITY-P0-POINTER-SCREEN-VIEWPORT.md) measured `screenX-clientX=+18px` across eight actual pointerdowns; current values followed the mismatched formula, differing from the viewport model by 4.3–5.5 value points. |
| Published hosting | Real pointer events and `ValueChanged` were observed in both WebAssembly and Release-published Production InteractiveServer in the corrected natural-width sample. | Same for the tested RangeSlider pointer samples. | Do **not** claim pointer delivery is universally broken in InteractiveServer. The coordinate calculation is still wrong; another historical Server-only failure remains separately unverified in its original environment. |
| Forced colors | The gradient-only rail disappears in Chromium CSS forced-colors emulation while the thumb outline remains. | Same rail-visibility failure. | [Forced-colors and reflow comparison](FLUENT-WC-3.1.3-FORCED-COLORS-REFLOW.md) contains actual source/official screenshots. CSS media emulation is not native Windows Contrast Themes acceptance. |
| Visual/reflow comparison | Actual official Fluent WC and Bluent screenshots exist in Light/LTR and Dark/RTL. The measured official-vs-Bluent host-width difference is not automatically a defect; internal thumb/focus anatomy and accepted design must be compared. At 620 CSS px, no document overflow was observed in the corrected fixture. | Actual Light/LTR and Dark/RTL Bluent specimens and reflow measurements exist, but no matching upstream two-thumb control was found. | Screenshot/geometry observations are useful evidence, not an approved Penpot comparison or complete responsive/zoom audit. The first imposed-width test artifact was discarded and corrected; do not file it as a product defect. |
| Two-thumb contract | Not applicable to a single scalar value. | Stable thumb selection, independent names/values, dependent `aria-valuemin`/`aria-valuemax`, non-crossing or crossing policy, overlap/collision, constant Tab order and RTL/touch behavior remain open. | The absence of a dedicated upstream component means the intended RangeSlider contract must be explicit rather than copied from single Slider semantics. |

## Source contract observed

Both components expose generic numeric `Min`, `Max`, `Value`, `ValueChanged`, and optional `ThumbSize` parameters, use pointer-move/up infrastructure, and calculate their values from a DOM rail rectangle. Slider's `Orientation` and `Size` declarations are commented out in current source; the corresponding vertical calculation is also commented out. RangeSlider binds a `ValueRange<TValue>` and validates that `Max` is greater than `Min`, but it does not expose independent accessible contracts for its two thumb nodes. This is a source/API inventory, not yet a full per-feature upstream disposition.

## Design-artifact traceability (2026-10-24)

The consolidated #552 design inventory now includes additive records for the two existing review-draft boards in the project-owned Penpot file:

- **Slider #442:** page `03 · Quality & migration` (`07c521b9-e441-80bd-8008-c4ad87df93c3`), board `#442 · Slider design · REVIEW DRAFT` (`deabb4f4-bae0-800e-8008-d55884e4ac27`), 39 editable child shapes. See the [dated Slider addendum](evidence/PENPOT-ISSUE-552-DESIGN-ARTIFACT-ADDENDUM-2026-10-24-SLIDER.json).
- **RangeSlider #443:** same page, board `#443 · RangeSlider design · REVIEW DRAFT` (`deabb4f4-bae0-800e-8008-d5588803df4e`), 49 editable child shapes. See the [dated RangeSlider addendum](evidence/PENPOT-ISSUE-552-DESIGN-ARTIFACT-ADDENDUM-2026-10-24-RANGESLIDER.json).

Both remain review-only; neither is a complete reusable variant set or an approval. The original 2026-10-22 read-only snapshot remains unchanged. Text-node counts, invalid text bounds and out-of-board counts were not preserved in the existing evidence, so those metrics are recorded as `null` rather than inferred. The consolidated [design-artifact audit](FLUENT-PARITY-DESIGN-ARTIFACT-AUDIT.md) now classifies both family-specific design artifacts as `dedicated-review-board-incomplete-variant-coverage`.

## Disposition for the canonical nine-dimension matrix

For both families:

- `visual`: `audited_gaps` — the forced-colors rail disappearance is evidenced; full visual/design acceptance remains incomplete.
- `behavior`: `audited_gaps` — the coordinate mismatch is reproduced; the tested host does deliver events, so the defect is the coordinate model rather than universal Server event loss.
- `accessibility`: `audited_gaps` — actual browser focus and source semantics demonstrate missing slider operability/announcements; native OS/AT is still pending.
- `feature`, `tokenTheme`, `responsiveRTL`, `BlazorExtensions`, `designArtifact`, and `migrationDocs`: `audited_gaps` in the canonical matrix — the cross-family inventories and dated design-artifact records identify gaps, but do not complete family-level acceptance. The Slider and RangeSlider boards are now traceable, but their state/interaction mapping is incomplete and design approval remains pending.
- Family `auditStatus`: `researching`; `designApproval`: `pending`; `evidenceBundle`: `null`; `gapDisposition`: `known_gaps_open`.

## Required owner actions

1. **#442 Slider:** define native slider semantics, accessible naming and keyboard interaction; use one coordinate space for pointer and rect; restore a visible rail in forced colors; validate min/max/step and any intentionally unsupported orientation behavior.
2. **#443 RangeSlider:** decide and document the two-thumb contract, including ordering/collision, dependent bounds, independent accessible names and values, stable Tab order, keyboard/touch/pointer/RTL behavior; fix coordinate-space use and forced-colors rail visibility.
3. Keep implementation on each owning issue after the normal lifecycle/design gates. Do not implement product changes inside #552.
4. Re-test after remediation using real pointer events, scrolling, window placement, multiple input types, WebAssembly and published InteractiveServer; compare screenshots to the approved editable Bluent v3 design and the real upstream Slider. Native OS high contrast and screen-reader validation remain separate gates.

## Evidence sources

- [Pinned Fluent Web Components 3.1.3 family crosswalk](FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.md)
- [Pinned React 9.74.10 semantic triage](FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md)
- [Actual pointer/scroll measurements](FLUENT-PARITY-P0-POINTER-SCREEN-VIEWPORT.md)
- [Official Fluent vs Bluent Light/Dark/RTL screenshots and focus probes](FLUENT-WC-3.1.3-LIGHT-DARK-RTL-COMPARISON.md)
- [Forced-colors and responsive reflow observations](FLUENT-WC-3.1.3-FORCED-COLORS-REFLOW.md)
- [Machine-readable source-semantic findings](FLUENT-PARITY-P0-SEMANTICS.json)
- [Slider owner issue #442](https://github.com/vrassouli/Bluent/issues/442) · [RangeSlider owner issue #443](https://github.com/vrassouli/Bluent/issues/443)

**Boundary:** these findings support partial audits with open gaps, not Fluent equivalence, design approval, implemented fixes, or issue closure.
