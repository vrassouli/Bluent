# Calendar<TValue>

`Calendar<TValue>` is Bluent's date/month/year selection surface. It supports `DateTime` and `DateOnly`, nullable or non-nullable, with culture-aware calendar navigation and optional min/max clamping.

## Package and namespace

```razor
@using Bluent.UI.Components
```

Package: `Bluent.UI`

## Supported TValue

The constructor accepts only:

- `DateTime`
- `DateTime?`
- `DateOnly`
- `DateOnly?`

Other types throw `InvalidOperationException`.

## Public API

| Parameter | Type | Default / notes |
| --- | --- | --- |
| `SelectedDate` | `TValue` | current value |
| `SelectedDateChanged` | `EventCallback<TValue>` | binding callback |
| `MonthChanged` | `EventCallback<DateOnly>` | invoked when the viewed month changes |
| `Culture` | `CultureInfo` | `CurrentUICulture` |
| `Mode` | `CalendarMode` | `DaySelect` |
| `DateClass` | `Func<DateOnly, string>?` | optional per-date CSS class callback |
| `Max` | `DateTime?` | optional maximum |
| `Min` | `DateTime?` | optional minimum |

`CalendarMode` values are `DaySelect`, `MonthSelect`, and `YearSelect`.

## Selection behavior

For non-nullable TValue, an externally default value causes the component to initialize selection to today during parameter processing.

When selecting a date, current source clamps it to `Min`/`Max`, converts it to TValue, invokes `SelectedDateChanged`, and closes a cascading Popover when one exists.

Nullable values can be cleared through the calendar's clear path.

## Culture and navigation

Month length, first-day offset, year/month arithmetic, and displayed calendar values use `Culture.Calendar` / `Culture.DateTimeFormat`. The view can navigate months, years, and 13-year ranges and can switch between day/month/year selection views.

`MonthChanged` receives the current view date converted to `DateOnly` when the viewed month changes.

## Popover integration

When hosted inside a Bluent Popover (for example through DateField), selecting a value closes that cascading popover. Standalone Calendar does not require the shared overlay host for its own static surface, but the containing Popover does.

## Accessibility/runtime boundary

Calendar is interaction-heavy. Verify keyboard date-grid navigation, focus movement, disabled/min/max date presentation, RTL, culture-specific calendars, and assistive-technology semantics in the target host. Do not infer a complete WAI-ARIA calendar/grid pattern from selection logic alone.

## Evidence boundary

Source verified from `Calendar.razor(.cs)` and `CalendarMode.cs`. Do not invent range selection, multiple-date selection, arbitrary TValue types, appointment/event storage, or async date providers absent from current source.
