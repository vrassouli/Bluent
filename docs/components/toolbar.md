# Toolbar family

`Toolbar` is Bluent's overflow-aware command strip. It inherits the shared `Overflow` implementation, and consumer commands are normally authored as `ToolbarButton`/related toolbar items so they can render either inline or inside the overflow menu.

## Package and namespace

```razor
@using Bluent.UI.Components
```

Package: `Bluent.UI`

## Basic usage

```razor
<Toolbar>
    <ToolbarButton Text="New"
                   Icon="@FluentIcons.Add"
                   OnClick="CreateNew" />
    <ToolbarButton Text="Save"
                   Icon="@FluentIcons.Save"
                   Appearance="ToolbarButtonAppearance.Primary"
                   OnClick="SaveAsync" />
</Toolbar>
```

## `Toolbar`

`Toolbar` inherits the public overflow surface:

| Parameter | Type | Default |
| --- | --- | --- |
| `ChildContent` | `RenderFragment?` | `null` |
| `Orientation` | `Orientation` | `Horizontal` |

It adds `bui-toolbar` and the kebab-cased orientation class to the wrapper and delegates child rendering/overflow behavior to the abstract `Overflow` base.

Because it inherits `Overflow`, actual overflow measurement is interactive and JS-backed. See [Overflow](overflow.md) for the source-defined behavior and limitations.

## `ToolbarButton`

`ToolbarButton` derives from `OverflowItemComponentBase`; it is designed to be nested in an overflow-capable parent such as `Toolbar`.

| Parameter | Type | Default / notes |
| --- | --- | --- |
| `Text` | `string` | empty/default |
| `MenuLabel` | `string?` | fallback to `Text` in overflow menu |
| `Icon` | `IconDefinition?` | optional typed icon |
| `TextClass` | `string` | optional text CSS class for inline Button rendering |
| `OnClick` | `EventCallback` | action callback |
| `Href` | `string?` | optional navigation target |
| `Dropdown` | `RenderFragment?` | optional dropdown/submenu content |
| `ShowDropdownIndicator` | `bool` | `false` |
| `Toggled` | `bool?` | optional toggle state |
| `ToggledChanged` | `EventCallback<bool>` | toggle-state callback |
| `DropdownPlacement` | `Placement` | `Bottom` |
| `Appearance` | `ToolbarButtonAppearance` | `Default` |

`ToolbarButtonAppearance` values are `Default`, `Primary`, and `Subtle`.

## Inline vs overflow rendering

`ToolbarButton` has two source-defined render paths:

- Inline: renders Bluent `Button` and maps its text, icon, href, appearance, dropdown, placement, click, tooltip, toggle state, class/style, and unmatched attributes.
- Overflow menu: renders Bluent `MenuItem` with `MenuLabel ?? Text`, icon, href, click callback, dropdown as submenu content, and `Toggled` mapped to the menu item's checked state.

This is why `ToolbarButton` should be preferred over an arbitrary raw button when the command must participate in Toolbar overflow behavior.

## Runtime behavior

The parent `Toolbar` inherits `Overflow` JS measurement. On first interactive render, the overflow base initializes `OverflowInterop`; later renders refresh the overflow popover surface. Static SSR can emit the initial toolbar content but cannot perform browser width measurement/reclassification.

## Accessibility and keyboard behavior

Inline `ToolbarButton` receives the semantics of Bluent `Button`, while overflow items receive the current `MenuItem` semantics. Current Toolbar source does not add a source-defined `role="toolbar"` or toolbar-specific arrow-key roving-focus model. Do not claim full ARIA-toolbar keyboard behavior without runtime/source evidence.

## Evidence boundary

Source verified from `Toolbar.razor`, `Toolbar.razor.cs`, `ToolbarButton.cs`, `ToolbarButtonAppearance.cs`, and the shared `Overflow` implementation. Other toolbar item types such as dividers follow the same family but should not be used to invent parameters absent from their source.
