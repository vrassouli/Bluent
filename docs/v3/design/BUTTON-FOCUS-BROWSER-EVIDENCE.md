# Button Focus Visible: real browser interaction evidence (#501)

**Date:** 2026-10-13
**Status:** Research-only, opt-in browser-injected CSS proposal; NOT the v3 production Button rewrite or final accessibility approval.
**Design:** Penpot project-owned file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, page `535db143-a732-807e-8008-c64d2fb91b9a`, including interaction board `cd054205-a525-80d8-8008-c84dc7f13d55`, split/design board `cd054205-a525-80d8-8008-c8513c9cdb13`, native Danger family `cd054205-a525-80d8-8008-c853b7ac86f0`.

## Repeatable interactive run

The probe `scripts/quality/probe_v3_button_focus_runtime.mjs` launches its own isolated Chrome/Edge debugging session with CDP and opens the **existing** Blazor WebAssembly demo `/components/buttons`. It uses native existing Bluent Buttons (not synthetic HTML mocks or DOM-inserted controls), and adds a **temporary CSS style element inside the ephemeral browser page only** to preview `:focus-visible` and an inset Split ring.

```powershell
dotnet run --project src/Bluent.UI.Demo/Bluent.UI.Demo.csproj --no-launch-profile --urls http://127.0.0.1:5080
# In a second terminal:
node scripts/quality/probe_v3_button_focus_runtime.mjs http://127.0.0.1:5080
# Edge alternative (Windows):
$env:CHROME_PATH='C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
node scripts/quality/probe_v3_button_focus_runtime.mjs http://127.0.0.1:5080
```

### Evidence: interactive WebAssembly

| Target | Actual CDP checks | Failed | Observations |
| --- | ---: | ---: | --- |
| Chrome on Dev01, interactive WASM | **17/17** | **0** | Native Split has separate focus targets; Tab/Shift+Tab, no layout shift, inset focus ring; mouse modality, LTR→RTL, Space/Enter toggling, forced-colors ring, disabled Tab skip, selected+focus, Danger focus |
| Edge on Dev01, interactive WASM | **17/17** | **0** | Same test path and checks |

The initial test script observed two failures caused by **incorrect CDP input modeling**, not confirmed product defects: (1) a pointer click on an already keyboard-focused element can retain `:focus-visible`; corrected by moving focus to a different element with the pointer first; (2) Enter lacked its `text: '\r'` native key character, so Chromium did not synthesize a trusted click; supplying it produced the actual click and normal Toggle behavior. Do not present those harness failures as Button regressions.

The probe is an automated interaction/layout test of the temporary candidate, **not** certification of actual v3 release styles, all ten brands/light+dark modes, WCAG contrast, assistive technology, keyboard popup semantics, or accessibility in other operating systems. It does not modify shipped styles, Razor/C# component behavior, user-facing demo pages, `Dev`, or NuGet.

### Known and new limitations

- **Confirmed existing Bluent gap:** the user-visible selected state toggles with native Space/Enter, but `aria-pressed` is absent (`null`) on the toggle after activation. Track the component fix and migration semantics in **#428**.
- **Static SSR != Interactive Server:** the current `Bluent.UI.Demo.SSR` `/components/buttons` route is static, via `Routes.razor` without interactive render mode. As expected, that page **does not process Blazor Toggle events**. It also does not provide a trustworthy InteractiveServer Button CSS parity baseline. The probe fails fast with a clear message when pointed at that host. This is **not** a keyboard Button failure. A new real **InteractiveServer** Button test fixture is still needed under #428, with design and code review.
- **Design decision pending #418:** candidate Split ring uses a 2px inset outline with a neutral token placeholder, and forced-colors `Highlight` fallback. Component design in Penpot separately shows independent Split targets. Contrast and preferred ring tokens, dark themes and all ten brands require explicit acceptance.
- Existing #501 remains **In progress** and its PR **Draft**. #428 remains Backlog until foundation prerequisites/design approvals permit its actual v3 component implementation. In particular, a CSS injection into Chrome **is not production CSS** and must not be described as a shipped focus improvement.

### Next gate

Approve focus stroke/contrast semantics in #418; create a dedicated interactive Button fixture and formalize public `aria-pressed` semantics after #428 moves through Ready into In progress; carry the proven Tab/Shift+Tab/Enter/Space/Split/RTL/forced-colors tests into the product CI with visual snapshots and complete Button Storybook-style scenarios.
