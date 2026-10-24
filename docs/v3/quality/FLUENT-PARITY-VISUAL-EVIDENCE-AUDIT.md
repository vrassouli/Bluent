# Visual evidence coverage audit - Issue #552

Review date: 2026-10-24. Source baseline: 73155f02.

## Scope

This audit inventories existing screenshots, browser visual modes, component style sources and the availability of family-specific editable Penpot design artifacts. Snapshot: [Penpot design-artifact snapshot](evidence/PENPOT-ISSUE-552-DESIGN-ARTIFACT-SNAPSHOT.json).

**Important:** this is an evidence coverage audit, not a visual parity verdict. Only the primary Button has a narrow 96×32 host-crop pixel diagnostic in Light/LTR and Dark/RTL; no complete family/state-by-state pixel-diff or approved side-by-side comparison was performed. Matching screenshots and token names do not prove Fluent visual parity. The zoom-200 scenario is a layout-reflow proxy, not native browser UI zoom.

## Coverage summary

| Evidence mode | Families with linked evidence |
|---|---:|
| Light / LTR | 18 / 18 |
| Dark / RTL | 18 / 18 |
| Forced-colors emulation | 18 / 18 |
| Reduced-motion emulation | 3 / 18 |
| Focus state | 17 / 18 |
| Hover state | 1 / 18 |
| Disabled state | 4 / 18 |
| Pressed/selected state | 10 / 18 |
| Narrow / zoom-reflow proxy | 5 / 18 |

## Family findings

| Family | Editable design artifact | Light/LTR | Dark/RTL | Forced colors | Focus | Hover | Disabled | Pressed/selected | Narrow/zoom proxy | Visual gap |
|---|---|---|---|---|---|---|---|---|---|---|
| Button | draft page(s) | yes | yes | yes | yes | yes | no | yes | yes | A narrow primary-Button host-crop pixel diagnostic exists for Light/LTR and Dark/RTL; no approved state-by-state Fluent/Penpot-to-browser comparison or design-owner sign-off exists. |
| Icon | review board, incomplete variants | yes | yes | yes | no | no | no | yes | yes | An editable Icon review board exists, but its reusable variant set is explicitly incomplete; no approved state-by-state Fluent/Penpot-to-browser comparison or pixel-diff is recorded. |
| Label | no dedicated family asset | yes | yes | yes | yes | no | yes | no | no | No family-specific editable design artifact in the dated Penpot record; a design-to-browser comparison cannot be completed for this family. |
| Link | no dedicated family asset | yes | yes | yes | yes | no | yes | no | no | No family-specific editable design artifact in the dated Penpot record; a design-to-browser comparison cannot be completed for this family. |
| Badge | no dedicated family asset | yes | yes | yes | yes | no | yes | no | no | No family-specific editable design artifact in the dated Penpot record; a design-to-browser comparison cannot be completed for this family. |
| TextField | draft page(s) | yes | yes | yes | yes | no | no | yes | no | Draft design pages exist, but no approved state-by-state design-to-browser comparison or pixel-diff is recorded. |
| Checkbox | draft page(s) | yes | yes | yes | yes | no | no | no | no | Draft design pages exist, but no approved state-by-state design-to-browser comparison or pixel-diff is recorded. |
| Switch | draft page(s) | yes | yes | yes | yes | no | no | no | no | Draft design pages exist, but no approved state-by-state design-to-browser comparison or pixel-diff is recorded. |
| NumericField | no dedicated family asset | yes | yes | yes | yes | no | no | yes | no | No family-specific editable design artifact in the dated Penpot record; a design-to-browser comparison cannot be completed for this family. |
| RadioGroup | no dedicated family asset | yes | yes | yes | yes | no | no | no | no | No family-specific editable design artifact in the dated Penpot record; a design-to-browser comparison cannot be completed for this family. |
| SelectField | no dedicated family asset | yes | yes | yes | yes | no | no | yes | no | No family-specific editable design artifact in the dated Penpot record; a design-to-browser comparison cannot be completed for this family. |
| DateField | no dedicated family asset | yes | yes | yes | yes | no | no | yes | no | No family-specific editable design artifact in the dated Penpot record; a design-to-browser comparison cannot be completed for this family. |
| TimeField | no dedicated family asset | yes | yes | yes | yes | no | no | yes | no | No family-specific editable design artifact in the dated Penpot record; a design-to-browser comparison cannot be completed for this family. |
| MaskedField | no dedicated family asset | yes | yes | yes | yes | no | no | yes | no | No family-specific editable design artifact in the dated Penpot record; a design-to-browser comparison cannot be completed for this family. |
| OtpField | no dedicated family asset | yes | yes | yes | yes | no | no | yes | no | No family-specific editable design artifact in the dated Penpot record; a design-to-browser comparison cannot be completed for this family. |
| Slider | review board, incomplete variants | yes | yes | yes | yes | no | no | no | yes | An editable Slider review board exists, but its reusable variant set is explicitly incomplete; no approved state-by-state Fluent/Penpot-to-browser comparison or pixel-diff is recorded. |
| RangeSlider | review board, incomplete variants | yes | yes | yes | yes | no | no | no | yes | An editable RangeSlider review board exists, but its reusable variant set is explicitly incomplete; no approved state-by-state Fluent/Penpot-to-browser comparison or pixel-diff is recorded. |
| FileSelect | no dedicated family asset | yes | yes | yes | yes | no | yes | yes | yes | No family-specific editable design artifact in the dated Penpot record; a design-to-browser comparison cannot be completed for this family. |

## Per-family follow-up

### Button (#428)

**Visual gap:** A narrow primary-Button host-crop pixel diagnostic exists for Light/LTR and Dark/RTL; no approved state-by-state Fluent/Penpot-to-browser comparison or design-owner sign-off exists.

**Follow-up:** Review the primary-Button crop diagnostic against the approved Penpot appearance/state design, document font/token/geometry differences, and obtain design-owner approval; these crops cover only two visual modes.

**Style sources:** [_button.scss](../../../src/Bluent.UI/Styles/Components/_button.scss)

**Browser evidence:** [BLUENT-BUTTON-STATE-CHROME.json](evidence/BLUENT-BUTTON-STATE-CHROME.json), [BLUENT-BLAZOR-FOCUS-CHROME.json](evidence/BLUENT-BLAZOR-FOCUS-CHROME.json), [BLUENT-LAB-P0-DARK-RTL-CHROME.json](evidence/BLUENT-LAB-P0-DARK-RTL-CHROME.json), [BLUENT-LAB-P0-ZOOM-200-CHROME.json](evidence/BLUENT-LAB-P0-ZOOM-200-CHROME.json), [BLUENT-LAB-P0-FORCED-COLORS-CHROME.json](evidence/BLUENT-LAB-P0-FORCED-COLORS-CHROME.json)

**Family audit:** [FLUENT-PARITY-BUTTON-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-BUTTON-AUDIT.md)

### Icon (#429)

**Visual gap:** An editable Icon review board exists, but its reusable variant set is explicitly incomplete; no approved state-by-state Fluent/Penpot-to-browser comparison or pixel-diff is recorded.

**Follow-up:** The unchanged-source route now has paired Chrome/Edge screenshots at 320 CSS px in Light/LTR and Dark/RTL. The SVG still paints at 253x253 px inside a 253x16 px wrapper, without document-level horizontal overflow. A complete same-state Fluent/Penpot comparison and design-owner approval remain open.

**Style sources:** No dedicated family stylesheet.

**Browser evidence:** [BLUENT-CROSS-ICON-CHROME.json](evidence/BLUENT-CROSS-ICON-CHROME.json), [BLUENT-ICON-CHROME-CANDIDATE-BROWSER.json](evidence/BLUENT-ICON-CHROME-CANDIDATE-BROWSER.json), [BLUENT-ICON-CHROME-RESPONSIVE-320-BROWSER.json](evidence/BLUENT-ICON-CHROME-RESPONSIVE-320-BROWSER.json), [BLUENT-ICON-EDGE-RESPONSIVE-320-BROWSER.json](evidence/BLUENT-ICON-EDGE-RESPONSIVE-320-BROWSER.json)

**Family audit:** [FLUENT-PARITY-ICON-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-ICON-AUDIT.md)

### Label (#430)

**Visual gap:** No family-specific editable design artifact in the dated Penpot record; a design-to-browser comparison cannot be completed for this family.

**Follow-up:** Capture matching viewport, theme, direction, typography and component state; compare the editable Penpot specimen with the runtime screenshot, record each difference and obtain design-owner approval.

**Style sources:** [_label.scss](../../../src/Bluent.UI/Styles/Components/_label.scss)

**Browser evidence:** [BLUENT-LABEL-LINK-BADGE-CHROME.json](evidence/BLUENT-LABEL-LINK-BADGE-CHROME.json)

**Family audit:** [FLUENT-PARITY-LABEL-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-LABEL-AUDIT.md)

### Link (#431)

**Visual gap:** No family-specific editable design artifact in the dated Penpot record; a design-to-browser comparison cannot be completed for this family.

**Follow-up:** Capture matching viewport, theme, direction, typography and component state; compare the editable Penpot specimen with the runtime screenshot, record each difference and obtain design-owner approval.

**Style sources:** [_link.scss](../../../src/Bluent.UI/Styles/Components/_link.scss)

**Browser evidence:** [BLUENT-LABEL-LINK-BADGE-CHROME.json](evidence/BLUENT-LABEL-LINK-BADGE-CHROME.json)

**Family audit:** [FLUENT-PARITY-LINK-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-LINK-AUDIT.md)

### Badge (#445)

**Visual gap:** No family-specific editable design artifact in the dated Penpot record; a design-to-browser comparison cannot be completed for this family.

**Follow-up:** Capture matching viewport, theme, direction, typography and component state; compare the editable Penpot specimen with the runtime screenshot, record each difference and obtain design-owner approval.

**Style sources:** [_badge.scss](../../../src/Bluent.UI/Styles/Components/_badge.scss)

**Browser evidence:** [BLUENT-LABEL-LINK-BADGE-CHROME.json](evidence/BLUENT-LABEL-LINK-BADGE-CHROME.json)

**Family audit:** [FLUENT-PARITY-BADGE-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-BADGE-AUDIT.md)

### TextField (#432)

**Visual gap:** Draft design pages exist, but no approved state-by-state design-to-browser comparison or pixel-diff is recorded.

**Follow-up:** Capture matching viewport, theme, direction, typography and component state; compare the editable Penpot specimen with the runtime screenshot, record each difference and obtain design-owner approval.

**Style sources:** [_field.scss](../../../src/Bluent.UI/Styles/Components/_field.scss)

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json)

**Family audit:** [FLUENT-PARITY-TEXTFIELD-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-TEXTFIELD-AUDIT.md)

### Checkbox (#434)

**Visual gap:** Draft design pages exist, but no approved state-by-state design-to-browser comparison or pixel-diff is recorded.

**Follow-up:** Capture matching viewport, theme, direction, typography and component state; compare the editable Penpot specimen with the runtime screenshot, record each difference and obtain design-owner approval.

**Style sources:** [_checkbox.scss](../../../src/Bluent.UI/Styles/Components/_checkbox.scss)

**Browser evidence:** [BLUENT-CONTROL-SEMANTICS-CHROME.json](evidence/BLUENT-CONTROL-SEMANTICS-CHROME.json), [BLUENT-CONTROL-SEMANTICS-EDGE.json](evidence/BLUENT-CONTROL-SEMANTICS-EDGE.json)

**Family audit:** [FLUENT-PARITY-CHECKBOX-SWITCH-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-CHECKBOX-SWITCH-AUDIT.md)

### Switch (#435)

**Visual gap:** Draft design pages exist, but no approved state-by-state design-to-browser comparison or pixel-diff is recorded.

**Follow-up:** Capture matching viewport, theme, direction, typography and component state; compare the editable Penpot specimen with the runtime screenshot, record each difference and obtain design-owner approval.

**Style sources:** [_switch.scss](../../../src/Bluent.UI/Styles/Components/_switch.scss)

**Browser evidence:** [BLUENT-CONTROL-SEMANTICS-CHROME.json](evidence/BLUENT-CONTROL-SEMANTICS-CHROME.json), [BLUENT-CONTROL-SEMANTICS-EDGE.json](evidence/BLUENT-CONTROL-SEMANTICS-EDGE.json)

**Family audit:** [FLUENT-PARITY-CHECKBOX-SWITCH-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-CHECKBOX-SWITCH-AUDIT.md)

### NumericField (#433)

**Visual gap:** No family-specific editable design artifact in the dated Penpot record; a design-to-browser comparison cannot be completed for this family.

**Follow-up:** Capture matching viewport, theme, direction, typography and component state; compare the editable Penpot specimen with the runtime screenshot, record each difference and obtain design-owner approval.

**Style sources:** [_field.scss](../../../src/Bluent.UI/Styles/Components/_field.scss)

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json)

**Family audit:** [FLUENT-PARITY-TYPED-FIELDS-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-AUDIT.md)

### RadioGroup (#436)

**Visual gap:** No family-specific editable design artifact in the dated Penpot record; a design-to-browser comparison cannot be completed for this family.

**Follow-up:** Capture matching viewport, theme, direction, typography and component state; compare the editable Penpot specimen with the runtime screenshot, record each difference and obtain design-owner approval.

**Style sources:** [_radio-group.scss](../../../src/Bluent.UI/Styles/Components/_radio-group.scss), [_radio.scss](../../../src/Bluent.UI/Styles/Components/_radio.scss)

**Browser evidence:** [BLUENT-CONTROL-SEMANTICS-CHROME.json](evidence/BLUENT-CONTROL-SEMANTICS-CHROME.json), [BLUENT-CONTROL-SEMANTICS-EDGE.json](evidence/BLUENT-CONTROL-SEMANTICS-EDGE.json)

**Family audit:** [FLUENT-PARITY-RADIOGROUP-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-RADIOGROUP-AUDIT.md)

### SelectField (#437)

**Visual gap:** No family-specific editable design artifact in the dated Penpot record; a design-to-browser comparison cannot be completed for this family.

**Follow-up:** Capture matching viewport, theme, direction, typography and component state; compare the editable Penpot specimen with the runtime screenshot, record each difference and obtain design-owner approval.

**Style sources:** [_field.scss](../../../src/Bluent.UI/Styles/Components/_field.scss), [_dropdown-select.scss](../../../src/Bluent.UI/Styles/Components/_dropdown-select.scss)

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json)

**Family audit:** [FLUENT-PARITY-TYPED-FIELDS-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-AUDIT.md)

### DateField (#438)

**Visual gap:** No family-specific editable design artifact in the dated Penpot record; a design-to-browser comparison cannot be completed for this family.

**Follow-up:** Capture matching viewport, theme, direction, typography and component state; compare the editable Penpot specimen with the runtime screenshot, record each difference and obtain design-owner approval.

**Style sources:** [_field.scss](../../../src/Bluent.UI/Styles/Components/_field.scss), [_calendar.scss](../../../src/Bluent.UI/Styles/Components/_calendar.scss)

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json)

**Family audit:** [FLUENT-PARITY-TYPED-FIELDS-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-AUDIT.md)

### TimeField (#439)

**Visual gap:** No family-specific editable design artifact in the dated Penpot record; a design-to-browser comparison cannot be completed for this family.

**Follow-up:** Capture matching viewport, theme, direction, typography and component state; compare the editable Penpot specimen with the runtime screenshot, record each difference and obtain design-owner approval.

**Style sources:** [_field.scss](../../../src/Bluent.UI/Styles/Components/_field.scss)

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json)

**Family audit:** [FLUENT-PARITY-TYPED-FIELDS-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-AUDIT.md)

### MaskedField (#440)

**Visual gap:** No family-specific editable design artifact in the dated Penpot record; a design-to-browser comparison cannot be completed for this family.

**Follow-up:** Capture matching viewport, theme, direction, typography and component state; compare the editable Penpot specimen with the runtime screenshot, record each difference and obtain design-owner approval.

**Style sources:** [_field.scss](../../../src/Bluent.UI/Styles/Components/_field.scss)

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json)

**Family audit:** [FLUENT-PARITY-TYPED-FIELDS-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-AUDIT.md)

### OtpField (#441)

**Visual gap:** No family-specific editable design artifact in the dated Penpot record; a design-to-browser comparison cannot be completed for this family.

**Follow-up:** Capture matching viewport, theme, direction, typography and component state; compare the editable Penpot specimen with the runtime screenshot, record each difference and obtain design-owner approval.

**Style sources:** [_otp-field.scss](../../../src/Bluent.UI/Styles/Components/_otp-field.scss)

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json)

**Family audit:** [FLUENT-PARITY-OTP-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-OTP-AUDIT.md)

### Slider (#442)

**Visual gap:** An editable Slider review board exists, but its reusable variant set is explicitly incomplete; no approved state-by-state Fluent/Penpot-to-browser comparison or pixel-diff is recorded.

**Follow-up:** Review the Slider design draft against the pinned Fluent range/slider contract, then capture matched screenshots and obtain design-owner approval; do not implement while the owning issue remains Backlog.

**Style sources:** [_slider.scss](../../../src/Bluent.UI/Styles/Components/_slider.scss)

**Browser evidence:** [BLUENT-LAB-P0-DARK-RTL-CHROME.json](evidence/BLUENT-LAB-P0-DARK-RTL-CHROME.json), [BLUENT-LAB-P0-ZOOM-200-CHROME.json](evidence/BLUENT-LAB-P0-ZOOM-200-CHROME.json), [BLUENT-LAB-P0-POINTER-SCROLL-CHROME.json](evidence/BLUENT-LAB-P0-POINTER-SCROLL-CHROME.json), [BLUENT-LAB-P0-POINTER-SCROLL-SERVER-CHROME.json](evidence/BLUENT-LAB-P0-POINTER-SCROLL-SERVER-CHROME.json), [BLUENT-LAB-P0-CHROME.json](evidence/BLUENT-LAB-P0-CHROME.json), [BLUENT-LAB-P0-FORCED-COLORS-CHROME.json](evidence/BLUENT-LAB-P0-FORCED-COLORS-CHROME.json)

**Family audit:** [FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md)

### RangeSlider (#443)

**Visual gap:** An editable RangeSlider review board exists, but its reusable variant set is explicitly incomplete; no approved state-by-state Fluent/Penpot-to-browser comparison or pixel-diff is recorded.

**Follow-up:** Review the two-thumb RangeSlider draft against the pinned Fluent references and settle ordering/clamping/keyboard semantics before matched screenshot comparison; do not implement while the owning issue remains Backlog.

**Style sources:** [_range-slider.scss](../../../src/Bluent.UI/Styles/Components/_range-slider.scss)

**Browser evidence:** [BLUENT-LAB-P0-DARK-RTL-CHROME.json](evidence/BLUENT-LAB-P0-DARK-RTL-CHROME.json), [BLUENT-LAB-P0-ZOOM-200-CHROME.json](evidence/BLUENT-LAB-P0-ZOOM-200-CHROME.json), [BLUENT-LAB-P0-POINTER-SCROLL-CHROME.json](evidence/BLUENT-LAB-P0-POINTER-SCROLL-CHROME.json), [BLUENT-LAB-P0-POINTER-SCROLL-SERVER-CHROME.json](evidence/BLUENT-LAB-P0-POINTER-SCROLL-SERVER-CHROME.json), [BLUENT-LAB-P0-CHROME.json](evidence/BLUENT-LAB-P0-CHROME.json), [BLUENT-LAB-P0-FORCED-COLORS-CHROME.json](evidence/BLUENT-LAB-P0-FORCED-COLORS-CHROME.json)

**Family audit:** [FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md)

### FileSelect (#444)

**Visual gap:** No family-specific editable design artifact in the dated Penpot record; a design-to-browser comparison cannot be completed for this family.

**Follow-up:** Capture matching viewport, theme, direction, typography and component state; compare the editable Penpot specimen with the runtime screenshot, record each difference and obtain design-owner approval.

**Style sources:** [_file-select.scss](../../../src/Bluent.UI/Styles/Components/_file-select.scss)

**Browser evidence:** [BLUENT-LAB-P0-DARK-RTL-CHROME.json](evidence/BLUENT-LAB-P0-DARK-RTL-CHROME.json), [BLUENT-LAB-P0-ZOOM-200-CHROME.json](evidence/BLUENT-LAB-P0-ZOOM-200-CHROME.json), [BLUENT-LAB-P0-FILE-UPLOAD-CHROME.json](evidence/BLUENT-LAB-P0-FILE-UPLOAD-CHROME.json), [BLUENT-LAB-P0-FILE-UPLOAD-SERVER-CHROME.json](evidence/BLUENT-LAB-P0-FILE-UPLOAD-SERVER-CHROME.json), [BLUENT-LAB-P0-CHROME.json](evidence/BLUENT-LAB-P0-CHROME.json), [BLUENT-LAB-P0-FORCED-COLORS-CHROME.json](evidence/BLUENT-LAB-P0-FORCED-COLORS-CHROME.json)

**Family audit:** [FLUENT-PARITY-FILESELECT-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-FILESELECT-AUDIT.md)

## Acceptance boundary

All 18 visual dimensions remain audited_gaps. The Icon, Slider and RangeSlider review boards were added to design traceability only; they do not add matched Fluent screenshots, pixel-diff, native OS/AT coverage or approval. Separately, the primary Button has only a same-size RGB crop diagnostic for Light/LTR and Dark/RTL; other Button states and the remaining 17 families are not covered. Pixel-level/state-by-state Light/Dark/RTL/forced-colors comparison and design-owner sign-off remain open. Every family design approval is pending and evidenceBundle remains null. No product source, CSS or public API changed.
