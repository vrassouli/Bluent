# DataPager

`DataPager` renders page-navigation controls from a current page and page count. It supports callback-driven paging or URL-link mode.

## Package and namespace

```razor
@using Bluent.UI.Components
```

Package: `Bluent.UI`

## Basic callback mode

```razor
<DataPager Page="_page"
           PageChanged="PageChanged"
           PageCount="_pageCount" />
```

## Public API

| Parameter | Type | Default |
| --- | --- | --- |
| `ButtonShape` | `ButtonShape` | `Circular` |
| `ShowFirstPage` | `bool` | `true` |
| `ShowPreviousPage` | `bool` | `false` |
| `ShowNextPage` | `bool` | `false` |
| `ShowLastPage` | `bool` | `true` |
| `FirstPageText` | `string?` | `null` |
| `PreviousPageText` | `string?` | `null` |
| `NextPageText` | `string?` | `null` |
| `LastPageText` | `string?` | `null` |
| `NextButtonIcon` | `IconDefinition?` | `FluentIcons.ChevronRight` |
| `PreviousButtonIcon` | `IconDefinition?` | `FluentIcons.ChevronLeft` |
| `FirstButtonIcon` | `IconDefinition?` | `FluentIcons.ArrowPrevious` |
| `LastButtonIcon` | `IconDefinition?` | `FluentIcons.ArrowNext` |
| `PageCount` | `int` | required |
| `Page` | `int` | `1` |
| `PageChanged` | `EventCallback<int>` | empty |
| `MaxPageButtons` | `int` | `5` |
| `PageQueryParameter` | `string?` | `null` |

The component inherits common Bluent attributes/tooltip support and renders a `<nav>` containing Bluent `ButtonGroup`/`Button` controls.

## Callback mode

When `PageQueryParameter` is empty, page buttons have no href and `GoTo(page)` updates the component's `Page` value and invokes `PageChanged` when the page differs from the current page.

The source does not itself clamp arbitrary externally supplied `Page`/`PageCount` values before all rendering calculations; pass sensible 1-based values.

## URL mode and current source bug

When `PageQueryParameter` is non-empty, page controls receive hrefs and `GoTo` returns without invoking `PageChanged`.

However, the current `UpdatePageQuery` implementation always writes:

```csharp
queryParams["page"] = newPageValue.ToString();
```

It does **not** use the value of `PageQueryParameter` as the query-string key. Therefore `PageQueryParameter` currently behaves as an URL-mode toggle rather than a functioning custom parameter-name setting. Do not document `PageQueryParameter="p"` as producing `?p=...` until source is fixed.

The URL builder also keeps existing query parameters but rebuilds from the current path.

## Button window

`MaxPageButtons` controls the current-page-number window. The component attempts to place previous buttons around the current page, then fills the remaining allowance with subsequent pages up to `PageCount`.

First/previous and next/last buttons are separately controlled through their `Show...` parameters.

## Accessibility and RTL

The `<nav>` wrapper provides native navigation structure, but current source does not add an automatic accessible label for the nav or `aria-current="page"` to the active button. Page state is represented visually through Bluent `Button.Toggled`/appearance.

Default directional icons are physical left/right/previous/next icons. Do not promise automatic RTL icon mirroring without verified runtime/style evidence; override the typed icon parameters when application semantics require it.

## Evidence boundary

Source verified from `DataPager.razor` and `DataPager.razor.cs`. Prefer the compiled `docs/examples/tasks/data-grid-paging.md` pattern for full grid/pager composition. Do not invent page-size, total-item, custom query-key, or automatic data-refresh APIs absent from current source.
