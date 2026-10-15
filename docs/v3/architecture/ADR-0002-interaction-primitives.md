# ADR-0002 — v3 Blazor interaction and JS lifetime conventions (#420)

**Status: PROPOSED.** This is not a new approved public API or full implementation. Only issue-specific task work targeting bluent-v3. Stable Dev, NuGet and v2 are unchanged.

## Design provenance and issue-specific editable draft

Canonical editable Bluent v3 Penpot file: b64f6665-c9ab-80b5-8008-c4ac99d9d000. Reviewed source inputs are accepted #501 Focus board f4136a9a-101d-8004-8008-ca2956fe05f9 and #417 D1-D5 styling architecture, and #494 public CLR inventory. A real source-owned issue-specific editable Penpot board was created 2026-10-15: page 40 / Blazor interaction and JS lifetime / #420, ID ed5216bd-3d5b-8015-8008-cb247e27efb4; board #420 Interaction contract and resource lifetime, ID ed5216bd-3d5b-8015-8008-cb247e906204 (51 native editable shapes). The four lanes cover field/EditContext binding, overlay keyboard/focus, JS module/owned pointer lifetime and evidence/signoff. This is a DRAFT, NOT accepted reviewer design parity, browser implementation or a reviewed screenshot. Earlier Figma fallback https://www.figma.com/design/X6Ima16GAyuk7dVUjGgIkt hit Starter limits; canonical Penpot was used instead. Review and real browser tests remain pending.

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

The original baseline had **five async void methods** and **eleven blanket catch(Exception) clauses**. Two source debts now have real v3-only fixes: AudioCaptureInterop.Stop was replaced by awaited StopAsync from the actual Button click handler, and OverflowInterop.Init by InitAsync awaited from the real OnAfterRenderAsync lifecycle. AudioCapture, Overflow and now OtpField DisposeAsync each attempt every JS handle even if earlier cleanup throws, catching only expected JSDisconnectedException; Audio's managed callback reference is released in finally. OtpField's existing InitializeAsync error-handling behavior is unchanged and its remaining broad catch is explicitly tracked. **Latest source debt (after DomHelper + BluentTheme remediation): three async void methods** (Popover SetPopover/ShowSurface and Overflow CheckOverflow), **one catch(Exception)** (OtpField initialization), and **two bare catch { } blocks** (DataGrid.Initialize and Popover.SetPopover). Earlier chronological baselines remain documented below; these three remaining errors and async event contracts are NOT claimed fixed.

[Real compiled assembly harness](../../../scripts/quality/v3_interop_lifecycle/Program.cs) instantiates the actual internal interop types via reflection and tests them with controlled fake IJSRuntime / IJSObjectReference objects. **89 real .NET assertions pass** (current branch): lazy import, awaited unfinished JS Stop/Init, JS error propagation, expected circuit shutdown, disposal of remaining JS handles after failed child/module, repeated Dispose, OtpField teardown, Popover event unsubscription, DataGrid teardown and dispose before use. This is materially stronger than source-only checks, but is **mocked JavaScript**, not Chrome/Edge lifecycle or native AT evidence. No public parameters or consumer callback signatures were changed.

Check [source guard](../../../scripts/quality/check_v3_interaction_primitives.py) plus [negative controls](../../../scripts/quality/test_v3_interaction_primitives.py). The source guard freezes the reduced outstanding debts by exact filename/method and count: new async void or broad Exception catches fail, while removing old debt is allowed; files that own DotNetObjectReference must contain a disposal call. Static checks do not certify that disposal works at runtime.

## Compilable existing-API sample

[v3 binding and form example](../../../samples/Bluent.TaskExamples/Pages/Tasks/V3InteractionConventions.razor) uses existing EditForm/EditContext, DataAnnotationsValidator, @bind-Value TextField oninput, Checkbox, Task-returning SaveAsync, a native submit Button with disabled/aria-busy and role=status/aria-live. Release compilation is a BUILD result only; the form is not a claim of future public API or full ARIA/keyboard coverage.

## Pending acceptance / migration

1. Review and approve the existing editable #420 Penpot flow (page and board IDs above), including controlled binding, focus trap/restore, pointer/JS ownership, overlays, RTL, high contrast and disposal errors; draft created but NOT signed off.
2. Test real Chrome/Edge WASM/Server keyboard, Escape, focus return, JS module teardown/disconnect and nested themes. Source checks do not substitute for runtime checks.
3. Popover service event handlers and protected Overflow CheckOverflow still need an explicit awaited event/override contract; no unsafe fire-and-forget shortcut. Finish broad catch remediation with lifecycle and browser evidence.
4. Update migration ledger for any approved public API change, and link #425 per-component CI evidence. Keep #420 In progress until real design and test acceptance, then seek Review.


### 2026-10-15 Popover lifetime fix (without synchronous event API changes)

PopoverInterop.DisposeAsync now independently attempts child JS and imported module disposal, catches only expected JSDisconnectedException, and **always releases** DotNetObjectReference in finally. PopoverContainerBase.DisposeAsync always removes all five service subscriptions in a separate finally, even when JS disposal throws. The real compiled-DLL fake-JS harness instantiates a real PopoverContainerBase with internal PopoverService via reflection and proves all five handlers are subscribed before initialization and removed after expected circuit disconnection or unexpected child JS failure. This adds ten assertions (47 at that checkpoint). **No changes** were made to the synchronous service event delegates, Popover SetPopover/ShowSurface async void methods, actual browser focus return, or released 2.x. Their behavior and migration remain open acceptance gates. Source debt was **3 async void / 7 broad catches** at that checkpoint.


### 2026-10-15 DataGrid lifetime fix

DataGridInterop.DisposeAsync independently attempts the child JS reference and module and **always disposes** the DotNetObjectReference (only expected JSDisconnectedException is tolerated). DataGrid<TItem>.DisposeAsync now invokes its existing base cleanup from finally, including when JS disposal unexpectedly fails; no new parameters or public methods were introduced. The same compiled-DLL harness creates the actual DataGrid<string> component, invokes its interop, and verifies disconnect, unexpected JSException, lazy initialization, idempotent Dispose and managed callback clearing. The cumulative harness now proves **55 actual .NET assertions** across AudioCapture, Overflow, OtpField, Popover and DataGrid. The remaining source debts are **3 async void / 6 typed catch(Exception) / 2 bare catch{}**. DataGrid Initialize still has its preexisting catch-all; migration requires approved user-visible error semantics and real browser tests.


### 2026-10-15 source-audit blind spot corrected

The initial negative-control checker counted only catch(Exception), not untyped catch blocks. Source review identified **two existing bare catch{}** blocks in DataGridInterop.Initialize and PopoverInterop.SetPopover. The updated source guard now records both **six typed broad catches plus two bare catches**, and two new negative tests reject additional untyped catch sites, including in newly created interop files. Removing old debt is allowed. Typed broad catches, bare catches and their error-handling semantics still require component-specific design before being rewritten. **14 source contract tests** pass; real compiled lifecycle harness remains **55 assertions**.


### 2026-10-15 pointer lifetime and theme cleanup (current #420 HEAD)

The existing internal DomHelper registered pointer move/up callbacks as unmanaged lifetime lists; Unregister removed JavaScript callbacks but retained the managed DotNetObjectReference until service disposal. On this task branch it now tracks references by handler Id using two dictionaries. Successful repeat registration releases the previous reference; normal Unregister releases the matching reference immediately, and a failed register or failed JS unregister still releases the newly created/owned callback via finally. DisposeAsync attempts both JS proxy and imported module independently (expected JSDisconnectedException only), releases all retained callbacks in finally and clears both dictionaries. There is **no change to IDomHelper public method signatures**, and the Bluent v2/stable branch is untouched.

BluentTheme.DisposeAsync now suppresses only expected JSDisconnectedException, clears the module reference in finally, and propagates unexpected JSException. The existing Overflow component now calls base.DisposeAsync inside finally even when its internal JS cleanup fails; the protected CheckOverflow method is intentionally not changed without a reviewed Task/consumer contract.

The compiled Bluent.UI fake-JS lifecycle harness was expanded from 55 to **89 actual .NET assertions** across seven owners (AudioCapture, Overflow, OtpField, Popover, DataGrid, DomHelper, BluentTheme). For DomHelper it tests pointer register, repeat ID replacement, normal and exceptional Unregister, failed registration, circuit disconnect, unexpected JS dispose, duplicate Dispose, no-import before use and **actual DotNetObjectReference.Value throwing after Dispose**. Theme tests cover lazy import, circuit loss, unexpected JS error propagation and cleanup. Source audit now passes 15 positive/negative checks. Actual Chrome/Edge baseline CI for #425 PR #549 passed in all four Server/WebAssembly combinations, **but it is a separate general CompatibilityProbe**, not yet an end-to-end pointer/Popover focus-return interaction test on #420 HEAD.

**Remaining signoff blockers:** authoritative issue-specific #420 Penpot board/reviewer decision; full browser-level pointer drag/unregister, overlay focus restoration/Escape, high contrast RTL and native OS/AT behavior; synchronous Popover/Overflow event API/migration review; remaining three async void plus OtpField Initialize and DataGrid/Popover bare catches. Do not merge/close #420 merely because mocked .NET and independent baseline browser jobs are green.
