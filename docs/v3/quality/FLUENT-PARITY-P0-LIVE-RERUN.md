# #552 — live Component Lab cross-browser rerun (2026-10-19)

**Execution result — current Bluent behavior only; NOT Fluent 2 parity acceptance.**

This was independently executed on **Dev01**, using the already existing isolated `#421` [Component Lab runner](https://github.com/vrassouli/Bluent/blob/v3/issue-421-component-lab/scripts/quality/run_v3_component_lab.ps1), not inferred from a prior issue comment. The owning Lab checkout was `b9952aa93e89fd569de54080a7fdd06037b53a41` on `v3/issue-421-component-lab`, with a clean working tree before and after. This report lives only on the isolated `#552` branch/PR. The underlying source and Lab were **not modified**, and the stable `Dev` branch was not touched.

| Browser (headless native Chromium executable) | Host | Actual Lab assertions | Failures | Mode caveat |
| --- | --- | ---: | ---: | --- |
| Google Chrome | Interactive WebAssembly / Debug build, rebuilt from source | **228 / 228** | 0 | Real pointer input verified for Slider and RangeSlider `ValueChanged` |
| Microsoft Edge | Interactive WebAssembly / Debug build, rebuilt from source | **228 / 228** | 0 | Same relevant pointer coverage |
| Google Chrome | **Published** Production InteractiveServer (SSR app) | **224 / 224** | 0 | Slider and RangeSlider Pointer `ValueChanged` **excluded from passing assertions** |
| Microsoft Edge | **Published** Production InteractiveServer (SSR app) | **224 / 224** | 0 | Same explicit exclusion |

**Total: 904/904 executed Lab assertions passed, 0 failed** across four independent launches. Each harness run started a disposable isolated localhost host and fresh GUID-scoped browser profile; each reported **remaining owned browser processes = 0** after cleanup. Machine-wide native OS/AT was not used, and no screenshot reference-vs-target diff is claimed. The supplied numbers are the *existing #421 Lab contract*, not 904 Fluent parity tests.

## P0 observations and non-claims

- **Button #428:** Real native button keyboard Enter and `ToggledChanged` behavior, variant rebinding, menus, disabled and other public source features are exercised in the Lab. Still lacks source-emitted toggle `aria-pressed` and signed-off Fluent visual/keyboard focus state comparison. User-supplied HTML attributes could add `aria-pressed` for a particular usage, but the component does not do so itself.
- **Slider #442:** Blazor-bound pointer input works in tested WASM Lab, including typed int/double. **Published Server pointer binding remains an actual known issue reported on #442 and is not retested/asserted by this Lab runner.** `ScreenX` vs viewport `getBoundingClientRect().Left` is source-proven. Semantic operable slider keyboard/ARIA, bounds, step, orientation, RTL pointer semantics are unverified/not implemented in current markup.
- **RangeSlider #443:** WASM pointer changes to int/decimal typed range verified; Server pointer not claimed, as above. Two `div` thumb elements do not themselves expose the W3C multi-thumb roles/names/ARIA values/focusable keyboard model; ordered tab navigation and touch OS/AT need product redesign and live verification.
- **FileSelect #444:** Actual native `InputFile`, `MaxFiles` single/multi fixtures, remove and `OnChange`, source examples and mobile Card spacing are covered by current Lab. Icon-only remove Button lacks an intrinsic accessible name; `Accept` is only a chooser hint. Security/type/size/authorization/server enforcement and native picker OS/AT acceptance remain pending.
- **RTL/mobile:** The Lab checked narrow 320px cards, rails within bounds and **8px separated** cards. This is **Lab fixture layout** with some English data/status islands deliberately `dir=ltr`, not approval of the full Bluent RTL component API, screenshot fidelity, design tokens or real Persian production pages.
- Existing `#421` source-only 18-family parity planning matrix is still **18/18 not reviewed** for Fluent acceptance. The `#552` [source-level P0 semantic-gap checkpoint](FLUENT-PARITY-P0-SEMANTICS.json) records seven reproducible *source observations*, not measured OS accessibility results.

## Grounded reference requirements

- [Fluent 2 Slider usage](https://fluent2.microsoft.design/components/web/react/core/slider/usage/): slider input via mouse, keyboard and touch; horizontal or vertical; labelled and accessible. React-page content is *design guidance*, not a promised Web Components API.
- [Microsoft Fluent Web Components slider](https://learn.microsoft.com/en-us/fluent-ui/web-components/components/slider): published `fluent-slider` reference. Exact WC source revision still unpinned.
- [W3C single-thumb slider](https://www.w3.org/WAI/ARIA/apg/patterns/slider/) and [multi-thumb slider](https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb/): focusable named thumbs, actual values/ranges, stable multi-thumb tab order and native touch AT verification.
- [HTML accept attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/accept): browser picker filtering is not file validation.

## Next acceptance gates (independent of passing 904 checks)

1. Pin official Fluent Web Components/React implementation versions and state variants; make a **specific per-family upstream feature matrix**, with explicit Bluent-only extensions.
2. Produce actual **paired reference/target screenshots** and geometry/visual diff under light/dark, 320px, zoom, RTL, high contrast and icon/text alignment, on approved editable Bluent design variants.
3. Reproduce/fix actual #442 published InteractiveServer Pointer failure, coordinate mismatch and RTL; test #443 independent keyboard-focusable thumbs and crossing; test #444 removable upload name and validation; test #428 toggle semantics and focus in browser and native AT.
4. Keep improvements in #428/#442/#443/#444 product issues with accepted design and normal status gate. #552 remains **In progress**, #553 **Draft**, and #421 new Lab family expansion remains **paused**.
