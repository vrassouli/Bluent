# DataGrid<TItem>

`DataGrid<TItem>` is Bluent's virtualized tabular data component. It composes registered `DataGridColumn<TItem>` definitions into frozen and scrollable column groups and obtains rows through Blazor's `ItemsProviderDelegate<TItem>`.

## Package and namespace

```razor
@using Bluent.UI.Components
@using Microsoft.AspNetCore.Components.Web.Virtualization
```

Package: `Bluent.UI`

`TItem` is constrained to `class`.

## Basic usage

```razor
<DataGrid TItem="Order"
          ItemsProvider="LoadOrders"
          RowSize="36">
    <Columns>
        <DataGridColumn TItem="Order" Header="Id" Field="order => order.Id" Width="90" Freezed />
        <DataGridColumn TItem="Order" Header="Customer" Field="order => order.CustomerName" Width="220" />
        <DataGridColumn TItem="Order" Header="Total" Field="order => order.Total" Format="{0:N0}" Width="120" />
    </Columns>
</DataGrid>
```

The repository's canonical compiled data-grid/paging task should be preferred when a full consumer pattern is needed: `docs/examples/tasks/data-grid-paging.md`.

## DataGrid parameters

| Parameter | Type | Default | Notes |
| --- | --- | --- | --- |
| `ItemsProvider` | `ItemsProviderDelegate<TItem>?` | `null` | Provider used by both frozen and main virtualizers. |
| `Columns` | `RenderFragment?` | `null` | Column-definition content. |
| `RowSize` | `int` | `32` | Passed as the virtualized item size. |

Public method:

```csharp
Task RefreshAsync()
```

`RefreshAsync()` refreshes both internal virtualizers when they exist.

## DataGridColumn<TItem>

Columns must be nested in the matching `DataGrid<TItem>`; initialization throws when the cascading grid is missing. A column registers with the grid on initialization and unregisters on disposal.

| Parameter | Type | Default / notes |
| --- | --- | --- |
| `Header` | `string?` | Optional explicit header text. |
| `Field` | `Expression<Func<TItem, object?>>?` | Optional value expression. |
| `CellClasses` | `Func<TItem, IEnumerable<string>>?` | Per-row cell classes. |
| `HeaderClasses` | `Func<IEnumerable<string>>?` | Header-cell classes. |
| `ChildContent` | `RenderFragment<TItem>?` | Optional custom cell template. |
| `Format` | `string?` | Passed to `string.Format(Format, value)`. |
| `Width` | `double` | `150`, rendered in pixels. |
| `Wrap` | `bool` | `false`; consumed by row/cell rendering. |
| `Freezed` | `bool` | `false`; places the column in the frozen group. |

When `Header` is absent and `Field` is present, the column derives a display name from the expression. Enum field values are converted through the repository display-name extension before optional formatting.

## Virtualization and frozen columns

Current markup creates separate virtualized row streams when frozen columns exist:

- one `Virtualize<TItem>` for `Freezed == true` columns;
- one `Virtualize<TItem>` for non-frozen columns.

Both receive the same `ItemsProvider` and `RowSize`. Consumers should therefore ensure their provider is safe to call independently for the same visible range.

## JavaScript and render modes

`DataGrid<TItem>` creates `DataGridInterop` during initialization and calls its `Initialize()` method after the first render. The current code path does not guard initialization with `RendererInfo.IsInteractive`.

Consequences:

- browser/JS behavior is part of the current component implementation;
- static/prerender behavior needs dedicated runtime verification rather than being inferred from other Bluent controls;
- interop is disposed asynchronously with the component.

Do not claim a render-mode matrix beyond verified evidence.

## Accessibility

The current top-level source renders `<div>`-based grid/header/content structures rather than a native `<table>` in the code reviewed here. Do not infer table/grid ARIA roles, keyboard cell navigation, sorting semantics, row selection, or screen-reader table behavior unless the corresponding current source/runtime evidence establishes it.

## Current limitations

- No public sort/filter/group/edit/selection parameters are present on `DataGrid<TItem>` in the source reviewed here.
- `ItemsProvider` is the row source; there is no public direct `Items` collection parameter on this component.
- `Width` is pixel-based in current column style generation.
- Frozen and main areas can independently invoke the provider.

## Evidence boundary

Source verified from `DataGrid.razor`, `DataGrid.razor.cs`, and `DataGridColumn.cs`; internal row renderers remain implementation details. Do not invent sorting, filtering, editing, direct items, column reordering, or native-table APIs absent from the current public surface.
