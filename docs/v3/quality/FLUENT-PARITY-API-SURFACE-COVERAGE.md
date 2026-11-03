# API surface disposition coverage - Issue #552

Review date: 2026-10-24. Pinned upstream reference: @fluentui/web-components@3.1.3.

## Scope and acceptance boundary

This report reconciles the four Wave A-D review ledgers with the 18-family source-candidate inventory. It verifies that each source-known candidate occurrence has one explicit disposition, mapping and rationale in exactly one wave ledger. This is an API occurrence audit, not a public-API completeness certificate or Fluent parity verdict.

- Reconciled occurrences: **239/239**.
- Dispositions: **97 Supported**, **11 Missing**, **130 Bluent extension**, **1 N/A**.
- Kinds: 3 cascading, 10 event, 28 slot, 198 value.
- Out-of-band ledger rows: **7**; repeated shared-framework notes are not unique API counts.

Acceptance remains audited_gaps; none of the 18 families is approved. Reconciled means each candidate was dispositioned in the research ledger, not that an owner accepted it or runtime behavior matches Fluent.

## Wave coverage

| Wave | Families | Occurrences | Supported | Missing | Bluent extension | N/A | Out-of-band rows |
|---|---|---:|---:|---:|---:|---:|---:|
| A | Badge, Button, Icon, Label, Link | 82 | 36 | 0 | 46 | 0 | 4 |
| B | Checkbox, NumericField, RadioGroup, SelectField, Switch, TextField | 71 | 28 | 4 | 38 | 1 | 1 |
| C | DateField, MaskedField, OtpField, TimeField | 40 | 16 | 7 | 17 | 0 | 1 |
| D | FileSelect, RangeSlider, Slider | 46 | 17 | 0 | 29 | 0 | 1 |

## Per-family coverage

| Family | Issue | Occurrences | Supported | Missing | Bluent extension | N/A | Upstream mapping | Approval |
|---|---:|---:|---:|---:|---:|---:|---|---|
| Button | #428 | 30 | 11 | 0 | 19 | 0 | tag_present (fluent-button, fluent-toggle-button, fluent-compound-button, fluent-menu-button, fluent-anchor-button) | pending |
| Icon | #429 | 10 | 4 | 0 | 6 | 0 | no_dedicated_tag (no dedicated tag) | pending |
| Label | #430 | 14 | 5 | 0 | 9 | 0 | tag_present (fluent-label) | pending |
| Link | #431 | 12 | 7 | 0 | 5 | 0 | tag_present (fluent-link, fluent-anchor-button) | pending |
| Badge | #445 | 16 | 9 | 0 | 7 | 0 | tag_present (fluent-badge, fluent-counter-badge) | pending |
| TextField | #432 | 12 | 5 | 0 | 7 | 0 | tag_present (fluent-text-input) | pending |
| Checkbox | #434 | 9 | 3 | 0 | 6 | 0 | tag_present (fluent-checkbox) | pending |
| Switch | #435 | 9 | 2 | 2 | 4 | 1 | tag_present (fluent-switch) | pending |
| NumericField | #433 | 17 | 7 | 1 | 9 | 0 | related_only (fluent-text-input) | pending |
| RadioGroup | #436 | 17 | 8 | 0 | 9 | 0 | tag_present (fluent-radio-group, fluent-radio) | pending |
| SelectField | #437 | 7 | 3 | 1 | 3 | 0 | related_only (fluent-dropdown, fluent-dropdown-option, fluent-listbox) | pending |
| DateField | #438 | 13 | 5 | 2 | 6 | 0 | related_only (fluent-text-input) | pending |
| TimeField | #439 | 9 | 5 | 1 | 3 | 0 | related_only (fluent-text-input) | pending |
| MaskedField | #440 | 9 | 5 | 1 | 3 | 0 | related_only (fluent-text-input) | pending |
| OtpField | #441 | 9 | 1 | 3 | 5 | 0 | related_only (fluent-text-input) | pending |
| Slider | #442 | 13 | 7 | 0 | 6 | 0 | tag_present (fluent-slider) | pending |
| RangeSlider | #443 | 13 | 3 | 0 | 10 | 0 | no_dedicated_tag (no dedicated tag) | pending |
| FileSelect | #444 | 20 | 7 | 0 | 13 | 0 | no_dedicated_tag (no dedicated tag) | pending |

## Source-confirmed Missing dispositions

| Family | Parameter | Source | Finding | Owner follow-up |
|---|---|---|---|---|
| Switch (#435) | Switch.Circular (bool) | [Checkbox.razor.cs](../../../src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor.cs#L14) | Switch overrides GetClasses without including Checkbox's circular class, so the inherited parameter is present in the CLR surface but not applied by the current component. | Remediate or explicitly deprecate through #435; do not silently count inherited parameters as supported. |
| Switch (#435) | Switch.Size (CheckboxSize) | [Checkbox.razor.cs](../../../src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor.cs#L15) | Switch overrides GetClasses without adding the inherited Checkbox size class, and fluent-switch has no size attribute in the pinned CEM. | Remediate or explicitly deprecate through #435 after the component API/design decision. |
| NumericField (#433) | NumericField.Step (TValue?) | [NumericField.razor.cs](../../../src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor.cs#L35) | The current implementation records the parameter but does not apply it to numeric parsing, increment/decrement behavior or the rendered input. This is a source-confirmed owner issue, not a request to change product code in #552. | Track/remediate through #433 after its design/API gate; add a negative-control test proving Step affects the intended contract. |
| SelectField (#437) | SelectField.BindValueEvent (string) | [BluentFieldComponentBase.cs](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L12) | SelectField binds through an explicit @onchange handler rather than using BindValueEvent; the inherited parameter has no effect in the current source. | Resolve the inherited API contract through #437; test both change and input paths before deciding whether to remove or honor it. |
| DateField (#438) | DateField.DateClass (Func<DateTime, string>?) | [DateField.razor.cs](../../../src/Bluent.UI/Components/DateFieldComponent/DateField.razor.cs#L26) | The current DateField source declares DateClass but never reads or passes it to the embedded picker; the public parameter has no effect. | Wire the callback into the picker or explicitly deprecate it through #438 after design/API review. |
| DateField (#438) | DateField.BindValueEvent (string) | [BluentFieldComponentBase.cs](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L12) | DateField binds CurrentValueAsString to a MaskedField component but does not pass its own BindValueEvent; the parent parameter has no effect on the visible input event. | Either forward the setting or explicitly remove/deprecate the inherited contract through #438 after API review. |
| TimeField (#439) | TimeField.BindValueEvent (string) | [BluentFieldComponentBase.cs](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L12) | TimeField binds CurrentValueAsString to a MaskedField component but does not pass its own BindValueEvent; the parent parameter has no effect on the visible input event. | Either forward the setting or explicitly remove/deprecate the inherited contract through #439 after API review. |
| MaskedField (#440) | MaskedField.BindValueEvent (string) | [BluentFieldComponentBase.cs](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L12) | MaskedField handles DOM input explicitly with @oninput and does not bind through BindValueEvent; changing this inherited parameter has no effect on the visible input. | Resolve the inherited contract through #440; retain input-event semantics if required by the mask engine. |
| OtpField (#441) | OtpField.StartAddon (RenderFragment?) | [BluentFieldComponentBase.cs](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L9) | OtpField markup does not render StartAddon despite inheriting the parameter; the public property has no effect. | Either render the addon in the approved OTP composition or explicitly deprecate the inherited API through #441. |
| OtpField (#441) | OtpField.EndAddon (RenderFragment?) | [BluentFieldComponentBase.cs](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L10) | OtpField markup does not render EndAddon despite inheriting the parameter; the public property has no effect. | Either render the addon in the approved OTP composition or explicitly deprecate the inherited API through #441. |
| OtpField (#441) | OtpField.Size (FieldSize) | [BluentFieldComponentBase.cs](../../../src/Bluent.UI/Components/BluentFieldComponentBase.cs#L11) | OtpField.GetClasses emits only bui-otp-field and the markup has no size-class binding; changing the inherited Size parameter has no effect. | Define supported OTP sizing in the approved design/API or explicitly deprecate the inherited parameter through #441. |

## Out-of-band API inventory (not included in 239 occurrences)

These records preserve surfaces outside the locally declared/inherited Parameter census. Repeated framework entries remain per-wave; do not count them as unique members.

| Wave | Surface | Declared scope | Disposition |
|---|---|---|---|
| A | Id | BluentComponentBase public API; not counted among the 82 [Parameter] occurrences | Supported |
| A | Disabled | Attribute-based base behavior; not a typed [Parameter] | Bluent extension |
| A | SetStateHasChanged | IBluentComponent/Blazor base method; not a component property | N/A |
| A | IconVariant.Color | Potential future icon feature; not in current public enum | N/A |
| B | InputBase<TValue> binding/validation surface | External Microsoft.AspNetCore.Components.Forms.InputBase<TValue>; not counted among the 71 locally declared/inherited parameter occurrences | Bluent extension |
| C | InputBase<TValue> binding/validation surface | External Microsoft.AspNetCore.Components.Forms.InputBase<TValue>; not counted among the 40 locally declared/inherited parameter occurrences | Bluent extension |
| D | InputBase<TValue> binding/validation surface | External Microsoft.AspNetCore.Components.Forms.InputBase<TValue>; not counted among the 46 locally declared/inherited parameter occurrences | Bluent extension |

## Explicit remaining gaps

- CLR/framework boundary: inherited InputBase<TValue> binding/validation is out-of-band in Waves B-D. Final emitted API and EditContext/form behavior are not certified.
- Events and slots: declarations are mapped, but that does not establish rendered child-content behavior or DOM event ordering. Runtime tests remain separate.
- CSS surface: exhaustive Bluent custom properties, parts/states, token relationships and matched rendered-state comparisons are not certified by these ledgers.
- Missing declarations: the 11 entries above are source-confirmed gaps in current review research. Remediation belongs to each owning issue after design-first/workflow gates; no product source changed in #552.
- Parity and approvals: all 18 matrix families remain audited_gaps; approval is pending and evidence bundles are null. Native OS high contrast and manual AT remain separate gates.

## Reproducibility

Run python scripts/quality/build_v3_fluent_api_surface_coverage_audit.py --check and python -m unittest discover -s scripts/quality -p test_v3_fluent_api_surface_coverage_audit.py -v. The builder fails closed on missing/duplicate candidates, absent mappings/rationales, count drift or an acceptance claim.

Sources: FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.json; Wave A-D API review ledgers; FLUENT-PARITY-RETRO-AUDIT.json.
