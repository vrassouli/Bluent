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

In six internal interop files plus DomHelper, the baseline has **five async void methods**: AudioCaptureInterop.Stop, OverflowInterop.Init and CheckOverflow, PopoverInterop.SetPopover and ShowSurface. Across these seven files, **eleven catch(Exception)** clauses already exist. In some DisposeAsync paths, cleanup operations share a single try block: an earlier throw could skip remaining resource disposal. This is a **source-risk finding only**, not an observed production memory leak or tested keyboard failure.

Check [source guard](../../../scripts/quality/check_v3_interaction_primitives.py) plus [negative controls](../../../scripts/quality/test_v3_interaction_primitives.py). The source guard freezes these known debts by exact filename/method and count: new async void or broad Exception catches fail, while removing old debt is allowed; files that own DotNetObjectReference must contain a disposal call. Static checks do not certify that disposal works at runtime.

## Compilable existing-API sample

[v3 binding and form example](../../../samples/Bluent.TaskExamples/Pages/Tasks/V3InteractionConventions.razor) uses existing EditForm/EditContext, DataAnnotationsValidator, @bind-Value TextField oninput, Checkbox, Task-returning SaveAsync, a native submit Button with disabled/aria-busy and role=status/aria-live. Release compilation is a BUILD result only; the form is not a claim of future public API or full ARIA/keyboard coverage.

## Pending acceptance / migration

1. Create and review an actual editable #420 interaction flow covering controlled binding, focus trap/restore, JS reference ownership, overlays, RTL, high contrast and disposal errors.
2. Test real Chrome/Edge WASM/Server keyboard, Escape, focus return, JS module teardown/disconnect and nested themes. Source checks do not substitute for runtime checks.
3. Refactor legacy async void and broad catches only with reviewed caller API and tests, not by changing stable 2.x or silently rethrowing into event handlers.
4. Update migration ledger for any approved public API change, and link #425 per-component CI evidence. Keep #420 In progress until real design and test acceptance, then seek Review.
