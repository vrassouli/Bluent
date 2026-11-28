# DateField product-context capture — 2026-11-28

File: BLUENT-DATEFIELD-PRODUCT-CONTEXT-2026-11-28.png

- Source route: the interactive Blazor WebAssembly product demo, /component-lab.
- Source checkout: task branch v3/issue-438-datefield, after the Component Lab sample refinement that demonstrates inherited Small, default Medium and Large sizing, plus a leading StartAddon. The capture precedes the follow-up commit.
- Browser: Chrome, viewport 1440 x 1200, device scale 1.
- Page state: DateField pilot selected; first DaySelect DateTime field's live calendar Popover open on October 2026; all eight DateField specimen cards visible in the rendered page.
- Visible specimen refinements: DaySelect shows the leading # StartAddon and Small input; MonthSelect retains default Medium; YearSelect is Large; other specimens remain visible.
- Theme/direction: application Light theme, LTR page direction, Light canvas.
- Capture SHA-256: d7064d7445dd102f0ed97a9cb0b383cae0f838289f8b04909377edec574543e8.

This is a product-context capture from the interactive Bluent demo route, not a QA-only fixture. The DateField component, input, calendar button and open Popover are live browser-rendered product components. The screenshot includes the revised sample description and all eight DateField specimen cards.

Scope and limitations:
- The capture is from the Component Lab product demo route, not the canonical /components/fields showcase.
- The Fields showcase still has a separate NumericField<float> rendering failure in NumericFieldValuePipeline.TryStep (Double-to-Single cast). That issue is outside DateField #438 and is not hidden by this capture.
- This is an agent visual capture/self-review. It is not represented as a separate human review or independent approval.
- The screenshot demonstrates the DateField's real product context and open-picker anatomy; it is not an accessibility certification and does not establish spoken screen-reader output.