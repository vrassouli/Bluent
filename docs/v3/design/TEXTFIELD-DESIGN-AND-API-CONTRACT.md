# TextField design and API contract — Issue #432

> **Status:** draft design/API audit, updated 2026-11-13. This is not a released v3 API, runtime implementation, or maintainer parity sign-off. Task branch: **v3/issue-432-textfield**, based on **bluent-v3** commit **bcd56ac8f6d8271f341747dbf2e6816fa768ff4f**.

## 1. Identity and design provenance

| Item | Verified reference |
| --- | --- |
| Existing family | TextField; v2 source: src/Bluent.UI/Components/TextFieldComponent/ |
| Issue | [#432](https://github.com/vrassouli/Bluent/issues/432), child of Epic #416 |
| Owned design file | Bluent v3 Design System, Penpot file b64f6665-c9ab-80b5-8008-c4ac99d9d000 |
| Read-only upstream reference | Page 10 · Fluent Input reference, page 07c521b9-e441-80bd-8008-c4d65ae7b089; board 07c521b9-e441-80bd-8008-c4d65b54658b |
| Native variant source | Page 16 · Bluent TextField variants, page e31294c6-7c55-805f-8008-c51213e75deb; variant set e31294c6-7c55-805f-8008-c51241e2236b |
| Full state matrix | Page 17 · TextField full matrix, page 343383cb-23d3-80b8-8008-ec421a657594; board 343383cb-23d3-80b8-8008-ec424306af65 |
| Anatomy / size / RTL | Page 18 · TextField anatomy, sizing & RTL, page 343383cb-23d3-80b8-8008-ec43be230d2d; board 343383cb-23d3-80b8-8008-ec43be3b98e5 |
| Keyboard / forced-colors / reflow | Page 19 · TextField keyboard, contrast & reflow, page 343383cb-23d3-80b8-8008-ec440d228749; board 343383cb-23d3-80b8-8008-ec440d2d8ed7 |
| Fluent crosswalk / composite state precedence | Page 20 · Fluent crosswalk & state precedence, page 343383cb-23d3-80b8-8008-ec45d2946dbd; board 343383cb-23d3-80b8-8008-ec45d29ff553 |

The Microsoft Fluent files are read-only references. The owned Penpot file is the editable working source. Keep Fluent Web Components and Fluent React Input as separate reference layers. Neither imported artwork nor a design board proves Blazor behavior or lossless upstream parity.

### Fluent source crosswalk — keep the two upstream APIs distinct

The four-appearance board is **not** a one-to-one reproduction of the Fluent Web Components `fluent-text-field` API. The repository parity hierarchy in #552 is authoritative: use Fluent Web Components as the primary API/DOM/keyboard target; use Fluent React v9 only as a clearly marked cross-platform reference where Web Components has no comparable pattern.

| Fluent reference | Verified scope | TextField disposition |
| --- | --- | --- |
| Fluent Web Components Text Field | Its official component page documents two appearances: Outline (default) and Filled. | Primary API/behavior target for Web Components comparison. Do not claim separate WC Underline, Filled lighter or Filled darker props. |
| Fluent React v9 Input | Documents Outline, Underline, Filled lighter and Filled darker; Small/Medium/Large; contentBefore/contentAfter; native input/Field integration. | Cross-platform visual/accessibility reference for the four-appearance design matrix; clearly label these extra variants as not a one-to-one WC component contract. |
| Bluent v3 TextField | Native Blazor TextField preserving Bluent's existing InputBase contract, addons, textarea mode and Persian digit/character helpers. | Keep deliberate Bluent extensions separate from parity claims; final public v3 API still needs review. |

Appearance disposition:
- **Outline:** shared by Web Components and React Input.
- **Filled:** the Web Components page documents one Filled appearance; do not silently map it to React's lighter or darker variant without an explicit design decision.
- **Filled lighter / Filled darker:** distinct React Input appearances; no separate matching appearance names are documented for the Web Components Text Field.
- **Underline:** documented by React Input; not a distinct Web Components Text Field appearance. Treat it as a cross-platform visual model / proposed Bluent extension relative to the WC component.

Source references (checked 2026-11-10):
- [Fluent Web Components — Text Field](https://learn.microsoft.com/en-us/fluent-ui/web-components/components/text-field).
- [Fluent React v9 — Input](https://fluentuipr.z22.web.core.windows.net/pull/36784/docs/react/components/input).
- [Fluent React v9 — Input accessibility](https://fluentuipr.z22.web.core.windows.net/pull/36784/docs/react/guide/accessibility/components/input).
- [Fluent React Input style implementation](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-input/library/src/components/Input/useInputStyles.styles.ts).

The Penpot page 20 crosswalk board records this distinction. This avoids reporting four React visual appearances as four supported Fluent Web Components appearances.

### Composite state rules — seven rows are not seven mutually exclusive flags

The 28 linked appearance/state variants are base visual specimens, not the full cartesian product of independent native states. The React Input reference composes aria-invalid, focus, disabled and appearance rules. The v3 test/demo matrix must add at least these overlapping cases:

| Combined condition | Upstream behavior to verify / preserve |
| --- | --- |
| Invalid + unfocused | aria-invalid=true drives the invalid border; the associated validation message must remain readable and described. |
| Invalid + focused | The React Input invalid border rule is limited to :not(:focus-within); focus underline remains the active border cue while aria-invalid and its message remain present. Do not stack a second generic danger/focus rectangle. |
| Disabled | Native disabled removes the control from the tab order; the focus pseudo-element is suppressed. In forced-colors, disabled border uses system GrayText. |
| ReadOnly + focused | Native readonly remains focusable and allows selection/copy while preventing edits; it is not Disabled. |
| Action addon | An interactive addon is a separate focusable control with its own accessible name; disabling the field does not automatically disable an action button inside its slot. |

Other visual/semantic constraints from the React reference:
- Input uses a native HTML input; the browser retains caret, selection, IME composition, autofill and password behavior. Use native textarea semantics for the Bluent multiline mode.
- Labels are not inferred from placeholder text. A visible Label must be programmatically associated; Field-style composition wires IDs, aria-labelledby, aria-describedby, aria-invalid and native required where supported.
- An aria-invalid state without a readable associated reason is incomplete validation feedback.
- A visible input boundary must meet at least **3:1** against its immediate host surface. Outline and Underline use a sufficiently contrasting bottom stroke; Filled lighter/darker rely on the field surface contrasting with the surface behind it. The Penpot matrix now places both Filled samples on a contrasting dark host surface; a real consumer surface still needs browser contrast verification.
- filled-lighter-shadow and filled-darker-shadow are deprecated upstream and are intentionally excluded.
- React's focus underline is a 2px ::after border driven by :focus-within; the source also has reduced-motion handling. Verify the chosen keyboard focus treatment in actual forced-colors and assistive-technology environments rather than copying a transparent outline blindly.

The new Penpot page 20 board is a review aid for the crosswalk and composite rules; it is not runtime, contrast certification or maintainer approval.
### State and appearance coverage

The native variant set contains **28 unique linked variants**. The four-appearance axis is based on Fluent React Input plus proposed Bluent coverage; it is not a claim that Fluent Web Components Text Field exposes all four appearance props:

- Appearances: Outline, Filled lighter, Filled darker, Underline.
- States: Rest, Hover, Pressed, Focus, Error, Disabled, ReadOnly.

Each appearance has all seven states. Page 17 is a linked-instance review matrix; page 16 remains the variant source. Medium is the reference size shown in the state matrix; Small and Large are included in the anatomy page pending final measured/token-backed geometry.

Draft decisions:
- Focus uses a **2px active underline**; do not add a generic full-rectangle focus ring.
- Underline appearance has no surrounding rectangle.
- Filled lighter and Filled darker are distinct surfaces.
- Disabled and ReadOnly are visually and semantically distinct. ReadOnly shows a value and is intended to remain selectable.
- RTL uses logical leading/trailing slots. DOM and accessible reading order stay label → control → description/validation.
- Error is not conveyed by color alone.
- Keyboard, forced-colors, zoom and responsive boards express acceptance intent, not runtime evidence.

**Penpot visual QA checkpoint — 2026-11-11:** the narrow 320px/400% reflow preview on page 19 was shifted 85px to the right so it no longer occludes the second field in the wide-layout specimen. A fresh export confirms a clear gap between the wide and narrow examples. This is a geometry/readability correction only; pages 17–20 remain DRAFT, and no token, appearance, dimension or maintainer approval is implied.

### Token boundary

Penpot colors and dimensions are provisional review values. #418 is in Review and owns the final source → global → semantic → component token names, approved values, modes/brands and production aliases. Do not add production CSS that consumes draft-only values or invents final public token names before #418 acceptance.

## 2. Existing v2 source/API baseline

Source read from task branch base commit bcd56ac8f6d8271f341747dbf2e6816fa768ff4f. This section is a compatibility inventory, **not an approved v3 signature**.

### Type and inherited contract

| Member | Existing contract |
| --- | --- |
| TextField | Bluent.UI.Components.TextField, partial Razor component |
| Base type | BluentFieldComponentBase<string?> → BluentInputComponentBase<string?> → Blazor InputBase<string?> |
| Binding | Inherited Value, ValueChanged and ValueExpression; standard @bind-Value and InputBase EditContext/FieldIdentifier/validation behavior |
| Presentation | Inherited Class, Style and CssClass; root currently emits bui-field and bui-text-field |
| Composition | StartAddon: RenderFragment? and EndAddon: RenderFragment? |
| Size | Size: FieldSize = Medium; enum values Small, Medium, Large |
| Bind event | BindValueEvent: string = "onchange"; use "oninput" for live updates |
| Unmatched attributes | Forwarded to native input/textarea except class; examples include id, name, type, placeholder, autocomplete, disabled, readonly, accesskey and aria-* |

### TextField parameters

| Parameter | CLR type | Default | Current behavior |
| --- | --- | --- | --- |
| Rows | int? | null | Null renders native input; set renders native textarea with rows. |
| ResizeTextarea | bool | false | With Rows set, false adds no-resize; true leaves native resizing enabled. |
| GainFocus | bool | false | Requests focus on the native element after first render only. No general focus callback exists. |
| DigitOnly | bool | false | Applies ToDigits() before updating the bound value. |
| AsciiDigits | bool | false | Applies ToAsciiDigits() after DigitOnly. |
| ArabicToPersianConversion | bool | false | Applies ToPersianChars() after the preceding enabled transforms. |

No TextField-specific focus/change/blur EventCallbacks or generic ChildContent exist in current source. StartAddon and EndAddon are the supported slots.

### Inherited public and framework surface

The public contract is larger than the six parameters declared directly on `TextField`. The current source inheritance chain contributes the following members:

| Member | Origin | CLR shape / behavior | API classification |
| --- | --- | --- | --- |
| `Value` | `InputBase<string?>` | `string?`; current value | Blazor parameter; supports `@bind-Value` |
| `ValueChanged` | `InputBase<string?>` | `EventCallback<string?>` | Blazor parameter; paired with `Value` |
| `ValueExpression` | `InputBase<string?>` | `Expression<Func<string?>>` | Blazor parameter; drives `FieldIdentifier` and validation |
| `AdditionalAttributes` | `InputBase<string?>` | `IReadOnlyDictionary<string, object>?` capture-unmatched-values | Blazor parameter; forwarded to the native input/textarea except `class` |
| `DisplayName` | `InputBase<string?>` | `string?` | Blazor parameter; validation/display text |
| `Class` | `BluentInputComponentBase<string?>` | `string?` | Bluent parameter; applied to wrapper class list |
| `Style` | `BluentInputComponentBase<string?>` | `string?` | Bluent parameter; applied to wrapper `style` |
| `StartAddon` / `EndAddon` | `BluentFieldComponentBase<string?>` | `RenderFragment?` | Bluent parameters; separate leading/trailing wrapper slots |
| `Size` | `BluentFieldComponentBase<string?>` | `FieldSize`, default `Medium` | Bluent parameter; `Small`, `Medium`, `Large` |
| `BindValueEvent` | `BluentFieldComponentBase<string?>` | `string`, default `onchange` | Bluent parameter; selects the native value-binding event |
| `Element` | `BluentInputComponentBase<string?>` | public `ElementReference?`, `[DisallowNull]` | Public component property populated by `@ref`; not a `[Parameter]` |
| `Id` | `BluentInputComponentBase<string?>` | public getter / protected setter | Public derived identity; caller id wins, otherwise generated/member-name behavior |
| `Field` | `BluentInputComponentBase<string?>` | public `FieldIdentifier` getter | Public read-only projection of the inherited `FieldIdentifier` |
| `EditContext` / `FieldIdentifier` / `CssClass` | `InputBase<string?>` | framework context and computed members | Inherited framework behavior; not TextField-specific parameters |
| `DomHelper` | `BluentInputComponentBase<string?>` | protected injected `IDomHelper?` | Internal inherited service dependency; used for accesskey platform hint behavior |

The base implementation synthesizes a temporary `ValueExpression` when none is supplied outside an `EditForm`, filters unmatched `class` out of native attributes, composes `Class` and `CssClass` on the wrapper, and obtains the native `name` through `NameAttributeValue`. The current disabled CSS helper checks the unmatched `disabled` value; no separate TextField `Disabled` or `ReadOnly` parameter exists. `Element`, `Field` and `Id` are public members but are not consumer-settable Razor parameters.

### Fluent counterpart and Bluent-extension map

| Existing Bluent API / behavior | Closest Fluent counterpart | Disposition for v3 review |
| --- | --- | --- |
| Value / ValueChanged / ValueExpression | React Input value/defaultValue/onChange; Web Components form-connected native text field | Preserve native text entry, but keep Blazor InputBase/EditContext as the framework contract; do not imitate React controlled-state signatures. |
| StartAddon / EndAddon | React Input contentBefore / contentAfter | Visual/slot analogue. Decorative content stays non-focusable; action buttons are independent controls with their own accessible names and tab stops. |
| Size = Small/Medium/Large | React Input Small/Medium/Large | Shared three-size visual axis; final v3 dimensions/typography still belong to #418. |
| disabled / readonly unmatched attributes | Native input disabled / readonly semantics | Preserve native behavior: disabled is not focusable; readonly remains focusable and selectable. Keep them as distinct states. |
| Rows | Fluent Textarea, not Fluent Input/Text Field | Bluent's combined TextField API switches from input to textarea; document as a Bluent composition/extension, not an Input prop parity claim. |
| ResizeTextarea | Native textarea resize behavior | Bluent-specific convenience flag; test resize enabled/disabled with real textarea markup. |
| GainFocus | Programmatic native element focus | Bluent-specific first-render behavior; no equivalent TextField prop is documented by the selected references. Validate interactive render/hydration/navigation behavior. |
| DigitOnly / AsciiDigits / ArabicToPersianConversion | No matching Input/Text Field API identified | Bluent-specific text transformation extensions. Preserve the v2 order and test keyboard, paste, IME, cursor and culture behavior. |
| BindValueEvent | Framework event binding | Blazor-specific configurable onchange/oninput behavior; do not expose it as a Fluent appearance or generic DOM prop. |
| Label / validation association | Fluent React Field + Label + validationMessage | Bluent currently composes a separate Label and InputBase/EditContext validation. Keep persistent visible labels and stable described-by/invalid semantics; placeholder alone is not a label. |
| Class / Style / unmatched attributes | Native input props and root/input slots | Preserve appropriate consumer attributes, but document root vs native-control styling ownership explicitly in the eventual v3 API. |

This table is a source-backed disposition, not a proposed final v3 parameter list. A Bluent-only extension may be retained, renamed, decomposed or deprecated only through the component API review and migration decision; do not silently drop it to look more like a Fluent API.

### Exact text transformation behavior and order

The current ValueStringProxy setter delegates to the internal, rendering-independent `TextFieldValuePipeline.Normalize` helper. The helper applies enabled transforms in this exact order:

1. DigitOnly → ToDigits(): preserves ASCII, Persian and Arabic-Indic digits, removing other characters.
2. AsciiDigits → ToAsciiDigits(): maps Persian and Arabic-Indic numerals to ASCII.
3. ArabicToPersianConversion → ToPersianChars(): with default normalization, maps Arabic kaf to Persian kaf and Arabic yeh/alef maksura to Persian yeh; it is not full Arabic normalization.

All three flags default to false. **Current-API regression evidence (2026-11-13):** all eight boolean combinations (none, each single flag, each pair and all three) now have live Component Lab specimens. Each of the four multi-flag combinations has a real native browser Ctrl+V clipboard test. `DigitOnly + AsciiDigits` filters to decimal digits and then yields ASCII `123456`; `DigitOnly + ArabicToPersianConversion` filters first, normalizes Arabic kaf/yeh, and keeps the original Persian/Arabic-Indic digit script (`۱۲٣٤56`). `AsciiDigits + ArabicToPersianConversion` and the three-flag pipeline are also covered by real paste; the three-flag pipeline has an additional native browser text-insertion/bound-model check. This does **not** prove physical OS IME stability. A separate Chromium CDP Input.insertText observation on 2026-11-13 measured the current v2 caret: with `AsciiDigits=true` and value `12345`, inserting Persian `۹` at `selectionStart=selectionEnd=2` produced the correct normalized value `129345` but left `selectionStart=selectionEnd=6` (the end of the string), rather than the expected mapped index `3`. This is an observed current-v2 limitation under CDP text insertion, not physical OS IME evidence. TF-TRANSFORM-005 now defines the v3 caret/selection requirement. The `insertCompositionText`/`isComposing` case remains synthetic DOM observation only. Do not silently reorder this pipeline.

### Native markup and lifecycle

- The wrapper renders optional start-addon div, then input or textarea, then optional end-addon div.
- Both native modes receive forwarded attributes, input id, name, ElementReference, ValueStringProxy binding and BindValueEvent.
- The inherited input base supplies Blazor validation semantics and filters the unmatched class attribute while forwarding other attributes.
- GetInputId honors a caller-provided id; otherwise it uses the bound expression's member name. TextField does not itself render a visible label.
- GainFocus uses ElementReference.FocusAsync() on first render. Verify that it does not steal focus after hydration/navigation and is invoked only in an interactive context.
- The inherited accesskey behavior obtains platform information after first render through IDomHelper and may append a platform-specific shortcut hint to the placeholder. This is shared base behavior, not TextField-specific JavaScript.
- No TextField-specific JavaScript module or cleanup/disposal path was found in the current v2 implementation.

## 3. Existing v2 styling observations

Read from src/Bluent.UI/Styles/Components/_field.scss on the task base:

- The common shell uses inline-flex, logical inline padding, shared background, 1px neutral border and a 2px accessible bottom border.
- Medium uses 32px minimum height; Small 24px; Large 40px. These are measured v2 values, not approved v3 dimensions.
- Native input/select/textarea flex to remaining width. Addons use a minimum width based on field min-height.
- Hover, active and focus-within update shell border colors. Focus animates an ::after compound-brand underline.
- Disabled wrapper and native disabled control have separate styling hooks. The stylesheet has no equally explicit ReadOnly wrapper-state contract.
- Textarea resize is controlled by .no-resize > textarea { resize: none; }.

v3 audit notes (do not patch v2 in this issue):

- The v2 stylesheet is shared by several field components and is not a v3 semantic contract.
- Current focus changes the full wrapper border and also draws an underline; the v3 draft intentionally moves toward underline-only active focus.
- The existing start-addon spacing rule contains a misspelled teaxtarea sibling selector; verify the correct textarea selector in v3.
- ReadOnly must use native readonly semantics and must not be conflated with disabled. The current IsDisabled helper checks only disabled.

## 4. v3 design-to-implementation contract

### Required semantics

- Continue to use native input and textarea elements; do not replace them with contenteditable or a custom keyboard widget.
- Preserve InputBase<string?> binding and EditContext validation unless a separately reviewed breaking/API decision is recorded.
- Preserve label/id association and unmatched native attribute forwarding, including appropriate aria-* attributes.
- Define predictable label, required indication, helper/description, invalid message and addon composition, with stable IDs and aria-describedby/invalid semantics where applicable.
- Avoid nesting interactive addons inside another interactive element.
- Disabled is non-editable and not focusable; ReadOnly remains focusable/selectable and does not mutate the model.
- Focus visibility must remain clear for keyboard users and must not be conflated with hover/pressed.
- Addon positions use logical properties so visual leading/trailing placement mirrors in RTL without changing semantic DOM order.

### Proposed design axes

Penpot axis names are design descriptors, not accepted public C# enum names or markup parameters.

| Axis | Draft values | Runtime requirement |
| --- | --- | --- |
| Appearance | Outline, Filled lighter, Filled darker, Underline | Explicit state handling; approved #418 tokens only |
| State | Rest, Hover, Pressed, Focus, Error, Disabled, ReadOnly | Prefer native pseudo-classes and actual Blazor validation/native state |
| Size | Small, Medium, Large | Measure against accepted density/token scale; v2 px values are compatibility reference only |
| Control mode | Single-line input, multiline textarea | Native semantics and attributes in both branches |

Do not publish proposed parameters such as Appearance, ReadOnly, HelperText, ErrorMessage, Required, a new size enum or focus callbacks as real v3 API until source/API review accepts them. Some behaviors may be composed from native attributes, Label, validation components or render fragments instead.

### Visual and accessibility rules

- Focus: 2px active underline in the approved brand focus color; no extra full-rectangle outline. Verify contrast in every approved brand/mode and use a non-color-only cue if needed.
- Error: expose readable validation text and semantic invalid state; do not rely on red alone.
- Disabled: subdued treatment, native disabled semantics and no keyboard tab stop.
- ReadOnly: visible and selectable value, native readonly semantics and normal focusability; not a disabled look.
- Forced colors: allow system-color remapping and verify actual browser/OS behavior.
- Reduced motion: keep focus understandable without animation and honor prefers-reduced-motion.
- RTL/mixed direction: CSS logical properties; verify Persian/Arabic text, Latin identifiers, digits and punctuation in the browser.
- Responsive: test 320px width, 200–400% zoom/reflow, long labels, helper/error wrapping, addons, textarea and narrow flex/grid parents.
- Keyboard: test Tab/Shift+Tab, focus-visible, disabled skipping, ReadOnly focus/selection, Enter form behavior and interactive addons as independent tab stops only when appropriate.
- Accessible naming: pair with Label or another explicit naming mechanism; associate helper/error via stable relationships and verify actual DOM and screen-reader output.

## 5. Demo and test coverage to build

The #421 Component Lab platform is reusable infrastructure, not complete TextField acceptance. On 2026-11-13 the existing current-API TextField pilot was expanded to **21 live specimens**. The three transform flags have all **eight on/off combinations** represented, and each of the four multi-flag combinations has real native Ctrl+V coverage. The suite has **28 explicitly named TextField-targeted checks per run**. Final local Dev01 matrix: Chrome/Edge WebAssembly **278/278 full shared-Lab assertions each**, and Chrome/Edge published InteractiveServer **275/275 each**, aggregate **1106/1106** across all four runs. The 28 TextField checks are a subset of those totals, not an additional count. Every run recorded no browser JS errors and owned profile cleanup `remaining=0`; both Server runs completed SignalR WebSocket HTTP 101. The dedicated fixture verifies every transform combination; a named EndAddon button remains independently focusable/enabled beside a disabled input, receives the next Tab stop and activates once with Enter; form validation, `GainFocus`, `onchange`, attributes and label associations remain covered. Synthetic DOM composition is not a physical OS IME test. Exact-head GitHub CI on commit `160c26bc3a0fcc482e78080bfdcd3062ff4942d8` passed **23/23 checks across seven workflows**, including Release build/tests/five-package validation, Component Lab, compatibility browsers, Popover, Button runtime, source/census and docs. The first Edge/WASM native-site-zoom attempt exposed a transient Chart.js startup canvas snapshot/label-focus failure; the isolated retry passed Edge at native site zoom 200% and 400% (`10/10` each, overflow 0, cleanup remaining 0), with the full exact-head workflow green. This remains v2/current-API regression evidence only: it does not implement the v3 TextField, prove approved design parity or complete the exhaustive scenario matrix below.

Component-specific demo scenarios:

1. Basic single-line binding with onchange and live oninput.
2. All three sizes and four appearances.
3. StartAddon, EndAddon and both together, including an interactive addon.
4. Textarea with multiple row counts and resize enabled/disabled.
5. Disabled and ReadOnly side-by-side, including selection and tab behavior.
6. EditForm with DisplayName, validation success/error and description associations.
7. Custom id/name, placeholder, type, autocomplete, accesskey and aria-* forwarding.
8. Initial GainFocus in an interactive route and navigation/hydration regression.
9. Each digit/Arabic-character flag individually and in combinations, including paste, mixed scripts and culture.
10. LTR, RTL/Persian, mixed Latin identifiers, Light/Dark, supported brands and forced-colors.
11. 320px layout, 200–400% zoom, long helper/error text and narrow parent constraints.
12. Keyboard/touch operation, browser console and assistive-technology naming/description.

### Executable acceptance scenarios to implement after the gates

The following 24 IDs are stable design/test-plan identifiers. They are **not evidence that a test has already run**. Each scenario must be implemented in the dedicated TextField demo and backed by unit/integration/browser evidence as appropriate.

| ID | Scenario / setup | Expected behavior to assert | Evidence layer |
| --- | --- | --- | --- |
| TF-BIND-001 | Native single-line input with default BindValueEvent | onchange updates Value/ValueChanged through InputBase; no duplicate model update. | bUnit/integration + browser |
| TF-BIND-002 | Same input with BindValueEvent=oninput | Each committed input edit updates the bound value; EditContext notifications are correct and not duplicated. | bUnit/integration + browser |
| TF-NATIVE-001 | Custom id/name/type/placeholder/autocomplete/data-* / aria-* | Native attributes land on the actual input, not only the wrapper; caller id wins over generated id. | rendered DOM + browser |
| TF-NATIVE-002 | Class and Style plus unmatched class attribute | Class/Style remain on the intended root; the unmatched class is not duplicated or forwarded incorrectly to the native control. | rendered DOM + computed style |
| TF-FIELD-001 | Label + TextField inside EditForm | Label targets the actual native input id; validation is associated with the field and does not depend on placeholder text. | rendered DOM + browser AX tree |
| TF-ADDON-001 | StartAddon only, EndAddon only, both | Logical placement, spacing and input shrink behavior are correct at LTR and RTL. | browser screenshot + DOM |
| TF-ADDON-002 | Interactive Button inside StartAddon or EndAddon | It is an independent focusable control with its own accessible name and tab stop; parent focus is not stolen. | keyboard + browser AX tree |
| TF-MODE-001 | Rows unset, then Rows=3 | First render is input; second scenario is native textarea with rows=3 and the same binding/attribute contract. | rendered DOM + browser |
| TF-MODE-002 | Textarea with ResizeTextarea false and true | False suppresses native resizing; true retains browser resizing; addon spacing selector works for textarea. | browser interaction + computed style |
| TF-STATE-001 | disabled vs readonly side-by-side | Disabled cannot receive focus/edit; readonly remains focusable/selectable and does not change the model. | keyboard + browser DOM |
| TF-FOCUS-001 | GainFocus=true on initial interactive render | Native control receives focus once on first interactive render; it does not steal focus on subsequent parameter changes/navigation. | WASM + InteractiveServer browser |
| TF-TRANSFORM-001 | DigitOnly=true, input A۱۲٣٤-09 | Result is ۱۲٣٤09: keep ASCII/Persian/Arabic-Indic digits and remove all non-digits. | unit + browser |
| TF-TRANSFORM-002 | AsciiDigits=true, input ۱۲۳٤٠١ | Result is 123401; ASCII input remains unchanged. | unit + browser / culture matrix |
| TF-TRANSFORM-003 | ArabicToPersianConversion=true, input كيى | Result is کیی under current default ToPersianChars normalization. | unit + fa-IR browser |
| TF-TRANSFORM-004 | All transform flags enabled, mixed scripts/paste/IME | Existing setter order remains DigitOnly → AsciiDigits → ArabicToPersianConversion; verify all transforms during native paste and composition commit/cancel without treating synthetic DOM events as native IME proof. | unit + manual browser |
| TF-TRANSFORM-005 | Mid-string digit normalization (value 12345; insert Persian ۹ after 12) | Result is 129345 and the collapsed caret remains after the normalized inserted character (index 3); map selectionStart/selectionEnd through the normalized prefix instead of unconditionally moving to the end. For a selected range, preserve the mapped selection boundaries. | Chromium CDP Input.insertText + browser selection readback; repeat for RTL and applicable transforms |
| TF-VALID-001 | Required/invalid state while unfocused | Native required/aria-invalid state and readable validation message are associated; danger border is not the only cue. | EditContext + DOM + browser AX |
| TF-VALID-002 | Invalid input while focused | Focus underline remains the active visual cue while invalid semantics and the readable error remain present. | browser screenshot + DOM/AX |
| TF-KBD-001 | Tab/Shift+Tab, Enter and addon controls | Focus order follows semantic DOM; disabled is skipped; readonly remains reachable; Enter follows normal form semantics. | real keyboard browser test |
| TF-RTL-001 | Persian label/value, Latin identifier, mixed digits and punctuation under dir=rtl | Logical addons mirror; text bidi remains usable; DOM reading order is unchanged. | fa-IR browser screenshot + DOM |
| TF-RESP-001 | 320px viewport, narrow grid/flex parent and 200–400% zoom | Input shrinks without horizontal clipping; label/helper/error wrap; textarea and addons remain usable. | real browser screenshot/overflow probe |
| TF-THEME-001 | Light/Dark across supported brand set | Text, stroke, surface and focus roles resolve through approved #418 aliases; filled boundary ≥3:1 against the immediate host surface. | ten-brand browser matrix + contrast audit |
| TF-A11Y-001 | Windows forced-colors / contrast theme and reduced-motion | Native/system colors keep boundary and focus visible; disabled uses system disabled color; transition does not animate when reduced motion is requested. | native OS/browser + computed styles |
| TF-RENDER-001 | Interactive WebAssembly and InteractiveServer | Binding, initial focus, validation, native attributes and disposal behave in both supported interactive render modes. | Chrome/Edge × WASM/Server |

Negative controls should also cover: missing accessible name; placeholder used as the only label; readonly treated as disabled; clickable addon without a name; textarea without Rows; DigitOnly removing letters; and error+focus incorrectly drawing a second full-rectangle ring.| Evidence layer | Required proof | Current status |
| --- | --- | --- |
| Source/API | v2 API inventory and field CSS | Verified for v2 baseline |
| Design | 28 linked appearance/state variants and four owned review boards | Draft design complete; not signed off |
| Build | v3 Release build with zero warnings | Not run for TextField; no v3 runtime code |
| Unit/integration | binding, EditContext, invalid/valid transitions, addons, sizes, textarea, transforms and native attributes | Not implemented |
| Browser/DOM | native semantics, focus, validation relationships, RTL, responsive and theme state | Not run |
| Visual | screenshots across states, sizes, themes, widths and directions | Penpot exports only; browser visual evidence not run |
| Keyboard/AT | Tab/Shift+Tab, readonly/disabled, accessible naming and descriptions | Not run |
| Forced colors/motion | actual browser/OS forced-colors and reduced-motion | Not run |
| Pack/migration | affected package contents and v2→v3 compatibility mapping/rollback | Not run |

Add a component-specific Skill only after a real v3 API and canonical reference exist. Until then, the v3 router can link to this draft, but must not imply a supported API.

## 6. Dependencies, gating and next steps

Live GitHub Project #5 checked on 2026-11-13:

- #417 architecture: Done.
- #419 Penpot workflow: Done.
- #420 Blazor conventions: Done.
- #425 quality gates: Done.
- #421 Component Lab / 66-family ledger: In progress; platform exists, but the TextField pilot is not exhaustive.
- #418 tokens/themes: Review; exact token names/values and production mappings still await acceptance.
- #432 TextField: In progress.

Exact-head engineering verification on `160c26bc3a0fcc482e78080bfdcd3062ff4942d8`: **23/23 GitHub checks passed across 7 workflows**. The Edge/WebAssembly native-site-zoom job passed on isolated retry: 200% and 400% each 10/10, zero settled overflow, zero cleanup residue. The complete checks are linked from [PR #562](https://github.com/vrassouli/Bluent/pull/562).

The Penpot working file contains four #432 review pages (17–20): full appearance/state matrix, anatomy/sizing/RTL, keyboard/forced-colors/reflow, and Fluent crosswalk/composite state rules. All four corresponding #432 boards remain explicitly **DRAFT**. The design pages are evidence of a reviewable proposal, not approval. #418 remains Review and #421 remains In progress; therefore final token mapping and the shared demo/coverage contract are not complete prerequisites.

The accepted #417 architecture and completed #419 design workflow are not substitutes for #418 token acceptance. This document and Penpot boards may progress with visible provisional annotations. Runtime CSS consuming new semantic/component token aliases must wait for actual #418 acceptance and the current bluent-v3 integration.

Next sequence:
1. Review the TextField API/design contract, including additive v3-only parameters.
2. Wait for #418's approved token schema/mappings; update this isolated task branch from the accepted bluent-v3 head only when required and reviewed.
3. Implement native Blazor/CSS from the reviewed contract; add automated coverage, exhaustive Component Lab fixtures, canonical component reference and migration ledger entry.
4. Run zero-warning Release build/tests, pack checks, browser visual/keyboard/RTL/theme/forced-colors validation and available assistive-technology tests.
5. Open a PR from v3/issue-432-textfield to bluent-v3. Do not merge into Dev, publish stable packages or close #432 from this task branch.

**Current boundary (2026-11-13):** design/API audit plus current-API Lab regression coverage are active; v3 runtime implementation and Fluent-parity acceptance are not complete. The expanded Lab evidence must not be represented as v3 component acceptance.


## 7. Automated source/API drift guard

The v3 Documentation Contract workflow now runs `scripts/quality/check_v3_textfield_contract.py` and `test_v3_textfield_contract.py` whenever the TextField component, either inherited Bluent field/input base, this contract, or the guard itself changes. The fail-closed checker verifies:

- The exact six direct `[Parameter]` names, CLR types and documented defaults.
- The concrete inheritance chain `TextField → BluentFieldComponentBase<string?> → BluentInputComponentBase<string?> → InputBase<string?>` and the six Bluent-owned inherited parameters (`StartAddon`, `EndAddon`, `Size`, `BindValueEvent`, `Class`, `Style`).
- The inherited framework/public surface rows in this document, native input and textarea branches, `@ref`/binding event wiring, and unmatched-attribute behavior.
- The setter transform order (`DigitOnly → AsciiDigits → ArabicToPersianConversion`) and the documented distinction between current-API regression evidence and future v3 acceptance.
- Workflow path filters and the actual CI step invoking the checker/tests, so the guard cannot quietly stop running when its source or API docs change.

Twelve local source/API guard tests include positive source/documentation parity and negative mutations for direct/inherited API drift, transform reordering, native textarea removal, evidence overclaiming and CI trigger removal. In addition, the NUnit suite now has ten direct tests of the internal value pipeline: all eight transform-flag combinations plus null and empty input. Negative source-guard mutations run against temporary copies and do not modify the working tree. These tests protect the existing transform behavior; they are not browser, caret/IME, v3 component implementation or design-approval evidence.


## 8. Penpot model audit and contrast findings — 2026-11-13

A source-model audit was performed against the connected **Bluent v3 Design System** file (Penpot file ID b64f6665-c9ab-80b5-8008-c4ac99d9d000). The authoritative TextField boards are:

| Penpot page | Board | Scope |
| --- | --- | --- |
| 17 · TextField full matrix | 343383cb-23d3-80b8-8008-ec424306af65 | 7 states × 4 appearances |
| 18 · TextField anatomy, sizing & RTL | 343383cb-23d3-80b8-8008-ec43be3b98e5 | Input/textarea anatomy, addons, sizes and direction |
| 19 · TextField keyboard, contrast & reflow | 343383cb-23d3-80b8-8008-ec440d2d8ed7 | Keyboard, forced-colors and responsive acceptance intent |
| 20 · Fluent crosswalk & state precedence | 343383cb-23d3-80b8-8008-ec45d29ff553 | Web Components versus React reference scope and composite states |

### Structural/model results

- Page 17 exposes all **28 unique State × Appearance combinations** (Rest, Hover, Pressed, Focus, Error, Disabled, ReadOnly × Outline, Filled lighter, Filled darker, Underline); no duplicate pairing was found.
- The four boards have **zero descendants outside their board bounds** by the measured shape geometry.
- The source variant container on page 16 has the intended State and Appearance properties and 28 combinations. Four variant components still expose non-empty Penpot variantError metadata (IDs: e31294c6-7c55-805f-8008-c5126f8392cc, e31294c6-7c55-805f-8008-c5126f8822cf, e31294c6-7c55-805f-8008-c5126f8c17f3, e31294c6-7c55-805f-8008-c5126f8f4697). Their variantProps still report the intended state/appearance values; this is a component-name/variant metadata defect, not evidence that the property mapping itself is wrong.
- No Penpot shapes, text, fills, sizes, or positions were changed during this audit.

### Text contrast calculation from page 17 fills

The calculation uses the actual input-surface rectangle containing each text node, not the outer board/card background. It applies the WCAG relative-luminance contrast formula to the stored foreground and surface hex fills. The 28 sample text nodes consist of 24 placeholders and four ReadOnly values.

| Appearance / state | Foreground on surface | Measured contrast | Result |
| --- | --- | ---: | --- |
| Outline / active five states | #62758a on #ffffff | 4.74:1 | Meets 4.5:1 |
| Filled lighter / active five states | #62758a on #ffffff | 4.74:1 | Meets 4.5:1 |
| Underline / active five states | #62758a on #ffffff | 4.74:1 | Meets 4.5:1 |
| Filled darker / Rest, Hover, Pressed, Focus, Error | #62758a on #f5f5f5 | **4.347:1** | **Below 4.5:1; design correction required** |
| Disabled / four appearances | #a3a3a3 on #ffffff or #f5f5f5 | 2.314–2.523:1 | Disabled-state contrast exception; retain as an explicit review item |
| ReadOnly / four appearances | #424242 on #ffffff or #f5f5f5 | 9.218–10.05:1 | Meets 4.5:1 |

The five active Filled darker placeholder samples share the same 4.347:1 result. This is a **design finding**, not a production-code defect or approval of an alternative color. Do not choose a replacement hex value or consume a new semantic token here; resolve the foreground/surface pair in the authoritative design after #418 approves the token mapping.

The dark anatomy sample and the black forced-colors sample were separately checked against their actual inner surfaces (#292929 and #000000 respectively); the earlier apparent low-contrast readings against the outer light board background were false positives from using the wrong comparison surface.

### Visual-export limitation and acceptance boundary

Penpot model inspection and SVG markup generation succeeded. The Penpot PNG export endpoint failed with a network fetch error, and attempts to activate the TextField pages through openPage timed out. Consequently this is **model/geometry/contrast evidence only**: no fresh PNG visual review, rendered-pixel parity review, or maintainer visual sign-off is claimed. All four boards remain **DRAFT**. The four variant metadata defects and the Filled darker placeholder contrast finding remain open for design review.

#418 remains Review, with token vocabulary/values and production mappings awaiting acceptance. #432 remains In progress. This audit does not authorize v3 runtime CSS, merge, package publication, deployment, or changes to stable/v2 branches.

## TextField #432 — Penpot PNG export and visual review follow-up — 2026-11-13

This is a follow-up to the earlier export limitation recorded in section 8. The Penpot connection was restored and all four current TextField boards were opened and successfully exported as PNG from the connected **Bluent v3 Design System** file (file ID `b64f6665-c9ab-80b5-8008-c4ac99d9d000`).

| Page | Board | Visual review |
| --- | --- | --- |
| 17 · TextField full matrix | `343383cb-23d3-80b8-8008-ec424306af65` | Reviewed the complete 7-state × 4-appearance matrix; all 28 pairings are present, aligned and visually readable. |
| 18 · TextField anatomy, sizing & RTL | `343383cb-23d3-80b8-8008-ec43be3b98e5` | Reviewed single-line input/addons, textarea, three density sizes, Persian RTL/logical addon placement and light/dark sample surfaces. |
| 19 · TextField keyboard, contrast & reflow | `343383cb-23d3-80b8-8008-ec440d2d8ed7` | Reviewed keyboard/semantic-state intent, focus indicator, forced-colors specimen, responsive narrow layout and acceptance checklist. |
| 20 · Fluent crosswalk & state precedence | `343383cb-23d3-80b8-8008-ec45d29ff553` | Reviewed the Web Components versus React reference boundary, appearance disposition and composite state precedence. |

The earlier PNG endpoint failure and `openPage` timeout were transient session/tool failures; they are superseded by the successful exports and visual review above. This is visual review of the editable Penpot proposal only, not a browser/runtime screenshot, pixel parity acceptance, accessibility sign-off or maintainer approval. All four boards remain explicitly **DRAFT**.

### Remaining design findings

- The four non-empty `variantError` records on page 16 remain unresolved: `e31294c6-7c55-805f-8008-c5126f8392cc`, `e31294c6-7c55-805f-8008-c5126f8822cf`, `e31294c6-7c55-805f-8008-c5126f8c17f3`, `e31294c6-7c55-805f-8008-c5126f8f4697`. Their `variantProps` still expose the intended State/Appearance pairs. A reversible probe changed one State value to `RepairProbe` and restored it; the `variantError` did not clear. A reversible probe of the library element's `name` setter also had no effect. The API exposes `variantError` as a getter without a setter. No persistent property/name change was left behind. Do not rebuild or transform the component set merely to suppress these diagnostics without a reviewed migration plan.
- The five active Filled darker placeholder samples remain **4.347:1** (`#62758a` on `#f5f5f5`), below 4.5:1 for normal text. No replacement color was chosen. Resolve the foreground/surface pair against the exact, maintainer-approved #418 semantic mapping; do not consume preview-only tokens.
- Disabled examples remain separately scoped to disabled controls and are not reclassified as ordinary text failures. ReadOnly values and dark/forced-colors sample pairs passed against their actual inner surfaces.

No persistent Penpot shapes, fills, dimensions, positions or component mappings were modified during this follow-up. No runtime API, Razor, C#, CSS, token or package change is authorized by this design review.

## TextField #432 — repair Penpot variant-name metadata and placeholder token decision request — 2026-11-13

### Page-16 variant metadata repair

The four non-empty `variantError` diagnostics reported in the previous audit have now been repaired in the owned **Bluent v3 Design System** Penpot file (`b64f6665-c9ab-80b5-8008-c4ac99d9d000`). Root cause: the invalid-name diagnostics are stored against the library variant component, and the repair must rename the original main-instance shape while its owning source page is active. Updating the `LibraryElement.name` wrapper or editing a component from a different active page does not repair this metadata.

- Activated source page 16, `16 · Bluent TextField variants` (`e31294c6-7c55-805f-8008-c51213e75deb`).
- For each of the four affected variants, set the original main-instance shape name to the existing property-pair syntax (`State=<value>, Appearance=<value>`). This clears Penpot’s invalid-name metadata without changing `variantProps`.
- Repaired component IDs: `e31294c6-7c55-805f-8008-c5126f8392cc`, `e31294c6-7c55-805f-8008-c5126f8822cf`, `e31294c6-7c55-805f-8008-c5126f8c17f3`, and `e31294c6-7c55-805f-8008-c5126f8f4697`.
- Switched away from page 16 and reopened it before verifying persistence.

Final source-model verification: **28 components, 28 unique State × Appearance pairs, zero non-empty `variantError` values**, and all State/Appearance values remain within the expected seven/four enumerations. No variant property, visual fill, size, position, text content or component membership was changed. The earlier audit entries documenting the original four errors remain as historical evidence; this follow-up supersedes their “still open” status.

### Filled darker placeholder — measured alternatives, no token selection

The current page-17 Filled darker placeholder sample remains `#62758a` on its immediate `#f5f5f5` input surface (**4.3472:1**). The #418 branch schema currently has no explicit TextField placeholder semantic/component alias. I inspected the ten emitted theme CSS files in both Light and Dark modes (20 brand×mode outputs); the neutral source values are shared across all ten emitted brand themes.

| Existing Fluent source role | Light value | Contrast on #f5f5f5 | Dark value | Contrast on #292929 |
| --- | ---: | ---: | ---: | ---: |
| `--colorNeutralForeground4` | `#707070` | 4.5423:1 | `#999999` | 5.1064:1 |
| `--colorNeutralForeground3` | `#616161` | 5.6807:1 | `#adadad` | 6.4827:1 |

The investigation also found Fluent React v9 placeholder usage of `--colorNeutralForeground4` in [Fluent UI discussion #34002](https://github.com/microsoft/fluentui/discussions/34002). This is useful compatibility evidence, not a universal Fluent contract: the #432 crosswalk distinguishes Fluent React Input from Fluent Web Components TextField. FG4 narrowly passes the current light Filled darker specimen; FG3 gives more contrast headroom but is visually stronger.

A downstream decision request was posted to #418 PR #500 (comment `6855027097`) asking the foundation owner to choose between the closer React-aligned FG4 role, the higher-contrast FG3 role, or a dedicated placeholder semantic role with an explicitly selected source mapping. This is a request for review, not an approval. No Penpot placeholder color, #418 token schema, opt-in CSS, production CSS, or runtime code was changed.

#418 remains Review and PR #500 remains open. TextField placeholder styling stays gated until the shared semantic role/source mapping and design are explicitly accepted.

### Editable Penpot comparison board — placeholder source roles

Added a separate, explicitly **DRAFT** decision aid below the existing page-19 acceptance board in the same owned Penpot file. It does not alter the original keyboard/contrast/reflow board or any of the 28 TextField state/appearance specimens.

- Page: `19 · TextField keyboard, contrast & reflow` (`343383cb-23d3-80b8-8008-ec440d228749`).
- New board: `#432 · Placeholder role comparison · DRAFT` (`07d10be0-910e-8048-8008-f09180896f55`), 1850 × 540.
- The board presents the current 4.3472:1 baseline and side-by-side FG4/FG3 candidate source roles with the measured Light/Dark immediate-surface pairs. It explicitly states that neither option is approved and asks #418 to decide the semantic role/source mapping.
- All 25 children are within the board bounds. A PNG export was generated and visually reviewed; labels, swatches, measured ratios and the decision gate are readable.

This is an editable comparison/review aid only. It adds no Penpot design token, changes no token binding or placeholder color, and is not a design approval. See #418 PR #500 downstream request comment `6855027097`.
## TextField #432 — exact pinned Fluent placeholder source and corrected Filled darker contrast — 2026-11-13

### Exact upstream version verification

Downloaded the exact pinned `@fluentui/web-components@3.1.3` package with `npm pack` and inspected its compiled `dist/esm/text-input/text-input.styles.css` (package metadata confirms version 3.1.3). The npm tarball integrity `sha512-1jl4CHoFFSfevkr8l7F+dKNJzyMWBZqwQfB/khNZtwyY0rv87799mpDWSVu0QeiZAFEbqCtnAOnXWsxJ/kek+Q==` matches the frozen #552 package-version evidence.

The exact pinned CSS confirms:
- `.control::placeholder` → `var(--colorNeutralForeground4)` (CSS line 82).
- Disabled placeholder selector → `var(--colorNeutralForegroundDisabled)` (lines 129–132).
- `[appearance=filled-darker] .root` background → `var(--colorNeutralBackground3)` (lines 193–194).

This is direct evidence from the pinned package, not current Fluent `master` or a React-only comparator.

### Correct Filled darker contrast comparison

The prior comparison used the wrong Dark surface (`colorNeutralBackground1`, `#292929`). The exact Fluent 3.1.3 Filled darker surface is `colorNeutralBackground3`; the emitted #418 themes use `#f5f5f5` in Light and `#141414` in Dark. All ten emitted brand themes share these neutral role values per mode.

| Source role | Light foreground / BG3 | Light contrast | Dark foreground / BG3 | Dark contrast |
| --- | --- | ---: | --- | ---: |
| `--colorNeutralForeground4` | `#707070` / `#f5f5f5` | **4.5423:1** | `#999999` / `#141414` | **6.4663:1** |
| `--colorNeutralForeground3` | `#616161` / `#f5f5f5` | **5.6807:1** | `#adadad` / `#141414` | **8.2092:1** |

The current TextField design sample remains `#62758a` on Light BG3 `#f5f5f5` (**4.3472:1**), below the 4.5:1 normal-text threshold. FG4 is the exact pinned Fluent Web Components placeholder role and passes both modes; the Light pair has only 0.0423:1 headroom. FG3 gives higher contrast but is a stronger visual treatment than the pinned upstream role. The exact pinned source separately maps disabled placeholder text to `colorNeutralForegroundDisabled`.

### Penpot comparison board updated

Updated the existing DRAFT comparison board on page 19: `#432 · Placeholder role comparison · DRAFT`, board `07d10be0-910e-8048-8008-f09180896f55`. Dark pairs now use BG3 `#141414` and ratios 6.4663:1 / 8.2092:1. Re-exported and visually reviewed the PNG. All 25 children remain within bounds. The source TextField matrix and its 28 specimens are unchanged; no token, binding, or production color was changed.

### Foundation decision request

Updated the downstream decision request on #418 PR #500 (comment `6855027097`) with the exact pinned package evidence. Recommendation: use FG4 as the source role for ordinary placeholders and FGDisabled for disabled placeholders, then have #418 approve the semantic/public placeholder mapping. FG3 remains a contrast-heavier departure option. The current #418 preview schema has no explicit TextField placeholder role, and no maintainer decision has been recorded; therefore #432 does not consume an unapproved token or implement CSS.
### Five-state visual comparison — current placeholder vs pinned FG4 proposal

Added a second separate **DRAFT** visual study below the page-19 decision aid in the same owned Penpot file:
- Page: `19 · TextField keyboard, contrast & reflow` (`343383cb-23d3-80b8-8008-ec440d228749`).
- Board: `#432 · Filled darker placeholder contrast study · DRAFT` (`07d10be0-910e-8048-8008-f095c3e3c41c`), 1850 × 520.

The board shows Rest, Hover, Pressed, Focus and Error as five separate columns. Each repeats the same immediate BG3 surface (`#f5f5f5`) with the current placeholder (`#62758a`, 4.3472:1) and the pinned-source FG4 candidate (`#707070`, 4.5423:1). The page keeps surface/layout unchanged and explicitly labels the FG4 treatment as a proposal, not an accepted product color. Disabled placeholder remains a separate FGDisabled role; ReadOnly shows a value rather than a placeholder.

The board has 53 children, **zero out-of-bounds shapes**, and its exported PNG was visually reviewed. The original page-17 28-variant source matrix and the earlier page-19 decision board are unchanged. After switching to page 16 and back to page 19, source verification still reports 28 variants / 28 unique pairs / zero `variantError` values.

No token binding, component variant, placeholder fill, product CSS or runtime source was changed. The #418 semantic/public mapping decision is still outstanding.

### Full four-board visual export review — 2026-11-13

Re-exported and visually inspected the four primary TextField design boards from the owned Penpot file (`b64f6665-c9ab-80b5-8008-c4ac99d9d000`):

| Page | Board | Visual review |
| --- | --- | --- |
| 17 · TextField full matrix | `343383cb-23d3-80b8-8008-ec424306af65` | All 28 appearance/state specimens and row/column labels are visible; state distinctions and immediate input surfaces are legible; no clipped field or label. |
| 18 · Anatomy, sizing & RTL | `343383cb-23d3-80b8-8008-ec43be3b98e5` | Single-line/addon, textarea, size, Persian RTL and light/dark anatomy sections export cleanly; explanatory captions are visible. |
| 19 · Keyboard, contrast & reflow | `343383cb-23d3-80b8-8008-ec440d2d8ed7` | Keyboard/native-state, schematic forced-colors, narrow reflow and acceptance checklist sections are legible; no clipped content. |
| 20 · Fluent crosswalk & precedence | `343383cb-23d3-80b8-8008-ec45d29ff553` | Primary Web Components scope is separated from React visual fallback; appearance mapping and composite-state precedence remain readable. |

No additional geometry or text clipping defect was identified in these exports. These are visual-export checks only: all four primary boards remain marked **DRAFT**, so this does not claim maintainer design approval, real-browser parity, native forced-colors acceptance, or assistive-technology sign-off.