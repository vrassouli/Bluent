# Chart, Dataset, plugins, and scales

## Purpose

Use `Chart` from `Bluent.UI.Charts` for Chart.js-backed canvas charts. Compose datasets, chart plugins, and axis scales as children of the chart rather than building Chart.js configuration manually.

## Package and namespace

- Package: `Bluent.UI.Charts`
- Components: `Bluent.UI.Charts.Components`
- Supporting Chart.js option types: `Bluent.UI.Charts.ChartJs`
- Browser JS interop is required for the canvas to initialize and update.
- Do not add an unverified global Chart.js script; the verified task pattern uses the packaged module lifecycle.

## Minimal verified usage

```razor
@using Bluent.UI.Charts.Components
@using Bluent.UI.Charts.ChartJs

<Chart>
    <Legend Display="false" />
    <Title Text="Completed orders" />
    <YScale Text="Orders" />
    <Dataset ChartType="ChartType.Line"
             Data="_throughput"
             Label="Completed"
             Smooth />
</Chart>
```

`Dataset<TKey,TValue>.Data` accepts `IEnumerable<KeyValuePair<TKey,TValue>>`. The compiled task example uses `Dictionary<string,double>`.

## Public composition surface

### `Chart`

- `ChildContent` — nested datasets/plugins/scales.
- Renders a `<canvas>` and cascades itself to descendants.
- First render initializes Chart.js through JS interop; later renders call the interop update path with a rebuilt configuration.
- Implements async disposal for the interop host.

### `Dataset<TKey,TValue>`

Must be nested inside `Chart`; initialization throws otherwise.

Parameters:

- `Data` — required typed key/value sequence.
- `ChartType` — default `Bar`; values: `Bar`, `Line`, `Pie`, `Doughnut`, `PolarArea`, `Radar`, `Scatter`.
- `Label`
- `BorderColor`, `BackgroundColor`
- `BorderWidth`, `BorderRadius`
- `BorderSkipped`
- `Smooth` — maps to tension `0.4` when true.
- `FillTarget`

Datasets register with the parent on initialization and remove themselves on disposal. Chart labels are merged from dataset keys. Conflicting key orderings can make `Chart.MergeOrderedLists` throw `InvalidOperationException`.

### Plugins

The following are child components and require a cascading chart host:

- `Legend`: `Position` defaults to `Bottom`; `Display` defaults to `true`.
- `Title`: required `Text`; `Display=true`; optional font (`Family`, `Size`, `Weight`, `Style`) and padding (`Bottom`, `Left`, `Right`, `Top`).
- `Subtitle`: same text/font/padding shape as `Title`.
- `Tooltip`: `Enabled=true`.

`Title` and `Subtitle` refresh their plugin configuration in `OnParametersSet`. Current source creates the `Legend` and `Tooltip` plugin only during initialization, so changing their parameters after initialization should not be assumed to reconfigure the live plugin without runtime/source fixes.

### Scales

`Scale` is abstract; do not emit `<Scale>`. Use:

- `XScale`
- `YScale`

Both expose inherited `Display=true` and optional `Text`. They register a `ChartScale` during initialization and remove it on disposal. Current source does not rebuild that registered scale in `OnParametersSet`, so dynamic scale parameter updates are not established.

## Rendering and runtime

`Chart` is canvas/JS dependent. The canonical chart-dashboard task is build-verified, and repository hosting evidence records representative chart runtime in WebAssembly and interactive Blazor Web App modes. Do not claim meaningful static-SSR chart output from the canvas alone.

When chart data conveys important information, provide a textual summary/context outside the canvas.

## Common mistakes

- Do not assume installing `Bluent.UI` installs `Bluent.UI.Charts`.
- Do not instantiate abstract `ChartJs`, `Dataset`, or `Scale` types as Razor tags.
- Do not place `Dataset`, plugin, or scale children outside a chart host.
- Do not add a second global Chart.js script to the verified packaged-module pattern.
- Do not assume all child option components react to parameter changes; see the lifecycle limitations above.

## Evidence

Verified against current `Dev` source for `Chart`, `Dataset<TKey,TValue>`, `Legend`, `Title`, `Subtitle`, `Tooltip`, `Scale`, `XScale`, `YScale`, `ChartType`, plus the compiled `ChartDashboard.razor` task and its canonical task documentation.