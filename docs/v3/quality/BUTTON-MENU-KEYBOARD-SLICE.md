# Button-managed MenuList keyboard and ARIA slice — #428

Status: implementation slice under review; not full Issue #428 acceptance.

## Design source

The current source-owned Penpot file is **Bluent v3 Design System**, page **46 · Button dropdown menu keyboard contract · #428** (page ID `ebe6a73c-d7b0-804d-8008-daec5fe2edb9`, board ID `ebe6a73c-d7b0-804d-8008-daec60488d87`). The board records the trigger, popup/item roles, focus lifecycle, keyboard matrix and explicit evidence boundaries.

## Contract implemented in this slice

- Button-managed menu trigger: `aria-haspopup="menu"`, `aria-expanded`, and a stable `aria-controls` reference.
- Caller-provided attributes cannot override the managed menu's aria-haspopup, aria-expanded, or aria-controls; unrelated attributes such as data-qa remain pass-through. The compatibility fixture deliberately supplies conflicting values and the runtime matrix checks for one component-owned value for each attribute.
- MenuList: `role="menu"` and an accessible name provided with `aria-label` or `aria-labelledby`.
- MenuItem: `role="menuitem"`, `tabindex="-1"`, and `aria-disabled="true"` for disabled entries; nested menu triggers expose their submenu relationship.
- Keyboard navigation: ArrowDown/ArrowUp with wrapping, Home/End, disabled-item skipping, character type-ahead, leaf Enter/Space activation through one click plus JavaScript-owned dismissal, submenu activation through the component callback, Escape focus restoration, Tab and Shift+Tab dismissal that moves focus to a real keyboard-focusable element without a focus trap, and direction-aware submenu arrows.
- Popover interop caches the in-flight JS instance creation. This prevents concurrent first-render Set/Show/Hide callbacks from creating different JavaScript Popover objects with separate active-state maps.
- Opening and closing Button-managed popovers use internal awaited show/close paths across Blazor and JavaScript; opening is no longer fire-and-forget from the managed Button click handler.
- Closing a popover synchronizes the trigger aria-expanded state even when the current JavaScript instance did not record that instance as active.

## Browser evidence

The published-production probe is scripts/quality/probe_v3_button_toggle_interactive_server.mjs. On 2026-10-30, the fresh temporary Production host passed **208/208 assertions, 0 failures** in Chrome/Edge × InteractiveServer/InteractiveWebAssembly (52 checks per combination). InteractiveServer confirmed the real SignalR WebSocket HTTP 101 handshake. Checks cover initial/collapsed ARIA and DOM readiness, menuitem semantics, disabled-item skipping, Arrow/Home/End navigation, type-ahead, exactly-once Enter/Space leaf activation and closure, LTR and RTL direction-aware submenu opening/closing (including opposite-direction key non-actions), Escape and forward/reverse Tab dismissal/focus, nested submenu navigation, and Button aria-pressed interactions. This was a local published host, not a deployment. The reproducible Windows PR gate is .github/workflows/v3-button-runtime-contract.yml; it runs the Release solution tests and the same Chrome/Edge × InteractiveServer/InteractiveWebAssembly probe. Current local validation: Button .NET test project 31/31 passed; docs-contract tests 22/22; full quality suite 67/67; docs contract 0 findings; Markdown links checked in 158 files; consumer Skill coverage 58 families / 67 routes. After updating the existing broad WebAssembly Button probe to assert the newly implemented aria-haspopup=menu contract on both caret and caretless Dropdown triggers (rather than its obsolete pre-menu null expectation), the probe also passed 211/211 in Chrome and 211/211 in Edge on the live Debug WebAssembly demo.

## Acceptance boundary

This slice does not sign off the full Fluent visual/API parity of #428. Approved #418 token mapping, visual parity against the owned Penpot designs, native Windows Contrast Themes, named screen-reader acceptance, and maintainer review remain separate acceptance gates. Do not use this document or source-level checks as substitutes for those gates. Keep issue #428 In progress and PR #554 Draft until the full issue criteria are accepted.
