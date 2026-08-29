# TileLayout

`TileLayout` is a CSS-driven Bluent layout primitive for arranging child content into responsive tiles. Use it when content should flow through a repeated tile/grid layout with a configurable minimum cell width and gap.

## Package and namespace

```razor
@using Bluent.UI.Components
```

Package: `Bluent.UI`

## Basic usage

```razor
<TileLayout CellMinWidth="240px" CellGap="1.5rem">
    <Card>First</Card>
    <Card>Second</Card>
    <Card>Third</Card>
</TileLayout>
```

## Public API

| Parameter | Type | Default | Notes |
| --- | --- | --- | --- |
| `ChildContent` | `RenderFragment?` | `null` | Tiles/content to arrange. |
| `CellMinWidth` | `string` | `"300px"` | Written to CSS custom property `--tile-cell-width`. |
| `CellGap` | `string` | `"1rem"` | Written to CSS custom property `--tile-cell-gap`. |

The component also inherits the standard Bluent `Class`, `Style`, `Id`, and unmatched-attribute surface.

## Render behavior

`TileLayout` renders one wrapper `<div>` with class `bui-tile-layout` and its child content. Layout sizing is exposed to Bluent CSS through these custom properties:

```text
--tile-cell-width
--tile-cell-gap
```

The parameter values are CSS strings, not numeric Bluent size enums. Supply valid CSS lengths such as `240px`, `18rem`, or other values supported by the consuming stylesheet/browser.

## Runtime and interaction

The component itself has no JavaScript interop, pointer logic, selection model, or interactive render-mode requirement. Responsive wrapping is CSS-driven.

## Accessibility

`TileLayout` currently adds no semantic grid/list roles of its own. Choose semantic child components/content appropriate to the information being presented; do not infer keyboard grid behavior from the visual tile layout.

## Evidence boundary

Source verified from `TileLayout.razor` and `TileLayout.razor.cs`. Do not invent row/column counts, per-item span APIs, drag/reorder behavior, virtualization, or breakpoint parameters that are not present in current source.
