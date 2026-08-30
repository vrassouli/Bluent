# Button

`Button` renders a Bluent action as a button or link and supports icons, toggle state, badges, dropdown actions, and split-button composition.

## When to use

Use `Button` for user-initiated commands, navigation styled as an action, toggle actions, or compact dropdown/split actions. Use `Link` when the interaction is primarily inline navigation rather than an action control.

## Package and namespace

```bash
dotnet add package Bluent.UI
```

```razor
@using Bluent.UI.Components
@using Bluent.UI.Icons
```

Follow [Getting Started](../getting-started/index.md) for `AddBluentUI()` and packaged styles. Dropdowns and inherited tooltips use Bluent popover/tooltip infrastructure and the shared `<Containers />` setup.

## Minimal example

```razor
<Button Text="Save"
        Icon="@FluentIcons.Save"
        Appearance="ButtonAppearance.Primary"
        OnClick="SaveAsync" />
```

The repository Button showcase compiles equivalent icon, appearance, size, disabled, link, toggle, group, dropdown, and split-button patterns. This page is source verified; no new browser run was performed for this documentation change.

## Parameters

| Parameter | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `Text` | `string?` | `null` | No | Primary visible text. |
| `TextClass` | `string?` | `null` | No | Additional class applied to the text wrapper. |
| `SecondaryText` | `string?` | `null` | No | Secondary line for compound buttons. |
| `Icon` | `IconDefinition?` | `null` | No | Strongly typed icon definition. Filled variant is rendered when available for active/toggled styling. |
| `Toggled` | `bool?` | `null` | No | Enables toggle behavior when non-null and carries the current state. |
| `ToggledChanged` | `EventCallback<bool>` | empty | No | Raised after the component flips a non-null `Toggled` value. |
| `Rotated` | `bool` | `false` | No | Applies the component's rotated visual state. |
| `Orientation` | `Orientation` | `Horizontal` | No | Horizontal or vertical content orientation. |
| `OnClick` | `EventCallback` | empty | No | Action callback. Also distinguishes split-button from dropdown-only composition when `Dropdown` is present. |
| `Shape` | `ButtonShape` | `Rounded` | No | `Rounded`, `Circular`, or `Square`. |
| `Appearance` | `ButtonAppearance` | `Default` | No | `Default`, `Primary`, `Danger`, `Outline`, `Subtle`, or `Transparent`. |
| `Size` | `ButtonSize` | `Medium` | No | `Small`, `Medium`, or `Large`. |
| `Href` | `string?` | `null` | No | When non-empty, the simple button renders as an anchor; disabled links do not receive `href`. |
| `Badge` | `RenderFragment?` | `null` | No | Badge/content overlay rendered in the badge wrapper. |
| `BadgeHorizontalPosition` | `HorizontalSides` | `Start` | No | Horizontal badge position. |
| `BadgeVerticalPosition` | `VerticalSides` | `Top` | No | Vertical badge position. |
| `Dropdown` | `RenderFragment?` | `null` | No | Dropdown surface. Without `OnClick`, creates a dropdown button; with `OnClick`, creates a split button. |
| `ShowDropdownIndicator` | `bool` | `false` | No | Shows a placement-aware caret when the button is a popover trigger. |
| `Compact` | `bool` | `false` | No | Enables compact visual treatment. |
| `DropdownPlacement` | `Placement` | `Bottom` | No | Placement for the internally created dropdown popover. |
| `Tooltip` / `TooltipContent` | inherited | `null` | No | Tooltip content inherited from `BluentUiComponentBase`. |
| `Class` / `Style` | inherited | `null` | No | Application CSS class and inline style. |
| Unmatched attributes | inherited | `null` | No | Applied to the rendered action element; use for `disabled`, `aria-*`, `data-*`, etc. |

## Events and binding

`OnClick` runs for a normal action. If `Toggled` is non-null, the click handler flips it, invokes `ToggledChanged`, and then invokes `OnClick`.

Two-way toggle binding is supported:

```razor
<Button Text="Pin" @bind-Toggled="_pinned" />
```

## Child content and composition

`Button` does not expose generic `ChildContent`. Its named `Badge` and `Dropdown` fragments are the composition slots.

A `Dropdown` with no `OnClick` becomes a dropdown-only button backed by `Popover`. A `Dropdown` plus `OnClick` becomes a split button using `ButtonGroup` plus a separate popover trigger.

## Services and containers

Use the normal `AddBluentUI()` setup. Dropdown and tooltip behavior depends on Bluent popover/tooltip services; include `<Containers />` once in the active interactive layout as described by Getting Started.

## Styling and theming

Use the packaged Bluent theme and component stylesheet. `Appearance`, `Shape`, `Size`, `Orientation`, `Compact`, `Rotated`, `Toggled`, and icon/text presence select component-defined visual states. Internal CSS class names are implementation details rather than a compatibility contract.

## Localization and RTL

Button has no built-in localized action text; the application supplies `Text` and `SecondaryText`. Dropdown caret direction is selected from popover placement. Complete Button-specific RTL visual verification is not recorded.

## Accessibility and keyboard interaction

The simple action renders a native `<button type="button">` unless `Href` is non-empty, in which case it renders an `<a>` when enabled. Native button/link keyboard semantics therefore apply to the simple form. Icon-only buttons need an application-provided accessible name such as `aria-label` or meaningful tooltip/text context. Component-specific assistive-technology verification is not recorded.

## Hosting and render modes

See [Hosting models and render modes](../compatibility/hosting-and-render-modes.md).

| Render mode | Status | Notes |
| --- | --- | --- |
| Standalone WebAssembly | Unverified | Showcase compiles; no Button-specific browser evidence recorded here. |
| Interactive Server | Unverified | Interactive actions require an interactive mode; no Button-specific run recorded here. |
| Interactive WebAssembly | Unverified | No Button-specific run recorded here. |
| Interactive Auto | Unverified | No Button-specific run recorded here. |
| Static SSR | Limited | Initial simple markup can render, but callbacks, toggle behavior, dropdowns, and tooltips require interactivity. |

## JavaScript and static assets

A simple Button has no component-specific manual script tag. Dropdowns and tooltips use shared Bluent popover/tooltip infrastructure. Include the standard Bluent theme and component CSS bundles.

## Common mistakes

### Dropdown indicator throws or does not behave as expected

`ShowDropdownIndicator` derives its caret from a parent `Popover`. Use it through the supported dropdown/popover composition rather than treating it as an independent decoration.

### Dropdown unexpectedly becomes a split button

Supplying both `Dropdown` and an `OnClick` delegate intentionally creates split-button behavior. Remove `OnClick` for a dropdown-only button.

### Icon-only action has no accessible name

Add an appropriate `aria-label`, visible text, or other accessible naming context.

## Known limitations

- There is no generic `ChildContent` slot.
- Button-specific browser, keyboard, RTL, and assistive-technology verification is not recorded by this page.
- Dropdown/split behavior depends on the shared popover infrastructure.

## Related components

- `ButtonGroup`: `button-group.md`
- `Popover`, `MenuList`, and `MenuItem`: see [component inventory](inventory.md)
- [Getting Started](../getting-started/index.md)

## Source and verification

- Component markup: `src/Bluent.UI/Components/ButtonComponent/Button.razor`
- Component logic: `src/Bluent.UI/Components/ButtonComponent/Button.razor.cs`
- Public enums: `src/Bluent.UI/Components/ButtonComponent/`
- Base tooltip behavior: `src/Bluent.UI/Components/BluentUiComponentBase.cs`
- Compiled showcase: `src/Bluent.UI.Demo.Pages/Pages/Components/Buttons.razor`
- Source verified against PR branch base commit `73e5de61133ec7037934f232addf5ddbf646e766`
- Verification date: 2026-08-29
