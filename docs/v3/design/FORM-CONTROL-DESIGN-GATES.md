# Bluent v3 — form-control interaction & native-state design gates (#419)

> **2026-10-10 — source-based assessment, NOT an approved design or browser accessibility certification.** The separate `Bluent v3 Design System` Penpot file already contains linked imported Fluent reference matrices for Input (28), Checkbox (30), Switch (40), plus one token-bound, locally editable *single-state* draft design each for TextField/Checkbox/Switch. Exact IDs are in [the live-verified workspace manifest](penpot-workspace.manifest.json), [source variant matrix](COMPONENT-REFERENCE-MATRICES.md), and [local draft component ledger](LOCAL-COMPONENT-DRAFTS.md). **Update (same day):** Penpot was reconnected to the correct Bluent v3 file and native editable **TextField 10 / Checkbox 12 / Switch 12** variant families were actually created, rendered and verified as **34 source-linked local design previews**. This page remains the **unresolved runtime/API review gate**; creation of those visual designs does **not** approve FC1–FC6, source compatibility or accessibility. See [native variant IDs and evidence](NATIVE-CONTROL-VARIANTS.md).

## Evidence boundary and source files

- `src/Bluent.UI/Components/BluentInputComponentBase.cs`: Blazor `InputBase<TValue>` inheritance, `AdditionalAttributes` forwarding, generated/user IDs, disabled detection.
- `src/Bluent.UI/Components/BluentFieldComponentBase.cs`: `FieldSize`, `StartAddon`, `EndAddon`, `BindValueEvent` (defaults `onchange`).
- `src/Bluent.UI/Components/TextFieldComponent/TextField.razor{,.cs}`: single-line input vs multiline textarea, value proxy transformations, focus request.
- `src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor{,.cs}`: `Checkbox<TValue>`, nullable tri-state visual classes, native checkbox input, label variations and `Toggle()`.
- `src/Bluent.UI/Components/SwitchComponent/Switch.razor{,.cs}`: `Switch : Checkbox<bool>`, native input `type=checkbox`, alternate visual CSS and `LabelPosition`.
- `src/Bluent.UI/Components/LabelPosition.cs`: only `Before` and `After`, no `Above` option.
- `src/Bluent.UI/Styles/Components/_checkbox.scss` and `_switch.scss`: visual-state classes, invisible positioned native input overlay, indicator `pointer-events: none`, disabled selector styles.

**Do not infer bugs solely from Penpot screenshots.** These are C#/Razor/SCSS source findings. Actual DOM state, form validation and input behavior must be confirmed with browser and keyboard/screen-reader tests in the *future dedicated component issues*. The current source can differ from a running NuGet package.

## 1. TextField / Input: independent design dimensions

| Fluent upstream source | Existing Bluent behavior | Review requirement |
| --- | --- | --- |
| Input: Size Small/Medium/Large | Inherited `FieldSize` from `BluentFieldComponentBase` | Preserve old size values/public signatures; validate real heights and density |
| Input: Filled lighter/darker, Outline, Underline | Existing TextField source doesn't declare an `Appearance` parameter | Treat appearance as an **open v3 API/design decision**; do not invent enum or silently change defaults |
| Rest/Hover/Pressed/Focus/Error/Disabled/Read only | Native `input`/`textarea` receives `AdditionalAttributes`; Blazor form component has `CssClass` and `BindValueEvent` | Verify actual focus/validation selectors, read-only semantics, attribute forwarding and EditContext; don't mark all states complete from Penpot |
| Single-line Input | `Rows != null` renders `textarea`, optional no-resize; StartAddon/EndAddon support | Separate Fluent Input and Textarea reference/design coverage while retaining one public TextField API if possible |
| Generic text editing | `DigitOnly`, `AsciiDigits`, `ArabicToPersianConversion`, `GainFocus` supported | Preserve Persian/digit transformation when rewriting; test `oninput` and `onchange`, IME composition and caret behavior |

**Test scenarios to turn into executable checks later:** a) bind/edit valid and invalid values; b) set `Rows` and confirm native textarea branch; c) toggle start/end addons + Disabled + ReadOnly attributes; d) Persian Arabic-yeh/kaf conversion and digit transformation at commit/input cadence; e) follow focus through Tab/Shift+Tab and errors in LTR/RTL; f) screen reader name and error announcement; g) 200–400% zoom/reflow without side scrolling. No pass status is asserted here.

## 2. Checkbox: boolean/null value vs visual indeterminate state

Current Bluent `Checkbox<TValue>` explicitly supports only `bool` and `bool?`. Its source maps `ValueAsBool==null` to an **`indeterminate` CSS class**. It also uses three different label fallbacks (checked/unchecked/indeterminate). The C# method `Toggle()` is **not** a symmetric 3-state cycle:

| Current source input value | Expression `ValueAsBool == true` | `Toggle()` tries to write |
| --- | --- | --- |
| `false` | false | `true` |
| `true` | true | `false` |
| `null` | false | `true` |

This table describes **the method's code path** before `BindConverter.TryConvertTo` and Blazor rendering, *not* a tested end-user click/keyboard outcome. It is fine for a two-state checkbox to clear indeterminate on first user action, but the v3 design must explicitly choose whether `null` is a **controlled mixed state** or an interactive cycling state. The source code also does not explicitly set DOM input `indeterminate` or `aria-checked="mixed"` in the Razor markup; those may be supplied through attributes by consumers, but **screen-reader exposure is unverified**. Treat this as a priority accessibility **test gap**, not a finished defect finding.

The `.indicator` CSS has `pointer-events: none`, and the native transparent checkbox input is positioned above it: do not conclude that the indicator `@onclick=Toggle` necessarily handles pointer clicks. For Disabled, the native `<input>` honors forwarded attributes, but `Toggle()` itself doesn't check `IsDisabled`; verify any alternate/programmatic invocation rather than claiming a demonstrated disabled-click regression.

**Required Bluent-specific design states:** three status values, keyboard Focus and FocusVisible, invalid/error, enabled/disabled, light/dark, all supported brand themes, Standard/Circular shapes and before/after label positioning. The upstream **30-style variant matrix** is a *visual reference*; it does not implement `ValueChanged`, `EditContext` or accessible tri-state semantics.

## 3. Switch: appearance versus native semantic role

Bluent `Switch` inherits `Checkbox<bool>`; its Razor renders an `input type="checkbox"`. The checked value is a Boolean, and `LabelPosition` supports only `Before` / `After`. Upstream Fluent Switch offers **40 visual variants**: Checked True/False × Label Above/Before/After/No label × Rest/Hover/Pressed/Focus/Disabled.

**Open design/API decision:** whether to expose `Label Above` as a new value/layout or as a compound Field/Label pattern. Do not assume existing `Before` can represent it without layout or accessibility differences. Decide whether v3 should announce a **switch role** (`role="switch"`, `aria-checked`) or deliberately remain a native checkbox semantic; both can be made accessible but their names/expected interactions differ. `GetInputAdditionalAttributes()` may forward consumer-provided attributes, so static markup alone is **insufficient** to assert missing runtime attributes.

**Required runtime cases:** Space key, label click, pointer hit area, focus indicator in forced colors, checked state and two-way bind, disabled/readonly applicable behavior, before/after/above layout, RTL visual order vs keyboard navigation, CSS motion suppression for reduce-motion, and zoom/touch target sizing.

## 4. Design decisions that must be visible in Penpot before Review

| Decision | Source-preserving proposal, not yet approved | Proof required |
| --- | --- | --- |
| **FC1 — Field appearance** | Upstream 4 appearances map to a private v3 appearance model until compatibility decision | Penpot component variants + source API crosswalk |
| **FC2 — Textarea vs Input** | Keep existing public TextField multiline branch, with separate visual anatomy | Design variants + `Rows` browser tests |
| **FC3 — Indeterminate** | Preserve nullable Boolean visual state; define end-user transition and ARIA/mixed semantics explicitly | Penpot 3-state specimens + keyboard/AT tests |
| **FC4 — Switch label** | Preserve Before/After initially; treat Above as pending compatibility decision | Penpot RTL/LTR layouts + label activation tests |
| **FC5 — Focus/forced colors** | Do not use visual-only focus as acceptance; adopt OS colors and true `:focus-visible` behavior | Real browser tests + Penpot reference |
| **FC6 — Motion and density** | Do not change 24/32/40px defaults until target sizing and reduce-motion policies approved | Browser media queries, target-size exceptions and Penpot states |

The authoritative v3 CSS/layer/theme decisions D1–D4 remain under **#417**, while code-level token implementation remains under **#418** after its own Ready gate. This document is within the active **#419** design-workspace task and does not authorize future component implementation/status transitions.

### Next authoring action

The separately owned Penpot **native variant sets and linked matrix boards are now in place**; the remaining work is to *review and expand* them into full coverage (sizes, hover/pressed, Persian TextField editing, nullable-checkbox ARIA semantics, label activation and forced-colors), with FC1–FC6 still awaiting **approval**. After the design passes review, translate exact properties into individual component implementation issues, demo/Skills/docs/migration coverage and evidence. Keep all work on branch `v3/issue-419-penpot-library`, PR #499 (Draft), base `bluent-v3`; stable Bluent 2.x and NuGet remain unchanged.