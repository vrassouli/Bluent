# Stack

`Stack` is a lightweight flexbox layout component for arranging child content horizontally or vertically with Bluent's layout utility classes.

Use it for ordinary one-dimensional component layout. It has no JavaScript, service, overlay, measurement, or selection behavior.

## Package and namespace

- Package: `Bluent.UI`
- Namespace: `Bluent.UI.Components`

## Minimal example

```razor
<Stack Orientation="Orientation.Horizontal"
       HorizontalAlignment="StackAlignment.End"
       VerticalAlignment="StackAlignment.Center"
       Wrap>
    <Button Text="Cancel" />
    <Button Text="Save" Appearance="ButtonAppearance.Primary" />
</Stack>
```

## Parameters

| Parameter | Type | Default | Notes |
| --- | --- | --- | --- |
| `ChildContent` | `RenderFragment?` | `null` | Content arranged by the stack. |
| `Orientation` | `Orientation` | `Horizontal` | Horizontal or vertical layout. |
| `HorizontalAlignment` | `StackAlignment` | `Stretch` | Alignment on the horizontal axis; how it maps to flex main/cross axis depends on `Orientation`. |
| `VerticalAlignment` | `StackAlignment` | `Stretch` | Alignment on the vertical axis; how it maps to flex main/cross axis depends on `Orientation`. |
| `Fill` | `bool` | `false` | Adds the `flex-fill` utility class. |
| `Wrap` | `bool` | `false` | Adds `flex-wrap`. |
| `Reverse` | `bool` | `false` | Uses row-reverse or column-reverse according to orientation. |
| `Overflow` | `StackOverflow` | `Default` | `Auto`/`Hidden` add corresponding overflow utility classes; `Default` adds none. |
| `Class` / `Style` / unmatched attributes | inherited | — | Forwarded to the root `<div>`. |

`StackAlignment` values are `Start`, `Center`, `End`, and `Stretch`. `StackOverflow` values are `Default`, `Auto`, and `Hidden`.

## Alignment mapping

For a horizontal Stack:

- `HorizontalAlignment` maps to flex `justify-content-*` when not `Stretch`;
- `VerticalAlignment` maps to `align-items-*` when not `Stretch`.

For a vertical Stack, those mappings swap axes:

- `VerticalAlignment` maps to `justify-content-*`;
- `HorizontalAlignment` maps to `align-items-*`.

`Stretch` is represented by omitting the corresponding explicit utility class in current source, so do not document a separate generated `*-stretch` class.

## Reverse behavior

Horizontal `Reverse=true` adds `flex-row-reverse`; normal horizontal layout relies on the base flex direction and does not explicitly add `flex-row` in current source. Vertical layout adds `flex-column` normally or `flex-column-reverse` when reversed.

## RTL

Because horizontal reverse/order and flex direction can interact with document direction and CSS utilities, distinguish `Reverse` from RTL. `Reverse` explicitly reverses the flex row/column order; it is not a locale/direction switch.

## Accessibility

`Stack` renders a plain `<div>` and adds no semantic role. This is appropriate for generic layout. If the child group has meaningful semantics (navigation, list, toolbar, etc.), choose the corresponding semantic/component structure rather than assuming `Stack` supplies it.

## Hosting and render modes

`Stack` is render-only layout and has no component-specific interactivity or JavaScript requirement. Its structure/styles can render in static SSR as well as interactive modes.

## Evidence

Source verified against `Stack.razor`, `Stack.razor.cs`, `StackAlignment.cs`, and `StackOverflow.cs` on 2026-08-29.