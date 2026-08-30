# ItemsList and ListItem

The Bluent List family is composed from `ItemsList` and nested `ListItem` components. Use it for explicitly authored selectable/navigation list content; use [DataList<TItem>](data-list.md) when items come from a collection/provider and should be virtualized through a template.

## Package and namespace

```razor
@using Bluent.Core
@using Bluent.UI.Components
```

Package: `Bluent.UI`

## Basic usage

```razor
<ItemsList SelectionMode="SelectionMode.Single"
           SelectedItemsChanged="SelectionChanged">
    <ListItem Text="Overview" Icon="@FluentIcons.Home" />
    <ListItem Text="Orders" Icon="@FluentIcons.Document" />
</ItemsList>
```

## ItemsList API

| Parameter | Type | Default | Notes |
| --- | --- | --- | --- |
| `ChildContent` | `RenderFragment?` | `null` | Nested `ListItem` content. |
| `SelectionMode` | `SelectionMode` | `Single` | Current selection policy. |
| `SelectedItemsChanged` | `EventCallback<IEnumerable<ListItem>>` | empty | Receives currently selected registered items after item selection changes. |

`ItemsList` registers nested list items internally and renders an `bui-list` class plus the kebab-cased selection mode.

A commented-out `Draggable` parameter exists in source but is not public API; do not use it.

## ListItem API

| Parameter | Type | Default / notes |
| --- | --- | --- |
| `ChildContent` | `RenderFragment?` | optional custom content |
| `Data` | `object?` | optional consumer data |
| `Text` | `string?` | optional text |
| `Icon` | `IconDefinition?` | optional typed icon |
| `Selected` | `bool` | `false` |
| `SelectedChanged` | `EventCallback<bool>` | selection binding callback |
| `OnClick` | `EventCallback` | click callback |
| `Href` | `string?` | optional navigation target |
| `Match` | `NavLinkMatch` | route matching behavior |

A `ListItem` must be nested in an `ItemsList`; initialization throws otherwise.

## Selection behavior

For non-link items:

- `SelectionMode.Single` selects the clicked item and asks the parent to deselect other selected items.
- `SelectionMode.Multiple` toggles the clicked item's selection.
- `SelectedChanged` is invoked whenever `SetSelection` changes the item.
- parent `SelectedItemsChanged` receives the currently selected registered items.

For link items:

- the item renders as `<a>` rather than `<div>`;
- click does not directly toggle list selection;
- active-state selection follows `NavigationManager.LocationChanged` + `NavLinkMatch`/URL matching;
- multiple-selection mode combined with `Href` throws during initialization.

When a `ListItem` is nested under an `AccordionPanel`, selecting it can expand the cascading panel.

## Render and accessibility considerations

Non-link list items currently render through a clickable `<div>` path rather than a native button. Current source does not establish listbox/option roles, roving tabindex, or keyboard selection handling. Do not claim WAI-ARIA listbox semantics or keyboard parity without runtime/source evidence.

Link items use native anchor semantics when an `Href` is present.

## Current source boundaries

- Drag-specific public parameters on `ItemsList`/`ListItem` are commented out; do not invent list dragging from the presence of `DndContext` plumbing.
- Selection equality for ordinary `ItemsList` is component-instance state, not a generic item-key abstraction.
- The family is explicitly authored; it does not provide data virtualization itself.

## Evidence boundary

Source verified from `ItemsList.razor(.cs)` and `ListItem.razor(.cs)`. Do not invent listbox keyboard behavior, direct `Items` parameters, templating/provider APIs, or drag configuration on this family; use `DataList<TItem>` for provider-backed templated virtualization.
