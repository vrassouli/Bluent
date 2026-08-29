# Gauge

## Purpose

Use `Gauge` from `Bluent.UI.Charts` for a JS-backed radial gauge with a numeric value, configurable range/angles, optional value text, and threshold colors.

## Package and namespace

- Package: `Bluent.UI.Charts`
- Namespace: `Bluent.UI.Charts.Components`
- Requires browser JS interop for initialization and value updates.

## Minimal usage

```razor
@using Bluent.UI.Charts.Components

<Gauge Min="0"
       Max="100"
       Value="72" />
```

## Public API

- `Value` (`double`)
- `Min` (`double`, default `0`)
- `Max` (`double`, default `100`)
- `StartAngle` (`int`, default `135`)
- `EndAngle` (`int`, default `45`)
- `Radius` (`int`, default `40`)
- `HideValue` (`bool`)
- `DisableAnimation` (`bool`)
- `FormatValue` (`Func<double,Task<string>>`) — defaults to current-culture `ToString`.
- `Colors` (`Dictionary<double,string>?`) — threshold/color configuration passed to the JS gauge.
- `GaugeClass`, `DialClass`, `ValueDialClass`, `ValueClass`
- `ViewBox`
- inherited Bluent component attributes/class/style/id surface.

## Lifecycle and binding

`Gauge` is not a two-way input control: there is no `ValueChanged` callback in current source. Treat `Value` as display input.

On first render the component initializes its JS gauge configuration and sets the value. After initialization, changing `Value` triggers `SetValueAsync`; the animation flag is derived from `DisableAnimation`.

Other configuration parameters (`Min`, `Max`, angles, radius, classes, colors, view box, value visibility) are passed during first-render initialization. Current source does not reinitialize the JS gauge when those parameters later change, so dynamic configuration updates should not be assumed.

`FormatValue` is invoked from JS through `GetLabelAsync` and may be asynchronous.

## Rendering and accessibility

The .NET component renders a host `<div>` and JS creates/manages the gauge. Browser runtime evidence is required for visual geometry, animation, color thresholds, and formatting callbacks.

Current source does not itself establish a native meter/progress semantic contract. If the value is important to understanding the page, expose equivalent textual/semantic context rather than relying only on the visual gauge.

## Common mistakes

- Do not use `@bind-Value`; current source has no `ValueChanged`.
- Do not assume changing range/angle/color configuration after initialization updates the live gauge.
- Do not claim static SSR provides the functional gauge.
- Do not use the visual gauge as the only representation of important state.

## Evidence

Source verified against current `Dev` `Gauge.cs` and its JS-interoperability lifecycle. Runtime behavior remains browser-dependent.