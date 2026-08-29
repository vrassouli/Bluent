# Tree and TreeItem

`Tree` is Bluent's hierarchical item component with expansion, optional tri-state checkbox behavior, links, and source-defined drag/drop/reorder hooks. Use it when the UI is genuinely hierarchical; use `ItemsList`/`DataList<TItem>` for flat selectable lists.

## Package and namespace

```razor
@using Bluent.UI.Components
```

Package: `Bluent.UI`

## Basic composition

```razor
<Tree CheckboxMode="TreeCheckboxMode.Cascade">
    <TreeItem Title="Projects" Expanded>
        <TreeItem Title="Bluent" />
        <TreeItem Title="Ruzin" />
    </TreeItem>
</Tree>
```

## Tree API

| Parameter | Type | Default / notes |
| --- | --- | --- |
| `ChildContent` | `RenderFragment?` | nested root `TreeItem` components |
| `CheckboxMode` | `TreeCheckboxMode` | `None` |
| `CircularCheckboxes` | `bool` | `false` |
| `Draggable` | `bool` | `false` |
| `Orderable` | `bool` | `false` |
| `ToggleSubItemsOnClick` | `bool` | `true` |
| `ToggleCheckStateOnClick` | `bool` | `false` |
| `OnClick` | `EventCallback<TreeItem>` | tree-level item-click callback |
| `OnItemDrop` | `EventCallback<DndContext>` | drop-on-item callback |
| `OnInsertAfter` | `EventCallback<DndContext>` | reorder/insert-after callback |
| `CanDrop` | `Func<object, object, bool>?` | optional source/target predicate |
| `CanDrag` | `Func<object, bool>` | defaults to always true |
| `CanReorder` | `Func<object, bool>` | defaults to always true |
| `SharedContext` | cascading `DndContext?` | optional shared drag/drop context |

`Tree.Items` exposes the registered root `TreeItem` instances as `IReadOnlyList<TreeItem>`.

`TreeCheckboxMode` values are `None`, `Independent`, `Cascade`, `CascadeDown`, and `CascadeUp`.

## TreeItem API

Important public parameters include:

- `Title` (`string`)
- `Icon` / `ExpandedIcon` (`IconDefinition?`)
- `Expanded` / `ExpandedChanged`
- `DisableCheckBox`
- nullable `IsChecked` / `IsCheckedChanged`
- `OnClick`
- `Data`
- `Href` and `Target`
- `DragData` (`Func<object>`, defaulting to `Data ?? this`)
- `ChildContent`
- `ItemTemplate`
- `Expandable`

`TreeItem.Items` exposes its registered child items as an `IReadOnlyList<TreeItem>`.

A `TreeItem` must be nested under a `Tree` or another `TreeItem`; root/child registration is managed through cascading parameters and removed on disposal.

## Expansion and click behavior

By default, clicking an item asks the item to toggle expansion when it has children or `Expandable=true`, then invokes the tree-level click callback. `ToggleSubItemsOnClick=false` disables that automatic expansion path.

`ToggleCheckStateOnClick=true` additionally toggles the item's checkbox state from item clicks.

## Checkbox propagation

The checkbox model is nullable (`bool?`) and supports cascade modes:

- `Independent` stops propagation.
- `Cascade` propagates down and then updates ancestors.
- `CascadeDown` propagates descendants only.
- `CascadeUp` updates ancestors only.

This source model is richer than a simple Boolean checkbox; do not replace nullable state with a non-nullable assumption in generated consumer code.

## Drag/drop and ordering

Tree drag/drop uses a `DndContext` carrying drag data and drop target data. Source-defined behavior distinguishes dropping onto an item (`OnItemDrop`) from inserting after an item (`OnInsertAfter`). `CanDrag`, `CanDrop`, and `CanReorder` restrict those operations.

`Draggable` and `Orderable` affect whether a `TreeItem` considers itself draggable; `DragData` determines the object stored in the context.

Treat these as event/data contracts, not evidence that the component persists hierarchy changes. The application is responsible for updating its backing model in response to drop/reorder callbacks.

## Runtime and accessibility boundaries

Expansion/checkbox clicks can work through Blazor interaction, while drag/drop behavior is browser-event dependent and requires runtime verification in the target host.

Current source does not by itself establish the complete WAI-ARIA tree/treeitem keyboard model, roving focus, arrow-key navigation, or keyboard-accessible drag/drop. Do not claim those semantics from the visual hierarchy alone. Verify checkbox cascade, drag/drop, ordering, RTL, and assistive-technology behavior before stronger guarantees.

## Evidence boundary

Source verified from `Tree.razor(.cs)`, `TreeItem.razor(.cs)`, `TreeCheckboxMode.cs`, and shared `DndContext`. Do not invent automatic data-source binding, persistence, lazy child loading APIs, or keyboard tree semantics absent from the current public surface.
