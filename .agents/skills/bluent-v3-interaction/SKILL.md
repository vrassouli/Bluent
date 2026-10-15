# Bluent v3 Interaction Primitives · #420

Read docs/v3/architecture/ADR-0002-interaction-primitives.md, AGENTS.md and the v3 workflow and branching contracts before changing any component.

This issue is PROPOSED / In progress, not approved public Blazor API. The actual owned Penpot v3 board #501 and #417 architecture are reference sources only; the #420-specific design flow still requires editable designer approval. Figma fallback X6Ima16GAyuk7dVUjGgIkt was created but writing is temporarily limited.

Source audit: python scripts/quality/check_v3_interaction_primitives.py. Unit tests: python -m unittest discover -s scripts/quality -p test_v3_interaction_primitives.py -v and python -m unittest discover -s scripts/quality -p test_v3_interaction_sample.py -v. Compile actual consumer example with dotnet build samples/Bluent.TaskExamples/Bluent.TaskExamples.csproj -c Release -warnaserror.

Original source baseline: five async void methods + eleven broad catch(Exception) sites; after isolated AudioCapture/Overflow fixes **three async void and six broad catches remain**. These are grandfathered source debts ONLY, not accepted lifecycle design or runtime compliance. New async void and broad Exception catches must fail the guard; reducing debt is allowed. Do not refactor shared base or public callback signature before exact API/migration + browser review.

Working sample V3InteractionConventions.razor uses existing EditContext, TextField and Checkbox two-way binding, Task SaveAsync, disabled+aria-busy, validation messages and live status. It is BUILD evidence only. Actual focus trap/return, JS disconnection/disposal, overlay portals, keyboard/RTL and screen reader behavior still require component-specific runtime tests. Never merge into stable Dev or publish v3 NuGet without separate approval.


2026-10-15 implementation in v3 task branch: await AudioCapture.StopAsync in real click, await Overflow.InitAsync from Blazor OnAfterRenderAsync; independent JS handle Dispose with expected JSDisconnectedException tolerance, no blanket catch. Compiled actual DLL harness scripts/quality/v3_interop_lifecycle/V3InteropLifecycle.csproj tests 55 .NET assertions using fake IJSRuntime for await ordering, JS failures, disposal and circuit loss. Source regression guard freezes remaining three async void and nine catches. This DOES NOT prove actual Chrome/Edge, native focus/AT or safe synchronous Popover event migration; keep #420 In progress.


2026-10-15 OtpField disposal remediation: OptFieldInterop.DisposeAsync now attempts child and imported JS module independently even if child disposal throws, catches only expected JSDisconnectedException and nulls internal handles. 9 additional real compiled assembly fake-JS assertions (37 total) test child/module failures, disconnect, repeated teardown and dispose-before-use. OtpField.InitializeAsync broad catch remains deliberately untouched pending component error-state contract, so 8 broad catches remain alongside 3 async void. No public component parameters/events changed; no live browser/AT claim.


2026-10-15 Popover cleanup verified: PopoverInterop.DisposeAsync now always disposes child, module and managed callback independently; only expected JSDisconnectedException is swallowed. PopoverContainerBase.DisposeAsync finally removes all five PopoverService event handlers even on unexpected JSException. Real compiled harness instantiates actual public PopoverContainerBase with internal service and observes the subscriptions before/after error (47 total assertions). Synchronous service callback signatures and remaining Popover async void methods are UNCHANGED pending approved lifecycle design and live browser tests; current source debt is 3 async void / 7 broad catches.


2026-10-15 DataGrid lifetime: internal DataGridInterop child+module cleanup uses independent finally paths, DotNetObjectReference always disposed, catch expected JSDisconnectedException only. Actual DataGrid<TItem> component DisposeAsync now invokes base.DisposeAsync in finally. Compiled DLL fake-JS harness exercises real DataGrid<string> instance with disconnect, unexpected error, lazy creation and repeated dispose: 55 cumulative checks. Source ledger 3 async void / 6 broad catches. This does not remove DataGrid Initialize catch-all or prove browser/AT behavior.
