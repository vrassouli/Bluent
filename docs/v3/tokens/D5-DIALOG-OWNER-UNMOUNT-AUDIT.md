> **UPDATED 2026-10-11:** Safari remote automation was enabled subsequently and the actual published v3 SSR InteractiveServer lab passed **15/15** repeatable, real Safari 27.0.1 WebDriver checks on MacBook3. The earlier Safari block below is historical. Native VoiceOver remains unverified because first-run Quickstart appeared. See [Safari/WebKit and VoiceOver evidence](D5-SAFARI-VOICEOVER-AUDIT.md).

# #418 D5 - Dialog owner unmount / global keyboard cleanup

**2026-10-11. Status: DRAFT opt-in evidence only, no final Fluent API or native AT acceptance.** Branch v3/issue-418-design-tokens; Draft PR #500 targeting bluent-v3.

## Existing design basis and tooling limitations

The existing editable Bluent v3 Design System Penpot file **b64f6665-c9ab-80b5-8008-c4ac99d9d000**, D5 page 36 **535db143-a732-807e-8008-c6403ec3fa0c**, board **535db143-a732-807e-8008-c6403f3c74af**, defines the draft keyboard owner/focus stack and last-owner listener cleanup. This checkpoint follows that existing decision; it does **not** claim a new approved design.

An additional lifecycle-specific Penpot page was attempted but the correct plugin tab was suspended. The authorized Bluent v3 Figma working-file fallback was attempted and blocked by the Figma MCP Starter-plan rate limit. No new Penpot or Figma board was created in this checkpoint. Dedicated design parity remains an open Review gate.

## Real Blazor owner disposal test

The v3 Styling Lab now mounts a real opt-in **Dialog** with AccessibleName, IsModal and EnableModalKeyboard via an @if expression. The actual **Button inside the Dialog** turns the condition off, removing the entire owner from the Blazor render tree **without calling Close()**. This directly tests the IDisposable/IAsyncDisposable lifecycle instead of a synthetic DOM removal or normal Escape close.

The CDP script counts actual browser **DOMDebugger.getEventListeners(window)** keydown registrations: before show, while modal registered and after unmount. For **three independent mount/unmount cycles** it checks **baseline -> +1 -> baseline**, verifies no active modal remains, and confirms a real Tab resumes normal page navigation. The test does not infer memory leaks merely from DOM state.

The provisional v3 JS helper's unregisterModal now accepts the stable Dialog ID (as well as an element), finds the retained root in its owner map and deletes it, rather than relying on an ElementReference which might already be detached when DisposeAsync runs. This is **defensive disposal hardening**, not a proven repair of a pre-existing leak. The legacy non-opt-in Dialog does not load/register this JS helper. No v2 public API changes.

## Investigation and result

The initial new test timed out **despite correct browser listener counts**: the polling callback returned numeric 0, which JavaScript treats as false. A second draft compared boolean true to numeric 0 and reported three false failures. Temporary .NET/browser diagnostic logs confirmed correct disposal and actual **0 -> 1 -> 0** counts. Both test assertion bugs were corrected and the debug logs removed. **Do not interpret these false-red test runs as evidence of an original runtime leak**.

Actual Chrome and Edge x Blazor WebAssembly and locally published InteractiveServer each passed the complete **194/194** live browser checks, including three real owner teardown cycles per run. Chrome/Edge both use Chromium; this does **not** constitute independent engine, native voice/assistive speech or complete accessibility certification.

## Safari check: genuinely blocked

On MacBook3, SafariDriver from Safari 27.0.1 successfully started and returned HTTP status **ready=true**. Creating a WebDriver session returned: **"You must enable 'Allow remote automation' in the Developer section of Safari Settings"**. No user browser setting was changed. The temporary safaridriver session was stopped. Therefore no Safari rendering engine test was performed. VoiceOver/NVDA remain untested.

## Remaining acceptance

Service-hosted Dialog behavior when the *initiating page navigates but the global container survives* is a distinct design decision; a directly unmounted opt-in component does not resolve it. Safari/Firefox independent engine, real VoiceOver/NVDA, detailed component combinations, final design/Fluent/API/Skills/migration approvals remain open. #418 remains In progress; PR #500 Draft; #420 Backlog. Do not merge to Dev or publish stable NuGet.