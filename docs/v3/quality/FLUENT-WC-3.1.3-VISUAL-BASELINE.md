# #552 — actual pinned Fluent vs current Bluent Lab screenshots (2026-10-19)

> **First paired visual evidence; NOT pixel-by-pixel parity, Fluent approval or native OS/AT certification.** This is a real Chrome 1240×1140 deviceScaleFactor 1 capture from two separately hosted applications. No screenshot, illustration or UI was hand-drawn to imitate either product. The [official released reference](FLUENT-WC-3.1.3-P0-CROSSWALK.md) is exactly `@fluentui/web-components@3.1.3` with `@fluentui/tokens@1.0.0-alpha.24` / `webLightTheme`; the Bluent target is real `#421` Component Lab WebAssembly at source commit `b9952aa93e89fd569de54080a7fdd06037b53a41`. Both were launched with disposable localhost HTTP and fresh dedicated Chrome profiles.

## Button visual pair

| Official Fluent Web Components 3.1.3 | Current Bluent Button Component Lab |
| --- | --- |
| ![Actual official Fluent 3.1.3 buttons at rest](evidence/FLUENT-WC-3.1.3-LIGHT-CHROME.png) | ![Actual current Bluent Button family demo](evidence/BLUENT-LAB-BUTTON-CHROME.png) |

The screenshots depict **different test layouts, contents, visual densities and nominal control widths**. Both sampled buttons are 32px high for the measured default/primary specimens, but the official demo's 160px button host width is constrained by its `preview` container; Bluent's sampled Button was 96px wide. **Do not** claim equal padding, typography, shape or layout tokens from these two independently constrained widths. Bluent Lab additionally exposes Split, Badge and rotated/vertical variants not placed in the official WC fixture; treat extra variants as a capability-mapping question rather than an automatic mismatch.

**Behavioral finding:** the official pinned `fluent-toggle-button` actually toggled its `pressed` state in Chrome; current Bluent `ToggledChanged` works in existing Lab checks, but its component-generated HTML does **not** automatically emit `aria-pressed`. Only source/audit-level missing semantics are asserted, not a native screen-reader outcome. Official reference has dedicated compound and menu button tags; Bluent uses different composition and parameters.

## Slider visual pair

| Official Fluent single-thumb reference | Current Bluent Slider |
| --- | --- |
| ![Real Fluent 3.1.3 continuous and stepped slider](evidence/FLUENT-WC-3.1.3-LIGHT-CHROME.png) | ![Actual Bluent Slider int and double specimens](evidence/BLUENT-LAB-SLIDER-CHROME.png) |

The Fluent fixture measured a 260×32px `fluent-slider` host; Bluent's sampled Slider host measured approximately 351.5×20px inside its separate Card. **Those outer host dimensions are container-/fixture-dependent** and do not constitute a normalized geometry diff. Both show a filled progress segment, dark remaining track and circular thumb, but the actual thumb radius/stroke, component spacing, dark theme, RTL, zoom and forced-colors haven't been compared under normalized constraints.

**Verified official behavior:** real Chrome `ArrowRight` advanced a published WC `step="10"` Slider after keyboard focus. The official manifest declares `step`, `orientation`, `mode`, `value`, `min`, `max`, `size` and disabled properties. Existing Bluent Slider only declares Min, Max, Value, ValueChanged and ThumbSize (comments contain proposed Orientation/Size, not active API); source-only current thumb lacks native keyboard/slider ARIA metadata. Real Bluent WASM pointer ValueChanged was independently verified in #421's prior and current Lab; the known published InteractiveServer pointer gap remains **open**.

Official WC keyboard focus reference: [Fluent WC 3.1.3 stepped-slider focus screenshot](evidence/FLUENT-WC-3.1.3-LIGHT-CHROME-KEYBOARD-FOCUS.png).

## Non-identical components: RangeSlider and FileSelect

| Bluent-only current source specimens | Evidence |
| --- | --- |
| RangeSlider, two-thumb range | ![Current Bluent RangeSlider](evidence/BLUENT-LAB-RANGESLIDER-CHROME.png) |
| FileSelect, native upload + Cards | ![Current Bluent FileSelect](evidence/BLUENT-LAB-FILESELECT-CHROME.png) |

No custom elements with the names `fluent-range-slider` and `fluent-file-select` are declared by the **specific pinned WC 3.1.3 release**. These images therefore do **not** invent an exact upstream WC visual comparison. W3C multi-thumb keyboard/ARIA, native browser file picker behavior, accessible remove Button, MaxFiles enforcement and secure upload validation remain independently owned by #443/#444, with a documented extension decision pending.

## Machine and run evidence

- [Official Chrome measurement / 5 passing assertions](evidence/FLUENT-WC-3.1.3-LIGHT-CHROME.json): actual official tag definitions, nonzero rendered elements, shadow rendering, ToggleButton pressed state and stepped Slider ArrowRight.
- [Bluent Chrome measurement / 5 passing assertions](evidence/BLUENT-LAB-P0-CHROME.json): 4 live component families, source branch/commit, native DOM sizes, thumb counts and missing explicit ARIA attributes.
- Reproduction scripts: `scripts/quality/probe_v3_fluent_wc_reference.mjs`, `scripts/quality/probe_v3_bluent_lab_reference.mjs`, and official fixture `scripts/quality/fixtures/fluent-wc-3.1.3-*.js/html`. The official NPM JS bundle is **not vendored into Bluent**; rebuild the fixture in an isolated scratch directory using the pinned packages documented in the [WC source crosswalk](FLUENT-WC-3.1.3-P0-CROSSWALK.md).
- Earlier separately repeated four-mode Component Lab smoke: [Chrome + Edge × WebAssembly + published InteractiveServer 904/904](FLUENT-PARITY-P0-LIVE-RERUN.md). **Those existing checks are not 904 Fluent parity tests, and published Server Slider/RangeSlider pointer ValueChanged was intentionally not among their assertions.**
- Actual screenshot files are saved under `docs/v3/quality/evidence/` and checked by `test_v3_p0_visual_evidence.py`. No native OS assistive technology was used, no actual user design approval was obtained, and dark/RTL/forced-colors plus comparable anatomy/state screenshots remain to do.

**Next release gate:** produce *normalized* same-state/same-size WC-vs-Bluent comparisons and source-owned editable component design approvals; validate all public API and actual keyboard/touch/SSR/OS-AT interactions; apply approved fixes through component owners #428/#442/#443/#444 only. Keep #552 In progress and PR #553 Draft.
## Additional real-browser rerun — 2026-10-23

A fresh isolated Chromium run was completed against the pinned published Fluent WC 3.1.3 fixture and the live Bluent #421 Component Lab WebAssembly source. Both hosts used 1240×1140 CSS-pixel viewports at DPR 1; the Bluent component specimens and Fluent reference were independently hosted and exercised, not recreated as drawings.

| Scenario | Fluent checks | Bluent checks | What this establishes |
| --- | ---: | ---: | --- |
| Dark + LTR | 7/7 | 8/8 | Real component render, ToggleButton pressed-state change, and stepped Slider keyboard change on the upstream reference; Bluent specimen presence and focused control probe |
| Dark + RTL | 7/7 | 8/8 | Same runtime checks with actual `dir=rtl` and dark-theme setup |
| Forced-colors emulation | 8/8 | 11/11 | Chromium reports both `forced-colors: active` and `prefers-contrast: more`; this is CSS-media emulation, not native Windows High Contrast or assistive-technology certification |

Evidence files use the `*-RERUN-20261023-CHROME` suffix where needed, alongside the `DARK-LTR` evidence.

| Scenario | Fluent reference record | Bluent record | Bluent screenshots |
| --- | --- | --- | --- |
| Dark + LTR | [measurement JSON](evidence/FLUENT-WC-3.1.3-DARK-LTR-CHROME.json) · [screenshot](evidence/FLUENT-WC-3.1.3-DARK-LTR-CHROME.png) | [measurement JSON](evidence/BLUENT-LAB-P0-DARK-LTR-CHROME.json) | [Button](evidence/BLUENT-LAB-BUTTON-DARK-LTR-CHROME.png) · [Slider](evidence/BLUENT-LAB-SLIDER-DARK-LTR-CHROME.png) · [RangeSlider](evidence/BLUENT-LAB-RANGESLIDER-DARK-LTR-CHROME.png) · [FileSelect](evidence/BLUENT-LAB-FILESELECT-DARK-LTR-CHROME.png) |
| Dark + RTL | [measurement JSON](evidence/FLUENT-WC-3.1.3-DARK-RTL-RERUN-20261023-CHROME.json) · [screenshot](evidence/FLUENT-WC-3.1.3-DARK-RTL-RERUN-20261023-CHROME.png) | [measurement JSON](evidence/BLUENT-LAB-P0-DARK-RTL-RERUN-20261023-CHROME.json) | [Button](evidence/BLUENT-LAB-BUTTON-DARK-RTL-RERUN-20261023-CHROME.png) · [Slider](evidence/BLUENT-LAB-SLIDER-DARK-RTL-RERUN-20261023-CHROME.png) · [RangeSlider](evidence/BLUENT-LAB-RANGESLIDER-DARK-RTL-RERUN-20261023-CHROME.png) · [FileSelect](evidence/BLUENT-LAB-FILESELECT-DARK-RTL-RERUN-20261023-CHROME.png) |
| Forced-colors emulation | [measurement JSON](evidence/FLUENT-WC-3.1.3-FORCED-COLORS-RERUN-20261023-CHROME.json) · [screenshot](evidence/FLUENT-WC-3.1.3-FORCED-COLORS-RERUN-20261023-CHROME.png) | [measurement JSON](evidence/BLUENT-LAB-P0-FORCED-COLORS-RERUN-20261023-CHROME.json) | [Button](evidence/BLUENT-LAB-BUTTON-FORCED-COLORS-RERUN-20261023-CHROME.png) · [Slider](evidence/BLUENT-LAB-SLIDER-FORCED-COLORS-RERUN-20261023-CHROME.png) · [RangeSlider](evidence/BLUENT-LAB-RANGESLIDER-FORCED-COLORS-RERUN-20261023-CHROME.png) · [FileSelect](evidence/BLUENT-LAB-FILESELECT-FORCED-COLORS-RERUN-20261023-CHROME.png) |

The Bluent source was the existing `v3/issue-421-component-lab` commit `b9952aa93e89fd569de54080a7fdd06037b53a41`; this does not validate a new product implementation or a published InteractiveServer build.

### Defects confirmed by the rerun

- In forced-colors emulation, both Bluent Slider and RangeSlider rails resolve to `background-image: none` and transparent `background-color`; their 4px rails therefore lose their visible track. The existing CSS depends on a gradient, with no forced-colors fallback. Route the fix through owner issues [#442](https://github.com/vrassouli/Bluent/issues/442) and [#443](https://github.com/vrassouli/Bluent/issues/443), with a semantic system-color rail/thumb treatment designed and reviewed before product changes.
- Bluent Slider's root and thumb still have no usable native keyboard focus target or slider role/value semantics in the actual DOM probe. RangeSlider's two thumbs likewise expose no role, tabindex or `aria-valuenow`. These are concrete DOM/keyboard gaps, not native screen-reader test results.
- The official reference responds to the stepped Slider's `ArrowRight` key and ToggleButton clicks. This proves those reference behaviors work in the tested Chromium fixture; it does not imply Bluent parity.

The rerun did **not** perform normalized pixel-diff acceptance, native OS high-contrast testing, screen-reader testing, touch testing, or published InteractiveServer acceptance. No component is marked Fluent-approved. Preserve #552 as In progress and PR #553 as Draft.
