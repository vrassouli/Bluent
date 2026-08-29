# DropdownList<TItem, TValue>

`DropdownList<TItem, TValue>` is Bluent's virtualized, filterable selection control built on top of `DropdownSelect<TValue>`. Use it when the available item set is provider-backed or large enough to benefit from Blazor virtualization.

## Package and namespace

```razor
@using Bluent.UI.Components
@using Microsoft.AspNetCore.Components.Web.Virtualization
```

Package: `Bluent.UI`

`TItem` is constrained to `class`; `TValue` is unconstrained.

## Representative single-select usage

```razor
<DropdownList TItem="Customer"
              TValue="int"
              @bind-Value="_customerId"
              ItemValue="customer => customer.Id"
              ItemText="customer => customer?.Name ?? string.Empty"
              ItemProvider="id => FindCustomer(id)"
              ItemsProvider="LoadCustomers" />
```

The provider uses Bluent's filtered request:

```csharp
private ValueTask<ItemsProviderResult<Customer>> LoadCustomers(
    FilteredItemsProviderRequest request)
{
    // request.StartIndex, request.Count, request.Filter,
    // request.CancellationToken
}
```

## Public parameters

| Parameter | Type | Default / meaning |
| --- | --- | --- |
| `DropdownPlacement` | `Placement` | `BottomStart` |
| `MaxHeight` | `int` | `180` px for dropdown content |
| `HideFilter` | `bool` | `false` |
| `HideClear` | `bool` | `false` in the current public surface; see limitation below |
| `FilterPlaceholder` | `string?` | localized `Search` when empty |
| `Value` | `TValue?` | single-select value |
| `ValueChanged` | `EventCallback<TValue?>` | single-select binding callback |
| `SelectedItemChanged` | `EventCallback<TItem?>` | receives the last selected item |
| `SelectedItemsChanged` | `EventCallback<IEnumerable<TItem>>` | receives current selected items |
| `Values` | `IEnumerable<TValue>` | defaults to an empty sequence; see synchronization limitation |
| `ValuesChanged` | `EventCallback<IEnumerable<TValue>>` | presence of a delegate switches source behavior to multi-select mode |
| `EmptyDisplayText` | `string` | localized `Select...` when empty |
| `ItemSize` | `float` | `50`, passed to Blazor `Virtualize` |
| `ItemValue` | `Func<TItem, TValue?>` | required value selector |
| `ItemText` | `Func<TItem?, string>` | required text selector; receives `null` in unresolved selected-value display paths |
| `ItemContent` | `RenderFragment<TItem>?` | optional custom row content |
| `ItemsProvider` | `FilteredItemsProviderDelegate<TItem>` | required virtualized/filter-aware provider |
| `ItemProvider` | `Func<TValue, TItem>?` | optional resolver used when an externally supplied single `Value` must be mapped back to an item |
| `Placeholder` | `RenderFragment<PlaceholderContext>?` | forwarded to Blazor `Virtualize` |
| `EmptyContent` | `RenderFragment?` | forwarded to Blazor `Virtualize` |

The component inherits common Bluent attributes and tooltip parameters and forwards them to its internal `DropdownSelect`.

## Selection modes

Current source determines multi-select mode from `ValuesChanged.HasDelegate` rather than from the `Values` collection itself.

### Single select

When `ValueChanged` participates in binding:

- selecting a row clears prior selected items;
- the selected `TValue` is emitted through `ValueChanged`;
- `SelectedItemChanged` and `SelectedItemsChanged` are also invoked;
- the dropdown closes after an item selection change;
- external `Value` changes can be resolved through `ItemProvider`.

### Multi select

When `ValuesChanged` has a delegate:

- row selection uses `SelectionMode.Multiple`;
- the dropdown stays open after each item toggle;
- all selected values are emitted through `ValuesChanged`;
- the selected-value surface is composed from multiple `DropdownOption<TValue>` values/tags.

## Filtering and virtualization

When filtering is visible, the dropdown renders a `TextField` configured with `BindValueEvent="oninput"`, `GainFocus`, and localized placeholder text. Filter changes refresh the internal `Virtualize<TItem>` provider.

`FilteredItemsProviderRequest` exposes:

```csharp
int StartIndex
int Count
string? Filter
CancellationToken CancellationToken
```

The internal list is virtualized using Blazor's `Virtualize<TItem>` and the configured `ItemSize`.

## Important source limitations

- `Values` is a public parameter, but current source does not hydrate `_selectedItems` from incoming `Values`. Do not claim arbitrary external multi-select value synchronization without runtime/source changes.
- `HideClear` is public but current markup does not pass it into the internal `DropdownSelect` in the source reviewed here. Do not claim it currently hides the selected-value clear affordance.
- Multi-select mode is inferred from whether `ValuesChanged` has a delegate, not simply whether multiple values are supplied.
- `ItemProvider` is synchronous (`Func<TValue, TItem>`), even though the main item stream is async/provider-backed.
- Filtering/virtualization and popover behavior are interactive; static SSR alone cannot provide the full selection experience.
- Keyboard/focus/listbox semantics require runtime verification; the source composition alone is not evidence of a complete ARIA combobox/listbox implementation.

## Infrastructure

Because `DropdownList` composes `DropdownSelect`/Popover behavior, normal `AddBluentUI()` registration and one shared `<Containers />` host in the active layout are required for the interactive dropdown surface.

## Evidence boundary

Source verified from `DropdownList.razor`, `DropdownList.razor.cs`, and `FilteredItemsProviderRequest.cs`, plus the separately documented `DropdownSelect<TValue>` family. Do not replace the filtered provider contract with an invented `IEnumerable<TItem>`-only API or assume unverified external multi-select synchronization.
