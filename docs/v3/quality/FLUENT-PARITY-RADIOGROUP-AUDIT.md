# #552 family audit — RadioGroup (#436)

**Status: partial source audit with behavior/accessibility gaps identified.** This is not Fluent parity acceptance, design approval, or browser/native assistive-technology sign-off. Findings are source-backed; no product code or design file was changed.

## Upstream comparison decision

The pinned Fluent Web Components 3.1.3 inventory and React semantic triage treat the radio-group container and individual radio option as related but distinct semantics. Bluent exposes `RadioGroup<TValue>` plus nested `Radio<TValue>`, but native radio grouping is defined by shared `name` values and a fieldset/legend or an equivalent accessible group—not by the Blazor cascading value alone.

## Confirmed source gaps

| Finding | Current source | Disposition |
| --- | --- | --- |
| No shared native radio name is generated | `Radio.razor` renders `<input type="radio">` with attributes from `GetInputAdditionalAttributes()`, `checked`, `id`, and `@onchange`; neither `RadioGroup.razor` nor `Radio.razor` supplies a shared `name` from the group. | Confirmed behavior gap: independent unnamed radio inputs do not form the native same-name radio set, so native arrow-key selection and form serialization are not established. Actual browser behavior must be captured before acceptance. |
| No group-level semantics | `RadioGroup.razor` renders the group label as a plain `<label>` with no `for`, and wraps options in ordinary `div` elements. It emits neither `fieldset`/`legend` nor `role="radiogroup"` and a programmatic group label relationship. | Confirmed accessibility gap. The cascading `RadioGroup` value is Blazor component plumbing, not a browser accessibility relationship. |
| Option labels are individually associated | `Radio.razor` gives each input an `id` and renders one or two `<label for="@Id">` elements. | Useful existing semantics, but they do not repair the missing group name/relationship. Verify accessible names when option text is empty or custom attributes override IDs. |
| Native `change` drives Blazor state | `Radio` listens to native `change`; on value `on`, it calls the parent group's `SetValue`, which notifies nested radios through an internal event. | Source behavior is understood. It does not demonstrate correct native radio keyboard grouping. |

## Canonical matrix disposition

- `behavior`: `audited_gaps` — the component does not generate a shared native `name`, so browser-native radio-group behavior is not established.
- `accessibility`: `audited_gaps` — the group label has no group relationship and no fieldset/legend or radiogroup role is rendered.
- `visual`, `feature`, `tokenTheme`, `responsiveRTL`, `BlazorExtensions`, `designArtifact`, and `migrationDocs`: `not_reviewed` — no RadioGroup-specific live browser or normalized Fluent screenshot audit was performed in this step.
- Family `auditStatus`: `researching`; `designApproval`: `pending`; `evidenceBundle`: `null`; `gapDisposition`: `known_gaps_open`.

## Required owner actions

1. **#436:** define a native radio-group contract: stable shared `name`, group label via `fieldset`/`legend` or a valid ARIA relationship, disabled/required behavior, and caller-supplied attribute precedence.
2. In Chrome and Edge, test Tab entry, Arrow keys, Space, label activation, one checked item, required validation, native form submission and nested Blazor binding. Verify WebAssembly and published InteractiveServer separately.
3. Compare every public parameter/default/enum and focus/selection state against pinned Fluent `RadioGroup` and `Radio` references; preserve any intentional Bluent extension explicitly.
4. Link the editable Bluent v3 design and capture Light/Dark, RTL, focus-visible, forced colors, 320px/reflow and native screen-reader results before acceptance. Keep implementation on #436 after its Ready/design gates.

## Evidence sources

- [Canonical RadioGroup documentation](../../components/radio-group.md)
- `src/Bluent.UI/Components/RadioGroupComponent/RadioGroup.razor` and `.razor.cs`
- `src/Bluent.UI/Components/RadioGroupComponent/Radio.razor` and `.razor.cs`
- [Pinned Fluent Web Components 3.1.3 crosswalk](FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.md)
- [Pinned Fluent React semantic triage](FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md)
- [RadioGroup owner issue #436](https://github.com/vrassouli/Bluent/issues/436)

**Boundary:** these source facts establish an audit gap, not a runtime reproduction, design approval, or native AT pass.
