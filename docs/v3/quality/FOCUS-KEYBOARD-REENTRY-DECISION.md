# #552 / #420 / #465 — manual TabList focus re-entry research

**PROPOSED ONLY, NOT APPROVED.** No Bluent product code, public API or editable design has changed. This Wave H addition is strictly a pure-policy experiment and owner review artifact on audit branch #552; PR #553 stays Draft. It cannot certify Fluent parity or native screen-reader behavior.

## Source baseline and reason for separate decision

The actual source `src/Bluent.UI/Components/TabListComponent/TabListTabItem.razor` creates a native `button` for non-link tabs and an `a href` for link mode, but no roving `tabindex` or arrow-key handler. The parent `TabList.razor` renders separate panel containers. [Actual Chrome/Edge native keyboard observations](FLUENT-PARITY-CROSS-CONTROL-KEYBOARD.md) confirmed Tab, Enter and Space on the native button, but ArrowRight and ArrowLeft do not change focus or selection in the tested specimen.

A manual-activation tablist *could* have `FocusedId=two` after an arrow while its actual `SelectedId=one` remains unchanged. If the user leaves the tablist using native Tab, the previous pure `rovingTabStops` helper always preferred the stale `FocusedId`, so a later Tab re-entry could land on an unselected tab. [WAI-ARIA APG manual tabs example](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/examples/tabs-manual/) describes focus entry on the active tab. The desired behavior **must be explicitly confirmed** against the real approved Fluent/TabList design, especially with overflow, RTL, and Href mode.

## Proposed focus-entry policy

- **Focus currently inside the tablist:** retain the roving stop at valid `FocusedId`, without automatically selecting that tab in manual activation mode.
- **Focus actually outside:** prefer eligible `SelectedId` for the next entry. If selected is unavailable, fall back to valid `FocusedId` and then first eligible item.
- On item removal/disable/hide/unmount, do not focus a missing DOM element. If all candidates are unavailable, expose no synthetic roving target.
- Do not intercept native Tab, introduce a new public `focusWithin` parameter, or implement global focus listeners. A future Blazor implementation needs component-scoped focusin/focusout and a connected post-render ElementReference focus bridge.
- This distinction is **panel tablist only**. `TabListTabItem.Href` is a route/navigation link and must not inherit fabricated tab semantics or selection behavior.

The pure fixture `scripts/quality/fixtures/focus-navigation-core-prototype.mjs` now accepts optional `{focusWithin: boolean}` in `rovingTabStops` for experiment only; default `true` preserves all earlier 35 research tests. Eight new tests cover arrow focus vs selection, leaving/re-entering, newly selected tab, disabled selected tab, hidden/removed tab, empty eligibility, invalid input and reorder.

Run: `node --test scripts/quality/test_v3_focus_navigation_prototype.mjs scripts/quality/test_v3_focus_reentry_proposal.mjs` (**43 pure research assertions**).

## Explicit outstanding evidence gate

No run of the unmodified Bluent current demo can validate the new proposed reentry semantics because the current TabList **does not itself support arrow roving focus**. A separate, design-approved owner implementation (not the #552 audit PR) must then validate actual native browser Tab/Shift+Tab from both sides, manual/automatic activation, RTL, disabled/removal, overflow and real AX tree, and physical screen-reader behavior as available.

All **33** owner-bound cases in [the acceptance matrix](FOCUS-KEYBOARD-ACCEPTANCE-MATRIX.json) still have `status=planned` and `evidence=null`. The 43 pure tests do **not** complete any component acceptance. Proposed owners: shared focus lifecycle #420, panel TabList behavior #465 and decorative Icon #429.
