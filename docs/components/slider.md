# Slider

`Slider<TValue>` is a pointer-driven scalar range control with `Min`, `Max`, `Value`, `ValueChanged`, and optional `ThumbSize`.

## When to use
Use it for approximate scalar selection across a bounded numeric range. Prefer `NumericField<TValue>` when precise typed entry or validation is more important than dragging.

## Package and namespace
`Bluent.UI`, namespace `Bluent.UI.Components`.

## Minimal verified example
```razor
<Slider @bind-Value="_value" Min="-50" Max="50" />
```
This exact pattern is compiled by `Sliders.razor`.

## Public API
- `Min`, `Max`: `TValue?`; when omitted, supported numeric types default to 0/100.
- `Value`: `TValue?`.
- `ValueChanged`: `EventCallback<TValue?>`; supports `@bind-Value`.
- `ThumbSize`: `int?`.
- inherited `Class`, `Style`, unmatched attributes and tooltip parameters from `BluentUiComponentBase`.

Current source implements numeric handling for nullable/non-nullable `sbyte`, `byte`, `short`, `ushort`, `int`, `uint`, `long`, `ulong`, `float`, `double`, and `decimal`. Do not assume arbitrary numeric-like structs are supported.

## Interaction and services
The root element handles pointer-down and the component participates in Bluent pointer move/up infrastructure through `IPointerMoveEventHandler` / `IPointerUpEventHandler`. It injects `IDomHelper`; use normal `AddBluentUI()` setup.

## Accessibility and keyboard
Current markup is a `<div>` with rail/thumb children. Source does not add native range input semantics, `role="slider"`, `tabindex`, `aria-valuemin/max/now`, or a keyboard handler. Therefore keyboard and slider accessibility semantics must not be claimed as supported without a separate implementation/runtime change.

## RTL/localization
No localized text is rendered. Pointer/layout behavior is source-observed only; RTL interaction has not been runtime verified.

## Render modes / JS
Interactive value changes require an interactive render mode and shared Bluent DOM/pointer infrastructure. No manual script tag is documented. Static SSR can render initial markup only.

## Common mistakes / limitations
- Do not describe it as a native `<input type="range">`; it is custom pointer-driven markup.
- No public `Step`, `Orientation`, or `Size` parameter currently exists; orientation/size code is commented out in source.
- Keyboard/accessibility behavior is not established by current markup.
- Runtime pointer behavior is not newly browser-verified by this documentation pass.

## Related components
- `RangeSlider<TValue>`: `range-slider.md`
- `NumericField<TValue>`: `numeric-field.md`

## Source and verification
- `src/Bluent.UI/Components/SliderComponent/Slider.razor`
- `src/Bluent.UI/Components/SliderComponent/Slider.razor.cs`
- compiled demo: `src/Bluent.UI.Demo.Pages/Pages/Components/Sliders.razor`
- source verified against the #406 PR branch on 2026-08-29.
