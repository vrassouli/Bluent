# ADR-0002 — v3 Blazor interaction and JS lifetime conventions (#420)

**Status: PROPOSED.** This is not a new approved public API or full implementation. Only issue-specific task work targeting bluent-v3. Stable Dev, NuGet and v2 are unchanged.

## Design provenance and issue-specific editable draft

Canonical editable Bluent v3 Penpot file: b64f6665-c9ab-80b5-8008-c4ac99d9d000. Reviewed source inputs are accepted #501 Focus board f4136a9a-101d-8004-8008-ca2956fe05f9 and #417 D1-D5 styling architecture, and #494 public CLR inventory. A real source-owned issue-specific editable Penpot board was created 2026-10-15: page 40 / Blazor interaction and JS lifetime / #420, ID ed5216bd-3d5b-8015-8008-cb247e27efb4; board #420 Interaction contract and resource lifetime, ID ed5216bd-3d5b-8015-8008-cb247e906204 (51 native editable shapes). The four lanes cover field/EditContext binding, overlay keyboard/focus, JS module/owned pointer lifetime and evidence/signoff. This is a DRAFT, NOT accepted reviewer design parity, browser implementation or a reviewed screenshot. Earlier Figma fallback https://www.figma.com/design/X6Ima16GAyuk7dVUjGgIkt hit Starter limits; canonical Penpot was used instead. Review and real browser tests remain pending.

## Latest 2026-10-15 evidence — native CSS reduced-motion and optional-arrow safety

The authored Popover SCSS now automatically honors the operating system/browser CSS preference prefers-reduced-motion: reduce with zero transition duration and delay. This is a real product style (not test-only inline CSS), compiled into tracked components.css and published Bluent.UI components.min.css. Existing JavaScript zero-duration/cancellable hide lifecycle makes the surface really hidden even when the browser emits no transitionend. V3 task CI rebuilds the pinned Sass compiler and checks tracked CSS, and verifies bundled CSS after the .NET sample build. Both JS and CSS checks reject stale assets.

Public DisplayArrow=false is exercised in a real Blazor consumer fixture. Browser assertions check the optional no-arrow surface opens with finite geometry without an arrow DOM node, and CDP Runtime.exceptionThrown catches invisible rejected JavaScript promises. Public API stays unchanged.

**Local Dev01 browser evidence:** Chrome/WASM **27/27**, Edge/WASM **27/27**, Chrome/InteractiveServer **27/27**, Edge/InteractiveServer **27/27**, total **108/108** actual browser checks, with PNG and JSON evidence across all modes. New test checks computed shipped CSS zero-duration with reduce-motion emulated, BEFORE applying test-only inline overrides. It also verifies zero-duration Escape/focus, stale 700ms animation cancellation, two-surface LIFO Escape/focus, independent resizing and no-arrow geometry. Forced-colors simulation is browser emulation, NOT native Windows Contrast Themes or named assistive technology proof. Reviewer signoff on Penpot #420 design and component parity remain outstanding.

## Latest implementation — zero-duration animation and race-free rapid reopen (2026-10-15)

Fixed a genuine timing defect in the non-modal Popover JavaScript lifecycle: earlier hideSurface relied solely on transitionend and registered a one-shot listener on every close. With CSS transitions disabled, a reduced-motion host or an interrupted transition, that event can be absent; a late event from an earlier close could also hide a reopened surface. No public Blazor or consumer API changed.

A private map of per-triggerId pending hide completions now owns the pending CSS transitionend listener and an exact-duration fallback timer, both cancelled on reopen and dispose. Zero-duration computed transitions immediately complete, while late transition events only finish a still-closed surface; child transition events are ignored. Geometry cleanup and focus restoration remain independent of sibling Popovers.

**Real live local regression evidence:** Chrome + Edge x WebAssembly + InteractiveServer, **23/23 actual browser assertions per mode = 92/92**. In addition to existing live-click, two-surface LIFO focus and resizing tests, the browser now emulates reduced motion and forced colors in RTL and forces a zero-second transition to assert Escape fully hides the surface. It also closes/reopens while a **700ms** animation is pending, waits past its deadline and verifies a stale completion cannot hide the reopened Popover. Each case retains PNG and JSON evidence; a separate PNG of RTL/forced-colors browser emulation is captured. Emulation and PNG are NOT native Windows Contrast Themes, screen-reader/AT or accepted Fluent visual parity.

The TypeScript static-asset contract adds requirements for cancellable transitions and two deliberate negative regression controls, verifying generated ESM/global JavaScript and maps match Bluent.UI static assets. All locally tested on Dev01; exact GitHub CI HEAD for this patch still needs its own pass. Penpot #420 design board remains a reviewer draft, not an approved design. Issue remains In progress; PR remains Draft.

## 2026-10-15 Popover Escape / focus and JS listener lifetime — verified

The real TypeScript Popover now tracks open surfaces and, upon a real Escape keypress, dismisses the most recently opened visible non-modal surface, restoring focus to exactly that surface's trigger. Outside-click dismissal deliberately does **not** steal focus. This is not a modal focus trap, general overlay-level keyboard parity, native Windows Contrast support, or screen-reader certification. No public Blazor parameters or service signatures changed.

JS Popover now tracks/removes trigger show/hide handlers, document outside-click and Escape listeners, resize observers and Floating UI auto-update resources. Rebinding the same trigger ID removes its old handlers. The C# PopoverInterop.DisposeAsync explicitly calls the JS object's dispose() BEFORE releasing IJSObjectReference, and its managed DotNetObjectReference is still released under exceptional JS cleanup. Merely releasing a JSObjectReference does not execute the JavaScript class's own cleanup.

On Dev01 with both ESM/global webpack artifacts rebuilt and copied into Bluent.UI static web assets: real Chrome/WASM 10/10, Edge/WASM 10/10, Chrome/InteractiveServer 10/10 and Edge/InteractiveServer 10/10 = **40/40 live browser checks**. A CDP Escape keyDown/keyUp closes and restores focus; reopen and outside-click without focus theft are also asserted on each mode. PNG screenshots and JSON evidence were emitted. Compiled Bluent.UI fake-JS .NET harness now passes **123 assertions**, including explicit JS dispose calls under normal and abnormal teardown.

The static-web-asset guard check_v3_popover_js_bundle.py verifies all four tracked webpack ESM/global JS and map artifacts match Bluent.UI wwwroot. Four new positive/negative source tests reject stale/missing bundles or missing focus semantics. On PR, CI runs npm ci and webpack build, compares generated dist with tracked files and refuses stale assets. The four Windows browser jobs cover Chrome/Edge by Server/WASM. This is scoped Popover evidence, NOT complete native OS/AT, Fluent visual parity, RTL overlays, other components' focus traps or design-review approval.

## 2026-10-15 independent multi-Popover geometry and LIFO focus test

A second real source-owned, v3-QA-only fixture now mounts **two concurrent nonmodal Popovers** with SameWidth enabled, using the actual Bluent components and an independent Blazor Server host route. The renderer exposes a readiness marker from OnAfterRenderAsync so the test waits until event handlers are interactive; it sends the OpenBoth command **exactly once**, rather than racing duplicate actions while the circuit is starting. That distinction caught a flaky test-only issue on Edge/Server without weakening the underlying behavioral assertions.

An actual implementation defect was corrected in the source TypeScript Popover: its trigger ResizeObserver, surface ResizeObserver, MutationObserver and Floating UI automatic-positioning cleanup previously used **single shared members** even though one Popover JS owner can manage several open surfaces. Resources are now separately keyed by trigger ID and disposed only with their matching surface. Hiding one Popover no longer deactivates another Popover's resize/position observers. ES5 compilation compatibility is preserved.

**Real Dev01 Chrome/Edge x WebAssembly/InteractiveServer: 17/17 checks per combination, total 68/68** after the last changes. The additional seven checks per mode cover real stack fixture readiness, one-time open command, concurrent surfaces, independent SameWidth widths, first trigger resizing while the second width remains unchanged, then Escape closing the topmost and restoring focus to the second trigger, followed by Escape closing the remaining surface and focusing the first trigger. Each mode has real PNG/JSON evidence, including a screenshot of both open surfaces. The actual canonical Penpot #420 editable board remains DRAFT pending maintainer review; this is not native Windows Contrast Theme or named screen-reader acceptance. The GitHub CI exact new SHA must separately finish before being reported as green.

## Component state and semantics proposals

| Domain | Proposed rule | Current source/reference |
| --- | --- | --- |
| Binding | Preserve Value / EventCallback<T> ValueChanged contracts; only user changes should emit Changed, not parent Parameter setting. InputBase<T> coordinates EditContext, FieldIdentifier and validation. | TextField, Checkbox, DropdownList. |
| Interaction | Await event Task/ValueTask; no new public async void handlers. Clarify disabled, readonly, loading and aria-busy separately. | Button, AccordionPanel, DataList and sample. |
| Focus | Native keyboard Tab/Enter/Space semantics, modal-only trapping, Escape and focus return. TextField gets underline only; Button ring uses approved brand-on-neutral / inverse-on-filled context. | Approved Penpot #501; final component behavior remains separate. |
| Overlays | Respect root/portal theming and highest overlay Escape handling. Do not derive host color from Button Appearance. | #417/#418 research and existing PopoverService/Dialog. |
| JS lifecycle | No DOM until interactive after-render; lazy module import, preserve owned DotNetObjectReference and JS handles, dispose each even after another cleanup failure; catch expected JSDisconnectedException specifically rather than blanket Exception. | Current Interops and DomHelper. |
| Base and slots | Retain Class, Style, id, AdditionalAttributes, semantic native elements and RenderFragment/RenderFragment<T>. | BluentComponentBase and BluentUiComponentBase. |

## Current 2026-10-15 implementation — supersedes historical checkpoints below

Within the **eight audited files** (Bluent.UI Interops/*.cs plus DomHelper service), every initial unsafe source debt is resolved: **five async void**, **eleven typed catch(Exception)** and **two bare catch{}** are reduced to **zero**. This is a narrow source audit, not a claim that other packages are completely remediated. Eighteen Python negative/positive source tests prevent these patterns from returning.

Public IPopoverService synchronous event/method contracts and protected Overflow.CheckOverflow() stay unchanged. Internally Overflow now defers a JS check until OnAfterRenderAsync and awaits CheckOverflowAsync. Popover SetPopoverAsync and ShowSurfaceAsync are Task-returning; sync service notifications enqueue operations in a private PopoverCommandQueue, then OnAfterRenderAsync serially awaits them after DOM creation. The queue prevents concurrent drains, clears on disposal/circuit disconnection and preserves subsequent commands after unexpected failure. This is a v3-only internal implementation.

**Actual compiled .NET evidence:** 115 assertions using a fake IJSRuntime against real compiled Bluent.UI types, including awaited operations, error propagation, callback disposal and Popover FIFO/overlap recovery. **Actual Dev01 browser evidence:** four real Popover runtime combinations — Chrome/WASM 7/7, Edge/WASM 7/7, Chrome/InteractiveServer 7/7, Edge/InteractiveServer 7/7 = **28/28** checks with PNG/JSON. Cases cover default keep-surface, dynamic surface, inner action/state update and manual Show/Close. The Browser probe now runs an unmodified WebAssembly Debug localhost demo for WASM, and a **Production-published** SSR host for Server, avoiding the SSR Development static-asset patching failures. The dedicated #420 Windows CI is expanded to Chrome/Edge × WASM/Server, with 4 real browser jobs. That earlier 28/28 checkpoint predates the separate 40/40 real Escape/focus tests above; native Contrast Themes/AT or complete component RTL/visual parity remain unverified. Latest GitHub CI for the four-job change is pending.

Source-owned editable #420 Penpot design file b64f6665-c9ab-80b5-8008-c4ac99d9d000, page ed5216bd-3d5b-8015-8008-cb247e27efb4, board ed5216bd-3d5b-8015-8008-cb247e906204 remains a DRAFT not yet approved by the maintainer. Issue/PR remain In progress / Draft until real design signoff and remaining interactive/native checks.

InteractiveServer evidence comes from a dedicated v3 QA-only page in src/Bluent.UI.Demo.SSR/Components/Pages/PopoverInteractiveServerProbe.razor. It renders the same real source-owned Popovers demo inside a scoped interactive Containers host; the actual public Popover and IPopoverService contracts are unchanged. The SSR host requires Release publish + Production when exercising static assets; running the Development host directly returned unrelated FileNotFoundException for published CSS. The harness itself publishes the real SSR host and is tested with its auto-run mode (Chrome Server 7/7); WebAssembly auto-run uses its Debug localhost base / (Chrome 7/7). Human design review and native OS/AT remain open.

### Historical progress below — not the current debt count

## Actual source debt and regression boundary

The original baseline had **five async void methods** and **eleven blanket catch(Exception) clauses**. Two source debts now have real v3-only fixes: AudioCaptureInterop.Stop was replaced by awaited StopAsync from the actual Button click handler, and OverflowInterop.Init by InitAsync awaited from the real OnAfterRenderAsync lifecycle. AudioCapture, Overflow and now OtpField DisposeAsync each attempt every JS handle even if earlier cleanup throws, catching only expected JSDisconnectedException; Audio's managed callback reference is released in finally. OtpField's existing InitializeAsync error-handling behavior is unchanged and its remaining broad catch is explicitly tracked. **Historical source debt (after DomHelper + BluentTheme remediation): three async void methods** (Popover SetPopover/ShowSurface and Overflow CheckOverflow), **one catch(Exception)** (OtpField initialization), and **two bare catch { } blocks** (DataGrid.Initialize and Popover.SetPopover). Earlier chronological baselines remain documented below; these three remaining errors and async event contracts are NOT claimed fixed.

[Real compiled assembly harness](../../../scripts/quality/v3_interop_lifecycle/Program.cs) instantiates the actual internal interop types via reflection and tests them with controlled fake IJSRuntime / IJSObjectReference objects. **89 real .NET assertions pass** (current branch): lazy import, awaited unfinished JS Stop/Init, JS error propagation, expected circuit shutdown, disposal of remaining JS handles after failed child/module, repeated Dispose, OtpField teardown, Popover event unsubscription, DataGrid teardown and dispose before use. This is materially stronger than source-only checks, but is **mocked JavaScript**, not Chrome/Edge lifecycle or native AT evidence. No public parameters or consumer callback signatures were changed.

Check [source guard](../../../scripts/quality/check_v3_interaction_primitives.py) plus [negative controls](../../../scripts/quality/test_v3_interaction_primitives.py). The source guard freezes the reduced outstanding debts by exact filename/method and count: new async void or broad Exception catches fail, while removing old debt is allowed; files that own DotNetObjectReference must contain a disposal call. Static checks do not certify that disposal works at runtime.

## Compilable existing-API sample

[v3 binding and form example](../../../samples/Bluent.TaskExamples/Pages/Tasks/V3InteractionConventions.razor) uses existing EditForm/EditContext, DataAnnotationsValidator, @bind-Value TextField oninput, Checkbox, Task-returning SaveAsync, a native submit Button with disabled/aria-busy and role=status/aria-live. Release compilation is a BUILD result only; the form is not a claim of future public API or full ARIA/keyboard coverage.

## Pending acceptance / migration

1. Review and approve the existing editable #420 Penpot flow (page and board IDs above), including controlled binding, focus trap/restore, pointer/JS ownership, overlays, RTL, high contrast and disposal errors; draft created but NOT signed off.
2. Test real Chrome/Edge WASM/Server keyboard, Escape, focus return, JS module teardown/disconnect and nested themes. Source checks do not substitute for runtime checks.
3. Event/method signatures are now preserved through a render-scheduled awaited Popover queue and Overflow check. Validate Server-mode/keyboard/focus/RTL outcomes and document any migration before acceptance.
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

## 2026-10-16 — Generic click Popover disclosure ARIA (draft)

The **actual** Bluent v3 Design System Penpot file
b64f6665-c9ab-80b5-8008-c4ac99d9d000, page 40
ed5216bd-3d5b-8015-8008-cb247e27efb4, board
ed5216bd-3d5b-8015-8008-cb247e906204 now includes an
editable source-owned **DRAFT** disclosure state proposal.

On the existing v3 task branch, an ordinary click-triggered
generic nonmodal Popover now advertises aria-expanded=false on
initial binding, aria-expanded=true when its actual surface opens,
and a correct aria-controls reference to that visible surface.
Escape and outside click synchronize false and clear controls.
Only missing attributes are owned by the library; existing
consumer-provided aria-expanded/aria-controls are never overwritten.
Rebinding or disposal removes only library-owned ARIA state, and
hover/focus Tooltip triggers do not get disclosure ARIA.

We do **not** assign generic role=menu, role=dialog, or
aria-haspopup to an arbitrary Popover; the same primitive wraps
menus, tooltips, dropdowns, and consumer content with different
semantics. This is a scoped fix for real click disclosures, not a
new public Blazor parameter or a universal overlay semantics API.
Existing public signatures and stable 2.x remain unchanged.

Source policy checks require conditional click-only binding,
respect for consumer-supplied attributes, show/hide synchronization,
and per-trigger cleanup when the JavaScript object is rebound or
disposed. Separate individual Blazor Popover removal versus global
container teardown still merits its own lifecycle acceptance check.

**Verified on real Dev01** after rebuilding/mirroring production
ESM/global scripts and source maps: Chrome/InteractiveServer 30/30,
Edge/WebAssembly 30/30, zero assertion failures. The first direct
initial-state sample was briefly ahead of async Blazor/JS hydration,
so the test now waits for actual aria-expanded=false to be bound
instead of manufacturing state, then confirms true and the exact
aria-controls surface ID while open and false/no stale controls after
a real CDP Escape keyboard event. Both runs passed; 12 bundle source
negative/positive tests, 21 interaction source tests, Release Build
zero warnings/errors and 20 .NET tests passed. Remaining two browser
combinations must be checked by the new exact-head GitHub CI, not
inferred from these local samples.

Native Windows Narrator/NVDA speech output, real Contrast Themes,
author-supplied ARIA attributes in a live consumer and maintainer
Penpot parity remain **separate unapproved acceptance gates**.
