# Bluent v3 — Focus and keyboard architecture proposal

> Audit #552, 20 October 2026. **PROPOSED, NOT APPROVED.** Design-first handoff for #420, #465, #466, #469, #507, #517 and #429. This is **not** a Bluent production implementation, Fluent parity decision or native screen-reader acceptance. Stable `Dev`, product code, Penpot and Figma have not been changed. PR #553 stays Draft.

## Source-real grounding

[Original cross-control DOM/AX audit](FLUENT-PARITY-CROSS-CONTROL-ICON-AX.md) plus [actual Chrome/Edge native keyboard evidence](FLUENT-PARITY-CROSS-CONTROL-KEYBOARD.md) establish precise starting conditions. TabList's native button can receive Tab focus and Enter/Space activation; ArrowLeft/ArrowRight do not move focus; it lacks semantic tab state. The NavItem expansion trigger and Accordion header are clickable but non-tabbable DIVs. The MenuItem specimens, **both enabled and disabled**, are not focusable; a legitimate menu should use composite keyboard navigation rather than making every row a tab stop. Decorative icon glyphs can contaminate accessible control names. These findings are limited to the original observed demos, not every supported Bluent consumer.

## Decision for design review

Share **only focus selection/indexing mechanics**, not a universal keyboard event handler. An internal proposed `FocusNavigationCore` should be pure, deterministic and UI-agnostic: ordered stable IDs, visibility, DOM presence, navigability, disabled-focus policy, effective text direction, orientation, wrap and Home/End. It chooses the *intended next ID*. Each control owns its component state, keyboard behavior and ARIA. A separate minimum post-render `ElementReference.FocusAsync()` bridge (or tightly scoped JS) focuses a real, still-connected element after Blazor rendering. **Do not create a universal keyboard handler.**

The research prototype in `scripts/quality/fixtures/focus-navigation-core-prototype.mjs` and its **35 Node.js** tests are **not** production C# or browser tests. The horizontal RTL visual-arrow convention remains an explicit proposal pending #420/#465 acceptance.

## Shared invariants for #420

1. Registration uses stable logical IDs; reorder/removal/hide/SSR hydration cannot rebind a DOM ID to another item. Focus restoration: prefer the eligible selected/focused reference; then nearby surviving item, then safe fallback. If no candidates exist, do not force focus.
2. Keep `FocusId` separate from `SelectedId`, `ExpandedId` and `ActiveMenuItemId`. Manual tabs move focus on arrow but select on Enter/Space; automatic activation is acceptable only with instant panel updates. Hover never changes a meaningful accessible control name.
3. `FocusDisabledPolicy` is owner-specific: skip disabled tabs; a disabled menu row *may* receive arrow focus under composite policy but `canActivate` must remain false. Distinguish native HTML disabled from `aria-disabled`.
4. Roving focus exposes exactly one eligible `tabindex=0` within a tablist, with other tabs `-1`. The menu can use roving focus or `aria-activedescendant`, **not both at once**.
5. Horizontal ArrowRight/ArrowLeft follow the reviewed *effective element direction* (RTL/LTR); vertical ArrowUp/ArrowDown do not reverse for RTL. Wrap, Home, End, Escape, Enter, Space and Tab must be handled only where justified by the owning component.
6. Do not intercept native Tab or global scrolling. Component-scoped handlers must prevent default only for a handled key. Avoid focus traps and stale post-render `ElementReference` access after disposal, asynchronous rerender or portal closing.
7. Support visible `:focus-visible` via Fluent semantic tokens including Forced Colors and RTL, without changing the previously accepted TextField underline/focus treatment.
8. Document authority and collisions for caller `AdditionalAttributes` (`role`, `tabindex`, `aria-label`, `aria-selected`, `aria-expanded`, `aria-current`, `aria-disabled`, `aria-controls`). Decorative Icon #429 policy hides the Regular/Filled font glyphs from actionable names but must not hide intentionally informative standalone Icons.

## Per-owner keyboard contracts

### TabList #465

For *panel tabs*: semantic `tablist` with `tab` descendants (native buttons are fine), `aria-selected`, `aria-controls`, matching labeled `tabpanel`, one roving tab stop, horizontal/vertical/RTL arrows, Home/End, selected-vs-focused state and overflow/deferred cases. Preserve working native Enter/Space. Existing `TabListTabItem.Href` means *route navigation*; do not silently treat a navigation link as a panel tab. Define navigation-link mode separately with real `a href` and `aria-current=page` where applicable. Explicitly approve a migration path.

### NavList #466

Keep real navigation links within a nav landmark. Expandable group needs its own native named disclosure `button` with `aria-expanded` and optionally `aria-controls`, **not** an interactive wrapper enclosing nested links. Native Tab/Enter/Space can then work correctly. Drawer-specific focus-return belongs to Drawer.

### Accordion #469 / AccordionPanel #507

Use a semantic heading containing a native disclosure `button` with `aria-expanded` and `aria-controls`; keep independent HeaderAction controls adjacent, *outside* that heading/button. Native Enter/Space toggle while preserving current single/multiple, panel lifecycle and DeferredLoading behavior. Optional region landmarks only where meaningful.

### MenuList + MenuItem #517

Choose an explicit menu composite (`role=menu` with `menuitem`/`menuitemcheckbox`/`menuitemradio`, appropriate `aria-checked` and `aria-disabled`) **only** for true application menus, not arbitrary navigation/list displays. Parent controls opening/closing, initial focus, ArrowUp/Down, Home/End, Escape, Tab exit, submenu direction in RTL and trigger focus restoration. Disabled entries may remain arrow-focusable but must never invoke a callback. Decide between roving DOM focus and `aria-activedescendant` before implementation; do not automatically add `tabindex=0` to every MenuItem.

## Gate sequence

- **A:** #420 + foundations #417/#418/#419/#421/#425 architectural and semantic decisions approved. Check the correct *Bluent v3* editable Penpot/Figma file, not the unrelated Runner design.
- **B:** Each owner independently approves Fluent 2 anatomy/variants, Focus/Selection/Disabled/Expanded, Light/Dark/RTL/mobile/forced-colors states.
- **C:** If authorized, implement minimal internal policy on a separate owner branch, then per-component owner PRs into `bluent-v3`. Do **not** put product code into audit PR #553, and never merge into stable `Dev`.
- **D:** Execute **33 owner-bound test scenarios** in [planned acceptance matrix](FOCUS-KEYBOARD-ACCEPTANCE-MATRIX.json): real browser and AX, keyboard and visual reference, published InteractiveServer, physical NVDA/JAWS and actual Windows contrast settings where available. All matrix cases remain **planned / not-executed** until backed by specific evidence.

Reference patterns: [WAI-ARIA Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), [Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/), [Accordion](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/), [Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/), [Fluent 2](https://fluent2.microsoft.design/).

**A green audit CI only validates recorded claims**, policy fixture tests and source-evidence guards. It does not certify design, implemented accessibility, or acceptance.

## Follow-up: manual TabList focus re-entry candidate (Wave H)

A newer [research-only design decision](FOCUS-KEYBOARD-REENTRY-DECISION.md) distinguishes focus inside the manual tablist vs focus after native Tab leaves. The candidate prefers an eligible focused tab only while inside, then returns entry priority to the eligible selected tab. This is **unapproved** and does not implement browser focusin/focusout or revise any component acceptance case.

## Editable Penpot Focus architecture review (2026-10-21)

The [new separate #420 Focus lifecycle design board](FOCUS-KEYBOARD-PENPOT-REVIEW-420.md) is editable in the correct Bluent v3 Penpot file and visually inspected. It remains **PROPOSED and NOT APPROVED**. No product owner acceptance or API implementation is implied.
