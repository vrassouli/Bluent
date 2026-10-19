> **New D5 name-from-title audit (2026-10-11):** Named standard Dialogs now associate their visible h2 with a unique aria-labelledby reference; custom fragment Dialogs retain an explicit aria-label fallback. Four Chrome/Edge × WASM/InteractiveServer browser suites pass 183/183 each. See [Penpot page 38 and Dialog AX naming evidence](D5-DIALOG-HEADING-AX-AUDIT.md). Native NVDA/VoiceOver sign-off remains OPEN.

# #418 — Escape priority and caller-owned initial focus (D5 draft)

**2026-10-11.** This is experimental, *opt-in* code on `v3/issue-418-design-tokens`, with Draft PR #500 targeting `bluent-v3`. No stable `Dev` merge or NuGet publish.

## Design-first source

The correct editable Penpot **Bluent v3 Design System**, file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, now contains:

- **Page 37** `535db143-a732-807e-8008-c644769400c0`, **board** `535db143-a732-807e-8008-c644771eb48a`, titled *Modal Escape priority and focus policy*. This contains **26 editable native Penpot elements**, zero verified board-bounds errors, and was exported to PNG and visually inspected. It distinguishes deep-first Escape behavior from the explicit initial-focus decision. It is **DRAFT**, not maintainer approval or Fluent 2 pixel parity.
- Earlier keyboard-stack page 36 `535db143-a732-807e-8008-c6403ec3fa0c`, board `535db143-a732-807e-8008-c6403f3c74af`. The D2/D5 portal owner board 33 remains background architecture.

## The Esc interaction rule

A modal-only global **Capture** listener had previously intercepted Escape before descendant controls. The opt-in modal listener now runs in **window bubble phase**, after a nested control has had the opportunity to handle the event; it still respects `defaultPrevented`, `isComposing` and repeat/closing guards. Tab/Shift+Tab focus containment and nested top-modal ownership remain active.

For `Popover.AccessibleTriggerState=true`, the real Popover JS class owns its visible state (and aria-expanded). While its surface is actually shown, it registers an opt-in **document bubble** Escape handler. When Escape originates on its trigger or surface, this listener prevents and stops the event, hides only the Popover, restores the trigger focus, and unregisters on dismissal. Other Popovers and legacy controls receive no new handler. The opt-in handler ignores surfaces already hidden or in the process of closing and skips composing/repeat events. It deliberately **does not** impose a generic surface role/aria-haspopup: a menu, listbox, tooltip and nonmodal dialog need different contracts.

When an internal control calls `preventDefault()` and `stopPropagation()` on Escape, the modal's window handler does not dismiss the Dialog. If no child owns the key, the topmost modal closes using its existing asynchronous Blazor Close lifecycle. Nested Dialog stack and launcher-return behavior remain covered by earlier tests.

**Not claimed:** Escape ownership when an arbitrary *non-opted-in* third-party portal uses an uncoordinated document/window listener, all possible inputs, or route-unmount races. The correct component-specific priority needs individual design review.

## Explicit initial-focus selection

Provisional `DialogConfigurator.SetInitialFocusTargetId(string elementId)` requires a nonblank ID and is opt-in. It is transported through `DialogConfiguration` and the real Dialog parameter. On first interactive render, the named Dialog focuses its own root, then calls `focusInitial(root, elementId)` from the isolated helper. The helper verifies that a target:

- is within **this Dialog** (not outside it or in a sibling/underlying modal);
- is connected, visibly rendered, not disabled or aria-disabled, not inert/aria-hidden;
- participates in the Dialog's focusable candidate set.

Only such a target gains programmatic focus. Any missing, disallowed or external target causes a safe **Dialog-root fallback**, not focus leakage outside the modal. The real v3 demo exposes both a valid inside target and an intentionally external target. Without an explicit ID, the previous root-first policy stays unchanged. Non-opt-in legacy Dialog markup and HtmlRenderer behavior remain unchanged.

## Live browser and build evidence

`scripts/quality/probe_v3_blazor_runtime.mjs` now passes **176/176 actual browser/CDP checks in each of four runs**: Chrome WebAssembly, Chrome locally published InteractiveServer, Edge WebAssembly, and Edge locally published InteractiveServer. The additions inspect:

- a **real Popover nested inside a real Modal** opening with aria-expanded true;
- first Escape closing only that Popover, with Dialog count unchanged, aria-expanded false and focus restored to the Popover trigger;
- a real descendant consuming Escape independently without accidentally dismissing the Modal;
- explicit valid last-action initial focus vs rejected outside ID and safe root focus;
- correct return focus to the respective page launchers after modal dismiss.

Existing topmost/nested Escape, Tab/Shift+Tab, motion, RTL/Persian, brand, simulated forced-colors, legacy Popover and nonmodal Dialog checks continue passing. Unit tests guard explicit configured IDs and empty-ID rejection. This is Chromium implementation evidence, **not** independent browser-engine, native keyboard/AT, NVDA or VoiceOver acceptance.

## Remaining blockers to sign-off

Real NVDA/VoiceOver and OS High Contrast with native keyboards; exact focus sequence with TextField/ComboBox/Select/menus and non-opted-in third-party overlays; role/aria-labelledby/title semantics; component-specific popup roles and Escape contracts; navigation/unmount and intermediate event-race handling; final Fluent/API/Skills/migration parity review. Issue #420 remains Backlog and is not silently implemented.

Keep #418 In progress and PR #500 Draft until these gates are genuinely accepted.


## Open-Popover unmount cleanup regression (2026-10-11 follow-up)
The opt-in JS Popover instance now exposes unregisterOptInEscapeByTriggerId, called through the existing PopoverInterop on actual PopoverService.Destroy for that opted-in trigger only. It releases the document keydown listener even when Blazor unmounts a still-open Popover before its usual close lifecycle; old/non-opted-in Popovers are not changed. The research lab includes an explicitly removable opened Popover and its own in-surface Remove button, avoiding a coincidental outside-click close. The CDP probe uses DOMDebugger.getEventListeners(document) to verify **the new keydown listener count rises by one on show and returns to the original count after actual component disposal**. This passed in Chrome and Edge with actual WASM and locally published InteractiveServer: **177/177** each (first server attempt hit transient local ERR_CONNECTION_REFUSED; clean rerun passed). JS module disposal/route teardown across arbitrary third-party popup libraries is not certified.
