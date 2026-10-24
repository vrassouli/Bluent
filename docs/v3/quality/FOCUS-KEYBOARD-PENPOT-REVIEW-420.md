# #420 Penpot design review: Focus ownership and async keyboard lifecycle

> **PROPOSED / REVIEW REQUIRED — NOT APPROVED.** 2026-10-21. This editable Penpot artifact is a research design handoff for #420 and #552. Neither product code nor stable Dev was modified.

## Verified editable Penpot source

| Field | Grounded value |
| --- | --- |
| Correct file | **Bluent v3 Design System** |
| File ID | `b64f6665-c9ab-80b5-8008-c4ac99d9d000` |
| Existing page | **40 · Blazor interaction and JS lifetime · #420** |
| Page ID | `ed5216bd-3d5b-8015-8008-cb247e27efb4` |
| **New separate board** | **#420 · Focus ownership + async lifecycle proposal · REVIEW REQUIRED** |
| Board ID | `4d22aead-d6ef-801a-8008-d2dfd28e6d18` |
| Board bounds | x=1820, y=80; 1500 × 1640 |
| Editable shape count | **81** Penpot text/rectangle layers |
| Original board | **#420 · Interaction contract and resource lifetime** — left unchanged |

The correct file ID was confirmed before editing. The new board was placed to the right of the existing #420 architecture design, not over it. A **direct Penpot PNG export** was visually inspected; headers, focus-ring and selected-state specimens, surfaces and gaps were all legible. This screenshot was used for inspection, not falsely presented as a product/Fluent acceptance test.

See [the full architecture proposal](FOCUS-KEYBOARD-ARCHITECTURE-PROPOSAL.md) for owner semantics, API conventions and design-first requirements.

**Visual preview:** [actual exported Penpot PNG — 1500 × 1640](evidence/BLUENT-FOCUS-PENPOT-BOARD-420.png). This is an unchanged export of the **editable 81-layer Penpot board**, not a substitute for the source board or design approval.

## What the board models

1. Intent from keyboard/owner event -> stable scope and logical ID -> asynchronous render/epoch validation -> `ElementReference.FocusAsync()` only when the target is still connected and user focus is still owned.
2. **TabList panel semantics**: Tab A remains selected while Tab B has visible focus, differentiating manual activation FocusedId and SelectedId. Navigation `Href` items are not panel tabs.
3. **Async cancellation**: await, rerender, unmount, dispose or owner focus changes invalidate stale pending requests. Never focus dead elements or steal current user focus.
4. **Popup lifecycle**: Escape can restore a still-connected trigger only while the popup owns focus; no restoration after external focus/route change or removed trigger.
5. Component boundaries: foundation #420 vs TabList #465, NavList #466, Accordion #469/#507 and MenuItem #517.

## Design decisions requiring reviewer approval

| Decision | Candidate | Not yet approved |
| --- | --- | --- |
| Shared policy | Pure deterministic focus-index + lifecycle epoch, no universal keydown handler | Owner-local DOM bridge and focus lifecycle |
| TabList reentry | FocusedId inside; eligible SelectedId on next native Tab entry after exit | RTL/vertical, manual/automatic activation, overflow and Href |
| Menu composite | Arrow focus policies separate from activation; disabled items may be focused without executing | MenuList focus model and disabled ARIA contract |
| Disclosure | A separate named native button for NavList and Accordion, not nested links/actions | Heading, aria-expanded, aria-controls and focus restore |
| Popup | Conditional restoration to connected trigger when focus is still owned | Nested overlays, route changes, disposal, disconnected circuit |
| Cross-cutting | Explicit role/tabindex/aria-* AdditionalAttributes precedence and visible focus ring | High Contrast, mobile, RTL, Button/TextField visual treatments |

The board is a **design-review artifact**, not approved UI tokens, a public C# API or acceptance of the real Bluent components.

## Evidence, risk, and next gate

[Wave J](BLUENT-BLAZOR-FOCUS-REAL-LIFECYCLE.md) records **174/174** native Chrome/Edge checks in an **independent real .NET 10 Blazor InteractiveServer lab**, including genuine post-render FocusAsync and interleaved async cancellation. This does **not** certify Bluent TabList or MenuItem.

[All 33 owner scenarios](FOCUS-KEYBOARD-ACCEPTANCE-MATRIX.json) remain `planned`, `evidence=null`. #552 remains In progress and PR #553 remains Draft targeting `bluent-v3`. Owners keep their existing real Project #5 status; **nothing is promoted on the basis of this proposal**. No product source, CSS, Penpot original board or stable `Dev` branch is modified.

**To review:** open **Bluent v3 Design System → 40 · Blazor interaction and JS lifetime · #420** and inspect the new board to the **right** of the original design. Record actual approval or requested changes in #420. Until then, no foundation/product implementation can treat this design as approved.
