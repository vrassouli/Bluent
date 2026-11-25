# Issue #418 consumer review - DateField non-modal dialog popup

> Status: source-backed consumer review and API proposal only. This document does not approve a new public Popover API, does not change production behavior, and does not move DateField #438 out of Backlog.

## Consumer design

The owned Bluent v3 Penpot file records the DateField decision on page 61, `DateField - Fluent design decision - #438` (page id `39bbee31-a6cb-801d-8008-feba6ea9ebf9`). The selected model is a compact, anchored, **non-modal** calendar popup. The input remains editable and separate from the calendar trigger. The popup must be exposed as a labelled `dialog`, but it must not set `aria-modal`, inert the page, trap focus, or behave like the modal Dialog service.

The shared #418 boundary is limited to the trigger/surface relationship. DateField #438 owns initial focus on the selected date (or today), date-grid keyboard navigation, selection, and closing when Tab/Shift+Tab naturally exits the calendar.

## Current source behavior - verified on `v3/issue-418-design-tokens`

### Trigger type

- An ordinary `Button` renders caller-supplied `aria-haspopup="dialog"` unchanged.
- The Button-managed Dropdown/Menu path intentionally owns `aria-haspopup="menu"` and filters conflicting caller popup-state attributes. That is a different semantic contract and must remain unchanged.
- Regression coverage: `tests/RegexSampleGeneratorTest/PopoverDialogTriggerContractTests.cs`; focused Release test passed 1/1 on 2026-11-25.

### Expanded state and controls relationship

- `Popover.AccessibleTriggerState` is the existing experimental, explicit opt-in. It is serialized into `PopoverSettings.AccessibleTriggerState`.
- The Popover JS then supplies `aria-expanded` and a persistent `aria-controls` pointing at `<trigger-id>_surface`, and updates expanded state as the surface opens/closes.
- Consumers must **not** pre-render their own `aria-expanded` or `aria-controls` when this opt-in is enabled. The current JS deliberately treats pre-existing attributes as caller-owned and does not overwrite them, so a pre-rendered static value would become stale.
- `aria-haspopup` remains consumer-owned; Popover does not infer it.

### Escape and focus restoration

- The shared document Escape handler closes the topmost open Popover when the event originates within its trigger or surface for an opt-in disclosure.
- That close path calls `hideSurface(..., true)`, which restores focus to the connected, enabled trigger.
- Escape from unrelated focus elsewhere in the document is not consumed by this opt-in path.
- This is the shared Escape/return-focus behavior only; it does not provide the DateField's initial selected-day focus or calendar-grid navigation.

### Remaining shared surface gap

`PopoverSurface.razor` currently renders the positioning root as a plain `<div id="<trigger-id>_surface">` with no semantic role and no accessible name. `AccessibleTriggerState` only manages the trigger's expanded/controls relationship; it does not name or type the surface. Generic Popover also does not close an ordinary non-menu popup on Tab/Shift+Tab leaving the surface.

Therefore the current shared implementation is **not yet sufficient by itself** for the DateField contract. DateField needs its controlled surface root to expose `role="dialog"` and a stable accessible name. This must remain **consumer-selected semantics**, not a universal Popover role: a menu, listbox, tooltip and non-modal dialog have different contracts. If #418 accepts a shared API, it should only forward an explicitly supplied role and accessible-name source (for example `aria-label` or `aria-labelledby`) to the actual controlled root; an unconfigured Popover must gain no inferred/default role, and Popover must not force `aria-haspopup`. DateField #438 chooses `dialog`; other consumers keep their own semantics. Exact public member names and validation rules remain open for review.

## Recommended responsibility split

| Concern | Owner |
| --- | --- |
| Caller-provided `aria-haspopup="dialog"` | DateField trigger usage, using ordinary Button attributes |
| Live `aria-expanded` and persistent `aria-controls` | Existing opt-in Popover disclosure behavior |
| Explicit, consumer-selected role/name on the actual controlled surface root (no inferred/default role) | Shared Popover plumbing in #418, if accepted; additive and opt-in |
| Escape dismiss + trigger focus restoration | Existing Popover behavior, verified for opt-in disclosure |
| Focus selected date/today on open | DateField #438 |
| Arrow/Home/End/PageUp/PageDown calendar navigation | DateField #438 |
| Tab/Shift+Tab natural exit and popup close | DateField #438; no focus trap |
| Modal state, inert background, modal focus trap | Not used by DateField |

## Acceptance tests to add before #438 can enter Ready

1. Plain Button preserves `aria-haspopup="dialog"`; managed Menu Button continues to emit only `aria-haspopup="menu"`.
2. Opt-in Popover adds and updates exactly one `aria-expanded` and persistent `aria-controls`; pre-authored conflicting values are not used by the DateField implementation.
3. DateField's actual controlled surface root exposes its explicitly selected `role="dialog"` and a stable accessible name; no `aria-modal` is emitted. Unconfigured Popovers gain no role, and menu/listbox/tooltip consumers retain their own semantics.
4. Escape from inside closes and restores focus to the calendar trigger; focus outside the trigger/surface is not stolen.
5. Tab and Shift+Tab leave the page's natural focus order, close the calendar, and do not trap focus.
6. Opening focuses the selected day or today; DateField owns the calendar-grid keyboard contract.

## Design references

- [DateField page 61 - owned Bluent v3 Penpot file](https://design.penpot.app/#/workspace?file-id=b64f6665-c9ab-80b5-8008-c4ac99d9d000&page-id=39bbee31-a6cb-801d-8008-feba6ea9ebf9)
- [Portal ownership and Dialog API options - page 54](https://design.penpot.app/#/workspace?file-id=b64f6665-c9ab-80b5-8008-c4ac99d9d000&page-id=388782f1-b766-8073-8008-f32c913ab071)
- [Issue #438 - DateField](https://github.com/vrassouli/Bluent/issues/438)
- [PR #500 - Foundation / #418](https://github.com/vrassouli/Bluent/pull/500)

This review is evidence and a proposed consumer contract, not maintainer approval. #418 remains In progress and DateField #438 remains Backlog until the shared surface role/name decision and the other required foundations are accepted.
