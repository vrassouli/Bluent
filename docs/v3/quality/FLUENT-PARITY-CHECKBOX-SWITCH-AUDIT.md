# #552 family audit — Checkbox (#434) and Switch (#435)

**Status: partial source audit with accessibility gaps identified.** These findings are source-backed and are not Fluent parity acceptance, design approval, or browser/native assistive-technology sign-off. No product code or design file was changed.

## Upstream comparison decision

The pinned Fluent Web Components 3.1.3 manifest contains distinct `fluent-checkbox` and `fluent-switch` elements. Its Checkbox metadata includes a dedicated `indeterminate-indicator` slot, but a slot inventory does not establish the control's runtime mixed-state semantics. The pinned React semantic triage explicitly treats Checkbox and Switch as separate contracts: Checkbox's indeterminate state must be compared independently from Switch's on/off role and announcement.

## Confirmed source gaps

| Family | Source fact | Disposition |
| --- | --- | --- |
| Checkbox #434 — mixed state | `Checkbox<TValue>` accepts `bool` or `bool?`. When `ValueAsBool` is `null`, the wrapper gets the `indeterminate` class and the visual indeterminate SVG is rendered. The actual input is still `<input type="checkbox">` with `checked` derived from `CurrentValue`; source does not set the DOM `input.indeterminate` property or `aria-checked="mixed"`. | Confirmed accessibility gap: the visual mixed state is not exposed as native/ARIA mixed state. Chrome and Edge browser AX trees confirm the native input is announced as an unchecked checkbox; native screen-reader output remains untested. |
| Checkbox #434 — user transition | `Toggle()` treats only `ValueAsBool == true` as checked, then sets the next value to `!isChecked`. The documented user gesture therefore moves `null` to `true`; returning to `null` is an application assignment, not a user state. | Explicit source behavior, not automatically a defect. Keep it separate from the missing native/ARIA mixed state; do not change tri-state transition policy without an owner decision. |
| Switch #435 — semantic role | `Switch.razor` inherits `Checkbox<bool>` and renders the same native `<input type="checkbox">`. `Switch.razor.cs` changes only the `bui-switch` and label-position classes; no `role="switch"` is rendered. | Confirmed source and browser difference: Chrome and Edge AX trees expose role `checkbox` (computed name `Light` in the tested initial state), not role `switch`. Native screen-reader output and pinned Fluent runtime comparison remain pending. |
| Shared label and required marker | Checkbox/Switch render a native `<label for="@GetInputId()">` when their state-specific text exists. `Required` only renders marker text and does not set native `required` or `aria-required`. | Source fact and documented boundary. Verify the actual computed name for checked, unchecked and indeterminate labels; do not claim the visual required marker performs validation. |

## Canonical matrix disposition

For both Checkbox and Switch:

- `accessibility`: `audited_gaps` — Checkbox's visible mixed state lacks native/ARIA mixed semantics; Switch uses native checkbox semantics without an explicit switch role.
- `visual`: `audited_gaps` — editable Fluent reference and Bluent draft matrices show incomplete state/style coverage; see [core-control design audit](FLUENT-PARITY-CORE-CONTROLS-DESIGN-AUDIT.md).
- `designArtifact`: `audited_gaps` — editable reference/local frame IDs are recorded in the design audit; approval remains pending.
- `feature`, `behavior`, `tokenTheme`, `responsiveRTL`, `BlazorExtensions`, and `migrationDocs`: `not_reviewed`.
- Family `auditStatus`: `researching`; `designApproval`: `pending`; `evidenceBundle`: `null`; `gapDisposition`: `known_gaps_open`.

## Partial browser evidence (not full acceptance)

The [consolidated Checkbox/Switch/RadioGroup/OtpField browser audit](FLUENT-PARITY-CONTROL-SEMANTICS-BROWSER-AUDIT.md) records **56/56 instrumentation checks in Chrome and 56/56 in Edge**, with nine screenshots per engine. It confirms the unchecked AX state for the visual indeterminate checkbox and checkbox semantics for Switch. These are browser DOM/AX observations, not screen-reader sign-off.

## Required owner actions

1. **#434 Checkbox:** decide and implement the mixed-state contract across visual state, native `input.indeterminate`, `aria-checked="mixed"` or the appropriate native semantics, and form serialization. Test null/false/true, keyboard Space, label activation, disabled state, validation, and whether caller-supplied ARIA may override component-owned state.
2. **#435 Switch:** decide whether the supported contract is a native checkbox or an accessible switch. Compare the pinned Fluent switch's rendered role/state and announcement; then test `role="switch"`/checked state, label activation, keyboard operation, disabled state and form behavior. Do not assume Checkbox parity makes Switch parity.
3. **Already captured:** Chrome and Edge WebAssembly DOM/AX, native Space activation, Light/Dark through the actual header control, LTR/RTL, and CDP-emulated forced-colors. **Still required:** published InteractiveServer, focus-visible, 320px/reflow, native Windows Contrast Themes, real screen readers, and comparison against the pinned Fluent runtime. Link the editable Bluent v3 designs before visual acceptance.
4. Keep product fixes on each owning issue after Ready/design gates; this #552 branch remains audit-only.

## Evidence sources

- [Canonical Checkbox documentation](../../components/checkbox.md)
- [Canonical Switch documentation](../../components/switch.md)
- `src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor` and `.razor.cs`
- `src/Bluent.UI/Components/SwitchComponent/Switch.razor` and `.razor.cs`
- [Pinned Fluent Web Components 3.1.3 crosswalk](FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.md)
- [Pinned Fluent React semantic triage](FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md)
- [Chrome/Edge browser evidence](FLUENT-PARITY-CONTROL-SEMANTICS-BROWSER-AUDIT.md)
- [Checkbox owner issue #434](https://github.com/vrassouli/Bluent/issues/434) · [Switch owner issue #435](https://github.com/vrassouli/Bluent/issues/435)

**Boundary:** this is a partial source audit. It does not prove native screen-reader output, full Fluent equivalence, design approval or implemented fixes.
