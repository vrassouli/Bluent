# Spinner

`Spinner` is Bluent's indeterminate busy indicator with optional label text. Use it when work is in progress but no meaningful percentage is available.

## Package and namespace

```razor
@using Bluent.UI.Components
```

Package: `Bluent.UI`

## Basic usage

```razor
<Spinner Label="Loading orders" />
```

## Public API

| Parameter | Type | Default | Notes |
| --- | --- | --- | --- |
| `Appearance` | `SpinnerAppearance` | `Primary` | `Primary` or `Inverted`. |
| `LabelPosition` | `SpinnerLabelPosition` | `Below` | `Before`, `After`, `Above`, or `Below`. |
| `Size` | `SpinnerSize` | `Medium` | `ExtraTiny`, `Tiny`, `ExtraSmall`, `Small`, `Medium`, `Large`, `ExtraLarge`, or `Huge`. |
| `Label` | `string?` | `null` | Optional visible label. |

The component inherits normal Bluent `Class`, `Style`, `Id`, tooltip, and unmatched-attribute support.

## Render behavior

Current markup renders:

- a wrapper `<div>` with `bui-spinner` plus appearance/position/size classes;
- nested `<span>` elements for the animated spinner visual;
- a `<label>` element only when `Label` is non-empty.

Animation is CSS-driven; the component itself has no JavaScript interop or timer code.

## Accessibility

The current source does not add `role="status"`, `aria-busy`, a live region, or visually hidden status text automatically. The rendered `<label>` is not source-associated with a form control. Treat it as visible spinner text, not evidence of a native labeling relationship.

For an operation whose status must be announced to assistive technologies, provide verified accessible status semantics in the surrounding application until the component defines them itself.

## Choosing Spinner vs ProgressBar

Use `Spinner` for indeterminate busy state. Use [ProgressBar](progress-bar.md) when a meaningful percentage is known or when you want Bluent's determinate/indeterminate progress-bar visual with optional message/icon.

## Evidence boundary

Source verified from `Spinner.razor`, `Spinner.razor.cs`, `SpinnerAppearance.cs`, `SpinnerLabelPosition.cs`, and `SpinnerSize.cs`. Do not invent cancellation, value/progress, delay, overlay, or automatic busy-state semantics.
