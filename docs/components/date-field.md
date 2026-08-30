# DateField

`DateField<TValue>` is Bluent's culture-aware date entry field for `DateTime`/`DateOnly`, with day/month/year modes, optional calendar picker, range metadata, masking, and Blazor validation.

## When to use

Use `DateField<TValue>` when the model value is a date and the UI needs Bluent date masking and optional calendar selection. Use a plain text field only when the value is intentionally unparsed text.

## Package and namespace

```bash
dotnet add package Bluent.UI
```

```razor
@using Bluent.UI.Components
```

Follow [Getting Started](../getting-started/index.md) for normal Bluent registration and styles. DateField uses localization registered by Bluent UI services.

## Minimal example

```razor
<DateField @bind-Value="_date" />
```

The repository Fields showcase compiles small/medium/large, disabled, `oninput`, and month-selection examples. This page is source verified; no new browser run was performed.

## Parameters

| Parameter | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `Culture` | `CultureInfo` | `CurrentUICulture` | No | Culture/calendar used for formatting, parsing, separators, and supported date range. |
| `Mode` | `CalendarMode` | `DaySelect` | No | Day, month, or year selection mode. |
| `DateClass` | `Func<DateTime,string>?` | `null` | No | Public date-class callback. Current DateField wrapper source does not pass it to `DateFieldPicker`; verify picker behavior before documenting a styling recipe around it. |
| `Max` | `DateTime?` | `null` | No | Maximum passed to the internal picker. |
| `Min` | `DateTime?` | `null` | No | Minimum passed to the internal picker. |
| `DisplayCalendar` | `bool` | `true` | No | When true and no custom `EndAddon` is supplied, renders the built-in picker trigger. |
| `ParsingErrorMessage` | `string` | empty | No | Custom parsing message; empty uses the localized built-in message. |
| `StartAddon` / `EndAddon` | `RenderFragment?` | `null` | No | Field addon slots. A custom `EndAddon` replaces the built-in calendar trigger. |
| `Size` | `FieldSize` | `Medium` | No | Field/picker button size. |
| `BindValueEvent` | `string` | `"onchange"` | No | Passed through field infrastructure; the outer DateField binds its internal MaskedField value. |
| `Value` / `ValueChanged` / `ValueExpression` | inherited `InputBase<TValue>` | standard Blazor defaults | No | Standard binding/validation contract. |
| `Class` / `Style` | inherited | `null` | No | Application CSS class and inline style. |
| Unmatched attributes | inherited | `null` | No | Forwarded through the internal MaskedField. |

The constructor accepts `DateTime`, `DateTime?`, `DateOnly`, and `DateOnly?`; other `TValue` types throw `InvalidOperationException`.

## Events and binding

```razor
<DateField @bind-Value="_month" Mode="CalendarMode.MonthSelect" />
```

Parsing errors participate in `InputBase<TValue>` validation. The picker updates the current value through the component's internal `OnDatePicked` path.

## Child content and composition

There is no generic child content. `StartAddon` is preserved. `EndAddon` takes precedence over the default calendar picker trigger; set `DisplayCalendar="false"` to omit the default trigger when no custom end addon is needed.

## Services and containers

DateField injects `IStringLocalizer` for parsing text and relies on normal `AddBluentUI()` localization registration. The picker composes other Bluent components; use standard application setup.

## Styling and theming

DateField renders through `MaskedField` and forces `dir="ltr"` for the date input string. `Size` is mapped to the built-in picker Button size. Date strings use the active culture's date separator in masks, while source constants use year/month/day ordering.

## Localization and RTL

Built-in parsing error text and format descriptions are localized. `Culture` controls parsing, formatting, calendar bounds, and date separators. The input itself is explicitly LTR even in RTL layouts, which is appropriate for the numeric date pattern; surrounding labels/layout follow the application direction. Full calendar RTL behavior is not newly verified here.

## Accessibility and keyboard interaction

The text-entry portion is an internal `MaskedField`; the optional calendar trigger is an internal Button/picker composition. Provide a `Label` or other accessible name. Disabled state is passed to the picker. Detailed picker keyboard and assistive-technology behavior requires separate runtime verification.

## Hosting and render modes

| Render mode | Status | Notes |
| --- | --- | --- |
| Standalone WebAssembly | Unverified | Fields showcase compiles; no DateField-specific browser run recorded. |
| Interactive Server | Unverified | Binding and calendar interaction require interactivity. |
| Interactive WebAssembly | Unverified | Same. |
| Interactive Auto | Unverified | Same. |
| Static SSR | Limited | Initial masked field markup can render; binding and picker interaction require interactivity. |

## JavaScript and static assets

No manual DateField script tag is documented. DateField composes `MaskedField` and the internal picker, so shared Bluent interactive/static assets apply. Include standard Bluent theme/component CSS.

## Common mistakes

### Using an unsupported TValue

Use `DateTime`, nullable `DateTime`, `DateOnly`, or nullable `DateOnly`. Other types fail in the constructor.

### Expecting the built-in calendar when EndAddon is supplied

A custom `EndAddon` wins. Remove it to restore the built-in picker, or provide your own end-addon UI intentionally.

### Assuming Min/Max are fully enforced by text parsing

The source passes `Min`/`Max` to the picker; `TryParseValueFromString` itself does not compare the parsed typed value against those parameters. Do not overstate text-entry range enforcement without runtime/implementation evidence.

### Treating DateClass as verified picker styling

`DateClass` is public on DateField, but the wrapper code shown here does not pass it into the picker construction. Verify/fix that path before publishing a supported recipe.

## Known limitations

- `DateClass` propagation is not established by the current wrapper source.
- Text parsing does not directly enforce `Min`/`Max` in `TryParseValueFromString`.
- Picker keyboard, RTL, and assistive-technology behavior is not newly verified by this page.

## Related components

- `TimeField<TValue>`: `time-field.md`
- `TextField`: `text-field.md`
- `MaskedField` and `Calendar`: see [component inventory](inventory.md)

## Source and verification

- Component markup: `src/Bluent.UI/Components/DateFieldComponent/DateField.razor`
- Component logic: `src/Bluent.UI/Components/DateFieldComponent/DateField.razor.cs`
- Internal picker: `src/Bluent.UI/Components/DateFieldComponent/Internal/`
- Compiled showcase: `src/Bluent.UI.Demo.Pages/Pages/Components/Fields.razor`
- Source verified against PR branch base commit `73e5de61133ec7037934f232addf5ddbf646e766`
- Verification date: 2026-08-29
