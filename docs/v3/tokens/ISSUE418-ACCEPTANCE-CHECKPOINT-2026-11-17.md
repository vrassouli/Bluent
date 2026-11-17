# Issue #418 — acceptance checkpoint (2026-11-17)

## Scope and exact revision

Repository: vrassouli/Bluent  
PR: https://github.com/vrassouli/Bluent/pull/500  
Branch: v3/issue-418-design-tokens → bluent-v3  
Exact tested head: ecce36cc52ae9903114c4c104c9b0a029e09c220

This checkpoint records CI, a clean Windows acceptance clone, real browser/runtime probes and the native Penpot audit. It does not represent maintainer approval of production APIs/tokens or native OS/assistive-technology certification.

## Exact-head CI

GitHub Actions for ecce36c: **13/13 SUCCESS**, zero failures and zero pending jobs. The run includes Token Contract, Documentation Contract, Baseline Quality Gate, Local Package Boundary, Button Runtime and Focus contracts, Component Lab, Interaction Source Contract, Firefox Portal Lab, WebKit Portal Lab, Real Compatibility Browsers and Real Browser Lab. Real Browser Lab completed all four cells: Chrome/Edge × WASM/InteractiveServer.

## Windows release validation

Environment: Windows 11 Pro, build 28000, .NET SDK 10.0.403. The PR was cloned to %TEMP%\Bluent-418-Acceptance; the user's original D:\projects\Bluent checkout remained on Dev and clean.

| Check | Result |
|---|---:|
| dotnet restore Bluent.sln | PASS |
| Release build with warnings as errors | 0 warnings / 0 errors |
| Full solution tests | 140/140 |
| Issue #418 focused review contract | 13/13 |
| Additive public API ledger | 8/8 |
| NuGet package-boundary unit tests | 9/9 |
| Probe syntax / git diff --check | PASS |

## Real browser evidence

All probes ran against the isolated PR clone at the exact tested source revision.

| Browser / mode | Probe | Result |
|---|---|---:|
| Chrome 157.0.8103.79 · Blazor WASM | probe_v3_blazor_runtime.mjs | 1,179/1,179 |
| Edge 157.0.4341.60 · Blazor WASM | probe_v3_blazor_runtime.mjs | 1,179/1,179 |
| Chrome 157 · forced-colors + reduced-motion emulation | probe_v3_forced_colors_runtime.mjs | 299/299 |
| Edge 157 · forced-colors + reduced-motion emulation | probe_v3_forced_colors_runtime.mjs | 299/299 |
| Firefox 159 · Published InteractiveServer | probe_v3_firefox_portal.mjs | 34/34 |
| Playwright WebKit 1.65.1 · Published InteractiveServer | probe_v3_firefox_portal.mjs | 34/34 |

The 1,179-point WASM probe covers the real Blazor controls, 20 brand×mode combinations, 80 Dark foreground candidates (minimum contrast **4.600125:1**), focus/zoom samples, narrow viewports, double-ring viewports and platform glyph observation for Persian text. It is not an IME or spoken-AT test.

The 299-point media probe covers ten brands × Light/Dark × normal, reduced-motion only, forced-colors only and combined media states. It verifies Button focus remains visible with a 2px system Highlight outline and no layout shift, TextField retains underline-only focus, and reduced motion independently resolves to 0ms. This is browser CDP media emulation, **not native Windows Contrast Themes**.

The 34-point Firefox and WebKit probes run against Published InteractiveServer and cover D2 scope snapshots, independent nested/concurrent Dialog/Popover ownership, modal inert background, Escape priority, nested Escape/focus restoration, route teardown and uncaught browser errors.

### Probe correction in ecce36c

The previous test-only probe contained a mojibake Persian Close-button literal even though the rendered accessible label was correct. It now uses JavaScript Unicode escapes for the actual Persian aria-label. It also waits until both parent and nested Dialog roots have data-bui-v3-keyboard-bound before dispatching Escape. The earlier WebKit timeout came from sending Escape before Blazor's asynchronous JS-interoperability registration completed. Once both handlers were registered, Firefox and WebKit each passed 34/34. This commit changes the probe harness only; it does not modify Bluent runtime code.

## Native Penpot state

Source-owned file: Bluent v3 Design System  
File ID: b64f6665-c9ab-80b5-8008-c4ac99d9d000  
Current observed revision: **843**.  
The repeatable native TokenSet audit ran at revision 842 and passed **1,285/1,285 assertions** across 46 logical roles, Light/Dark and all 20 Brand×Mode themes. Physical inventory: 45 TokenSets / 492 token entries.

Page 45 remains **REVIEW REQUIRED**; page 55 remains **DRAFT**. Pages 52–54 record selected engineering directions as preview/prototype only.

## What remains unaccepted

| Gate | Current evidence | Disposition |
|---|---|---|
| Native Windows Contrast Themes for Dialog/Popover and unsupported Focus hosts | HCM is off on the Windows test account; only browser CDP emulation was run. Settings were not changed. | OPEN |
| Spoken NVDA / Narrator / VoiceOver and keyboard navigation | Narrator is installed but not running; NVDA/JAWS are not installed. No spoken acceptance was performed. | OPEN |
| Native Safari.app / SafariDriver / VoiceOver | Playwright WebKit is green but is not Safari.app or spoken VoiceOver. | OPEN |
| Persian OS IME/caret/selection and cross-platform font metrics | Browser platform-glyph observation only; composition/IME typing was not tested. | OPEN |
| Design/API sign-off | Page 45 remains REVIEW REQUIRED; final public semantic allow-list, production aliases, and Focus/Portal/Dialog names/shapes are not approved. | OPEN |
| GitHub Project #5 custom Status field | Not changed through the available GitHub actions. | NOT UPDATED |

## Disposition

Issue #418 remains **Open / In progress**. PR #500 remains **Open / mergeable / unmerged**. No stable Dev/main changes, production CSS activation, NuGet publication or deployment were performed. The Windows browser evidence strengthens runtime confidence but does not close native OS/AT or maintainer design/API approval gates.
