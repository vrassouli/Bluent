# Simple diagram using Bluent.UI.Diagrams

Use the Diagrams package when an application needs a diagram surface. This
minimal example supplies meaningful SVG child content without introducing an
editor workflow.

## Requirements

- Package: `Bluent.UI.Diagrams`
- Namespace: `Bluent.UI.Diagrams.Components`
- Stylesheet:
  `_content/Bluent.UI.Diagrams/bluent.ui.diagrams.min.css`
- `Bluent.UI` is separate and is not installed transitively by Diagrams

## Complete source

[`SimpleDiagram.razor`](../../../samples/Bluent.TaskExamples/Pages/Tasks/SimpleDiagram.razor)
is the canonical compiled source. It declares a `Diagram` with two labeled
states and a directional connector using SVG child content.

## Expected behavior

The package surface renders a new-order state connected to a fulfilled state
inside a constrained diagram frame.

## Common mistakes

- Installing `Bluent.UI` does not install `Bluent.UI.Diagrams`.
- Include the diagram stylesheet in addition to any main UI styles.
- Constrain the diagram's height; an unconstrained canvas may have no useful
  visible area.
- This example is a display diagram, not proof of editing, selection, keyboard,
  touch, or persistence behavior.

## Render modes and evidence

The package, component, and child SVG compile in the standalone consumer.
Diagram module initialization requires an interactive browser. Representative
runtime evidence is recorded in the
[hosting guide](../../compatibility/hosting-and-render-modes.md).
