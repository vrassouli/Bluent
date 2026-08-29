# TimeField

`TimeField<TValue>` is Bluent's masked time-entry field for `TimeOnly`, `TimeSpan`, or `DateTime`, with optional seconds, culture-aware parsing, and Blazor validation.

## When to use

Use `TimeField<TValue>` when the model value should be a typed time value rather than arbitrary text. `TimeSpan` is appropriate for durations, while `TimeOnly` represents a clock time; a `DateTime` binding preserves its existing date when the time portion is edited.

## Package and namespace

```bash
dotnet add package Bluent.UI
```

```razor
@using Bluent.UI.Components
```

Follow [Getting Started](../getting-started/index.md) for normal Bluent registration and styles. TimeField uses Bluent localization services for its default parsing message.

## Minimal example

```razor
<TimeField @bind-Value="_startTime" />
```

The repository Fields showcase compiles `TimeOnly`, `DateTime`, and `TimeSpan` examples, with and without seconds. This page is source verified; no new browser run was performed.

## Parameters

| Parameter | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `ParsingErrorMessage` | `string` | empty | No | Custom parse-error format; empty uses localized built-in text. |
| `Seconds` | `bool` | `false` | No | Includes seconds in formatting and the accepted mask. |
| `Culture` | `CultureInfo` | `CurrentUICulture` | No | Culture used by `BindConverter` parsing. |
| `StartAddon` / `EndAddon` | `RenderFragment?` | `null` | No | Field addon slots. |
| `Size` | `FieldSize` | `Medium` | No | Field size. |
| `Value` / `ValueChanged` / `ValueExpression` | inherited `InputBase<TValue>` | standard Blazor defaults | No | Standard binding/validation contract. |
| `Class` / `Style` | inherited | `null` | No | Application CSS class and inline style. |
| Unmatched attributes | inherited | `null` | No | Forwarded through the internal MaskedField. |

The constructor accepts `TimeSpan`, `TimeSpan?`, `TimeOnly`, `TimeOnly?`, `DateTime`, and `DateTime?`; other types throw `InvalidOperationException`.

## Events and binding

```razor
<TimeField @bind-Value="_startTime" Seconds />
```

For a `DateTime` value, successful parsing replaces only the hour/minute/second while preserving the existing year/month/day. `TimeSpan` supports an optional day prefix in the source mask.

## Child content and composition

There is no generic child content. Use `StartAddon` and `EndAddon`.

## Services and containers

TimeField injects `IStringLocalizer` and uses normal Bluent UI localization registration. No TimeField-specific container is required.

## Styling and theming

TimeField composes `MaskedField`, uses standard field sizing, normalizes digits to ASCII, disables autocomplete in its own markup, and forces `dir="ltr"` for the time string.

## Localization and RTL

`Culture` is used for parsing and localized error text. The numeric time entry is explicitly LTR. Formatting in the current implementation uses explicit hour/minute(/second) patterns rather than a culture-specific display pattern, so verify target-locale expectations rather than assuming localized clock formatting.

## Accessibility and keyboard interaction

The interactive text entry comes from `MaskedField`; native text-input keyboard behavior applies around the mask. Pair it with `Label` or another accessible name. TimeField-specific assistive-technology and mask keyboard verification is not recorded here.

## Hosting and render modes

| Render mode | Status | Notes |
| --- | --- | --- |
| Standalone WebAssembly | Unverified | Fields showcase compiles; no TimeField-specific browser run recorded. |
| Interactive Server | Unverified | Binding and validation require interactivity. |
| Interactive WebAssembly | Unverified | Same. |
| Interactive Auto | Unverified | Same. |
| Static SSR | Limited | Initial field markup can render; binding/mask interaction requires interactivity. |

## JavaScript and static assets

No manual TimeField script tag is documented. It composes `MaskedField`, so shared Bluent field/static behavior applies. Include standard Bluent theme/component CSS.

## Common mistakes

### Binding an unsupported type

Use `TimeOnly`, `TimeSpan`, `DateTime`, or nullable forms of those types.

### Losing the date when editing DateTime

The component intentionally preserves the existing date and replaces only the time after a successful parse. Initialize the bound DateTime's date portion appropriately.

### Assuming culture-specific display formatting

Parsing uses `Culture`, but output formatting is explicitly `H:m` / `H:m:s` (or TimeSpan patterns). Verify UX expectations for locales that require different presentation.

## Known limitations

- No built-in min/max time parameters.
- Display formatting is not a culture-specific short/long time pattern.
- Mask, keyboard, RTL, and assistive-technology behavior is not newly runtime verified by this page.

## Related components

- `DateField<TValue>`: `date-field.md`
- `TextField`: `text-field.md`
- `MaskedField`: see [component inventory](inventory.md)

## Source and verification

- Component markup: `src/Bluent.UI/Components/TimeFieldComponent/TimeField.razor`
- Component logic: `src/Bluent.UI/Components/TimeFieldComponent/TimeField.razor.cs`
- Compiled showcase: `src/Bluent.UI.Demo.Pages/Pages/Components/Fields.razor`
- Source verified against PR branch base commit `73e5de61133ec7037934f232addf5ddbf646e766`
- Verification date: 2026-08-29
