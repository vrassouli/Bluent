# #552 family audit — RadioGroup (#436)

**Status: partial source audit with behavior/accessibility gaps identified.** This is not Fluent parity acceptance, design approval, or browser/native assistive-technology sign-off. Findings are source-backed; no product code or design file was changed.

## Upstream comparison decision

The pinned Fluent Web Components 3.1.3 inventory and React semantic triage treat the radio-group container and individual radio option as related but distinct semantics. Bluent exposes `RadioGroup<TValue>` plus nested `Radio<TValue>`, but native radio grouping is defined by shared `name` values and a fieldset/legend or an equivalent accessible group—not by the Blazor cascading value alone.

## Pinned Fluent Web Components 3.1.3 API crosswalk — 2026-10-25

The exact published `@fluentui/web-components@3.1.3` package was inspected from the local npm cache during this audit. The repository's pinned crosswalk records CEM SHA-256 `e460a61de0cd6f99ec6caedc203db681d95ac16332d3b296b50484b79ad61329` and source baseline `2c37dbef516230606306549458721d6bda03a8ab`. The upstream documentation treats group and option as separate contracts; only `fluent-radio` and slotted `role=radio` children receive group keyboard support ([Microsoft Radio and Radio Group reference](https://learn.microsoft.com/en-us/fluent-ui/web-components/components/radio-group)).

| Pinned custom element | CEM attributes | Events and slots | Bluent source contract and disposition |
| --- | --- | --- | --- |
| `fluent-radio-group` | `disabled`, `name`, `orientation`, `required`, `value` | `change`; default slot | Bluent declares `ChildContent`, `Label`, `ItemsLabelPosition`, `Orientation`; selected `Value` comes through the external Blazor `InputBase<TValue>` boundary. `Orientation` is a conceptual API match, not proof of keyboard parity. There is no explicit group-level `Name`, `Disabled`, or `Required` parameter, and the group markup emits no group name, ARIA radiogroup role, `fieldset`/`legend`, or programmatic label relationship. |
| `fluent-radio` | `checked`, `disabled`, `form`, `name`, `required`, `value` | `change`, `input`, `disabled`; `checked-indicator` slot | Bluent declares `Value`, `Label`, and cascading `RadioGroup`. `Value` is compared to the parent selection to calculate `checked`, but the current markup does not bind `Value` to a native input `value` attribute. Unmatched attributes are splatted to the native input, so a caller can manually set per-option `name`, `disabled`, `required`, `form`, or `value`; this is not a group-managed shared-name/value contract. |

This API crosswalk **does not** mean the two implementations have equivalent behavior. In the existing browser fixture, the default path renders empty native radio names and reproduces cross-group ArrowRight leakage. Caller-supplied per-option attributes may alter the tested DOM and must be tested as their own case. The current source also does not prove actual form-submission results for the `Radio.Value` model; that remains open.

## Confirmed source gaps

| Finding | Current source | Disposition |
| --- | --- | --- |
| No shared native radio name is generated | `Radio.razor` renders `<input type="radio">` with attributes from `GetInputAdditionalAttributes()`, `checked`, `id`, and `@onchange`; neither `RadioGroup.razor` nor `Radio.razor` supplies a shared `name` from the group. | Confirmed behavior gap, now reproduced in Chrome and Edge: every option has an empty native `name`. ArrowRight works between the first group’s two options, but from its last option it moves focus to the first option in the next RadioGroup. The previous group’s selected option remains checked while the next group’s first option becomes checked. In the tested group, Tab also moves from the first option to the second, making them separate Tab stops. Empty `name` also means native form submission has no field name for the value. |
| No group-level semantics | `RadioGroup.razor` renders the group label as a plain `<label>` with no `for`, and wraps options in ordinary `div` elements. It emits neither `fieldset`/`legend` nor `role="radiogroup"` and a programmatic group label relationship. | Confirmed accessibility gap. Chrome and Edge AX trees mark the group wrapper ignored (`role=none`, `ignored=true`) with no computed group name. The cascading `RadioGroup` value is Blazor component plumbing, not a browser accessibility relationship. |
| Option labels are individually associated | `Radio.razor` gives each input an `id` and renders one or two `<label for="@Id">` elements. | Useful existing semantics, but they do not repair the missing group name/relationship. Verify accessible names when option text is empty or custom attributes override IDs. |
| Native `change` drives Blazor state | `Radio` listens to native `change`; on value `on`, it calls the parent group's `SetValue`, which notifies nested radios through an internal event. | Chrome and Edge confirm pointer selection, ArrowRight between options in one group, and Space on an option update Blazor selection. The cross-group ArrowRight leak shows the groups are not isolated correctly. |

## Canonical matrix disposition

- `behavior`: `audited_gaps` — Chrome and Edge reproduce cross-group ArrowRight leakage when every radio has an empty native `name`; the tested options are separate Tab stops, and native form serialization has no field name.
- `accessibility`: `audited_gaps` — the group wrapper is ignored by Chrome/Edge AX, has no computed name, and has no group label relationship, fieldset/legend, or explicit radiogroup role.
- `visual`, `feature`, `tokenTheme`, `responsiveRTL`, `BlazorExtensions`, `designArtifact`, and `migrationDocs`: `audited_gaps` — no RadioGroup-specific live browser or normalized Fluent screenshot audit was performed in this step.
- Family `auditStatus`: `researching`; `designApproval`: `pending`; `evidenceBundle`: `null`; `gapDisposition`: `known_gaps_open`.

## Required owner actions

1. **#436:** define a native radio-group contract: stable shared `name`, group label via `fieldset`/`legend` or a valid ARIA relationship, disabled/required behavior, and caller-supplied attribute precedence.
2. **Already captured in Chrome/Edge WebAssembly:** pointer selection, ArrowRight within and across group boundaries, Space, AX roles/names, and Tab between the first group’s two options. The current run reproduces cross-group ArrowRight leakage. **Still required:** label activation, required/disabled behavior, actual form submission, additional group boundary cases, published InteractiveServer, and native screen-reader testing.
3. Compare every public parameter/default/enum and focus/selection state against pinned Fluent `RadioGroup` and `Radio` references; preserve any intentional Bluent extension explicitly.
4. Link the editable Bluent v3 design and capture Light/Dark, RTL, focus-visible, forced colors, 320px/reflow and native screen-reader results before acceptance. Keep implementation on #436 after its Ready/design gates.

## Partial browser evidence (not full acceptance)

See the [consolidated Checkbox/Switch/RadioGroup/OtpField browser audit](FLUENT-PARITY-CONTROL-SEMANTICS-BROWSER-AUDIT.md) and the raw [Chrome evidence JSON](evidence/BLUENT-CONTROL-SEMANTICS-CHROME.json) / [Edge evidence JSON](evidence/BLUENT-CONTROL-SEMANTICS-EDGE.json). Both runs passed 56/56 instrumentation checks; the checks intentionally assert that the cross-group navigation bug is reproduced, not that the component passes parity.

## Evidence sources

- [Canonical RadioGroup documentation](../../components/radio-group.md)
- `src/Bluent.UI/Components/RadioGroupComponent/RadioGroup.razor` and `.razor.cs`
- `src/Bluent.UI/Components/RadioGroupComponent/Radio.razor` and `.razor.cs`
- [Pinned Fluent Web Components 3.1.3 crosswalk](FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.md)
- [Pinned Fluent React semantic triage](FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md)
- [Chrome/Edge browser evidence](FLUENT-PARITY-CONTROL-SEMANTICS-BROWSER-AUDIT.md)
- [RadioGroup owner issue #436](https://github.com/vrassouli/Bluent/issues/436)

**Boundary:** these source facts establish an audit gap, not a runtime reproduction, design approval, or native AT pass.
