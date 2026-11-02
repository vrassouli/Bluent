> **Current 2026-10-11 D5 continuation:** Escape arbitration now gives descendant controls first opportunity to handle Escape (rather than capturing it at document entry), a real opt-in Popover nested in a real Modal closes before its parent, and explicit caller-chosen initial focus has safe inside-Dialog checks. This subsequent scope is documented in [Escape and initial-focus priority prototype](D5-ESCAPE-FOCUS-PRIORITY-PROTOTYPE.md), with four 176/176 Chromium browser matrices. Earlier open items below are historical; native AT remains unverified.

# #418 — Opt-in nested Modal keyboard ownership: tested D5 prototype

**2026-10-11. Draft, not final API or WCAG sign-off.** Task branch v3/issue-418-design-tokens; Draft PR #500 targets bluent-v3 only. Dev, stable v2 and released NuGet remain unchanged.

## Actual editable design artifact

Penpot **Bluent v3 Design System**: file **b64f6665-c9ab-80b5-8008-c4ac99d9d000**. Newly authored page **36 · Modal keyboard and nested focus stack · #418**, page **535db143-a732-807e-8008-c6403ec3fa0c**, native board **535db143-a732-807e-8008-c6403f3c74af**. The board contains 35 native editable shapes covering the first/last-focus keyboard loop, topmost Modal and nested parent/child Escape routing. The actual board was exported to PNG and visually reviewed. Live Penpot readback found zero board-boundary errors; all five button-like labels are completely inside their faces, with rendered-text center offsets 0 to 0.36 px. This design research extends prior D2/D5 page **acf5f619-7d81-80da-8008-c5fec09d9837**, board **acf5f619-7d81-80da-8008-c5fec0b7ec61**. The board is *draft*, not an approved Fluent or public API contract.

## Actual opt-in API and behavior

The existing provisional DialogConfigurator.SetAccessibleDialog(name, localizedCloseLabel) provides a semantic Dialog role/name and a readable Close label. New provisional **SetModalKeyboardNavigation(bool enabled=true)** is separate, defaults false, and activates only when configured on a *modal with an explicit accessible name*. The bool is transported through DialogConfiguration to the rendered actual Bluent Dialog; no legacy Dialog is automatically registered.

Dialog lazily imports its feature-branch research asset, **src/Bluent.UI/wwwroot/v3/issue-418-dialog-focus.preview.js**, only for those explicit Modal instances. A DotNetObjectReference and ElementReference are registered on first interactive render and unregistered/disposed on component disposal. The shared document keydown listener exists only while opted-in modals are registered; the active Dialog is resolved from the live DOM stack, not inferred from the last click or global theme.

- **Tab / Shift+Tab:** from the modal root or outside it, focus enters the appropriate first/last action; at the boundaries, the focusable sequence wraps within the topmost Modal. Disabled/inert/hidden candidates are excluded.
- **Escape:** calls the top modal's actual [JSInvokable] DismissOnEscape, which invokes Bluent Dialog.Close() rather than a synthetic HTML click. The parent does not close when its child closes. Repeat keydowns and a still-closing child's animation do not accidentally dismiss the parent.
- **Nested focus return:** callers explicitly provide SetReturnFocusTargetId. A nested modal may return focus to its own Button inside the still-open parent, never behind the topmost visible dialog. After final parent dismissal the page launcher receives focus; opening a new Dialog cancels pending returns.
- **Teardown / reduced motion:** disposing the last Modal removes the global keydown listener; ordinary page Tab navigation resumes. Emulated prefers-reduced-motion: reduce does not prevent Escape dismissal or launcher focus restoration.
- **Legacy compatibility:** non-opted-in Dialogs (including static-SSR HtmlRenderer tests) are unaffected and do not acquire the new registration, roles or keyboard handler.

The opt-in demo uses **V3ModalKeyboardContent.razor**, real Bluent Buttons, a nested IDialogService call, and independently verified Dialog roots with ARIA role and modal state. The previously accidental duplicate legacy Popover ID in its sibling theme demo was cleaned up.

## Real browser/quality evidence

The dependency-free browser/CDP probe **scripts/quality/probe_v3_blazor_runtime.mjs** now passes **169 of 169 checks in each of four actual runs**:

| Browser | Blazor host | Result |
| --- | --- | --- |
| Google Chrome | WebAssembly | 169/169 |
| Google Chrome | Locally published InteractiveServer | 169/169 |
| Microsoft Edge | WebAssembly | 169/169 |
| Microsoft Edge | Locally published InteractiveServer | 169/169 |

Tests dispatch browser-level Tab, Shift+Tab and Escape, inspect actual activeElement, role/aria-modal, top modal registration, nested dismissal, correct focus return at each stack level, auto-repeat guard, page Tab navigation after teardown and Escape under simulated reduced motion. Previous theme/brand/RTL typography, CSS, forced-colors and nonmodal accessibility checks continue passing. Chrome and Edge both use Chromium; this is not true independent rendering-engine or native screen-reader proof.

Release build: **zero errors/warnings**. NUnit: **48/48**, including default-off keyboard configuration and earlier legacy no-JavaScript HtmlRenderer tests. The v3 helper is a research static asset on the isolated task branch only; no stable NuGet was published.

## Open acceptance gates

Final API naming and aria-labelledby title linkage; initial-focus policies for diverse contents; Escape priority with nested comboboxes/menus and Popovers; iframe, route-change/unmount and true keyboard hardware behavior; independent browser engines, OS High Contrast and actual screen readers. The component-specific #420 issue remains **Backlog** and has not been started. Keep #418 In progress and PR #500 Draft, with no merge to Dev.
