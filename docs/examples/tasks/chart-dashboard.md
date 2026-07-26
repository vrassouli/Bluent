# Dashboard using Bluent.UI.Charts

Use the Charts package for a compact operational visualization and keep the
dataset typed in application code.

## Requirements

- Packages: `Bluent.UI.Charts`; `Bluent.UI` only when the page also uses main
  UI components such as `MessageBar`
- Namespaces: `Bluent.UI.Charts.Components` and
  `Bluent.UI.Charts.ChartJs`
- Assets: the main UI styles when using main components; no manually added
  global Chart.js script is required by this verified pattern

## Complete source

[`ChartDashboard.razor`](../../../samples/Bluent.TaskExamples/Pages/Tasks/ChartDashboard.razor)
is the canonical compiled source. It contains the chart, legend, title, axis,
line dataset, colors, fill, and typed throughput data.

## Expected behavior

The chart renders one smooth line/area series with weekday labels and a hidden
legend. The surrounding MessageBar provides a textual context rather than
using the chart as the only explanation.

## Common mistakes

- Installing `Bluent.UI` does not install `Bluent.UI.Charts`.
- Import the Charts component and Chart.js option namespaces.
- Do not add an unverified global script tag; the component uses its packaged
  module lifecycle.
- Provide an accessible textual summary when the data is important.

## Render modes and evidence

The chart source and package relationship are build-verified. Canvas
initialization requires an interactive browser. Representative chart runtime
evidence exists for WebAssembly and the interactive Blazor Web App modes in
the [hosting guide](../../compatibility/hosting-and-render-modes.md).
