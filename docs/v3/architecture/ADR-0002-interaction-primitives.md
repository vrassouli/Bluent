# ADR-0002 — v3 Blazor interaction and JS lifetime conventions (#420)

**Status: PROPOSED.** This is not a new approved public API or full implementation. Only issue-specific task work targeting bluent-v3. Stable Dev, NuGet and v2 are unchanged.

## Design provenance and unresolved authoring gate

Canonical editable Bluent v3 Penpot file: b64f6665-c9ab-80b5-8008-c4ac99d9d000. Reviewed source inputs are accepted #501 Focus board f4136a9a-101d-8004-8008-ca2956fe05f9 and #417 D1-D5 styling architecture, and #494 public CLR inventory. They are real source references, NOT an approved issue-specific #420 board. Penpot tab was frozen 2026-10-15; Figma fallback file https://www.figma.com/design/X6Ima16GAyuk7dVUjGgIkt was created but Starter rate limit prevented design layers. Explicit issue-specific editable interaction-flow design/reviewer acceptance remain pending.

## Component state and semantics proposals

| Domain | Proposed rule | Current source/reference |
| --- | --- | --- |
| Binding | Preserve Value / EventCallback<T> ValueChanged contracts; only user changes should emit Changed, not parent Parameter setting. InputBase<T> coordinates EditContext, FieldIdentifier and validation. | TextField, Checkbox, DropdownList. |
| Interaction | Await event Task/ValueTask; no new public async void handlers. Clarify disabled, readonly, loading and aria-busy separately. | Button, AccordionPanel, DataList and sample. |
| Focus | Native keyboard Tab/Enter/Space semantics, modal-only trapping, Escape and focus return. TextField gets underline only; Button ring uses approved brand-on-neutral / inverse-on-filled context. | Approved Penpot #501; final component behavior remains separate. |
| Overlays | Respect root/portal theming and highest overlay Escape handling. Do not derive host color from Button Appearance. | #417/#418 research and existing PopoverService/Dialog. |
| JS lifecycle | No DOM until interactive after-render; lazy module import, preserve owned DotNetObjectReference and JS handles, dispose each even after another cleanup failure; catch expected JSDisconnectedException specifically rather than blanket Exception. | Current Interops and DomHelper. |
| Base and slots | Retain Class, Style, id, AdditionalAttributes, semantic native elements and RenderFragment/RenderFragment<T>. | BluentComponentBase and BluentUiComponentBase. |

## Actual source debt and regression boundary

The original baseline had **five async void methods** and **eleven blanket catch(Exception) clauses**. Two source debts now have real v3-only fixes: AudioCaptureInterop.Stop was replaced by awaited StopAsync from the actual Button click handler, and OverflowInterop.Init by InitAsync awaited from the real OnAfterRenderAsync lifecycle. AudioCapture, Overflow and now OtpField DisposeAsync each attempt every JS handle even if earlier cleanup throws, catching only expected JSDisconnectedException; Audio's managed callback reference is released in finally. OtpField's existing InitializeAsync error-handling behavior is unchanged and its remaining broad catch is explicitly tracked. **Remaining source debt: three async void methods** (Popover SetPopover/ShowSurface and Overflow CheckOverflow) and **six blanket catches** (remaining OtpField initialization, BluentTheme, DomHelper). These are NOT claimed fixed.

[Real compiled assembly harness](../../../scripts/quality/v3_interop_lifecycle/Program.cs) instantiates the actual internal interop types via reflection and tests them with controlled fake IJSRuntime / IJSObjectReference objects. **55 real .NET assertions pass**: lazy import, awaited unfinished JS Stop/Init, JS error propagation, expected circuit shutdown, disposal of remaining JS handles after failed child/module, repeated Dispose, OtpField teardown, Popover event unsubscription, DataGrid teardown and dispose before use. This is materially stronger than source-only checks, but is **mocked JavaScript**, not Chrome/Edge lifecycle or native AT evidence. No public parameters or consumer callback signatures were changed.

Check [source guard](../../../scripts/quality/check_v3_interaction_primitives.py) plus [negative controls](../../../scripts/quality/test_v3_interaction_primitives.py). The source guard freezes the reduced outstanding debts by exact filename/method and count: new async void or broad Exception catches fail, while removing old debt is allowed; files that own DotNetObjectReference must contain a disposal call. Static checks do not certify that disposal works at runtime.

## Compilable existing-API sample

[v3 binding and form example](../../../samples/Bluent.TaskExamples/Pages/Tasks/V3InteractionConventions.razor) uses existing EditForm/EditContext, DataAnnotationsValidator, @bind-Value TextField oninput, Checkbox, Task-returning SaveAsync, a native submit Button with disabled/aria-busy and role=status/aria-live. Release compilation is a BUILD result only; the form is not a claim of future public API or full ARIA/keyboard coverage.

## Pending acceptance / migration

1. Create and review an actual editable #420 interaction flow covering controlled binding, focus trap/restore, JS reference ownership, overlays, RTL, high contrast and disposal errors.
2. Test real Chrome/Edge WASM/Server keyboard, Escape, focus return, JS module teardown/disconnect and nested themes. Source checks do not substitute for runtime checks.
3. Popover service event handlers and protected Overflow CheckOverflow still need an explicit awaited event/override contract; no unsafe fire-and-forget shortcut. Finish broad catch remediation with lifecycle and browser evidence.
4. Update migration ledger for any approved public API change, and link #425 per-component CI evidence. Keep #420 In progress until real design and test acceptance, then seek Review.


### 2026-10-15 Popover lifetime fix (without synchronous event API changes)

PopoverInterop.DisposeAsync now independently attempts child JS and imported module disposal, catches only expected JSDisconnectedException, and **always releases** DotNetObjectReference in finally. PopoverContainerBase.DisposeAsync always removes all five service subscriptions in a separate finally, even when JS disposal throws. The real compiled-DLL fake-JS harness instantiates a real PopoverContainerBase with internal PopoverService via reflection and proves all five handlers are subscribed before initialization and removed after expected circuit disconnection or unexpected child JS failure. This adds ten assertions (47 at that checkpoint). **No changes** were made to the synchronous service event delegates, Popover SetPopover/ShowSurface async void methods, actual browser focus return, or released 2.x. Their behavior and migration remain open acceptance gates. Source debt was **3 async void / 7 broad catches** at that checkpoint.


### 2026-10-15 DataGrid lifetime fix

DataGridInterop.DisposeAsync independently attempts the child JS reference and module and **always disposes** the DotNetObjectReference (only expected JSDisconnectedException is tolerated). DataGrid<TItem>.DisposeAsync now invokes its existing base cleanup from finally, including when JS disposal unexpectedly fails; no new parameters or public methods were introduced. The same compiled-DLL harness creates the actual DataGrid<string> component, invokes its interop, and verifies disconnect, unexpected JSException, lazy initialization, idempotent Dispose and managed callback clearing. The cumulative harness now proves **55 actual .NET assertions** across AudioCapture, Overflow, OtpField, Popover and DataGrid. The remaining source debts are **3 async void / 6 blanket Exception catches**. DataGrid Initialize still has its preexisting catch-all; migration requires approved user-visible error semantics and real browser tests.
