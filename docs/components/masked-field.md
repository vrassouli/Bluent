# MaskedField

`MaskedField` is a Bluent text field that accepts input incrementally only while it can still satisfy a required regular-expression mask.

## When to use

Use `MaskedField` for structured text such as phone numbers or identifiers where a regex describes the accepted shape. Use `TextField` for unrestricted text and typed fields such as `DateField`/`TimeField` when the model should be parsed to a CLR date/time type.

## Package and namespace

```bash
dotnet add package Bluent.UI
```

```razor
@using Bluent.UI.Components
```

Follow [Getting Started](../getting-started/index.md) for Bluent registration and packaged styles.

## Minimal example

```razor
<MaskedField @bind-Value="_mobile"
             Mask="^09\d{2}-\d{3}-\d{4}$" />
```

The repository Fields showcase compiles the same mask pattern. This page is source/demo verified; no new browser run was performed.

## Parameters

| Parameter | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `Mask` | `string` | none | Yes (`EditorRequired`) | Regular-expression mask used by the component's regex lexer and incremental validation. |
| `AsciiDigits` | `bool` | `false` | No | Converts entered digits to ASCII before validating/updating. |
| `ArabicToPersianConversion` | `bool` | `false` | No | Converts Arabic characters to Persian equivalents before validation/update. |
| `StartAddon` / `EndAddon` | `RenderFragment?` | `null` | No | Field addon slots. |
| `Size` | `FieldSize` | `Medium` | No | Field size inherited from `BluentFieldComponentBase`. |
| `Value` / `ValueChanged` / `ValueExpression` | inherited `InputBase<string?>` | standard Blazor defaults | No | Standard binding/validation contract. |
| `Class` / `Style` | inherited | `null` | No | Application CSS class and inline style. |
| Unmatched attributes | inherited | `null` | No | Passed to the native text input except `class`. |

`BindValueEvent` is inherited by the base type, but current `MaskedField` markup handles `@oninput` directly; do not assume changing `BindValueEvent` changes its input event.

## Events and binding

```razor
<MaskedField @bind-Value="_code" Mask="^\d{4}-\d{4}$" />
```

On each input event the component normalizes configured characters, checks whether the current prefix can still reach a full regex match, appends an unambiguous literal when one is implied by the mask, and updates the bound value only for valid prefixes. On key-up, invalid transient input is reverted to the last valid input.

## Child content and composition

There is no generic `ChildContent`. Use `StartAddon` and `EndAddon`.

## Services and containers

No MaskedField-specific service or `<Containers />` dependency is present. It uses the shared Bluent input/field base.

## Styling and theming

MaskedField renders a native `<input type="text">` inside the standard Bluent field wrapper. Use the packaged theme/component CSS and public `Size`, `Class`, and `Style` surfaces rather than internal CSS selectors.

## Localization and RTL

There are no built-in localized strings. `AsciiDigits` and `ArabicToPersianConversion` are source-verified normalization options useful in Persian/Arabic scenarios. Direction follows supplied/document attributes; MaskedField itself does not force LTR.

## Accessibility and keyboard interaction

The component renders a native text input and forwards `id`, `disabled`, `aria-*`, `autocomplete`, and similar attributes. Pair it with `Label` or another accessible naming mechanism. The custom incremental mask and key-up rollback behavior has not been separately verified with screen readers, IMEs, or all keyboard/input methods.

## Hosting and render modes

| Render mode | Status | Notes |
| --- | --- | --- |
| Standalone WebAssembly | Unverified | Fields showcase compiles; no MaskedField-specific browser evidence recorded here. |
| Interactive Server | Unverified | Incremental input/binding requires interactivity. |
| Interactive WebAssembly | Unverified | Same. |
| Interactive Auto | Unverified | Same. |
| Static SSR | Limited | Initial markup renders, but mask enforcement and binding require interactivity. |

## JavaScript and static assets

No component-specific JavaScript module is imported. Include the standard Bluent theme/component CSS.

## Common mistakes

### Treating Mask as ordinary placeholder formatting

`Mask` is a regex interpreted by Bluent's regex lexer. Use a pattern supported by the current lexer; source/demo verification is required for complex regex constructs.

### Expecting BindValueEvent to switch the input event

Current markup wires `@oninput` directly. `BindValueEvent` is inherited but not used for the MaskedField input event.

### Assuming invalid text reaches the model

The component intentionally updates the bound value only when the current prefix remains valid and rolls invalid transient input back on key-up.

## Known limitations

- Regex feature coverage is constrained by Bluent's internal regex lexer; complex patterns need verification.
- IME/mobile/assistive-technology behavior is not runtime verified here.
- `BindValueEvent` does not control current event wiring.

## Related components

- `TextField`: `text-field.md`
- `DateField<TValue>`: `date-field.md`
- `TimeField<TValue>`: `time-field.md`

## Source and verification

- Component markup: `src/Bluent.UI/Components/MaskedFieldComponent/MaskedField.razor`
- Component logic: `src/Bluent.UI/Components/MaskedFieldComponent/MaskedField.razor.cs`
- Compiled showcase: `src/Bluent.UI.Demo.Pages/Pages/Components/Fields.razor`
- Source verified against PR branch current `Dev` lineage
- Verification date: 2026-08-29
