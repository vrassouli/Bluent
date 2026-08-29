# NumericField

`NumericField<TValue>` binds numeric CLR values through a Bluent text field and adds parsing, range validation, formatting, stepping metadata, focus events, and digit normalization.

## When to use

Use `NumericField<TValue>` when the model should remain a numeric type and invalid text, overflow, minimum, or maximum values should participate in Blazor validation. Use `TextField` when the value is intentionally text even if it contains digits.

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
<EditForm Model="this">
    <NumericField @bind-Value="_amount" Min="0m" Max="100m" />
    <ValidationMessage For="() => _amount" />
</EditForm>
```

The Fields showcase compiles integer, float, byte, decimal, formatting, min/max, live binding, and explicit `Value`/`ValueChanged` converter examples. This page is source verified; no new browser run was performed.

## Parameters

| Parameter | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `ParsingErrorMessage` | `string` | `"The {0} must be a number."` | No | Format string used when conversion fails. |
| `MinimumErrorMessage` | `string` | `"The {0} must be greater than {1}."` | No | Format string used when a value is below the effective minimum. |
| `MaximumErrorMessage` | `string` | `"The {0} must be less than {1}."` | No | Format string used when a value is above the effective maximum. |
| `OverflowErrorMessage` | `string` | `"The value for {0} must be between {1} and {2}."` | No | Format string used for numeric overflow. |
| `GainFocus` | `bool` | `false` | No | Focuses the input after first render. |
| `Format` | `string?` | `null` | No | Numeric format string used when displaying a non-focused value. |
| `Min` | `TValue?` | type-dependent | No | Minimum allowed value. If omitted, internal defaults follow the numeric CLR type. |
| `Max` | `TValue?` | type-dependent | No | Maximum allowed value. If omitted, internal defaults follow the numeric CLR type. |
| `Step` | `TValue?` | type-dependent `1` | No | Public step value; current markup renders a text input and does not emit a native `step` attribute from this parameter. |
| `OnBlur` | `EventCallback` | empty | No | Raised after the component leaves focused editing state. |
| `OnFocus` | `EventCallback` | empty | No | Raised after the component enters focused editing state. |
| `StartAddon` / `EndAddon` | `RenderFragment?` | `null` | No | Field addon slots. |
| `Size` | `FieldSize` | `Medium` | No | Field size. |
| `BindValueEvent` | `string` | `"onchange"` | No | DOM event used for binding; `oninput` enables live parsing. |
| `Value` / `ValueChanged` / `ValueExpression` | inherited `InputBase<TValue>` | standard Blazor defaults | No | Standard Blazor form binding contract. |
| `Class` / `Style` | inherited | `null` | No | Application CSS class and inline style. |
| Unmatched attributes | inherited | `null` | No | Passed to the underlying text input except `class`. |

Supported type defaults are explicitly implemented for nullable/non-nullable `sbyte`, `byte`, `short`, `ushort`, `int`, `uint`, `long`, `ulong`, `float`, `double`, and `decimal`.

## Events and binding

```razor
<NumericField @bind-Value="_quantity"
              BindValueEvent="oninput"
              Min="0"
              OnFocus="HandleFocus"
              OnBlur="HandleBlur" />
```

The component stores the user's raw editing text while focused, converts non-ASCII digits to ASCII before parsing, and clears the raw editing buffer on blur.

## Child content and composition

There is no generic `ChildContent`. Use `StartAddon` and `EndAddon`.

## Services and containers

The field uses the shared Bluent input base and DOM helper behavior. No NumericField-specific service or container is required.

## Styling and theming

NumericField uses the standard Bluent field styling and renders an `<input type="text">`. Formatting is applied through `FormatValueAsString`; supported numeric CLR values use the current UI culture for display formatting while parsing uses invariant culture in the current implementation.

## Localization and RTL

Typed input is normalized through `ToDigits().ToAsciiDigits()` before parsing. Display formatting uses `CultureInfo.CurrentUICulture`; parsing calls `BindConverter` with invariant culture. Applications should verify decimal/group separator expectations for their target culture because display and parse culture choices are intentionally documented as observed implementation, not generalized locale guarantees.

## Accessibility and keyboard interaction

The component renders a native text input and forwards standard attributes including `id`, `disabled`, `aria-*`, and `autocomplete`. Pair it with `Label` or another accessible naming mechanism. `GainFocus` programmatically focuses after first render. Numeric-specific keyboard/spinbutton semantics are not provided by native `type=number` because current markup uses `type=text`.

## Hosting and render modes

| Render mode | Status | Notes |
| --- | --- | --- |
| Standalone WebAssembly | Unverified | Fields showcase compiles; no NumericField-specific browser run recorded. |
| Interactive Server | Unverified | Binding, validation, and focus events require interactivity. |
| Interactive WebAssembly | Unverified | Same. |
| Interactive Auto | Unverified | Same. |
| Static SSR | Limited | Initial input markup renders; binding/validation/focus behavior requires interactivity. |

## JavaScript and static assets

No NumericField-specific manual script is required. `GainFocus` uses shared element/DOM behavior. Include standard Bluent theme and component CSS.

## Common mistakes

### Assuming Step creates native number-input stepping

Current markup is `type="text"`; `Step` is public state but is not emitted as a native `step` attribute by the component markup. Do not document or depend on browser spinner behavior from this parameter without further implementation/runtime evidence.

### Expecting locale-specific parsing to match display formatting automatically

Current display formatting uses current UI culture while parsing uses invariant culture. Verify decimal input behavior for the application's target cultures.

### Using oninput without considering transient invalid text

Live parsing can produce validation errors while the user is midway through typing. Choose `BindValueEvent` according to the UX you want.

## Known limitations

- Current markup uses a text input, not native `type=number`.
- `Step` does not currently produce native stepping behavior in the rendered markup.
- Culture-specific parsing/display behavior needs application-level verification.
- NumericField-specific browser and assistive-technology verification is not recorded.

## Related components

- `TextField`: `text-field.md`
- `DateField<TValue>`: `date-field.md`
- `TimeField<TValue>`: `time-field.md`
- [Forms and validation guide](../guides/forms-and-validation.md)

## Source and verification

- Component markup: `src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor`
- Component logic: `src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor.cs`
- Field base: `src/Bluent.UI/Components/BluentFieldComponentBase.cs`
- Compiled showcase: `src/Bluent.UI.Demo.Pages/Pages/Components/Fields.razor`
- Source verified against PR branch base commit `73e5de61133ec7037934f232addf5ddbf646e766`
- Verification date: 2026-08-29
