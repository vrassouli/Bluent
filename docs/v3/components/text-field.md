# Bluent v3 TextField — implementation record (in progress)

> **Status:** task-branch implementation in progress; not a released v3 API and not accepted Fluent parity. This page records the source-backed work for [Issue #432](https://github.com/vrassouli/Bluent/issues/432). The existing [Bluent 2.x TextField reference](../../components/text-field.md) remains the consumer authority for released packages.

## Identity and design provenance

| Item | Value |
|---|---|
| Issue / Epic | [#432](https://github.com/vrassouli/Bluent/issues/432) / #416 |
| Task branch / PR | `v3/issue-432-textfield` → `bluent-v3` / [PR #562](https://github.com/vrassouli/Bluent/pull/562) |
| Package / namespace | `Bluent.UI` / `Bluent.UI.Components` |
| Source | `src/Bluent.UI/Components/TextFieldComponent/` |
| Styles | `src/Bluent.UI/Styles/Components/_field.scss`, `_text-field.scss` |
| Showcase | `/components/text-fields` in the Blazor WebAssembly demo |
| Editable design | Penpot file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, pages 16–20 |
| Full state matrix | Page 17, board `343383cb-23d3-80b8-8008-ec424306af65` |
| Anatomy / sizing / RTL | Page 18, board `343383cb-23d3-80b8-8008-ec43be3b98e5` |
| Keyboard / forced-colors / reflow | Page 19, board `343383cb-23d3-80b8-8008-ec440d2d8ed7` |
| Fluent scope / precedence | Page 20, board `343383cb-23d3-80b8-8008-ec45d29ff553` |

Pages 17–20 remain **DRAFT**. They contain 28 linked State × Appearance specimens (seven states × four appearances). The four-appearance matrix is a cross-platform visual reference, not a one-to-one Fluent Web Components Text Field API. The primary Web Components reference documents Outline and Filled; React Input is a secondary visual/accessibility reference for Underline and the lighter/darker filled treatments. See the detailed [design/API contract](../design/TEXTFIELD-DESIGN-AND-API-CONTRACT.md).

## Source-backed API

The current component remains a native Blazor `InputBase<string?>` implementation through:

`TextField → BluentFieldComponentBase<string?> → BluentInputComponentBase<string?> → InputBase<string?>`.

### Direct parameters

| Parameter | CLR type | Default | Behavior |
|---|---|---|---|
| `Rows` | `int?` | `null` | Null renders native `input`; a value renders native `textarea` with that row count. |
| `ResizeTextarea` | `bool` | `false` | With `Rows`, false disables native textarea resizing; true leaves the browser resize affordance enabled. |
| `GainFocus` | `bool` | `false` | Requests focus on the native control after its first interactive render only. |
| `DigitOnly` | `bool` | `false` | Keeps ASCII, Persian and Arabic-Indic decimal digits and removes other characters. |
| `AsciiDigits` | `bool` | `false` | Converts Persian and Arabic-Indic numerals to ASCII. |
| `ArabicToPersianConversion` | `bool` | `false` | Applies the existing `ToPersianChars()` conversion for Arabic kaf/yeh variants. |

### Inherited component and framework surface

| Member | Origin | Behavior |
|---|---|---|
| `Value`, `ValueChanged`, `ValueExpression` | `InputBase<string?>` | Standard `@bind-Value`, `EditContext`, field identity and validation notifications. |
| `AdditionalAttributes` | `InputBase<string?>` | Native attributes such as `id`, `name`, `type`, `placeholder`, `autocomplete`, `disabled`, `readonly` and `aria-*` are forwarded to the actual input/textarea (except wrapper-owned `class`). |
| `DisplayName` | `InputBase<string?>` | Validation/display name. |
| `StartAddon`, `EndAddon` | `BluentFieldComponentBase<string?>` | Optional leading/trailing `RenderFragment` slots. |
| `Size` | `BluentFieldComponentBase<string?>` | `FieldSize.Small`, `Medium` (default), `Large`. |
| `BindValueEvent` | `BluentFieldComponentBase<string?>` | Defaults to `onchange`; use `oninput` for live binding. |
| `Class`, `Style` | `BluentInputComponentBase<string?>` | Applied to the component wrapper. |
| `Element`, `Id`, `Field` | `BluentInputComponentBase<string?>` | Public element/identity/field projections; not consumer-settable Razor parameters. |

No new public `Appearance`, `ReadOnly`, `HelperText`, `ErrorMessage`, `Required`, focus callback or size enum is declared by this task. Read-only and disabled are native attributes, not new TextField parameters. A visible `Label` is composed separately and must target the actual native control ID; placeholder text is not an accessible label.

## Usage examples

Basic binding with live updates:

```razor
<Label Text="Display name" for="display-name" />
<TextField @bind-Value="Model.DisplayName"
           id="display-name"
           placeholder="Enter a name" />
<TextField @bind-Value="Model.Search"
           BindValueEvent="oninput"
           aria-describedby="search-description" />
```

Native multiline and addon composition:

```razor
<TextField @bind-Value="Model.Notes" Rows="4" ResizeTextarea>
    <StartAddon>
        <Icon Value="@FluentIcons.Search" aria-hidden="true" />
    </StartAddon>
    <EndAddon>
        <Button Text="Search" OnClick="Search" />
    </EndAddon>
</TextField>
```

Persian digit and character transforms:

```razor
<TextField @bind-Value="Model.NationalNumber"
           DigitOnly
           AsciiDigits />

<TextField @bind-Value="Model.PersianName"
           ArabicToPersianConversion />
```

The transformation order is fixed and behavior-preserving:

1. `DigitOnly` → `ToDigits()`
2. `AsciiDigits` → `ToAsciiDigits()`
3. `ArabicToPersianConversion` → `ToPersianChars()`

When normalization changes text, native `selectionStart`/`selectionEnd` offsets are mapped through the normalized source prefix and restored after rendering. This preserves mid-string caret/selection position instead of unconditionally moving the caret to the end. The input remains a native HTML control; the implementation does not replace browser text editing with `contenteditable`.

## Validation and native states

When an active Blazor `EditContext` has validation messages for the TextField's `FieldIdentifier`, the component sets `aria-invalid="true"` on the actual native control. The consumer is responsible for rendering a readable validation message and connecting it using a stable `aria-describedby` ID. The component does not create a helper/error message slot or generate that message's ID.

The current state-layer stylesheet keeps these conditions distinct:

- **Focus:** 2px active underline; no generic full-rectangle focus ring.
- **Invalid + unfocused:** invalid border; readable validation description remains associated.
- **Invalid + focused:** focus underline remains the active cue while invalid semantics/message stay present.
- **Disabled:** native control is not focusable/editable; system disabled colors are used in forced colors.
- **ReadOnly:** native control remains focusable and selectable but cannot be edited.
- **Textarea:** native resize behavior follows `Rows`/`ResizeTextarea`.
- **Reduced motion / forced colors:** focus is visible without requiring animation and system palette mappings are handled by the stylesheet.

Decorative addons are not focusable. Interactive addon content (for example a Button) is a separate, independently named control and its keyboard stop remains in semantic DOM order. Logical layout properties are used by the shared field shell for RTL placement.

The current state-layer styles use existing Fluent global role variables. Final TextField semantic/component token vocabulary, modes, brand mappings and production aliases remain owned by #418 and are not inferred from draft Penpot colors.

## Demo and coverage

The focused showcase is `/components/text-fields`. It includes:

- Standard `onchange` binding and live `oninput` binding.
- Small, Medium and Large.
- StartAddon, EndAddon with an independent action, and readonly/disabled.
- Textarea with resize disabled/enabled.
- DataAnnotations/EditContext validation and `aria-describedby`.
- First-interactive-render `GainFocus`.
- All eight flag combinations of the three text-normalization options.
- Persian RTL and mixed-direction Latin identifier examples.

The shared Component Lab continues to contain the earlier current-API TextField regression fixture. Its 28 named TextField checks and 1,106 aggregate four-mode assertions are **current-API regression evidence**, not the v3 component's full acceptance suite. The Lab family record remains `representative_only`.

## Verification status

| Check | Result | Boundary |
|---|---|---|
| TextField source/API/demo/browser-CI guard | 39/39 positive/negative tests passed | Source/API/demo/CI invariants only. |
| Release build / .NET tests | Full Solution Release build: 0 warnings / 0 errors; full solution tests: 70/70 passed | Compilation and unit/regression tests; browser evidence is reported separately. |
| JavaScript / Sass asset pipeline | Clean `npm ci` + webpack ESM/Global build and clean `npm ci` + Sass compilation passed | Generated CSS is consumed by the existing BundlerMinifier pipeline; Sass reports legacy Bootstrap/import deprecation notices, not compilation errors. |
| NuGet package content | Local `Bluent.UI.1.0.0.nupkg` pack passed; verified minified component CSS, ESM JS and Global JS are present, and packaged CSS contains `.bui-text-field` | Local pack validation only; package was not published. |
| InteractiveServer host | Debug SSR host built with warnings-as-errors; focused showcase reused in a real InteractiveServer circuit | Same source-owned showcase; not a second component implementation. |
| Real-browser runtime matrix | **92/92 passed**: Chrome/Edge × WebAssembly/InteractiveServer, 23/23 per combination | Live CDP browser interaction on the focused route; zero browser runtime/HTTP errors and zero QA-owned browser processes after cleanup. |
| Native Windows Contrast Themes / screen reader | Not performed for this implementation | Browser emulation or source inspection is not native OS/AT certification. |
| Penpot design approval | Pending; pages 17–20 remain DRAFT | No pixel-parity or maintainer approval claim. |
| #418 token mapping | Review | No final semantic placeholder/component mapping is claimed. |

### Real-browser evidence files

The same focused showcase was exercised in all four combinations. Each JSON file records 23/23 passing assertions, zero runtime signals and the rendered route; each PNG is the corresponding browser screenshot.

- BLUENT-TEXTFIELD-CHROME-WASM.json / .png
- BLUENT-TEXTFIELD-EDGE-WASM.json / .png
- BLUENT-TEXTFIELD-CHROME-INTERACTIVESERVER.json / .png
- BLUENT-TEXTFIELD-EDGE-INTERACTIVESERVER.json / .png

The permanent v3-compatibility-browsers.yml TextField job restores and builds the JavaScript and Sass asset pipelines from clean lockfiles, builds both hosts, runs the same probe in a Chrome/Edge × InteractiveServer/WebAssembly matrix on Windows, and uploads the JSON/PNG evidence as workflow artifacts. Exact-head GitHub CI for this updated workflow still needs to complete after push.

Reproducible checks:

```powershell
python scripts/quality/check_v3_textfield_contract.py
python -m unittest discover -s scripts/quality -p 'test_v3_textfield_contract.py' -v
python scripts/quality/check_v3_docs_contract.py
python scripts/quality/check_markdown_links.py
npm --prefix src/Bluent.UI.Scripts ci --ignore-scripts --no-audit --no-fund
npm --prefix src/Bluent.UI.Scripts run build
npm --prefix src/Bluent.UI ci --ignore-scripts --no-audit --no-fund
npm --prefix src/Bluent.UI run build:scss
dotnet build Bluent.sln --configuration Release --no-restore -warnaserror
dotnet test Bluent.sln --configuration Release --no-build
```

Issue #432 remains **In progress** and PR #562 remains open against `bluent-v3`. This branch is not a released v3 package, no merge into stable `Dev`/2.x is authorized, and no NuGet publication/deployment has occurred.
