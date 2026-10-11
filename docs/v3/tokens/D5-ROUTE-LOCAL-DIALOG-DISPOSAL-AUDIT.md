# #418 D5 — Page-local Dialog route disposal

**2026-10-11 · DRAFT v3-only experiment.** Do not merge to `Dev` or publish NuGet.

## Editable design source
Actual **Bluent v3 Design System** Penpot file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`: new page **D5 · Route-local Dialog pending result · #418**, ID `535db143-a732-807e-8008-c66a41867ed4`, board ID `535db143-a732-807e-8008-c66a418dadb2`; **26 native editable shapes, 0 out-of-board errors**, PNG exported and visually reviewed. The diagram concerns a *page-local* `<Containers />` owner, not a layout-global dialog container.

## Red-to-green reproduction
NUnit `PageLocalV3DialogMustCompletePendingResultWhenHostIsDisposed` first **failed** with `IsCompleted=false` after a real `HtmlRenderer` destroyed its owning `DialogContainer`. Previously `DialogContainer.Dispose()` only unsubscribed from service events; `DialogContext.ResultTCS` remained pending. Now Dispose settles `TrySetResult(null)` **only** for opt-in `AccessibleName != null` or `EnableModalKeyboard=true` dialogs, clears contexts and return-focus requests, and guards repeated Dispose. The `null` result means dismissed. Legacy unconfigured dialogs retain their existing lifecycle semantics; another NUnit test explicitly checks this, plus completing multiple simultaneous opted-in dialogs.

## Real browser route navigation
An opt-in service Dialog opened from `V3StylingLab` contains a **real Bluent Button** in `V3RouteExitDialogContent.razor` that navigates to `/v3/route-after-dialog` without calling Close. A deliberately unlisted SSR destination test route in `V3RouteAfterDialog.razor` has its own focusable Bluent Button. The Chrome CDP probe confirms **real InteractiveServer route transition**, old dialog/launcher disappearance, and independent destination focus outside any modal. This is separate from the existing repeated direct `@if` unmount keyboard-listener test.

**Passed: Chrome WASM 194/194, Edge WASM 194/194, Chrome published InteractiveServer 197/197, Edge published InteractiveServer 197/197.** NUnit 60/60 pending final Release rerun. The previously established Safari/WebKit 15/15 is for earlier D5 behaviors, **not this new navigation path**. Native VoiceOver spoken speech was not verified: macOS presented first-use VoiceOver Quickstart.

## Scope boundary
This implementation must **not** silently decide what happens to a **truly global** Dialog container in a persistent application layout during navigation. That owner policy, native AT validation, alternate routers, final Fluent/public API/Skills/migration parity remain open. #418 stays In progress, PR #500 Draft targeting `bluent-v3`, #420 Backlog.
