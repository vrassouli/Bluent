# Diagram basic shapes: Circle, Line, Rect

## Purpose

Use the basic shape child components when a `DrawingCanvas`/`Diagram` needs simple programmatic geometry without manually constructing drawing-element objects.

## Package and namespace

- Package: `Bluent.UI.Diagrams`
- Namespace: `Bluent.UI.Diagrams.Components`
- Shapes require a cascading `DrawingCanvas` and throw when initialized outside one.

## Components

### `Circle`

Required geometry: `Cx`, `Cy`, `R` (`double`). Optional `StrokeWidth`, `Fill`, `Stroke`.

### `Line`

Required geometry: `X1`, `Y1`, `X2`, `Y2` (`double`). Optional `StrokeWidth`, `Fill`, `Stroke`.

### `Rect`

Required `Width`, `Height`; optional `X`, `Y`, `Rx`, `Ry`, `StrokeWidth`, `Fill`, `Stroke`.

## Lifecycle limitation

All three components create their backing drawing element in `OnInitialized`, add it to the cascading canvas, and remove it on disposal. Current source does **not** copy changed Razor parameters into the existing backing element during `OnParametersSet`.

Therefore, do not assume that changing geometry/style parameters on an already-initialized `Circle`, `Line`, or `Rect` updates the rendered shape. Treat the declarative parameters as initialization-time configuration unless runtime/source behavior is improved and verified.

## Composition

```razor
<Diagram>
    <Rect X="20" Y="20" Width="160" Height="80" />
    <Line X1="180" Y1="60" X2="280" Y2="60" />
    <Circle Cx="320" Cy="60" R="40" />
</Diagram>
```

The compiled simple-diagram task provides representative package/shape composition. It is not proof of dynamic geometry updates or editor interaction.

## Common mistakes

- Do not render these shape components outside `DrawingCanvas`/`Diagram`.
- Do not assume parameter changes after initialization mutate the backing element.
- Do not infer keyboard/selection semantics from these declarative wrappers alone.

## Evidence

Source verified against current `Dev` `Circle.cs`, `Line.cs`, and `Rect.cs`, plus the compiled simple-diagram consumer task.