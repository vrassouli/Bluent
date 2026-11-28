# DateField product-context capture — 2026-11-28

File: [BLUENT-DATEFIELD-PRODUCT-CONTEXT-2026-11-28.png](BLUENT-DATEFIELD-PRODUCT-CONTEXT-2026-11-28.png)

- Source route: the interactive Blazor WebAssembly product demo, `/component-lab`.
- Build/source: current `v3/issue-438-datefield` working tree at commit `36dea74a043d5b63e11f1506ccf75c5e95fc36cf`.
- Browser: Chrome, viewport 1440 × 1000, device scale 1.
- Page state: DateField pilot selected; first DaySelect DateTime field's real calendar Popover open on October 2026; all eight DateField specimen cards visible in the rendered page.
- Theme/direction: application Light theme, LTR page direction, Light canvas.
- Capture SHA-256: `0d05bb1f9d8002b909de1fd67da6f6382a0efe4021baffa3a1569db203ad4344`.

This is a clean product-context capture from the interactive Bluent demo route, not a QA-only fixture. The DateField component, input, calendar button and open Popover are live browser-rendered product components. No DateField or JavaScript error banner is visible in the capture.

Scope and limitations:
- The capture is from the Component Lab product demo route, not the canonical `/components/fields` showcase.
- The Fields showcase still has a separate `NumericField<float>` rendering failure in `NumericFieldValuePipeline.TryStep` (Double-to-Single cast). That issue is outside DateField #438 and is not hidden by this capture.
- This is an agent visual self-review/capture. It is not represented as a separate human review or independent approval; the maintainer previously directed that no human reviewer be engaged.
- The screenshot demonstrates the DateField's real product context and open-picker anatomy; it is not an accessibility certification and does not establish spoken screen-reader output.
