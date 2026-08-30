# DataList<TItem>

`DataList<TItem>` is Bluent's provider-/collection-backed virtualized selectable list. It inherits `ItemsList`, so it reuses Bluent list selection behavior while generating `ListItem` instances from data through `ItemTemplate`.

## Package and namespace

```razor
@using Bluent.Core
@using Bluent.UI.Components
@using Microsoft.AspNetCore.Components.Web.Virtualization
```

Package: `Bluent.UI`

`TItem` is constrained to `class`.

## Basic usage

```razor
<DataList TItem="Customer"
          Items="_customers"
          ItemTemplate="customer => @<span>@customer.Name</span>"
          @bind-SelectedItem="_selectedCustomer" />
```

For remote/large data, supply `ItemsProvider` instead of a direct collection.

## Public API

`DataList<TItem>` adds these parameters on top of the inherited `ItemsList.SelectionMode` and `SelectedItemsChanged` surface:

| Parameter | Type | Default / notes |
| --- | --- | --- |
| `Items` | `ICollection<TItem>?` | optional direct collection |
| `ItemsProvider` | `ItemsProviderDelegate<TItem>?` | optional Blazor virtualized provider |
| `ItemsSize` | `float` | `36`, passed as `Virtualize.ItemSize` |
| `ItemTemplate` | `RenderFragment<TItem>?` | editor-required item content template |
| `PlaceHolder` | `RenderFragment<PlaceholderContext>?` | virtualization placeholder; note the public spelling `PlaceHolder` |
| `EmptyContent` | `RenderFragment?` | virtualization empty state |
| `ItemKey` | `Func<TItem, object>` | defaults to the item itself |
| `SelectedData` | `List<TItem>` | defaults to a new list |
| `SelectedItem` | `TItem?` | single/current selected item |
| `SelectedItemChanged` | `EventCallback<TItem?>` | current-item callback |
| `SelectedDataChanged` | `EventCallback<List<TItem>>` | selected-data callback |

Public method:

```csharp
Task RefreshDataAsync()
```

It refreshes the internal `Virtualize<TItem>` when available.

## Collection vs provider source

The internal Blazor `Virtualize<TItem>` receives both `Items` and `ItemsProvider` from the component. Follow Blazor virtualization rules and provide the appropriate source mode rather than relying on both simultaneously.

When the `Items` collection reference changes, `DataList` calls `RefreshDataAsync()`.

## Selection model

Each virtualized item becomes a `ListItem` with:

- `Data=context`;
- `@key=ItemKey(context)`;
- selection derived through `SelectedItem`/`SelectedData` and `ItemKey`;
- content from `ItemTemplate`.

When the external `SelectedItem` changes, current source clears `SelectedData` and replaces it with that single item when non-null.

For user selection:

- single mode clears prior selected data before adding the selected item;
- multiple mode keeps multiple entries;
- `SelectedDataChanged` receives the component's current mutable list;
- `SelectedItem` becomes the most recently selected item, or the last remaining selected item after removal.

## Important source cautions

- `SelectedData` defaults to a mutable `List<TItem>` and the component mutates it directly (`Clear`, `Add`, `RemoveAll`). Passing an externally owned list means the component will mutate that instance; do not treat it as immutable input.
- External `SelectedItem` synchronization collapses `SelectedData` to at most that item, even when list selection mode is multiple.
- `ItemKey` equality drives selected-data matching; choose a stable key.
- `ItemTemplate` is nullable in type but marked editor-required and is the intended content path.
- The public property is spelled `PlaceHolder`, not `Placeholder`.

## Accessibility and runtime

Virtualization requires interactive rendering for full scrolling/data behavior. The generated selection items inherit the current `ItemsList`/`ListItem` semantics; non-link list items are clickable div-based content without source-defined listbox roles or keyboard selection model. Do not claim complete listbox accessibility without runtime/source evidence.

## Evidence boundary

Source verified from `DataList.razor`, `DataList.razor.cs`, and the canonical List family source. `DataList<TItem>` is a distinct public family and should not be conflated with `DataGrid<TItem>` or `DropdownList<TItem,TValue>`.
