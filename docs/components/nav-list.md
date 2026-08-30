# NavList and NavItem

`NavList` is Bluent's application-navigation list container. Compose it with `NavItem` for links, expandable nested navigation, optional item actions, and drawer-aware navigation.

## Package and namespace

- Package: `Bluent.UI`
- Namespace: `Bluent.UI.Components`

## Minimal example

```razor
<NavList>
    <NavItem Text="Home" Icon="@FluentIcons.Home" Href="/" Match="NavLinkMatch.All" />
    <NavItem Text="Reports" Icon="@FluentIcons.Document">
        <NavItem Text="Sales" Icon="@FluentIcons.ChartMultiple" Href="/reports/sales" />
    </NavItem>
</NavList>
```

## NavList parameters

| Parameter | Type | Default | Notes |
| --- | --- | --- | --- |
| `ChildContent` | `RenderFragment?` | `null` | Navigation items. |
| `Compact` | `bool` | `false` | Adds compact styling. |
| `CollapsedWidth` | `string` | `"44px"` | Written to CSS custom property `--nav-list-collapsed-width`. |
| `Class` / `Style` / unmatched attributes | inherited | — | Applied to the root `<div>`. |

`NavList` renders a root `<div>` and cascades itself to descendants. Current source does not add a `<nav>` element or navigation ARIA landmark automatically.

## NavItem parameters

| Parameter | Type | Default | Notes |
| --- | --- | --- | --- |
| `Text` | `string` | EditorRequired | Visible item text. |
| `Icon` | `IconDefinition?` | EditorRequired | Item icon. If its filled variant exists, source renders a second filled icon for active styling. |
| `Href` | `string?` | `null` | When non-empty, the item root is an `<a>`; otherwise it is a `<div>`. |
| `Match` | `NavLinkMatch` | enum default | Active-route matching mode. |
| `ChildContent` | `RenderFragment?` | `null` | Nested items; presence makes this item expandable. |
| `Options` | `RenderFragment?` | `null` | Additional option/action content beside the item label. |
| `Expanded` / `ExpandedChanged` | `bool` / `EventCallback<bool>` | `false` / empty | Supports `@bind-Expanded` for expandable items. |
| `AutoCloseDrawer` | `bool` | `true` | For non-expandable items, closes a cascading `Drawer` when clicked. |

## Navigation and active state

`NavItem` injects `NavigationManager`, subscribes to `LocationChanged`, and computes active state with Bluent's `UrlMatcher.ShouldMatch(Match, currentUri, absoluteHref)`. It unsubscribes during async disposal.

This is custom route matching; `NavItem` does not render Blazor's `NavLink` component.

## Expand and click behavior

If `ChildContent` exists, clicking the item toggles `Expanded` and invokes `ExpandedChanged`. In that branch it does not auto-close a cascading Drawer. A non-expandable item closes the cascading Drawer when `AutoCloseDrawer` is true.

Nested content is rendered in `.sub-items` with click propagation stopped at that wrapper.

## Accessibility and keyboard behavior

Current markup has important source-observed limitations:

- non-link expandable items use a clickable `<div>` rather than a native `<button>`;
- source does not add `tabindex`, keyboard handlers, `aria-expanded`, or `aria-controls` to that expandable `<div>`;
- `NavList` root is a `<div>`, not a `<nav>` landmark;
- the chevron icon is visual state; group/tree/navigation semantics are not established automatically.

Do not claim full keyboard navigation or ARIA navigation-tree semantics without runtime/accessibility evidence. Applications needing accessible expandable navigation should treat this as a current implementation gap rather than inventing undocumented built-in behavior.

## RTL

The source uses a `ChevronRight` expander icon and relies on component styling for visual direction handling. RTL chevron behavior should be verified in the existing demo/runtime before making direction-specific claims.

## Evidence

Source verified against `NavList.razor`, `NavList.razor.cs`, `NavItem.razor`, and `NavItem.razor.cs` on 2026-08-29. Active-route, expandable keyboard, drawer-close, and RTL interaction remain candidates for runtime verification.