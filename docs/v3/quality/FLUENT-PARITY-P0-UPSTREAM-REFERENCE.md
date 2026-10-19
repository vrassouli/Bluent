# #552 upstream reference checkpoint — P0 (2026-10-19)

This is a **dated link/content checkpoint, not an upstream package-version freeze or parity verdict**. The Storybook site is a dynamic SPA: a live browser/Storybook package commit still needs inspection and pinning. The previous #552 source triage and [source API census](FLUENT-PARITY-18-API-CENSUS.md) remain unapproved.

| Bluent family | Confirmed official reference | Exactly what the source confirms | Still unverified |
| --- | --- | --- | --- |
| Button #428 | [Microsoft Fluent Web Components Button](https://learn.microsoft.com/en-us/fluent-ui/web-components/components/button); [Fluent 2 Button](https://fluent2.microsoft.design/components/web/react/core/button/usage/) | Microsoft documents `fluent-button` as a Web Component for HTML button; its documented appearance values are not a 1:1 mapping to Bluent enum names. | Installed/upstream WC release or commit, state attributes, Toggle/Split/Compound variant coverage, exact Storybook DOM and snapshots |
| Slider #442 | [Microsoft Fluent Web Components Slider](https://learn.microsoft.com/en-us/fluent-ui/web-components/components/slider); [Fluent 2 Slider](https://fluent2.microsoft.design/components/web/react/core/slider/usage) | `fluent-slider` is documented as a form-connected Web Component; Fluent 2 calls for pointer, keyboard and touch, and accessible labeling. Official Fluent design site links to a [Web Components Slider Storybook](https://web-components.fluentui.dev/?path=/docs/components-slider--docs). | Exact WC package/revision, browser DOM/screenshot parity, orientation, spacing and step evidence |
| RangeSlider #443 | [Fluent 2 single-value Slider guidance](https://fluent2.microsoft.design/components/web/react/core/slider/usage); [W3C multi-thumb slider pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb/) | The W3C multi-thumb slider pattern explicitly requires separately focusable thumbs, stable Tab order, correctly updating value range and accessible names. **This is a standards accessibility reference, not evidence of a Fluent two-thumb counterpart.** | Whether a currently published Fluent WC two-thumb API exists; explicit Bluent extension approval, role/AT and gesture tests |
| FileSelect #444 | [Fluent 2 button and accessibility guidance](https://fluent2.microsoft.design/components/web/react/core/button/usage/), [Fluent Web Components catalog](https://learn.microsoft.com/en-us/fluent-ui/web-components/components/overview) | An accessible named delete action can be compared with Button standards; Bluent FileSelect wraps native Blazor InputFile and requires separate validation. | Exact equivalent Fluent file upload component, if any; fallback vs intentional Bluent extension, runtime/AT tests |

### Known coordinate-space defect exposed by source

Both `Slider.razor.cs` and `RangeSlider.razor.cs` call `CalculateValueFromPoint(args.ScreenX, args.ScreenY)` while subtracting `railRect.Left` from `GetBoundingClientRectAsync`. `ScreenX` uses screen coordinates; `getBoundingClientRect().left` uses viewport/client coordinates. This is a source-proven **coordinate-space mix**, not an actual measured browser regression. It requires consistent viewport `ClientX` (subject to orientation and RTL design), bounds/zero-width guard, and real browser tests, all owned by product issues #442/#443. Do not modify product code inside this audit.

### Repro gates still missing

- Reproduce on Chrome and Edge, real viewport scroll, zoom, RTL, mouse/touch, WASM and published InteractiveServer.
- Verify all public C#/Blazor binding, validation, CSS, event sequences and keyboard roles; no source-only acceptance.
- Capture true Fluent v2 references/Storybook pinned revision, render screenshots with comparable state/theme/size, and approved editable Bluent Penpot/Figma component board. The #552 Figma decision map is **not** a component signoff.
- Test W3C multi-thumb touch assistive technology on actual supported devices; W3C specifically cautions about touch/AT gesture support.

No component was moved to Review/Done. No public v3 component implementation or stable v2 release changed.
