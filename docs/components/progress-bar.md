# ProgressBar

`ProgressBar` displays determinate percentage progress or an indeterminate busy animation, with an optional message and typed icon.

## Package and namespace

```razor
@using Bluent.UI.Components
```

Package: `Bluent.UI`

## Basic usage

```razor
<ProgressBar Value="65"
             Message="Uploading files"
             Color="ProgressBarColor.Brand" />
```

For unknown-duration work:

```razor
<ProgressBar Indeterminate Message="Preparing report" />
```

## Public API

| Parameter | Type | Default | Notes |
| --- | --- | --- | --- |
| `Value` | `float` | `0` | Percentage used in determinate mode. Rendered width is clamped to `0..100`. |
| `Message` | `string?` | `null` | Optional text rendered below/alongside the progress track according to styling. |
| `Icon` | `IconDefinition?` | `null` | Optional icon shown with `Message`. |
| `Color` | `ProgressBarColor` | `Brand` | `Brand`, `Success`, `Error`, or `Warning`. |
| `Size` | `ProgressBarSize` | `Small` | `Small` or `Large`. |
| `Indeterminate` | `bool` | `false` | Enables indeterminate styling and removes the explicit bar-width style. |

The component inherits normal Bluent `Class`, `Style`, `Id`, tooltip, and unmatched-attribute support.

## Value behavior

In determinate mode the current source renders the bar width as:

```csharp
Math.Max(0, Math.Min(Value, 100))
```

So values below zero render at 0% and values above 100 render at 100%. The component does not throw or mutate the supplied `Value`.

In indeterminate mode no width style is emitted; CSS controls the animation through the `indeterminate` class.

## Render behavior

Current markup is composed from nested `<div>` elements. When `Message` is non-empty, a message region is rendered and the optional typed icon precedes the text.

The component does not require JavaScript or an interactive render mode for its own visual state; changing parameters through Blazor interaction of course requires the host to rerender them.

## Accessibility

Current source does not add native `<progress>` markup or source-defined `role="progressbar"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, or live-region semantics. Do not claim assistive-technology progress semantics from the visual bar alone. Applications that need announced progress should add verified accessible context until the component itself establishes that contract.

## Evidence boundary

Source verified from `ProgressBar.razor`, `ProgressBar.razor.cs`, `ProgressBarColor.cs`, and `ProgressBarSize.cs`. Do not invent min/max parameters, value-change events, child content, cancellation behavior, or native progress semantics that are not present in current source.
