# #552 Wave J — real Blazor InteractiveServer FocusAsync lifecycle research

> **RESEARCH ONLY — NOT APPROVED Bluent product implementation.** 21 October 2026. Architecture handoff for #420, #465, #466, #469/#507, #517. Work is isolated in Draft PR #553; no source in `src/` or stable `Dev` was changed.

## Scope and verified platform

Unlike the previous [Wave I static-HTML research](FOCUS-KEYBOARD-LIFECYCLE-RESEARCH.md), this experiment builds and runs a **real .NET 10 Blazor InteractiveServer** project entirely inside `scripts/quality/fixtures/blazor-focus-lab/`. It uses `FocusLab.razor`, normal Blazor event callbacks, real conditional Razor rendering, `OnAfterRenderAsync` and **framework `ElementReference.FocusAsync()`** (not JS `element.focus()`). A dedicated Node.js native Chrome/Edge CDP harness issues actual browser mouse and key events to that isolated server.

| Browser on Dev01 Windows | Light/LTR | Dark/RTL | CSS Forced Colors emulation | Total |
| --- | ---: | ---: | ---: | ---: |
| Chrome 155 | 29/29 | 29/29 | 29/29 | **87/87** |
| Edge 155 | 29/29 | 29/29 | 29/29 | **87/87** |
| **Total** | **58/58** | **58/58** | **58/58** | **174/174** |

Real .NET Debug build succeeded with **0 errors and 0 warnings**. Evidence: [Chrome trace JSON](evidence/BLUENT-BLAZOR-FOCUS-CHROME.json), [Edge trace JSON](evidence/BLUENT-BLAZOR-FOCUS-EDGE.json), plus 12 real screenshots including [Chrome Dark/RTL FocusAsync](evidence/BLUENT-BLAZOR-FOCUS-CHROME-DARK-RTL-FOCUSED.png) and [Edge Light/LTR](evidence/BLUENT-BLAZOR-FOCUS-EDGE-LIGHT-LTR-FOCUSED.png). Each of 174 checks pins the observed Blazor status, browser activeElement and real FocusAsync call count, and is guarded by Python.

## Actual Blazor observations

1. Queueing a focus request inside the scope does **not** immediately invoke FocusAsync. Applying it while scope owns focus calls `_target.FocusAsync()` exactly once and native activeElement becomes the target.
2. Applying a queued request from an outside button cancels it; no extra FocusAsync occurs and the user's outside focus remains.
3. Removing the target in a Razor rerender invalidates queued focus; the removed node is never focused.
4. **Real asynchronous Blazor event handler:** `await Task.Delay(900)` yields between two UI actions. If scope still owns focus and the node exists, the resumed handler calls framework FocusAsync. If the user moves outside while awaiting, the handler cancels before focusing. If a second Razor event removes the target while awaiting, an epoch/availability check cancels before focusing. These are actual Blazor/SignalR event interleavings, not pure-model assertions.
5. Opening a conditional popup causes `OnAfterRenderAsync` to invoke `_popupItem.FocusAsync()`. Native Escape unmounts it and conditionally invokes `_trigger.FocusAsync()` to restore a still-connected trigger if the popup still owned focus.
6. Closing after the user focuses another outside control does not hijack that focus. Closing with the trigger removed does not focus a disconnected element.

The sample offers a scoped JS check of `document.activeElement`, element connection and focus sequence around actual `ElementReference.FocusAsync()`. The minimal local test server serves its Blazor JS runtime from **the installed local .NET/NuGet SDK asset package**, not from a CDN; this is a fixture-specific portability limitation. The harness tears down only its own server and browser processes.

## What is still NOT proven

**These are NOT tests of current Bluent TabList, MenuItem or any other shipped component.** The lab is a separate .NET 10 InteractiveServer component without Bluent references; no current component was modified. No product CSS, Fluent design parity, actual Windows High Contrast, NVDA/JAWS, WASM counterpart, network-circuit-disconnection recovery or cross-browser Safari/Firefox acceptance is claimed. Even green GitHub CI will pin **stored evidence and source checks only**, not run the live server in CI.

The [33 owner-bound acceptance scenarios](FOCUS-KEYBOARD-ACCEPTANCE-MATRIX.json) remain **all `planned` / `evidence=null`**. No owner issue is promoted by these observations. Shared Focus lifecycle architecture (#420) still needs a decision and design in the **correct editable Bluent v3 Penpot/Figma file** before any Bluent product code is implemented.

## Reproduction on Dev01

- `dotnet build scripts/quality/fixtures/blazor-focus-lab/Bluent.FocusLifecycleLab.csproj -c Debug`
- `node scripts/quality/probe_v3_blazor_focus_lifecycle.mjs chrome`
- `node scripts/quality/probe_v3_blazor_focus_lifecycle.mjs edge`
- `python -m unittest discover -s scripts/quality -p test_v3_blazor_focus_lifecycle_evidence.py -v`

The previously verified [manual TabList reentry](FOCUS-KEYBOARD-REENTRY-DECISION.md) and [Wave I native HTML focus experiment](FOCUS-KEYBOARD-LIFECYCLE-RESEARCH.md) remain separate research evidence.
