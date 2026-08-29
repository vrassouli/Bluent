# ActionCard family

`ActionCard` is a prominent titled card that can be clickable, navigational, or expandable. `ActionCardGroup` is the lightweight grouping wrapper for related action cards.

## Package and namespace

```razor
@using Bluent.UI.Components
```

Package: `Bluent.UI`

## Basic usage

```razor
<ActionCard Title="Reports"
            Description="Open reporting tools"
            Icon="@FluentIcons.Document"
            OnClick="OpenReports" />
```

Expandable cards supply `ChildContent` and can bind `IsExpanded`.

## ActionCard API

| Parameter | Type | Notes |
| --- | --- | --- |
| `Title` | `string` | editor-required |
| `Description` | `string?` | optional text description |
| `DescriptionContent` | `RenderFragment?` | optional rich description content |
| `Icon` | `IconDefinition?` | optional typed icon |
| `IconContent` | `RenderFragment?` | optional custom icon-region content |
| `HeaderAction` | `RenderFragment?` | optional extra header action |
| `ChildContent` | `RenderFragment?` | presence makes the card expandable |
| `IsExpanded` | `bool` | current expansion state |
| `IsExpandedChanged` | `EventCallback<bool>` | expansion binding callback |
| `OnClick` | `EventCallback` | header/action callback |
| `Href` | `string?` | non-empty values make the card link-backed |
| `DeferredLoading` | `bool` | controls deferred child rendering |

A card is styled active when it is expandable, has an href, or has a click delegate.

## Click and expansion behavior

Header click toggles `IsExpanded` when `ChildContent` exists and invokes `IsExpandedChanged`; it then invokes `OnClick`. Link-backed cards use an anchor root; otherwise the source uses a div-based root/composition.

`ActionCardGroup` provides grouped child-content layout but does not establish a shared selection model or radio-like exclusivity.

## Accessibility cautions

Expandable/clickable non-link action cards should not be assumed to have native button semantics or complete `aria-expanded` behavior without verifying the rendered markup/runtime. Link mode uses native anchor semantics when href is present.

## Evidence boundary

Source verified from `ActionCard.razor(.cs)` and `ActionCardGroup.razor(.cs)`. Do not invent selection groups, automatic routing state, async data loading, or keyboard semantics absent from current source.
