# #552 family audit — TextField (#432)

**Status: partial source/API audit; no confirmed component defect identified from source inspection alone.** This is not Fluent parity acceptance, design approval, browser/assistive-technology sign-off, or evidence that every feature works at runtime. No product code or design file was changed.

## Upstream comparison decision

The pinned Fluent Web Components 3.1.3 inventory contains a text-input primitive; the React comparison separates `Input` from the `Field` wrapper. Bluent's `TextField` renders native `<input>` or `<textarea>` based on `Rows`, with Bluent addons, sizing, digit normalization and focus support. The mapping must distinguish the input primitive from its separate `Label`/field composition; no one-to-one parity acceptance is inferred from the shared name.

## Source facts verified

| Area | Source observation | Audit disposition |
| --- | --- | --- |
| Native element and binding | `TextField.razor` renders a native `input` when `Rows` is null and `textarea` when set. Both use `@bind-value:event="@BindValueEvent"`; this public parameter is actually wired in both branches. | No source-level gap confirmed for the event selector. This is intentionally distinct from sibling typed fields where the inherited selector is ignored. |
| Accessible attributes | `GetInputAdditionalAttributes()` is applied to the actual input/textarea; `id`, `disabled`, `type`, `autocomplete`, `aria-*` and other unmatched attributes are supported by the documented contract. | No source-level defect confirmed. Consumers must still provide a valid accessible name using `Label`/`ForExpression` or another appropriate naming mechanism; the TextField itself does not invent a label. |
| Focus and sizing | `GainFocus` opts into programmatic focus after first render. `Rows` switches to textarea; `ResizeTextarea` controls the no-resize class. | Source behavior is identified, but focus timing, reflow and browser parity are not runtime-tested here. Preserve the component's own focus treatment rather than importing Button's ring behavior without design approval. |
| Input normalization | The bound string is passed through `ToDigits()`, `ToAsciiDigits()` and/or `ToPersianChars()` when the corresponding options are enabled. | Source contract verified; ordering/interactions between simultaneous flags and paste/IME behavior still need runtime tests. |
| Public API and composition | `StartAddon`, `EndAddon`, `Size`, `Rows`, `GainFocus` and the normalization flags are Bluent-specific additions around native input/textarea behavior. | Complete upstream parameter-by-parameter Supported / Missing / Intentional extension / N/A mapping remains open. No specific parity gap is asserted without the pinned signature and actual runtime/design comparison. |

## Canonical matrix disposition

- `visual`: `audited_gaps` — 28 Fluent reference variants versus 10 Bluent variants; Hover/Pressed/Underline and separate Filled Lighter/Darker variants are missing. See [core-control design audit](FLUENT-PARITY-CORE-CONTROLS-DESIGN-AUDIT.md).
- `designArtifact`: `audited_gaps` — editable reference and draft frame IDs are recorded in the design audit; draft only.
- `feature`, `behavior`, `accessibility`, `tokenTheme`, `responsiveRTL`, `BlazorExtensions`, and `migrationDocs`: `audited_gaps`. Family `auditStatus` is `researching`; `designApproval` remains `pending`; `evidenceBundle` remains `null`; `gapDisposition` is `known_gaps_open`.

## Required next evidence

1. Compare all public parameters, defaults, enums, event behavior and unmatched-attribute precedence against the pinned Fluent text-input and React Input/Field signatures; keep intentional Bluent extensions explicit.
2. Run real browser tests for `BindValueEvent=onchange/oninput`, input/textarea switching, `GainFocus`, disabled state, accesskey, normalization flag combinations, paste/IME, and form validation in WebAssembly and published InteractiveServer.
3. Capture same-state Fluent/Bluent screenshots for sizes, addons, focus, Light/Dark, RTL, 320px/reflow, forced colors and zoom. Use the accepted editable Bluent v3 TextField design before visual approval.
4. Verify accessible names and focus with a browser AX tree and native screen reader. Do not treat source markup or the compiling Fields showcase as runtime acceptance.

## Evidence sources

- [Canonical TextField documentation](../../components/text-field.md)
- `src/Bluent.UI/Components/TextFieldComponent/TextField.razor` and `.razor.cs`
- `src/Bluent.UI/Components/BluentFieldComponentBase.cs`
- `src/Bluent.UI/Components/BluentInputComponentBase.cs`
- [Pinned Fluent Web Components 3.1.3 crosswalk](FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.md)
- [Pinned Fluent React semantic triage](FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md)
- [TextField owner issue #432](https://github.com/vrassouli/Bluent/issues/432)

**Boundary:** this source/API inventory found no confirmed defect, but it is not a parity pass. All nine acceptance dimensions and design approval remain pending.
