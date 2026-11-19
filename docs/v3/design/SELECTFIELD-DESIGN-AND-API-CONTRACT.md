# SelectField — design and API contract (#437)

> **Implementation decision record · task branch `v3/issue-437-selectfield` · not a released v3 API.** This records the design and source contract for review. It does not accept the Penpot boards or imply #418 token approval.

## Implementation review tracking

- [Issue #437](https://github.com/vrassouli/Bluent/issues/437)
- [Draft PR #568](https://github.com/vrassouli/Bluent/pull/568), base `bluent-v3`

## Owned design source

- File: **Bluent v3 Design System**, Penpot file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`
- Page 60: `28143240-43dc-80cc-8008-f84a2fd6a22c`
- Board 1, anatomy / visual states: `28143240-43dc-80cc-8008-f84a3bd17206`
- Board 2, scalar vs multiple interaction: `28143240-43dc-80cc-8008-f84aa30a32ea`
- Board 3, themes / RTL / accessibility: `28143240-43dc-80cc-8008-f84aa52eb253`
- Visible board status: **DRAFT · REVIEW REQUIRED**

The upstream Microsoft Fluent 2 material remains a read-only reference. The editable source of truth for this task is the owned Bluent Penpot file. Exported boards were inspected, but this is not maintainer approval or final pixel-parity signoff.

## Decision 1 — retain the native HTML select

**Decision:** The interactive primitive remains the browser's native `<select>`. Bluent styles the closed control through the shared field shell; the option popup, option selection, keyboard behavior and form integration remain browser/OS-owned.

**Reason:** A native select provides the browser's established form and accessibility semantics. Replacing it with a generic popup would introduce an unrelated menu/listbox keyboard model, focus management, portal/theming behavior and additional accessibility work. A searchable or chip-based picker is a separate component pattern, not a SelectField enhancement.

**Consequences:**

- No custom popup, search/filter box, virtualized options, checkbox menu or chip rendering.
- `<option>` and `<optgroup>` remain the content contract.
- Browser/OS differences in the native popup are explicit; Bluent cannot promise identical popup screenshots across engines or platforms.
- Scalar select uses the native single-select behavior; array `TValue` uses `multiple` and native listbox behavior.

## Decision 2 — let TValue shape determine scalar or array semantics

| TValue shape | Native primitive | Conversion path |
| --- | --- | --- |
| Scalar | `<select>` | `CurrentValueAsString` and selectable-value parsing |
| Array | `<select multiple>` | `CurrentValueAsStringArray` receives the selected strings, then converts to typed `TValue` |

The implementation and browser evidence specifically cover `string`, `int`, `string[]`, `int[]`, `bool[]`, `bool?[]` and `decimal[]`. Boolean array paths parse each selected native string because the framework's generic array conversion path throws for the native string-array payload in this case; nullable empty options map to `null`. Decimal arrays use `CultureInfo.CurrentCulture`, including published InteractiveServer runs under `de-DE` and `fa-IR`. Boolean option values remain lowercase to match native option values and scalar bool formatting.

## Decision 3 — no new public parameters

The component declares only `ChildContent : RenderFragment?`. Shared field behavior remains inherited from `BluentFieldComponentBase<TValue>` and Blazor's `InputBase<TValue>`: typed value callbacks and expression, EditContext validation, Start/End addons, FieldSize, BindValueEvent, Class, Style and unmatched native attributes.

The consumer composes labels/help/validation text. No SelectField-specific Label, HelperText, ErrorMessage, Appearance, Clearable, Searchable, Placeholder or Popup parameter is introduced. `required` and `disabled` remain native HTML attributes, not custom parameters.

## Decision 4 — BindValueEvent is part of the actual event registration

Both branches of the rendered select bind using the inherited `BindValueEvent` rather than hard-coding `onchange`. The default remains `onchange`; `oninput` is explicitly exercised. Scalar and array binders use their respective typed paths.

## Decision 5 — preserve InputBase form and validation ownership

- Consumer label association and validation-message text remain caller-owned.
- The native select receives the generated id, inherited `NameAttributeValue` and unmatched HTML attributes.
- EditContext state is reflected through native `aria-invalid`.
- Native keyboard/focus/disabled semantics are not replaced with a JavaScript event layer.
- Addons are sibling content outside the native select. When combining option content and named addon slots, consumers use the explicit `ChildContent` slot.

## Visual and token boundary

The shared field styles own the closed select control, size and states. No SelectField-only Sass or JavaScript is required. RTL follows the host `dir`. The task uses only integrated shared field/theme roles; preview-only #418 aliases are not consumed.

## Verification gates and limitations

- Source/API regression guard and negative mutation tests are required.
- HtmlRenderer tests cover scalar, typed numeric, string/int/boolean arrays, option/optgroup composition, addons, native attributes, size/class/style and EditContext invalid state.
- Local real browser matrix: Chrome/Edge × WebAssembly/InteractiveServer, 23 assertions per cell (92 total), plus de-DE/fa-IR Chrome/InteractiveServer (46 more; 138/138 combined).
- The matrix verifies native combobox/listbox roles, keyboard binding events, multi-option Ctrl+Click, bool[]/bool?[] conversion, culture-aware decimal[] parsing, form validation/submission, RTL and 320px no-overflow.
- Native Windows Contrast Themes and spoken screen-reader acceptance remain separate and unclaimed.
- Penpot boards remain DRAFT; browser results are not design approval.
- Last completed hosted CI was on predecessor head fc96090d71a673c6c2c02d65457b1f3287afdc77: SelectField source/evidence plus its earlier four browser cells passed (4/4, 76/76); Component Lab 4/4, RadioGroup 4/4, TextField Edge/WASM + Edge/Server, Baseline, Docs, Skills, Public Census and Interaction Source also passed. The expanded 23-assertion core cells and de-DE/fa-IR culture matrix have 138/138 local assertions and require exact-head hosted CI after the next commit/push. The predecessor shared run also had unrelated Button menu/Tab focus-restoration and NumericField Chrome/Server Forced Colors failures; these do not indicate a SelectField failure.

See [the canonical SelectField v3 implementation record](../components/select-field.md) for the complete source/API, demo, migration and evidence ledger.
