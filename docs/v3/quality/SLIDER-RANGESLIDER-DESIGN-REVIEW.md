# Slider and RangeSlider design review handoff (#442–443)

> Status: **editable Penpot design proposals created; review pending; not implementation approval**. Updated 2026-10-23.

## Authoritative design location

- Tool: Penpot, project-owned **Bluent v3 Design System** file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`.
- Page: `03 · Quality & migration`, ID `07c521b9-e441-80bd-8008-c4ad87df93c3`.
- Slider board: `#442 · Slider design · REVIEW DRAFT`, ID `deabb4f4-bae0-800e-8008-d55884e4ac27`, 1440×1000, 39 child shapes.
- RangeSlider board: `#443 · RangeSlider design · REVIEW DRAFT`, ID `deabb4f4-bae0-800e-8008-d5588803df4e`, 1440×1000, 49 child shapes.
- Both boards were exported through Penpot and visually inspected on 2026-10-23. They are editable native boards/shapes, not flattened screenshots.

## Slider proposal (#442)

- Anatomy: label, optional visible value, track, selected fill and thumb.
- States shown: rest, keyboard focus, disabled and forced-colors treatment.
- Proposed keyboard contract: Arrow keys adjust by `Step`; Home/End reach `Min`/`Max`; optional PageUp/PageDown use a documented larger increment.
- Required semantics: slider role; `aria-valuemin`, `aria-valuemax`, `aria-valuenow`; accessible name; visible value association where used.
- Candidate API dimensions to review: value/change notification, min/max/step, orientation, disabled, label and value text. Names remain proposals until the actual C# public API is approved.
- Validation targets: `Min < Max`, `Step > 0`, deterministic clamping/rounding, pointer capture, RTL, resize, form binding, reduced motion and both WebAssembly/published InteractiveServer.

## RangeSlider proposal (#443)

- Anatomy: two thumbs, selected segment between endpoints and visible lower/upper values.
- States shown: rest, active-thumb focus, disabled and forced-colors treatment.
- Required semantics: two distinct slider tab stops, separately named endpoints (e.g. Minimum / Maximum), individual current values and announcements that identify the endpoint being changed.
- Proposed invariant: `Min ≤ LowerValue ≤ UpperValue ≤ Max` and `Step > 0`.
- Proposed default crossing policy: clamp the active thumb at the other thumb rather than silently swapping thumb identities. **This is a design proposal, not a maintainer-approved policy.**
- Edge cases needing review/tests: crossing option, equal endpoints, decimal-step rounding, RTL, touch, pointer capture, resize and form binding.

## Shared acceptance gates

1. #418 must approve the final semantic token/focus/forced-colors strategy; the proposal intentionally avoids asserting a final token name.
2. #420 must approve shared keyboard/focus/ARIA conventions and lifecycle rules.
3. #421 must provide an interactive demo/coverage contract; a static design specimen is not a demo.
4. #425 must provide browser/runtime/accessibility gates. Chromium forced-colors emulation does not substitute for native OS contrast modes or named screen-reader testing.
5. Review actual public source API before exposing parameter names or changing compatibility. Any API break belongs in the v2→v3 migration ledger.
6. Only after dependencies are accepted should the issues move through Ready → In progress, with separate task branches and PRs targeting `bluent-v3`.

## Existing live-browser evidence

The pinned `@fluentui/web-components@3.1.3` reference and Bluent Component Lab rerun documented in [FLUENT-WC-3.1.3-VISUAL-BASELINE.md](FLUENT-WC-3.1.3-VISUAL-BASELINE.md) found that Bluent's gradient-only Slider and RangeSlider rails become invisible in emulated forced colors, and that native keyboard/slider semantics are missing in the probed DOM. Those are source/browser observations; this handoff does not claim native AT certification or final Fluent approval.

## Decision still required

Review the editable boards and explicitly accept or revise (a) Slider keyboard/value semantics and orientation behavior, (b) RangeSlider thumb crossing/identity policy and endpoint names, and (c) the focus and forced-colors treatment. Until those decisions and shared dependencies are accepted, both issues remain Backlog and no product source is changed.
