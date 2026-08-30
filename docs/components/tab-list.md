# TabList and Tab

`TabList` is Bluent's overflow-aware tab surface. Compose it with public `Tab` children to select content panels, navigate with optional `Href` values, and move excess tabs into the inherited overflow menu.

## Package and namespace

- Package: `Bluent.UI`
- Consumer namespace: `Bluent.UI.Components`
- `TabList` derives from the abstract overflow infrastructure documented in [`overflow.md`](overflow.md).

## Minimal example

```razor
<TabList @bind-SelectedIndex="_selectedIndex">
    <Tab Text="Overview">
        <p>Overview content</p>
    </Tab>
    <Tab Text="History">
        <p>History content</p>
    </Tab>
</TabList>
```

## TabList parameters

| Parameter | Type | Default | Notes |
| --- | --- | --- | --- |
| `Appearance` | `TabListAppearance` | `Transparent` | Tab-list appearance. |
| `Size` | `TabListSize` | `Medium` | Tab-list size. |
| `SelectedIndex` / `SelectedIndexChanged` | `int` / `EventCallback<int>` | `-1` / empty | Selection contract; supports `@bind-SelectedIndex`. |
| `OnTabAdded` | `EventCallback<int>` | empty | Invoked with the index when a public `Tab` registers. |
| `EmptyContent` | `RenderFragment?` | `null` | Rendered when no concrete tab items are registered. |
| `ChildContent` | inherited from `Overflow` | `null` | Public `Tab` children. |
| `Orientation` | inherited from `Overflow` | `Horizontal` | Controls overflow orientation and CSS orientation. |

`TabList` adds `bui-tab-list`, orientation, appearance, and size CSS classes.

## Tab parameters

| Parameter | Type | Default | Notes |
| --- | --- | --- | --- |
| `Text` | `string` | `default!` | Visible tab label. |
| `MenuLabel` | `string?` | `null` | Alternate label when the tab renders in the overflow menu. |
| `Icon` | `IconDefinition?` | `null` | Optional tab icon. |
| `Href` | `string?` | `null` | When supplied, the visible tab item renders as an anchor and route state participates in selection. |
| `Match` | `NavLinkMatch` | enum default | Route matching mode. |
| `Data` | `object?` | `null` | Consumer-associated data. |
| `DeferredLoading` | `bool` | `false` | Panel content is not rendered until the tab is selected when enabled. |
| `OnClick` | `EventCallback` | empty | Invoked when the tab is activated. |
| `Orientation` | `Orientation` | `Horizontal` | Passed to the concrete rendered tab item; separate from the parent list's own inherited orientation. |
| `ChildContent` | `RenderFragment?` | `null` | Tab panel content. |
| `Actions` | `RenderFragment?` | `null` | Additional content rendered inside the visible tab item. |

`Tab` derives from `OverflowItemComponentBase` and must be nested under `TabList`. It renders as a normal `TabListTabItem` in the primary surface and as a `MenuItem` in the overflow surface.

## Selection behavior

`SelectedIndex = -1` means no selected tab. Selecting a tab updates `SelectedIndex`, invokes `SelectedIndexChanged`, and refreshes the previously/currently selected rendered tab items.

The source clamps programmatic selection performed through the internal selection path: indices above the current tab count become the last tab, and negative indices become zero. The public parameter itself is not rewritten merely because an out-of-range value was supplied; `SelectedTab` returns null unless the current index is valid.

When a tab has `Href`, the concrete tab item subscribes to `NavigationManager.LocationChanged` and uses Bluent's `UrlMatcher.ShouldMatch` to select/deselect according to route state.

## Panels and deferred loading

`TabList` renders panels only for registered tab items that have `ChildContent`. With `DeferredLoading=false`, panel markup may be rendered even while unselected and hidden through CSS state. With `DeferredLoading=true`, source renders the panel only once that tab is selected in the current render.

Do not describe deferred loading as persistence/caching beyond what this render condition proves.

## Overflow behavior

The inherited `Overflow` base renders `Tab` children in both primary and overflow contexts. A tab moved to the overflow representation becomes a `MenuItem` using `MenuLabel ?? Text`; activating that menu item selects the tab and invokes its `OnClick` callback.

JS interop is required for actual overflow measurement/reclassification. See [`overflow.md`](overflow.md).

## Accessibility and keyboard limitations

Visible non-link tab items render native `<button type="button">`, which is better than a generic clickable div. However current source shown for `TabList`/`TabListTabItem` does not add the full ARIA tabs pattern:

- no `role="tablist"` on the list;
- no `role="tab"`, `aria-selected`, or `aria-controls` on items;
- no `role="tabpanel"`/`aria-labelledby` on panel wrappers;
- no source-defined arrow-key roving focus behavior.

Therefore do not claim a complete WAI-ARIA tabs keyboard model without further implementation/runtime evidence. Links retain normal anchor semantics when `Href` is supplied.

## RTL

Overflow placement and the inherited overflow menu have direction-sensitive behavior that requires runtime verification. Avoid assuming `RightStart` placement or visual ordering automatically mirrors in RTL.

## Evidence

Source verified against `TabList.razor`, `TabList.razor.cs`, `Tab.cs`, `TabListTabItem.razor`, `TabListTabItem.razor.cs`, and the shared Overflow infrastructure on 2026-08-29. Overflow measurement, keyboard behavior, route-driven selection, and RTL remain runtime-verification targets.