# TextField

`TextField` is Bluent's bindable text input and textarea field, with addons, sizing, configurable bind event, focus support, and optional digit/character normalization.

## When to use

Use `TextField` for free-form text, search/query input, password-like input via unmatched HTML attributes, multiline text, or text that needs Bluent field addons. Use `NumericField<TValue>` when the model value should be a numeric type with parsing and range validation, and `MaskedField` when the input must follow a regular-expression mask.

## Package and namespace

```bash
dotnet add package Bluent.UI
```

```razor
@using Bluent.UI.Components
```

Follow [Getting Started](../getting-started/index.md) for normal Bluent registration and styles.

## Minimal example

```razor
<TextField @bind-Value="_name" placeholder="Name" />
```

The repository Fields showcase compiles binding, addons, disabled state, sizes, digit conversion, and textarea examples. This page is source verified; no new browser run was performed.

## Parameters

| Parameter | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `Rows` | `int?` | `null` | No | When null, renders `<input>`; when set, renders `<textarea rows="...">`. |
| `ResizeTextarea` | `bool` | `false` | No | Controls whether the component suppresses textarea resizing when `Rows` is set. |
| `GainFocus` | `bool` | `false` | No | Focuses the rendered element after first render. |
| `DigitOnly` | `bool` | `false` | No | Converts input through Bluent's digit normalization before updating the bound value. |
| `AsciiDigits` | `bool` | `false` | No | Converts digits to ASCII before updating the bound value. |
| `ArabicToPersianConversion` | `bool` | `false` | No | Converts Arabic characters to Persian equivalents before updating the bound value. |
| `StartAddon` | `RenderFragment?` | `null` | No | Content rendered before the input. |
| `EndAddon` | `RenderFragment?` | `null` | No | Content rendered after the input. |
| `Size` | `FieldSize` | `Medium` | No | `Small`, `Medium`, or `Large`. |
| `BindValueEvent` | `string` | `"onchange"` | No | DOM event used by the generated bind expression; use `oninput` for live updates. |
| `Value` / `ValueChanged` / `ValueExpression` | inherited `InputBase<string?>` | standard Blazor defaults | No | Standard Blazor form binding contract. |
| `Class` / `Style` | inherited | `null` | No | Application CSS class and inline style. |
| Unmatched attributes | inherited | `null` | No | Passed to the input/textarea except `class`; supports `placeholder`, `disabled`, `type`, `autocomplete`, `accesskey`, `aria-*`, etc. |

## Events and binding

Standard two-way binding is supported:

```razor
<TextField @bind-Value="_query" BindValueEvent="oninput" />
```

`TextField` does not expose component-specific focus/change callbacks. Use Blazor binding and unmatched DOM attributes where appropriate.

## Child content and composition

There is no generic `ChildContent`. `StartAddon` and `EndAddon` are the supported composition slots and can contain Bluent components such as `Icon` and `Button`.

## Services and containers

The field inherits `IDomHelper` support from `BluentInputComponentBase`. This is used after first render when an `accesskey` is supplied so the placeholder can include a platform-specific shortcut hint. No component-specific container is required.

## Styling and theming

Use the packaged Bluent theme and component CSS. `Size` selects field sizing; setting `Rows` switches to textarea markup, and `ResizeTextarea=false` applies the component's no-resize treatment. Use `Class` and `Style` for application adjustments rather than relying on internal selectors.

## Localization and RTL

The component itself has no built-in localized strings. `DigitOnly`, `AsciiDigits`, and `ArabicToPersianConversion` provide source-verified normalization useful for Persian/Arabic input scenarios. Direction is inherited unless the application supplies `dir` as an unmatched attribute.

## Accessibility and keyboard interaction

The component renders native `<input>` or `<textarea>` elements and forwards attributes such as `id`, `disabled`, `aria-*`, and `accesskey`. Pair the field with `Label`/`ForExpression` or another valid accessible naming mechanism. `GainFocus` causes programmatic focus after first render; use it deliberately. Complete assistive-technology verification is not recorded.

## Hosting and render modes

| Render mode | Status | Notes |
| --- | --- | --- |
| Standalone WebAssembly | Unverified | Fields showcase compiles; no TextField-specific browser run recorded here. |
| Interactive Server | Unverified | Binding and `GainFocus` require interactivity. |
| Interactive WebAssembly | Unverified | Binding and `GainFocus` require interactivity. |
| Interactive Auto | Unverified | Binding and `GainFocus` require interactivity. |
| Static SSR | Limited | Initial markup renders; client-side binding, focus, and access-key platform detection require interactivity. |

## JavaScript and static assets

Text entry itself needs no manual script tag. `GainFocus` and access-key platform detection call shared DOM helper behavior. Include standard Bluent theme/component styles.

## Common mistakes

### Expecting live binding with the default configuration

`BindValueEvent` defaults to `onchange`. Set `BindValueEvent="oninput"` when the model must update as the user types.

### Using TextField for typed numeric validation

Digit normalization still leaves the model as text. Use `NumericField<TValue>` when the bound value should be numeric and parsing/range errors should participate in Blazor validation.

### Expecting multiline mode without Rows

Set `Rows` to render a `<textarea>`.

## Known limitations

- No component-specific change/focus/blur callbacks.
- Character normalization behavior is source verified but not newly browser-tested by this page.
- TextField-specific RTL and assistive-technology verification is not recorded.

## Related components

- `NumericField<TValue>`: `numeric-field.md`
- `DateField<TValue>`: `date-field.md`
- `TimeField<TValue>`: `time-field.md`
- `SelectField<TValue>`: `select-field.md`
- `MaskedField`: see [component inventory](inventory.md)

## Source and verification

- Component markup: `src/Bluent.UI/Components/TextFieldComponent/TextField.razor`
- Component logic: `src/Bluent.UI/Components/TextFieldComponent/TextField.razor.cs`
- Field base: `src/Bluent.UI/Components/BluentFieldComponentBase.cs`
- Input base: `src/Bluent.UI/Components/BluentInputComponentBase.cs`
- Compiled showcase: `src/Bluent.UI.Demo.Pages/Pages/Components/Fields.razor`
- Source verified against PR branch base commit `73e5de61133ec7037934f232addf5ddbf646e766`
- Verification date: 2026-08-29
