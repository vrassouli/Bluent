# #418 — D5 dialog accessible semantics and keyboard ownership audit

**Status: three directly observed open issues; not fixed in the current opt-in portal-theme prototype.** This audit is based on live Chrome DevTools Protocol (CDP) DOM and Accessibility (AX) output from actual Blazor WebAssembly and published Interactive Server, 2026-10-11. All tested Dialogs were opened by a **programmatic click** through the existing demo; no claim about a completed keyboard Enter/Tab workflow or actual screen-reader speech is made.

## Correct editable Penpot decision records

**Bluent v3 Design System**, file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`:

- Existing `33 · Portal theme ownership decision · #418` page `acf5f619-7d81-80da-8008-c5fec09d9837`, native board `acf5f619-7d81-80da-8008-c5fec0b7ec61`: refreshed its D5 acceptance line to require a semantic dialog role, meaningful close label and focus entry/return. This does not approve an API or claim the gap was fixed.
- **New** `35 · Persian validation states and reflow · #418` page `916ee53e-8991-8009-8008-c61c0754ce9d`, native board `916ee53e-8991-8009-8008-c61c075e54cc`: 44 editable design elements, zero board-bound violations; initial PNG exported and visually inspected, final border/centering refinements checked geometrically (final re-export pending due suspended Penpot tab). The schematic board contrasts Persian invalid TextField, disabled Button, Light/Dark and real 320 CSS-pixel 400% text wrap. Noto Sans Arabic is **only a Penpot preview font**, not the selected v3 font. No bundled or redistributed font files.

## Actual current defects, with limits

The v3 opt-in `Dialog` service still uses the existing Bluent.UI Dialog component. For the scoped demo Dialog:

| CDP inspection | Observed |
| --- | --- |
| `.bui-dialog` `role` | **absent** |
| `aria-modal` | **absent** (tested examples are nonmodal) |
| Dialog title | visibly rendered `v3 scoped Dialog` but not mapped to a dialog accessible name |
| Header close Button | no textContent, aria-label or title |
| **Chrome AX accessible name of close Button** | a single **private-use icon-font glyph**, not a human-readable localized label |
| Active focus immediately after the programmatic opening | outside the dialog subtree |

These observations were reproduced in real Chrome on **WASM** and **published InteractiveServer**. A CDP-synthesized Enter-key activation experiment did not open the Dialog, so this audit does **not** attribute that outcome to Bluent keyboard behavior; the test harness may not reproduce a user-generated keyboard default action. Proper physical/native keyboard and real AT testing are mandatory.

The browser integration probe reports these under `observedUnfixedAccessibilityGaps` separate from the passing component/brand checks. **144/144 tests passing means only the existing asserted checks passed; it is not an accessibility pass.**

## Proposed next design gate (not yet implemented)

1. Specify how `Dialog` and modal/nonmodal variants expose `role="dialog"`, `aria-labelledby`, the title, and `aria-modal` when actually modal; distinguish cases where `aria-label` is needed.
2. Provide localized, meaningful accessible labels for icon-only dismiss and toolbar controls, via a backwards-compatible component contract. Avoid hard-coded English strings in Persian UI, icon-font PUA glyphs, or global DOM mutation.
3. Define focus entry, Tab/Shift+Tab containment for **modal** dialogs, focus restoration to each originating trigger and nested-dialog stack handling; nonmodal variants require separately defined behavior.
4. Test from actual keyboard and native OS High Contrast with screen readers, and measure browser AX/DOM in Light/Dark and RTL/LTR across WASM/InteractiveServer. Reduced-motion dismissal must remain functional.
5. Coordinate approved service/interaction decisions with any separate Dialog component issue (currently distinct from #418; do not autonomously start Backlog #420). Record final Penpot accessibility designs and API review before shipping.

No new public Dialog/Popover behavior, production component SCSS or stable API was altered in this audit. The `Dev` branch and released NuGet remain unaffected. Keep #418 **In progress** and PR #500 **Draft** until these and other gates are accepted.

## Additional button-triggered Popover state audit
The same live browser checks examine a visible real Bluent Popover after opening it with a Button. The trigger currently has no \`aria-expanded\`, \`aria-controls\` or \`aria-haspopup\` attributes even though the surface exists (with a DOM ID) and is visible. The surface has no \`role\` attribute. These are observed relationships, **not** a finding that every Popover variant must have \`role=dialog\`; exact semantics depend on whether the Popover is a menu, listbox, tooltip, or nonmodal dialog, and must be decided in its own design contract. For the tested interactive Button-triggered surface, the expanded-state/control relation needs review and explicit acceptance.
The executable test reports **four outstanding accessibility observations** separately under \`observedUnfixedAccessibilityGaps\`. Both actual Chrome/Blazor WASM and published InteractiveServer completed the same **144/144 existing positive assertions**, while printing all four open observations. Positive styling test counts do **not** convert the four findings into passing accessibility checks.
