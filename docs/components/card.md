# Card family

`Card` is Bluent's visual content container with optional click, selection, or link behavior. The family also contains structural child components such as `CardHeader`, `CardContent`, `CardFooter`, and `CardFloatingAction` for card composition.

## Package and namespace

```razor
@using Bluent.UI.Components
```

Package: `Bluent.UI`

## Basic usage

```razor
<Card Appearance="CardAppearance.Outline">
    <CardHeader Title="Order" />
    <CardContent>
        Order details
    </CardContent>
</Card>
```

## Card API

| Parameter | Type | Default | Notes |
| --- | --- | --- | --- |
| `Orientation` | `CardOrientation` | `Vertical` | `Vertical` or `Horizontal`. |
| `Size` | `CardSize` | `Medium` | `Small`, `Medium`, or `Large`. |
| `Appearance` | `CardAppearance` | `Filled` | `Filled`, `FilledAlternative`, `Outline`, or `Subtle`. |
| `ChildContent` | `RenderFragment?` | `null` | Card content/composition. |
| `OnClick` | `EventCallback` | empty | Click callback. |
| `Selected` | `bool` | `false` | Visual/current selection state. |
| `SelectedChanged` | `EventCallback<bool>` | empty | Presence of a delegate makes the card selectable. |
| `Href` | `string?` | `null` | Non-empty values make the root an anchor. |

A card is considered active for styling when it has a click callback, is selectable, or has an href.

## Root element and interaction

- With a non-empty `Href`, the card renders as `<a>` and adds `href` unless the inherited disabled state is true.
- Without `Href`, the card renders as `<div>`, even when `OnClick` or `SelectedChanged` is present.
- Click always schedules `OnClick`.
- When `SelectedChanged` has a delegate, clicking toggles `Selected` and invokes `SelectedChanged`.

Current `ClickHandler` does not guard callback/selection toggling with inherited `IsDisabled`; disabled styling/attribute behavior should therefore not be treated as complete interaction suppression.

## Accessibility cautions

Clickable/selectable cards without `Href` remain div-based in current source and do not automatically gain button semantics, tabindex, keyboard activation, `aria-pressed`, or selectable-option semantics. Do not claim those behaviors from the `active`/`selected` classes alone.

Link cards retain native anchor semantics while an href is present; disabled link cards suppress the href but remain anchors.

## Composition

Use Card family structural components when they match the intended layout instead of rebuilding card regions with arbitrary wrapper markup. Their individual surfaces are intentionally small and tied to card composition; do not infer unrelated application behavior from their names.

## Evidence boundary

Source verified from `Card.cs`, public Card enums, and the family source directory. Do not invent disabled-event suppression, keyboard-card behavior, generic routing state, or selection-group management absent from current source.
