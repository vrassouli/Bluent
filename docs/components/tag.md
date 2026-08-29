# Tag

`Tag` displays compact titled content with an optional typed icon, click action, and separate dismiss action.

## Package and namespace

```razor
@using Bluent.UI.Components
```

Package: `Bluent.UI`

## Basic usage

```razor
<Tag Title="Active" Icon="@FluentIcons.Checkmark" />
```

Dismissable usage:

```razor
<Tag Title="Filter: Open"
     Dismissable
     OnDismiss="RemoveFilter" />
```

## Public API

| Parameter | Type | Default / notes |
| --- | --- | --- |
| `Title` | `string` | required/default empty |
| `Dismissable` | `bool` | `false` |
| `Icon` | `IconDefinition?` | optional typed icon |
| `OnClick` | `EventCallback` | optional content action |
| `OnDismiss` | `EventCallback` | optional dismiss callback |

The component inherits common Bluent attributes and tooltip parameters.

## Render behavior

- When `OnClick` has a delegate, the main content renders as a native `<button>` containing optional icon and title.
- Without an `OnClick` delegate, the main content renders as a non-interactive `<div>`.
- When `Dismissable=true`, a separate native `<button type="button">` renders with `FluentIcons.Dismiss` and invokes `OnDismiss`.
- `Dismissable` controls visibility only; the component does not remove itself or mutate application state automatically.

## Accessibility

The clickable content uses native button semantics. The dismiss button, however, is icon-only and current source does not supply an explicit accessible name such as `aria-label`. Treat that as a source accessibility gap and provide verified accessible labeling through supported attributes/context when dismissal must be exposed to assistive technology.

`Title` labels the main content visually but is not automatically applied to the separate dismiss button.

## Evidence boundary

Source verified from `Tag.razor(.cs)`. Do not invent selection state, color/status enums, automatic removal, keyboard behavior beyond native buttons, or a built-in dismiss accessible label absent from current source.
