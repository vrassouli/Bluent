# Menu, MenuList, and MenuItem

`Menu` is a click-triggered popover wrapper that renders its items inside `MenuList`. Use it for compact command/action menus. `MenuList` and `MenuItem` are the lower-level composition primitives used inside menus and submenus.

## Package and namespace

- Package: `Bluent.UI`
- Namespace: `Bluent.UI.Components`
- Popover-backed interaction requires normal Bluent service registration and the shared `<Containers />` host.

## Minimal example

```razor
<Menu Placement="Placement.BottomStart">
    <Trigger>
        <Button Text="Actions" />
    </Trigger>
    <Items>
        <MenuItem Title="Edit" Icon="@FluentIcons.Edit" OnClick="Edit" />
        <MenuItem Title="Delete" Icon="@FluentIcons.Delete" OnClick="Delete" />
    </Items>
</Menu>
```

## Menu parameters

| Parameter | Type | Default | Notes |
| --- | --- | --- | --- |
| `Trigger` | `RenderFragment` | EditorRequired | Rendered as the trigger of an internal `Popover`. |
| `Items` | `RenderFragment` | EditorRequired | Wrapped automatically in `MenuList`. |
| `Placement` | `Placement` | `Bottom` | Passed to the internal popover. |
| inherited unmatched attributes | inherited | — | Forwarded to the internal `Popover`. |

Current source fixes `TriggerEvents="click"` and `DisplayArrow="false"` for the Menu wrapper.

## MenuList

`MenuList` exposes `ChildContent` plus inherited root attributes/styles. It renders a plain root `<div>` and cascades itself to descendant `MenuItem` components. Internally it tracks current items so all rows reserve icon/checkmark columns consistently when any item requires those columns.

## MenuItem parameters

| Parameter | Type | Default | Notes |
| --- | --- | --- | --- |
| `Title` | `string` | EditorRequired | Visible item title. |
| `OnClick` | `EventCallback` | empty | Command callback. |
| `ChildContent` | `RenderFragment?` | `null` | Presence creates a submenu. |
| `Icon` | `IconDefinition?` | `null` | Optional item icon. |
| `Checked` | `bool` | `false` | Renders a checkmark and causes the list to reserve the checkmark column. |
| `Data` | `object?` | `null` | Consumer-associated data; current item click logic does not automatically pass it to `OnClick`. |
| `Href` | `string?` | `null` | Non-empty and enabled items render as `<a href=...>`. |
| inherited disabled state | inherited | — | Disabled items get the `disabled` class; a disabled link renders as a `<div>`. |

`MenuItem` must be nested under a `MenuList`. Current initialization throws if the cascading list is absent; the exception text says it should be nested in `Menu`, even though the actual runtime requirement is the cascading `MenuList` supplied by `Menu` or direct composition.

## Close and submenu behavior

For a normal item, clicking invokes `OnClick` and then closes the cascading parent `Popover` when one exists.

When `ChildContent` is present, the item creates a nested `Popover` with `TriggerEvents="mouseenter, focus"`, `DisplayArrow="false"`, and `Placement.RightStart`. The item registers itself as that submenu trigger after first render. The submenu surface is exactly `ChildContent`; compose nested menu/list content according to verified examples rather than assuming arbitrary menu semantics.

## Accessibility and keyboard limitations

Current markup is primarily custom `<div>`/`<a>` composition:

- `MenuList` does not add `role="menu"` automatically;
- `MenuItem` does not add `role="menuitem"`, `menuitemcheckbox`, or related ARIA state automatically;
- non-link items are clickable `<div>` elements without source-defined `tabindex` or keydown handling;
- submenu trigger opens on `mouseenter, focus`, but the trigger is a `<div>` in current markup and source itself does not make it natively focusable;
- source does not implement arrow-key menu navigation, Home/End, typeahead, or Escape handling at the `MenuItem` level.

Therefore do not claim a complete WAI-ARIA menu keyboard model without dedicated runtime/accessibility evidence. These are current implementation gaps, not hidden built-in APIs.

## RTL

Submenus currently request `Placement.RightStart` and render `FluentIcons.ChevronRight`. Do not assume logical RTL mirroring from the API names alone; verify actual placement/styling behavior before publishing an RTL guarantee.

## Evidence

Source verified against `Menu.razor`, `Menu.razor.cs`, `MenuList.razor`, `MenuList.razor.cs`, `MenuItem.razor`, and `MenuItem.razor.cs` on 2026-08-29. Runtime keyboard, focus, submenu dismissal, and RTL behavior remain unverified for this page.