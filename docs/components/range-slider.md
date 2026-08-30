# RangeSlider

`RangeSlider<TValue>` is a pointer-driven two-thumb range selector whose value is `ValueRange<TValue>`.

## When to use
Use it when a user chooses a lower and upper bound from a numeric interval. Use two `NumericField` components when exact entry, validation messages, or keyboard-only operation is required.

## Package and namespace
`Bluent.UI`, namespace `Bluent.UI.Components`.

## Minimal verified example
```razor
<RangeSlider @bind-Value="_range" Min="0" Max="100" />

@code {
    private ValueRange<int> _range = new(10, 90);
}
```
The repository `Sliders.razor` showcase compiles the same binding pattern with `ValueRange<decimal>`.

## Public API
- `Min`, `Max`: `TValue?`; supported numeric types default to 0/100 when omitted.
- `Value`: `ValueRange<TValue>?`.
- `ValueChanged`: `EventCallback<ValueRange<TValue>?>`; supports `@bind-Value`.
- `ThumbSize`: `int?`.
- `ValueRange<TValue>` is the public lower/upper value type used by the binding contract.

Current source handles nullable/non-nullable integral and floating-point CLR numeric types explicitly. `Max` must be greater than `Min`; otherwise parameter processing throws `InvalidOperationException`.

## Interaction and services
The root handles pointer-down and the component implements Bluent pointer move/up handler interfaces. It injects `IDomHelper`; use normal `AddBluentUI()` registration.

## Accessibility and keyboard
Current markup consists of a `<div>`, rail, and two thumb `<div>` elements. Source does not provide focusability, keyboard handlers, native range inputs, slider roles, or ARIA range values. Do not claim accessible two-thumb slider semantics from the current implementation.

## RTL/localization
No built-in text is rendered. RTL pointer behavior has not been runtime verified.

## Render modes / JS
Value interaction requires an interactive render mode and shared Bluent DOM/pointer infrastructure. Static SSR can only render initial markup.

## Common mistakes / limitations
- Do not document native `<input type="range">` semantics; this is custom pointer markup.
- There is no public `Step`, `Orientation`, or keyboard API in the current source.
- Two-thumb keyboard/accessibility behavior is not implemented by the verified markup.
- Runtime dragging has not been newly browser-tested in this documentation pass.

## Related components
- `Slider<TValue>`: `slider.md`
- `NumericField<TValue>`: `numeric-field.md`

## Source and verification
- `src/Bluent.UI/Components/RangeSliderComponent/RangeSlider.razor`
- `src/Bluent.UI/Components/RangeSliderComponent/RangeSlider.razor.cs`
- `src/Bluent.UI/Components/RangeSliderComponent/ValueRange.cs`
- compiled demo: `src/Bluent.UI.Demo.Pages/Pages/Components/Sliders.razor`
- source verified against the #406 PR branch on 2026-08-29.
