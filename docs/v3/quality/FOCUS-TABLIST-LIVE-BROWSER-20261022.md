# #552 / #465 — Real Bluent TabList WebAssembly browser observations

**2026-10-22; source component unchanged; not Fluent parity, Penpot approval, or OS/AT signoff.**

The existing `scripts/quality/probe_v3_cross_component_keyboard.mjs` was rerun against the **actual Bluent WebAssembly demo** (`/components/tablists`) using native Chrome and Edge CDP keyboard input. Both engines completed **75/75 observation/instrumentation checks** across five component targets and three display modes (light/LTR, dark/RTL, emulated forced colors). A passing instrumentation check is **not** a passing accessibility requirement.

The dedicated six-row machine summary is [BLUENT-TABLIST-LIVE-BROWSER-20261022.json](evidence/BLUENT-TABLIST-LIVE-BROWSER-20261022.json), extracted from the full Chrome and Edge traces in the same evidence directory.

## Actual TabList findings (both engines, all three modes)

- The sampled `.tab-item` renders a native `button`, and CDP's accessibility tree reports role **button**, not **tab**. Its `aria-selected` is absent.
- Native Tab reaches the item, but after native ArrowRight / ArrowLeft key events **focus stays on the same item**. This reproduces missing roving arrow navigation in the current product.
- Native pointer selection changes the CSS `selected` class, confirming a narrower working behavior; it does not establish managed tab/panel accessibility semantics.
- Dark/RTL and emulated forced-colors represent synthetic browser conditions, **not** native OS high contrast or real assistive technology coverage.

The test currently targets the demonstrated TabList header item in the Size section. This is **not** a complete panel-tab / href navigation / disabled / dynamic removal evaluation. Those owner #465 scenarios stay `planned` until specifically tested in real component DOM with verified acceptance expectations. Implementation must follow #420/#465 design review.

Reproduce (on Dev01): `node scripts/quality/probe_v3_cross_component_keyboard.mjs chrome` then `node scripts/quality/probe_v3_cross_component_keyboard.mjs edge`. Browser probe regenerates broad screenshot/trace evidence; review changed files before committing.

No v2.x/Dev changes; no component code edits; #552 stays In progress and PR #553 remains Draft.
