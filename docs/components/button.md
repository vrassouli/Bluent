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

The compiled repository Button showcase covers icon, appearance, size, disabled, link, toggle, group, dropdown, split-button, badge, and tooltip patterns. The expanded live WebAssembly browser probe currently passes 97/97 assertions in both Chrome and Edge; keyboard Escape dismissal and focus restoration to the trigger are verified in Chrome and Edge. Native Windows contrast themes, screen-reader acceptance, and the remaining Button API/visual matrix remain open.

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
| `Href` | `string?` | `null` | No | When non-empty and enabled, the simple button renders as an anchor. If `disabled` is also true, it renders as a native disabled button instead and omits `href`. |
| `Badge` | `RenderFragment?` | `null` | No | Badge/content overlay rendered in the badge wrapper. |
| `BadgeHorizontalPosition` | `HorizontalSides` | `Start` | No | Horizontal badge position. |
| `BadgeVerticalPosition` | `VerticalSides` | `Top` | No | Vertical badge position. |
| `Dropdown` | `RenderFragment?` | `null` | No | Dropdown surface. Without `OnClick`, creates a dropdown button; with `OnClick`, creates a split button. |
| `ShowDropdownIndicator` | `bool` | `false` | No | Shows a placement-aware caret when the button is a popover trigger. |
| `Compact` | `bool` | `false` | No | Enables compact visual treatment. |
| `DropdownPlacement` | `Placement` | `Bottom` | No | Placement for the internally created dropdown popover. |
| `Tooltip` | string? (inherited) | `null` | No | Plain-text tooltip content. |
| `TooltipContent` | `RenderFragment?` (inherited) | `null` | No | Rich tooltip content; takes precedence when supplied. |
| `TooltipPlacement` | `Placement` (inherited) | `Top` | No | Tooltip popover placement. |
| `TooltipAppearance` | `PopoverAppearance` (inherited) | `Default` | No | `Default`, `Brand` or `Inverted`. |
| `DisplayTooltipArrow` | `bool` (inherited) | `false` | No | Adds the tooltip arrow element. |
| `Class` / `Style` | inherited | `null` | No | Application CSS class and inline style. |
| Unmatched attributes | inherited | `null` | No | Applied to the rendered action element; use for `disabled`, `aria-*`, `data-*`, etc. |

## Events and binding

`OnClick` runs for an enabled action. If `Toggled` is non-null, the click handler flips it and raises `ToggledChanged` before invoking `OnClick`. Disabled Buttons return before changing toggle state or invoking either callback.

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

The outer Badge element supplies the Button named Badge render-fragment parameter; the inner Badge is the visible Badge component. ShowDropdownIndicator is demonstrated with a Button-managed dropdown so its parent popover can supply placement context. The live browser probe covers all twelve DropdownPlacement values: each menu opens, its physical side and logical Start/End alignment are checked, Copy selection closes the panel, and outside-click dismissal waits for the transition. If the requested side has less room than the popover requires, the probe accepts an opposite-side collision flip only when available space is insufficient and alignment remains correct. Escape dismissal and trigger-focus restoration are covered by the live Chrome/Edge probe; the remaining Button API/visual matrix, native Windows contrast modes and assistive-technology acceptance remain open.

| BadgeHorizontalPosition | BadgeVerticalPosition | Live browser case |
| --- | --- | --- |
| Start | Top | Inbox badge |
| End | Bottom | Updates badge |
| Start | Bottom | Archive badge |
| End | Top | Tasks badge |

All four base position combinations are checked on the live WebAssembly Button demo, including the actual wrapper classes and accessible names.

| `DropdownPlacement` | Trigger indicator | Live browser evidence |
|---|---|---|
| `Placement.Top` | Up caret | Opens above; Copy closes; outside click dismisses |
| `Placement.TopStart` | Up caret | Opens above; Start edges align; Copy closes |
| `Placement.TopEnd` | Up caret | Opens above; End edges align; Copy closes |
| `Placement.Bottom` | Down caret | Opens below; Copy closes |
| `Placement.BottomStart` | Down caret | Opens below; Start edges align; Copy closes |
| `Placement.BottomEnd` | Down caret | Opens below; End edges align; Copy closes |
| `Placement.Right` | Right caret | Opens right when room allows; Copy closes |
| `Placement.RightStart` | Right caret | Opens right; Start edges align; Copy closes |
| `Placement.RightEnd` | Right caret | Opens right when room allows; if insufficient, flips left and retains End alignment |
| `Placement.Left` | Left caret | Opens left when room allows; Copy closes |
| `Placement.LeftStart` | Left caret | Opens left; Start edges align; Copy closes |
| `Placement.LeftEnd` | Left caret | Opens left; End edges align; Copy closes |

All twelve public dropdown placements are individual live browser scenarios. Edge-aligned cases verify the Start/End edge as well as the requested side; RightEnd flips left at the tested viewport when available right-side space is smaller than the popover width, while preserving End alignment.
## Child content and composition

`Button` does not expose generic `ChildContent`. Its named `Badge` and `Dropdown` fragments are the composition slots.

A `Dropdown` with no `OnClick` becomes a dropdown-only button backed by `Popover`. A `Dropdown` plus `OnClick` becomes a split button using `ButtonGroup` plus a separate popover trigger.

## Services and containers

Use the normal `AddBluentUI()` setup. Dropdown and tooltip behavior depends on Bluent popover/tooltip services; include `<Containers />` once in the active interactive layout as described by Getting Started.

## Tooltip behavior

Button inherits five tooltip parameters from BluentUiComponentBase:

| Parameter | Default | Behavior |
| --- | --- | --- |
| Tooltip | null | Plain-text tooltip content. |
| TooltipContent | null | Rich RenderFragment content; takes precedence when supplied. |
| TooltipPlacement | Placement.Top | Position enum for the tooltip popover. |
| TooltipAppearance | PopoverAppearance.Default | Default, Brand, or Inverted. |
| DisplayTooltipArrow | false | Adds the positioned arrow element. |

Example with string content:

    <Button Text="String tooltip" Tooltip="String tooltip content"
            TooltipPlacement="Placement.Right"
            TooltipAppearance="PopoverAppearance.Brand" DisplayTooltipArrow />

Example with rich content:

    <Button Text="Inverted tooltip" TooltipPlacement="Placement.BottomEnd"
            TooltipAppearance="PopoverAppearance.Inverted" DisplayTooltipArrow>
        <TooltipContent>
            Keyboard tooltip content
        </TooltipContent>
    </Button>

Tooltip wiring depends on the shared Containers host in an interactive layout. The live Button browser probe verifies string content appearing on pointer hover and hiding on mouseleave, and TooltipContent appearing on keyboard focus and hiding on blur. It also checks Brand/Right and Inverted/BottomEnd appearance/placement classes and arrow presence. Dropdown placement is separately covered for all twelve Placement values in a live LTR layout, including Start/End edge alignment and a justified collision flip when the requested side has insufficient room. The Tooltip-specific samples in this probe remain Top, Right and BottomEnd; the other Tooltip placement values do not yet have dedicated Tooltip runtime scenarios. Native assistive-technology behavior and Windows contrast themes remain unverified.

## Styling and theming

Use the packaged Bluent theme and component stylesheet. `Appearance`, `Shape`, `Size`, `Orientation`, `Compact`, `Rotated`, `Toggled`, and icon/text presence select component-defined visual states. Internal CSS class names are implementation details rather than a compatibility contract.

## Localization and RTL

Button has no built-in localized action text; the application supplies `Text` and `SecondaryText`. Dropdown caret direction is selected from popover placement. Complete Button-specific RTL visual verification is not recorded.

## Accessibility and keyboard interaction

The simple action renders a native `<button type="button">` unless `Href` is non-empty and enabled, in which case it renders an `<a>`. A Button with both `Href` and `disabled` renders a native disabled button without `href`; anchors do not implement native disabled semantics. The click handler exits before changing `Toggled` or invoking `ToggledChanged`/`OnClick` when disabled. When `Toggled` has a value, the native button exposes that current state through one component-owned `aria-pressed="true|false"`; this value overrides a conflicting caller-supplied `aria-pressed` attribute case-insensitively. When `Toggled` is `null`, the component does not generate toggle state and a caller-provided `aria-pressed` is preserved. Enabled link mode does not generate `aria-pressed`. A disabled `Href` renders as a native button; when `Toggled` has a value it follows the button toggle-state contract and exposes `aria-pressed`. Native button/link keyboard semantics apply to the simple form. Icon-only buttons need an application-provided accessible name such as `aria-label` or meaningful tooltip/text context. Chrome and Edge browser tests now cover the toggle semantics on published Production InteractiveServer and InteractiveWebAssembly; native Windows contrast-theme and screen-reader acceptance remain unverified.

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
