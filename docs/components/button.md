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

## Layout, badges and dropdowns

The compiled [Button showcase](../../src/Bluent.UI.Demo.Pages/Pages/Components/Buttons.razor) demonstrates the current public layout and content parameters, including two-way toggle binding and all six existing appearances.

    <Button Text="Compact action" Compact Icon="@FluentIcons.CursorClick" />
    <Button Text="Vertical action" Icon="@FluentIcons.CursorClick" Orientation="Orientation.Vertical" />
    <Button Text="Rotated action" Rotated />

    <Button Text="Inbox" Icon="@FluentIcons.CursorClick"
            BadgeHorizontalPosition="Bluent.UI.Enums.HorizontalSides.Start"
            BadgeVerticalPosition="Bluent.UI.Enums.VerticalSides.Top">
        <Badge>
            <Badge Text="3" Color="BadgeColor.Danger" Shape="BadgeShape.Circular"
                   aria-label="3 unread notifications" />
        </Badge>
    </Button>

    <Button Text="Actions" Icon="@FluentIcons.CursorClick"
            ShowDropdownIndicator="true" DropdownPlacement="Placement.Top">
        <Dropdown>
            <MenuList>
                <MenuItem Title="Save" />
                <MenuItem Title="Cancel" />
            </MenuList>
        </Dropdown>
    </Button>

    <Button Text="Styled action" Class="fw-semibold" Style="min-width: 8rem" data-demo-case="root-style" />

    <Button Text="Simulate save" OnClick="RecordSaveAction" />

    @code {
        private void RecordSaveAction()
        {
            // Replace with the application's real action.
        }
    }

The outer Badge element supplies the Button's named Badge render-fragment parameter; the inner Badge is the visible Badge component. ShowDropdownIndicator is demonstrated with a Button-managed dropdown so its parent popover can supply placement context. The live demo exercises the four base dropdown directions (Top, Bottom, Left and Right); its browser probe opens each panel, verifies the actual placement and selects Copy to verify dismissal. Outside-click dismissal after the panel transition is covered by the live Chrome/Edge probe. Keyboard dismissal/focus restoration, the Start/End enum combinations, the full Button API matrix, native Windows contrast modes and assistive-technology acceptance remain open.

| `DropdownPlacement` | Trigger indicator | Live browser evidence |
|---|---|---|
| `Placement.Top` | Up caret | Opens above; selecting Copy closes; outside click dismisses |
| `Placement.Bottom` | Down caret | Opens below; selecting Copy closes |
| `Placement.Right` | Right caret | Opens to the right; selecting Copy closes |
| `Placement.Left` | Left caret | Opens to the left; selecting Copy closes |

The four base directions are covered in the live probe. `TopStart`, `TopEnd`, `BottomStart`, `BottomEnd`, `LeftStart`, `LeftEnd`, `RightStart` and `RightEnd` remain public enum values but are not yet separate browser scenarios.
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

The simple action renders a native `<button type="button">` unless `Href` is non-empty, in which case it renders an `<a>` when enabled. When `Toggled` has a value, the native button exposes that current state through one component-owned `aria-pressed="true|false"`; this value overrides a conflicting caller-supplied `aria-pressed` attribute case-insensitively. When `Toggled` is `null`, the component does not generate toggle state and a caller-provided `aria-pressed` is preserved. Link mode does not generate `aria-pressed`, even if `Toggled` is set. Native button/link keyboard semantics apply to the simple form. Icon-only buttons need an application-provided accessible name such as `aria-label` or meaningful tooltip/text context. Chrome and Edge browser tests now cover the toggle semantics on published Production InteractiveServer and InteractiveWebAssembly; native Windows contrast-theme and screen-reader acceptance remain unverified.

## Hosting and render modes

See [Hosting models and render modes](../compatibility/hosting-and-render-modes.md).

| Render mode | Status | Notes |
| --- | --- | --- |
| Standalone WebAssembly | Partially verified | Existing live Button browser probe passed 23/23 checks in Chrome and Edge; this is not full component parity. |
| Interactive Server | Toggle semantics verified | Published Production route: 19/19 checks each in Chrome and Edge; callbacks and computed accessibility-tree state included. |
| Interactive WebAssembly | Toggle semantics verified | Published Production route: 19/19 checks each in Chrome and Edge; confirms actual WebAssembly rendering. |
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
- Full Button/Fluent visual and behavioral parity remains open; native Windows Contrast Themes and Narrator/NVDA/JAWS acceptance are not recorded. Complete Button-specific RTL visual parity and the full demo matrix remain open.
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
- Source rechecked on 2026-10-26 against the current Button markup, code-behind, inherited component API, and published browser evidence.
- Verification date: 2026-10-26
- Published interactive toggle evidence: [Button toggle semantic slice](../v3/quality/BUTTON-TOGGLE-ARIA-SLICE.md), with the reproducible [Production render-mode probe](../../scripts/quality/probe_v3_button_toggle_interactive_server.mjs).
