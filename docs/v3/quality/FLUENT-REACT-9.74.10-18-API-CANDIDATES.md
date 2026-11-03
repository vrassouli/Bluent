# #552 — Fluent React 9.74.10 API-name candidates for 18 Bluent families

**Pinned source-triage only — not Fluent 2 parity acceptance.** The umbrella package is pinned by npm tarball integrity. Thirteen component packages are pinned to exact versions at the lower bounds of the umbrella's declared dependency ranges; the umbrella does not lock a single transitive resolution.

Across 18 families and 19 Bluent classes, this compares 239 direct + locally inherited C# parameter occurrences against explicit React Props/Slots names. 42 occurrences have at least one spelling candidate; 197 do not; 0 mappings are approved.

| Bluent family | Owner | Fluent React comparators | Relationship / caveat |
| --- | ---: | --- | --- |
| Button | #428 | Button, CompoundButton, MenuButton, SplitButton, ToggleButton | Separate Button, ToggleButton, SplitButton, CompoundButton and MenuButton are alternatives, not a one-to-one class mapping. |
| Icon | #429 | Icon catalogue / no 1:1 component | Fluent React Icons is a named-icon catalogue, not a generic Icon(Value, Variant) wrapper. |
| Label | #430 | Label | Name candidates only; semantic and behavioral review is pending. |
| Link | #431 | Link | Name candidates only; semantic and behavioral review is pending. |
| Badge | #445 | Badge, CounterBadge, PresenceBadge | Name candidates only; semantic and behavioral review is pending. |
| TextField | #432 | Field, Input | Input is a primitive; Field is a separate label/validation wrapper. |
| NumericField | #433 | Field, SpinButton | SpinButton is the closest numeric control; Field is a separate wrapper. |
| Checkbox | #434 | Checkbox, Field | Name candidates only; semantic and behavioral review is pending. |
| Switch | #435 | Field, Switch | Name candidates only; semantic and behavioral review is pending. |
| RadioGroup | #436 | Field, Radio, RadioGroup | RadioGroup and Radio are separate components. |
| SelectField | #437 | Combobox, Dropdown, Field, Select | Select, Dropdown and Combobox have distinct interaction models. |
| DateField | #438 | Field, Input | No dedicated DatePicker export in this pinned umbrella; Input and Field are primitives only. |
| TimeField | #439 | Field, Input | No dedicated TimePicker export in this pinned umbrella; Input and Field are primitives only. |
| MaskedField | #440 | Input | No dedicated masked-input export in this pinned umbrella; Input is a primitive only. |
| OtpField | #441 | Input | No dedicated OTP export in this pinned umbrella; Input is a primitive only. |
| Slider | #442 | Field, Slider | Name candidates only; semantic and behavioral review is pending. |
| RangeSlider | #443 | Slider | No dedicated dual-thumb RangeSlider export; single Slider is not equivalent. |
| FileSelect | #444 | Field, Input | No dedicated file-upload/FileSelect export; native Input type=file is a primitive only. |

## Guardrails

- Package versions and npm integrity strings are retained in JSON. The component packages are a reproducible comparison set at the umbrella dependency lower bounds, not a claim that every consumer resolves to those exact transitive versions.
- Explicit Props/Slots fields only are captured. Native HTML attributes inherited through React types and shared utility types are not exhaustively expanded.
- A spelling match is a review lead, not a support guarantee; no spelling match does not prove missing capability. Events, enum semantics, accessibility, visual states, and external Bluent base-class members need manual review.
- Icon is a named-icon catalogue vs generic wrapper. DateField, TimeField, MaskedField, OtpField, RangeSlider and FileSelect only have related primitives here; no direct equivalence is claimed.
- The canonical #421 18-family acceptance matrix remains authoritative and unaccepted. No product code, design approval, owner issue status or stable Dev was changed.

Rebuild from exact npm tarballs with build_v3_fluent_react_crosswalk.py --write; validate the checked-in snapshot with --check. Raw third-party declarations are not committed.
