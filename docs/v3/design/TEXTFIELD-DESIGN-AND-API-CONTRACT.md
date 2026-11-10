# TextField design and API contract — Issue #432

> **Status:** draft design/API audit, 2026-11-10. This is not a released v3 API, runtime implementation, or maintainer parity sign-off. Task branch: **v3/issue-432-textfield**, based on **bluent-v3** commit **bcd56ac8f6d8271f341747dbf2e6816fa768ff4f**.

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

### Token boundary

Penpot colors and dimensions are provisional review values. #418 is In progress and owns the final source → global → semantic → component token names, approved values, modes/brands and production aliases. Do not add production CSS that consumes draft-only values or invents final public token names before #418 acceptance.

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

### Exact text transformation behavior and order

The current ValueStringProxy setter applies enabled transforms in this exact order:

1. DigitOnly → ToDigits(): preserves ASCII, Persian and Arabic-Indic digits, removing other characters.
2. AsciiDigits → ToAsciiDigits(): maps Persian and Arabic-Indic numerals to ASCII.
3. ArabicToPersianConversion → ToPersianChars(): with default normalization, maps Arabic kaf to Persian kaf and Arabic yeh/alef maksura to Persian yeh; it is not full Arabic normalization.

All three flags default to false. Combined-flag behavior, cursor preservation, paste composition and IME interaction need explicit tests before claiming parity. Do not silently reorder this pipeline.

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

The #421 Component Lab platform is reusable infrastructure, not complete TextField acceptance. Its current pilot covers a normal input, short textarea and disabled field only.

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

| Evidence layer | Required proof | Current status |
| --- | --- | --- |
| Source/API | v2 API inventory and field CSS | Verified for v2 baseline |
| Design | 28 linked appearance/state variants and three owned review boards | Draft design complete; not signed off |
| Build | v3 Release build with zero warnings | Not run for TextField; no v3 runtime code |
| Unit/integration | binding, EditContext, invalid/valid transitions, addons, sizes, textarea, transforms and native attributes | Not implemented |
| Browser/DOM | native semantics, focus, validation relationships, RTL, responsive and theme state | Not run |
| Visual | screenshots across states, sizes, themes, widths and directions | Penpot exports only; browser visual evidence not run |
| Keyboard/AT | Tab/Shift+Tab, readonly/disabled, accessible naming and descriptions | Not run |
| Forced colors/motion | actual browser/OS forced-colors and reduced-motion | Not run |
| Pack/migration | affected package contents and v2→v3 compatibility mapping/rollback | Not run |

Add a component-specific Skill only after a real v3 API and canonical reference exist. Until then, the v3 router can link to this draft, but must not imply a supported API.

## 6. Dependencies, gating and next steps

Live GitHub Project #5 checked on 2026-11-10:

- #417 architecture: Done.
- #419 Penpot workflow: Done.
- #420 Blazor conventions: Done.
- #425 quality gates: Done.
- #421 Component Lab / 66-family ledger: In progress; platform exists, but the TextField pilot is not exhaustive.
- #418 tokens/themes: In progress; exact token names/values and production mappings are not approved.
- #432 TextField: In progress.

The accepted #417 architecture and completed #419 design workflow are not substitutes for #418 token acceptance. This document and Penpot boards may progress with visible provisional annotations. Runtime CSS consuming new semantic/component token aliases must wait for actual #418 acceptance and the current bluent-v3 integration.

Next sequence:
1. Review the TextField API/design contract, including additive v3-only parameters.
2. Wait for #418's approved token schema/mappings; update this isolated task branch from the accepted bluent-v3 head only when required and reviewed.
3. Implement native Blazor/CSS from the reviewed contract; add automated coverage, exhaustive Component Lab fixtures, canonical component reference and migration ledger entry.
4. Run zero-warning Release build/tests, pack checks, browser visual/keyboard/RTL/theme/forced-colors validation and available assistive-technology tests.
5. Open a PR from v3/issue-432-textfield to bluent-v3. Do not merge into Dev, publish stable packages or close #432 from this task branch.

**Current boundary:** design and API audit are active; v3 runtime implementation and Fluent-parity acceptance are not complete.
