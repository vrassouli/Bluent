# Responsive layout and RTL audit - Issue #552

Review date: 2026-10-22. Source baseline: 73155f02.

## Scope

This source/evidence inventory reviews physical versus logical directional CSS, breakpoints, fixed dimensions and explicit RTL signals across the 18 pilot families. It links existing browser evidence for dark RTL, forced colors, reduced motion and selected narrow/zoom scenarios.

**Status: audited gaps, not accepted.** All 18 families have selected dark/RTL browser evidence, but the 320 CSS px and zoom/reflow evidence is not complete across all families. The existing zoom-200 scenario is a layout-reflow proxy, not native browser UI zoom. Physical left/right declarations may be intentional; each requires a design-backed decision rather than automatic replacement.

## Summary

| Family | Physical directional declarations | Logical directional declarations | Breakpoint/reflow rules | Explicit RTL signals | RTL browser evidence | Narrow/zoom evidence |
|---|---:|---:|---:|---:|---|---|
| Button | 4 | 1 | 9 | 1 | yes | yes |
| Icon | 0 | 0 | 0 | 0 | yes | yes |
| Label | 0 | 1 | 0 | 0 | yes | no |
| Link | 0 | 1 | 0 | 0 | yes | no |
| Badge | 0 | 0 | 6 | 0 | yes | no |
| TextField | 4 | 3 | 3 | 0 | yes | no |
| Checkbox | 5 | 1 | 0 | 1 | yes | no |
| Switch | 7 | 1 | 0 | 1 | yes | no |
| NumericField | 4 | 3 | 3 | 0 | yes | no |
| RadioGroup | 3 | 1 | 0 | 0 | yes | no |
| SelectField | 8 | 4 | 4 | 0 | yes | no |
| DateField | 4 | 6 | 4 | 0 | yes | no |
| TimeField | 4 | 3 | 3 | 0 | yes | no |
| MaskedField | 4 | 3 | 3 | 0 | yes | no |
| OtpField | 4 | 1 | 1 | 0 | yes | no |
| Slider | 4 | 0 | 0 | 0 | yes | yes |
| RangeSlider | 6 | 0 | 0 | 0 | yes | yes |
| FileSelect | 0 | 0 | 0 | 0 | yes | yes |

## Family findings

### Button (#428)

**Source finding:** 4 physical directional declaration(s) need review for intentionality/logical-property parity.

**Logical declarations:** 1; **breakpoint/reflow rules:** 9; **fixed dimensions:** 16; **explicit RTL signals:** 1.

**Follow-up:** Check icon/label order, focus ring clipping and wrapping at narrow RTL and layout-reflow proxy.

**Style files:** [_button.scss](../../../src/Bluent.UI/Styles/Components/_button.scss)

**Source anchors:** [_button.scss:L1](../../../src/Bluent.UI/Styles/Components/_button.scss#L1), [_button.scss:L58](../../../src/Bluent.UI/Styles/Components/_button.scss#L58), [_button.scss:L105](../../../src/Bluent.UI/Styles/Components/_button.scss#L105), [_button.scss:L106](../../../src/Bluent.UI/Styles/Components/_button.scss#L106)

**Browser evidence:** [BLUENT-BUTTON-STATE-CHROME.json](evidence/BLUENT-BUTTON-STATE-CHROME.json) (RTL; no narrow/zoom scenario), [BLUENT-BLAZOR-FOCUS-CHROME.json](evidence/BLUENT-BLAZOR-FOCUS-CHROME.json) (RTL; no narrow/zoom scenario), [BLUENT-LAB-P0-DARK-RTL-CHROME.json](evidence/BLUENT-LAB-P0-DARK-RTL-CHROME.json) (RTL; no narrow/zoom scenario), [BLUENT-LAB-P0-ZOOM-200-CHROME.json](evidence/BLUENT-LAB-P0-ZOOM-200-CHROME.json) (non-RTL; narrow/zoom proxy)

### Icon (#429)

**Source finding:** No dedicated family stylesheet; direction depends on markup and parent layout.

**Logical declarations:** 0; **breakpoint/reflow rules:** 0; **fixed dimensions:** 0; **explicit RTL signals:** 0.

**Follow-up:** The unchanged-source Chrome/Edge 320px run records Light/LTR and Dark/RTL: SVG 253x253px in a 253x16px wrapper, with no document overflow. The isolated CSS candidate now has live Chrome/Edge checks at 320px in both Light/LTR and Dark/RTL and measures 32x32px; it remains research-only and is not product or design approval.

**Style files:** No dedicated family stylesheet.

**Source anchors:** No matching source anchors in the reviewed file set.

**Browser evidence:** [BLUENT-CROSS-ICON-CHROME.json](evidence/BLUENT-CROSS-ICON-CHROME.json) (RTL; no narrow/zoom scenario), [BLUENT-ICON-CHROME-CANDIDATE-BROWSER.json](evidence/BLUENT-ICON-CHROME-CANDIDATE-BROWSER.json) (RTL; narrow/zoom proxy), [BLUENT-ICON-CHROME-RESPONSIVE-320-BROWSER.json](evidence/BLUENT-ICON-CHROME-RESPONSIVE-320-BROWSER.json) (RTL; narrow/zoom proxy), [BLUENT-ICON-EDGE-RESPONSIVE-320-BROWSER.json](evidence/BLUENT-ICON-EDGE-RESPONSIVE-320-BROWSER.json) (RTL; narrow/zoom proxy)

### Label (#430)

**Source finding:** No physical left/right declaration found in mapped family stylesheet; responsive/RTL runtime acceptance remains open.

**Logical declarations:** 1; **breakpoint/reflow rules:** 0; **fixed dimensions:** 0; **explicit RTL signals:** 0.

**Follow-up:** Check association, required marker placement and wrapping in RTL.

**Style files:** [_label.scss](../../../src/Bluent.UI/Styles/Components/_label.scss)

**Source anchors:** [_label.scss:L8](../../../src/Bluent.UI/Styles/Components/_label.scss#L8)

**Browser evidence:** [BLUENT-LABEL-LINK-BADGE-CHROME.json](evidence/BLUENT-LABEL-LINK-BADGE-CHROME.json) (RTL; no narrow/zoom scenario)

### Link (#431)

**Source finding:** No physical left/right declaration found in mapped family stylesheet; responsive/RTL runtime acceptance remains open.

**Logical declarations:** 1; **breakpoint/reflow rules:** 0; **fixed dimensions:** 0; **explicit RTL signals:** 0.

**Follow-up:** Check underline/focus geometry and inline placement within RTL text flow.

**Style files:** [_link.scss](../../../src/Bluent.UI/Styles/Components/_link.scss)

**Source anchors:** [_link.scss:L15](../../../src/Bluent.UI/Styles/Components/_link.scss#L15)

**Browser evidence:** [BLUENT-LABEL-LINK-BADGE-CHROME.json](evidence/BLUENT-LABEL-LINK-BADGE-CHROME.json) (RTL; no narrow/zoom scenario)

### Badge (#445)

**Source finding:** No physical left/right declaration found in mapped family stylesheet; responsive/RTL runtime acceptance remains open.

**Logical declarations:** 0; **breakpoint/reflow rules:** 6; **fixed dimensions:** 14; **explicit RTL signals:** 0.

**Follow-up:** Check badge placement and wrapping in RTL; include reduced-motion state in the visual matrix.

**Style files:** [_badge.scss](../../../src/Bluent.UI/Styles/Components/_badge.scss)

**Source anchors:** [_badge.scss:L21](../../../src/Bluent.UI/Styles/Components/_badge.scss#L21), [_badge.scss:L98](../../../src/Bluent.UI/Styles/Components/_badge.scss#L98), [_badge.scss:L108](../../../src/Bluent.UI/Styles/Components/_badge.scss#L108), [_badge.scss:L118](../../../src/Bluent.UI/Styles/Components/_badge.scss#L118)

**Browser evidence:** [BLUENT-LABEL-LINK-BADGE-CHROME.json](evidence/BLUENT-LABEL-LINK-BADGE-CHROME.json) (RTL; no narrow/zoom scenario)

### TextField (#432)

**Source finding:** 4 physical directional declaration(s) need review for intentionality/logical-property parity.

**Logical declarations:** 3; **breakpoint/reflow rules:** 3; **fixed dimensions:** 9; **explicit RTL signals:** 0.

**Follow-up:** Check label, validation message, caret, adornments and width constraints in RTL at narrow sizes.

**Style files:** [_field.scss](../../../src/Bluent.UI/Styles/Components/_field.scss)

**Source anchors:** [_field.scss:L25](../../../src/Bluent.UI/Styles/Components/_field.scss#L25), [_field.scss:L29](../../../src/Bluent.UI/Styles/Components/_field.scss#L29), [_field.scss:L48](../../../src/Bluent.UI/Styles/Components/_field.scss#L48), [_field.scss:L53](../../../src/Bluent.UI/Styles/Components/_field.scss#L53)

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json) (RTL; no narrow/zoom scenario), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json) (RTL; no narrow/zoom scenario)

### Checkbox (#434)

**Source finding:** 5 physical directional declaration(s) need review for intentionality/logical-property parity.

**Logical declarations:** 1; **breakpoint/reflow rules:** 0; **fixed dimensions:** 7; **explicit RTL signals:** 1.

**Follow-up:** Check label/indicator order, required/error text and focus visibility at narrow RTL.

**Style files:** [_checkbox.scss](../../../src/Bluent.UI/Styles/Components/_checkbox.scss)

**Source anchors:** [_checkbox.scss:L80](../../../src/Bluent.UI/Styles/Components/_checkbox.scss#L80), [_checkbox.scss:L177](../../../src/Bluent.UI/Styles/Components/_checkbox.scss#L177)

**Browser evidence:** [BLUENT-CONTROL-SEMANTICS-CHROME.json](evidence/BLUENT-CONTROL-SEMANTICS-CHROME.json) (RTL; no narrow/zoom scenario), [BLUENT-CONTROL-SEMANTICS-EDGE.json](evidence/BLUENT-CONTROL-SEMANTICS-EDGE.json) (RTL; no narrow/zoom scenario)

### Switch (#435)

**Source finding:** 7 physical directional declaration(s) need review for intentionality/logical-property parity.

**Logical declarations:** 1; **breakpoint/reflow rules:** 0; **fixed dimensions:** 4; **explicit RTL signals:** 1.

**Follow-up:** Check label/track order and thumb geometry at narrow RTL; verify state does not depend on physical left/right.

**Style files:** [_switch.scss](../../../src/Bluent.UI/Styles/Components/_switch.scss)

**Source anchors:** [_switch.scss:L100](../../../src/Bluent.UI/Styles/Components/_switch.scss#L100), [_switch.scss:L126](../../../src/Bluent.UI/Styles/Components/_switch.scss#L126)

**Browser evidence:** [BLUENT-CONTROL-SEMANTICS-CHROME.json](evidence/BLUENT-CONTROL-SEMANTICS-CHROME.json) (RTL; no narrow/zoom scenario), [BLUENT-CONTROL-SEMANTICS-EDGE.json](evidence/BLUENT-CONTROL-SEMANTICS-EDGE.json) (RTL; no narrow/zoom scenario)

### NumericField (#433)

**Source finding:** 4 physical directional declaration(s) need review for intentionality/logical-property parity.

**Logical declarations:** 3; **breakpoint/reflow rules:** 3; **fixed dimensions:** 9; **explicit RTL signals:** 0.

**Follow-up:** Check numeric text/caret direction, spin affordance and validation wrapping under RTL.

**Style files:** [_field.scss](../../../src/Bluent.UI/Styles/Components/_field.scss)

**Source anchors:** [_field.scss:L25](../../../src/Bluent.UI/Styles/Components/_field.scss#L25), [_field.scss:L29](../../../src/Bluent.UI/Styles/Components/_field.scss#L29), [_field.scss:L48](../../../src/Bluent.UI/Styles/Components/_field.scss#L48), [_field.scss:L53](../../../src/Bluent.UI/Styles/Components/_field.scss#L53)

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json) (RTL; no narrow/zoom scenario), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json) (RTL; no narrow/zoom scenario)

### RadioGroup (#436)

**Source finding:** 3 physical directional declaration(s) need review for intentionality/logical-property parity.

**Logical declarations:** 1; **breakpoint/reflow rules:** 0; **fixed dimensions:** 6; **explicit RTL signals:** 0.

**Follow-up:** Check option order, wrapping and keyboard focus order under RTL, not just the outer group direction.

**Style files:** [_radio-group.scss](../../../src/Bluent.UI/Styles/Components/_radio-group.scss), [_radio.scss](../../../src/Bluent.UI/Styles/Components/_radio.scss)

**Source anchors:** [_radio.scss:L89](../../../src/Bluent.UI/Styles/Components/_radio.scss#L89)

**Browser evidence:** [BLUENT-CONTROL-SEMANTICS-CHROME.json](evidence/BLUENT-CONTROL-SEMANTICS-CHROME.json) (RTL; no narrow/zoom scenario), [BLUENT-CONTROL-SEMANTICS-EDGE.json](evidence/BLUENT-CONTROL-SEMANTICS-EDGE.json) (RTL; no narrow/zoom scenario)

### SelectField (#437)

**Source finding:** 8 physical directional declaration(s) need review for intentionality/logical-property parity.

**Logical declarations:** 4; **breakpoint/reflow rules:** 4; **fixed dimensions:** 15; **explicit RTL signals:** 0.

**Follow-up:** Check native select arrow, popup alignment, label/error wrapping and keyboard focus in RTL at narrow widths.

**Style files:** [_field.scss](../../../src/Bluent.UI/Styles/Components/_field.scss), [_dropdown-select.scss](../../../src/Bluent.UI/Styles/Components/_dropdown-select.scss)

**Source anchors:** [_field.scss:L25](../../../src/Bluent.UI/Styles/Components/_field.scss#L25), [_field.scss:L29](../../../src/Bluent.UI/Styles/Components/_field.scss#L29), [_field.scss:L48](../../../src/Bluent.UI/Styles/Components/_field.scss#L48), [_field.scss:L53](../../../src/Bluent.UI/Styles/Components/_field.scss#L53)

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json) (RTL; no narrow/zoom scenario), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json) (RTL; no narrow/zoom scenario)

### DateField (#438)

**Source finding:** 4 physical directional declaration(s) need review for intentionality/logical-property parity.

**Logical declarations:** 6; **breakpoint/reflow rules:** 4; **fixed dimensions:** 36; **explicit RTL signals:** 0.

**Follow-up:** Check calendar popup anchoring, weekday order, selected-date focus and Min/Max messages in narrow RTL.

**Style files:** [_field.scss](../../../src/Bluent.UI/Styles/Components/_field.scss), [_calendar.scss](../../../src/Bluent.UI/Styles/Components/_calendar.scss)

**Source anchors:** [_field.scss:L25](../../../src/Bluent.UI/Styles/Components/_field.scss#L25), [_field.scss:L29](../../../src/Bluent.UI/Styles/Components/_field.scss#L29), [_field.scss:L48](../../../src/Bluent.UI/Styles/Components/_field.scss#L48), [_field.scss:L53](../../../src/Bluent.UI/Styles/Components/_field.scss#L53)

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json) (RTL; no narrow/zoom scenario), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json) (RTL; no narrow/zoom scenario)

### TimeField (#439)

**Source finding:** 4 physical directional declaration(s) need review for intentionality/logical-property parity.

**Logical declarations:** 3; **breakpoint/reflow rules:** 3; **fixed dimensions:** 9; **explicit RTL signals:** 0.

**Follow-up:** Check field alignment, localized formatting and popup/keyboard order under RTL.

**Style files:** [_field.scss](../../../src/Bluent.UI/Styles/Components/_field.scss)

**Source anchors:** [_field.scss:L25](../../../src/Bluent.UI/Styles/Components/_field.scss#L25), [_field.scss:L29](../../../src/Bluent.UI/Styles/Components/_field.scss#L29), [_field.scss:L48](../../../src/Bluent.UI/Styles/Components/_field.scss#L48), [_field.scss:L53](../../../src/Bluent.UI/Styles/Components/_field.scss#L53)

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json) (RTL; no narrow/zoom scenario), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json) (RTL; no narrow/zoom scenario)

### MaskedField (#440)

**Source finding:** 4 physical directional declaration(s) need review for intentionality/logical-property parity.

**Logical declarations:** 3; **breakpoint/reflow rules:** 3; **fixed dimensions:** 9; **explicit RTL signals:** 0.

**Follow-up:** Check caret and literal positioning, digit conversion and mask progression under RTL.

**Style files:** [_field.scss](../../../src/Bluent.UI/Styles/Components/_field.scss)

**Source anchors:** [_field.scss:L25](../../../src/Bluent.UI/Styles/Components/_field.scss#L25), [_field.scss:L29](../../../src/Bluent.UI/Styles/Components/_field.scss#L29), [_field.scss:L48](../../../src/Bluent.UI/Styles/Components/_field.scss#L48), [_field.scss:L53](../../../src/Bluent.UI/Styles/Components/_field.scss#L53)

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json) (RTL; no narrow/zoom scenario), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json) (RTL; no narrow/zoom scenario)

### OtpField (#441)

**Source finding:** 4 physical directional declaration(s) need review for intentionality/logical-property parity.

**Logical declarations:** 1; **breakpoint/reflow rules:** 1; **fixed dimensions:** 7; **explicit RTL signals:** 0.

**Follow-up:** Check visual cell order versus digit entry and screen-reader reading order under RTL; preserve digit sequence intentionally.

**Style files:** [_otp-field.scss](../../../src/Bluent.UI/Styles/Components/_otp-field.scss)

**Source anchors:** [_otp-field.scss:L38](../../../src/Bluent.UI/Styles/Components/_otp-field.scss#L38), [_otp-field.scss:L42](../../../src/Bluent.UI/Styles/Components/_otp-field.scss#L42)

**Browser evidence:** [BLUENT-TYPED-FIELDS-CHROME.json](evidence/BLUENT-TYPED-FIELDS-CHROME.json) (RTL; no narrow/zoom scenario), [BLUENT-TYPED-FIELDS-EDGE.json](evidence/BLUENT-TYPED-FIELDS-EDGE.json) (RTL; no narrow/zoom scenario)

### Slider (#442)

**Source finding:** 4 physical directional declaration(s) need review for intentionality/logical-property parity.

**Logical declarations:** 0; **breakpoint/reflow rules:** 0; **fixed dimensions:** 1; **explicit RTL signals:** 0.

**Follow-up:** Check rail origin, thumb position and value mapping under RTL; define direction/value reversal from design rather than assuming it.

**Style files:** [_slider.scss](../../../src/Bluent.UI/Styles/Components/_slider.scss)

**Source anchors:** No matching source anchors in the reviewed file set.

**Browser evidence:** [BLUENT-LAB-P0-DARK-RTL-CHROME.json](evidence/BLUENT-LAB-P0-DARK-RTL-CHROME.json) (RTL; no narrow/zoom scenario), [BLUENT-LAB-P0-ZOOM-200-CHROME.json](evidence/BLUENT-LAB-P0-ZOOM-200-CHROME.json) (non-RTL; narrow/zoom proxy), [BLUENT-LAB-P0-POINTER-SCROLL-CHROME.json](evidence/BLUENT-LAB-P0-POINTER-SCROLL-CHROME.json) (non-RTL; no narrow/zoom scenario), [BLUENT-LAB-P0-POINTER-SCROLL-SERVER-CHROME.json](evidence/BLUENT-LAB-P0-POINTER-SCROLL-SERVER-CHROME.json) (non-RTL; no narrow/zoom scenario)

### RangeSlider (#443)

**Source finding:** 6 physical directional declaration(s) need review for intentionality/logical-property parity.

**Logical declarations:** 0; **breakpoint/reflow rules:** 0; **fixed dimensions:** 1; **explicit RTL signals:** 0.

**Follow-up:** Check both thumbs, crossing behavior and focus order under RTL at narrow width; validate independently for each thumb.

**Style files:** [_range-slider.scss](../../../src/Bluent.UI/Styles/Components/_range-slider.scss)

**Source anchors:** No matching source anchors in the reviewed file set.

**Browser evidence:** [BLUENT-LAB-P0-DARK-RTL-CHROME.json](evidence/BLUENT-LAB-P0-DARK-RTL-CHROME.json) (RTL; no narrow/zoom scenario), [BLUENT-LAB-P0-ZOOM-200-CHROME.json](evidence/BLUENT-LAB-P0-ZOOM-200-CHROME.json) (non-RTL; narrow/zoom proxy), [BLUENT-LAB-P0-POINTER-SCROLL-CHROME.json](evidence/BLUENT-LAB-P0-POINTER-SCROLL-CHROME.json) (non-RTL; no narrow/zoom scenario), [BLUENT-LAB-P0-POINTER-SCROLL-SERVER-CHROME.json](evidence/BLUENT-LAB-P0-POINTER-SCROLL-SERVER-CHROME.json) (non-RTL; no narrow/zoom scenario)

### FileSelect (#444)

**Source finding:** No physical left/right declaration found in mapped family stylesheet; responsive/RTL runtime acceptance remains open.

**Logical declarations:** 0; **breakpoint/reflow rules:** 0; **fixed dimensions:** 0; **explicit RTL signals:** 0.

**Follow-up:** Check filename wrapping, remove-action placement, disabled state and overflow at narrow widths.

**Style files:** [_file-select.scss](../../../src/Bluent.UI/Styles/Components/_file-select.scss)

**Source anchors:** No matching source anchors in the reviewed file set.

**Browser evidence:** [BLUENT-LAB-P0-DARK-RTL-CHROME.json](evidence/BLUENT-LAB-P0-DARK-RTL-CHROME.json) (RTL; no narrow/zoom scenario), [BLUENT-LAB-P0-ZOOM-200-CHROME.json](evidence/BLUENT-LAB-P0-ZOOM-200-CHROME.json) (non-RTL; narrow/zoom proxy), [BLUENT-LAB-P0-FILE-UPLOAD-CHROME.json](evidence/BLUENT-LAB-P0-FILE-UPLOAD-CHROME.json) (non-RTL; no narrow/zoom scenario), [BLUENT-LAB-P0-FILE-UPLOAD-SERVER-CHROME.json](evidence/BLUENT-LAB-P0-FILE-UPLOAD-SERVER-CHROME.json) (non-RTL; no narrow/zoom scenario)

## Acceptance boundary

All 18 responsiveRTL dimensions are recorded as audited_gaps. This audit does not claim 320px/200% browser UI zoom coverage for every family, computed visual parity with the pinned Fluent runtime, or native OS/assistive-technology acceptance. Every family design approval remains pending and evidenceBundle remains null. No product source, CSS or public API changed.
