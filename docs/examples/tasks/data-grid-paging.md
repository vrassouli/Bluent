# DataGrid with paging

Use `DataGrid` with an `ItemsProvider` for row virtualization and `DataPager`
for application-controlled pages.

## Requirements

- Package: `Bluent.UI`
- Namespaces: `Bluent.UI.Components` and
  `Microsoft.AspNetCore.Components.Web.Virtualization`
- Services and assets: the [shared setup](README.md#shared-consumer-setup)

## Complete source

[`DataGridPaging.razor`](../../../samples/Bluent.TaskExamples/Pages/Tasks/DataGridPaging.razor)
is the canonical compiled source. It contains the row model, in-memory data
source, `ItemsProvider`, page calculation, columns, custom currency cell, and
bound pager.

## Expected behavior

The grid displays five orders per application page. Pager actions change the
page, recreate the keyed grid, and request the corresponding slice of rows.

## Common mistakes

- `ItemsProviderRequest.StartIndex` and `Count` describe the grid's requested
  range; honor both values.
- Return the count for the current provider result set, not an invented total.
- Production sorting, filtering, paging, authorization, and cancellation
  remain data-source responsibilities.
- Give the grid a constrained height so virtualization has a usable viewport.

## Render modes and evidence

The generic row type, provider delegate, columns, pager parameters, and model
compile in the WebAssembly consumer. Virtualization, paging callbacks, and
JavaScript-backed grid behavior require an interactive browser context.
