# #552 — semantic triage of pinned Fluent React API-name candidates

**Status: manual review queue; zero parity approvals.** Companion to [the pinned 9.74.10 API-name snapshot](FLUENT-REACT-9.74.10-18-API-CANDIDATES.md). This document classifies what the *names alone* can and cannot tell us; it does not claim semantic equivalence, implementation support, visual parity, or accessibility acceptance. Upstream evidence is limited to explicit React component Props/Slots names in the pinned snapshot. Native HTML inherited props, implementation source, rendered DOM, design, and AT still require separate checks.

## Review rules

- **Same-name candidate**: worth comparing; not proof that type, enum values, event payload, default, state, or behavior match.
- **Wrapper/slot candidate**: compare composition and label/validation ownership separately; never count a Field wrapper and its input primitive as two equivalent controls.
- **Related primitive only**: no dedicated upstream component in this pinned comparator; record a possible Bluent extension, not a parity match.
- **Different interaction contract**: preserve separate alternatives where the upstream components have distinct interaction models.
- **Unreviewed** remains the machine status for all 239 source occurrences. Nothing in this report changes it.

## Family-by-family semantic disposition

| Bluent family | Exact-name candidates found in pinned React Props/Slots | Semantic disposition / next required comparison |
| --- | --- | --- |
| Button | `Icon` ↔ `Button.icon` slot; `Shape`, `Appearance`, `Size` ↔ same-named Button props | **Mixed slot/value candidate.** `IconDefinition` is not automatically equivalent to React's icon slot. Compare enum domains/defaults, link-vs-button rendering, toggled/pressed semantics, split/menu/compound composition, focus and keyboard separately. Upstream Button, ToggleButton, SplitButton, CompoundButton and MenuButton remain distinct alternatives. |
| Icon | No same-name candidate | React Icons is a named-icon catalogue, not a generic `Icon(Value, Variant)` component. Compare glyph inventory, Regular/Filled/Color variants, sizing, decorative vs meaningful accessible naming, and RTL independently. |
| Label | `Size`, `Required` ↔ Label props; `Required` also collides with a slot name | **Name collision needs signature review.** Confirm whether `required` is an input/label semantic, a slot, or both in the generated API; compare association with control and required-state announcement. |
| Link | `Appearance` ↔ Link prop | Compare allowed appearance values, actual anchor semantics, URL/target/disabled behavior and focus. A matching `Appearance` name alone says nothing about navigation semantics. |
| Badge | `Appearance`, `Size`, `Shape`, `Color`, `Icon` ↔ Badge/CounterBadge props or slot | **State and taxonomy risk.** Compare each enum domain and visual meaning; Badge vs CounterBadge are separate candidates. An icon slot is not equivalent to an icon-definition value. Verify status/live-region semantics and numeric overflow separately. |
| TextField | `Size` ↔ Input and Field props | **Input primitive + Field wrapper.** Determine which owns sizing and which owns label, validation, hint and error associations. Check value binding, native input type, focus and Bluent's bottom-underline interaction separately. |
| NumericField | `Min`, `Max`, `Step`, `Size` ↔ SpinButton and Field props | Stronger conceptual candidates, still **not approved**. Compare numeric types/precision, bounds, step rounding, empty/null state, culture/decimal input, keyboard increments, spinbutton ARIA and Field validation. |
| Checkbox | `Label`, `Required`, `Size`, `LabelPosition` ↔ Checkbox/Field props or slots | **Control + wrapper split.** Compare checked/indeterminate state, controlled callback behavior, label hit target, required semantics and label placement; Field wrapper properties must not be mistaken for Checkbox-native properties. |
| Switch | `Label`, `Required`, `Size`, `LabelPosition` ↔ Switch/Field props or slots | Same name set as Checkbox does not establish equivalent interaction. Compare switch role/on-off announcement, keyboard operation, label activation and checked-state contract separately. |
| RadioGroup | `Label`, `Orientation` ↔ Field slots/props; Radio `Value`, `Label` ↔ Radio prop/slot | **Group and item are separate contracts.** Compare group naming/orientation, one-tab-stop roving focus, arrow-key behavior, selected value serialization, disabled options and label association. |
| SelectField | `Size` ↔ Select and Field props | **Do not collapse Select, Dropdown and Combobox.** Compare native select vs popup/listbox interaction, filtering/free text, selected option model, keyboard/typeahead, popup ownership and Field validation. |
| DateField | `Size` ↔ Input and Field props | Related primitives only; no dedicated DatePicker comparator in this pinned umbrella. Do not infer date-picker parity. Check date format/culture, min/max, parsing, invalid input, calendar interaction and timezone policy as a Bluent-only contract if applicable. |
| TimeField | `Size` ↔ Input and Field props | Related primitives only; no dedicated TimePicker comparator in this pinned umbrella. Check locale/time format, parsing, step, keyboard, invalid values and 12/24-hour behavior independently. |
| MaskedField | `Size` ↔ Input prop | Input is a primitive, not a masked-input equivalent. Define mask grammar, caret movement, paste/autofill, IME, deletion, validation and accessible error behavior separately. |
| OtpField | `Size` ↔ Input prop | Input is a primitive, not an OTP component. Check one-vs-many input structure, paste distribution, autofill, focus progression, backspace, RTL ordering and accessible group labeling independently. |
| Slider | `Min`, `Max`, `Value` ↔ Slider props | Closest direct conceptual candidate, but API names do not establish interaction parity. Existing P0 evidence already records missing thumb slider semantics/keyboard and mixed pointer coordinate spaces. Compare step, orientation, inversion, keyboard, touch, ARIA values and forced colors in real hosts. |
| RangeSlider | `Min`, `Max`, `Value` ↔ single-value Slider props | **Not equivalent.** A single-value Slider does not establish a dual-thumb component. Define two independently named/focusable values, dependent bounds, non-crossing/overlap policy, stable Tab order and RTL/touch behavior as an explicit extension. |
| FileSelect | `Appearance`, `OnChange` ↔ Input props | **Native file input primitive only.** Event payload and lifecycle differ; compare batches, cumulative `MaxFiles`, remove/reselect, file metadata, accessible per-file remove names and server-side validation. Existing P0 browser evidence proves `MaxFiles` overflow and an unhelpful icon-font accessible name; fixes belong to #444. |

## Required order of work

1. Resolve the existing P0 contracts through their owner issues: Button #428, Slider #442, RangeSlider #443, FileSelect #444. This audit must not patch those product components.
2. For each of the 18 families, compare the full Bluent public API (including inherited/framework parameters and callback payloads) against the exact pinned upstream signatures and implementation/docs, then record one explicit disposition per feature: supported, missing, intentional extension, or N/A with rationale.
3. Keep the existing #421 nine-dimension acceptance matrix canonical. Add evidence there rather than creating a competing acceptance ledger: source/signatures, states, keyboard/touch, visual Light/Dark/brand/RTL/320px/zoom/forced-colors, WASM and published InteractiveServer, plus native OS/assistive technology or an explicit pending marker.
4. Review actual editable Bluent component design frames in the source-owned design file before any design-dependent product changes. #418 tokens/themes, #420 shared interaction contracts and #425 release gates remain dependencies; green source tests are not substitutes.
5. Only after the owner issue's design and contract gates are approved may an implementation branch change product code. Keep all v3 work isolated from stable `Dev` and v2.x.

## Snapshot facts

- Reference: `@fluentui/react-components@9.74.10`, with 13 component packages pinned at the lower bounds of its declared dependency ranges and `@fluentui/react-icons@2.0.344` as a separate catalogue.
- Source comparison: 18 families, 19 Bluent component classes, 239 parameter occurrences, 42 occurrences with at least one exact-name candidate, 197 without a name candidate.
- **Approved mappings: 0.** All source snapshot rows remain `not_reviewed` / `not_inferred` until the required semantic and runtime evidence exists.
- The reference pins are a reproducible comparison set, not a claim that all consumers resolve those exact transitive package versions.
