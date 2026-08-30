# Label

`Label` renders a field/content label with optional required marker and popover-backed info content. It can derive display text, property name, and required state from an expression.

## Package and namespace

```razor
@using Bluent.UI.Components
```

Package: `Bluent.UI`

## Basic usage

```razor
<Label Text="Email" />
```

Expression-backed labels can use `ForExpression` so Bluent can derive metadata from the referenced member.

## Public API

| Parameter | Type | Default / notes |
| --- | --- | --- |
| `Text` | `string?` | optional explicit display text |
| `ForExpression` | `Expression<Func<object?>>?` | optional member expression used for display/property/required metadata |
| `RequiredSymbol` | `string` | `"*"` |
| `Info` | `RenderFragment?` | optional popover content |
| `Size` | `LabelSize` | `Medium` |
| `Required` | `LabelRequiredState` | `Auto` |

`Required=Auto` uses the expression metadata helper; explicit `Required` and `NotRequired` override it.

## Render behavior

The component renders a native `<label>` whose `for` value is derived from `ForExpression.GetMemberName()` when an expression exists. Display text uses explicit `Text` first, otherwise expression display metadata.

When `Info` is supplied, Label renders an info icon Button inside a Bluent Popover (`TopStart`). This means normal Bluent service registration and the shared `<Containers />` host are required for the interactive info surface.

When the resolved required state is true, `RequiredSymbol` is rendered in a required span. This marker is visual; do not confuse it with automatically adding validation attributes to an input.

## Accessibility cautions

The usefulness of the native `for` relationship depends on the derived property name matching the actual target element id. Do not assume `ForExpression` automatically guarantees association with every Bluent field; verify the generated target id in the consuming pattern.

The info trigger is currently an icon-only Button without a source-defined explicit accessible name in the reviewed Label markup. Treat that as an accessibility gap rather than inventing a label.

## Evidence boundary

Source verified from `Label.razor(.cs)` and the public label enums. Do not invent a `For` string parameter, validation behavior, automatic input id synchronization, or info-tooltip semantics beyond the current Popover composition.
