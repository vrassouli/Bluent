# Breadcrumb and BreadcrumbItem

`Breadcrumb` composes a hierarchy/location trail from nested `BreadcrumbItem` components.

## Package and namespace

```razor
@using Bluent.UI.Components
```

Package: `Bluent.UI`

## Basic usage

```razor
<Breadcrumb>
    <BreadcrumbItem Title="Home" Href="/" />
    <BreadcrumbItem Title="Orders" Href="/orders" />
    <BreadcrumbItem Title="Order 42" />
</Breadcrumb>
```

## Breadcrumb API

| Parameter | Type | Default |
| --- | --- | --- |
| `ChildContent` | `RenderFragment?` | `null` |
| `Size` | `BreadcrumbSize` | `Medium` |

## BreadcrumbItem API

| Parameter | Type | Notes |
| --- | --- | --- |
| `Title` | `string` | editor-required |
| `Href` | `string?` | optional navigation target |
| `Target` | `string?` | optional anchor target |
| `Icon` | `IconDefinition?` | optional typed icon |

An item with an empty `Href` is treated as the current item and receives the current-state class; items with hrefs render as navigable links according to the current markup.

## Accessibility boundary

Use one non-link/current item at the end of the hierarchy when appropriate. Verify current markup for nav labeling, separators, and `aria-current` before claiming the complete WAI-ARIA breadcrumb pattern; the source state/class alone is not proof that every semantic attribute is present.

## Evidence boundary

Source verified from `Breadcrumb.razor(.cs)`, `BreadcrumbItem.razor(.cs)`, and `BreadcrumbSize`. Do not invent automatic route generation, item collections, overflow behavior, or current-route matching beyond the explicit `Href`-empty current-item rule.
