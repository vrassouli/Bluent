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

The compiled repository Button showcase covers icon, appearance, size, disabled, link, toggle, group, dropdown, split-button, badge, and tooltip patterns. The expanded live WebAssembly browser probe passes **211/211 assertions in Chrome and 211/211 in Edge** on 2026-10-28. It verifies stable accessible names, all twelve inherited TooltipPlacement values, all 54 Appearance × Size × Shape combinations and class mappings, computed Button styles in Light and Dark themes, icon/text and Badge mirroring in LTR/RTL, Persian copy direction and accessibility names, and responsive behavior at 390px in Dark+RTL. An explicit `ToggledChanged` example independently verifies exactly-once callbacks for trusted pointer activation and Space, synchronized `aria-pressed` and visible state, and a stable accessible name across state changes. The Button-managed menu-role and keyboard-navigation contract is now verified on the published Production host (184/184 checks across Chrome/Edge × InteractiveServer/InteractiveWebAssembly). Native Windows Contrast Themes, named screen-reader acceptance, and complete approved-design/visual parity remain open.

## Appearance, size and shape matrix

The interactive showcase enumerates the current public `ButtonAppearance` (Default, Primary, Danger, Outline, Subtle, Transparent), `ButtonSize` (Small, Medium, Large), and `ButtonShape` (Rounded, Circular, Square) enums and renders the full **6 × 3 × 3 = 54** combination matrix. The real Chrome/Edge WebAssembly probe verifies every combination appears exactly once, maps to the expected runtime classes, and has resolved computed styles under both Light and Dark theme tokens. Paired Persian `ذخیره تغییرات` specimens verify content-driven RTL writing direction and the same Persian accessibility name under both LTR and RTL layout containers, while the icon mirrors to the appropriate side. All 18 appearance/size rows and both Persian specimens remain within the page width at a 390px viewport. This is current-source behavior coverage, not approval of pending tokens or pixel parity with Fluent 2.

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

The outer Badge element supplies the Button named Badge render-fragment parameter; the inner Badge is the visible Badge component. ShowDropdownIndicator is demonstrated with a Button-managed dropdown so its parent popover can supply placement context. The dedicated Tooltip placement matrix now renders all twelve inherited Placement values. The live browser probe opens each tooltip, checks its requested placement class and arrow, and verifies that pointer exit hides the tooltip. A separate set of examples continues to cover string and RenderFragment content, Default/Brand/Inverted appearance, hover/focus activation, and arrow on/off. The live browser probe also covers all twelve DropdownPlacement values: each menu opens, its physical side and logical Start/End alignment are checked, Copy selection closes the panel, and outside-click dismissal waits for the transition. If the requested side has less room than the popover requires, the probe accepts an opposite-side collision flip only when available space is insufficient and alignment remains correct. Escape dismissal and trigger-focus restoration are covered by the live Chrome/Edge probe; the remaining Button API/visual matrix, native Windows contrast modes and assistive-technology acceptance remain open.

| BadgeHorizontalPosition | BadgeVerticalPosition | Live browser case |
| --- | --- | --- |
| Start | Top | Inbox badge |
| End | Bottom | Updates badge |
| Start | Bottom | Archive badge |
| End | Top | Tasks badge |

All four base position combinations are checked on the live WebAssembly Button demo, including the actual wrapper classes and accessible names. A separate real-DOM geometry check measures each wrapper against its owning Button in both LTR and RTL: logical Start maps to physical left in LTR and physical right in RTL; End maps to the opposite edge, while Top and Bottom remain aligned to the corresponding vertical edges. Chrome and Edge validate all four combinations at sub-1.5px positional tolerance. This is a browser layout check, not approval of the remaining full Persian typography/Fluent visual matrix.

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

Tooltip wiring depends on the shared Containers host in an interactive layout. The live Button browser probe verifies string content appearing on pointer hover and hiding on mouseleave, and TooltipContent appearing on keyboard focus and hiding on blur. It checks all twelve inherited TooltipPlacement values through actual hover, visible surface, requested placement, arrow, and pointer-exit dismissal behavior; Brand/Right and Inverted/BottomEnd remain representative appearance/arrow checks. Dropdown placement is separately covered for all twelve Placement values in a live LTR layout, including Start/End edge alignment and a justified collision flip when the requested side has insufficient room. Native assistive-technology behavior and Windows contrast themes remain unverified.

## Styling and theming

Use the packaged Bluent theme and component stylesheet. `Appearance`, `Shape`, `Size`, `Orientation`, `Compact`, `Rotated`, `Toggled`, and icon/text presence select component-defined visual states. Internal CSS class names are implementation details rather than a compatibility contract.

## Localization and RTL

Button has no built-in localized action text; the application supplies `Text` and `SecondaryText`. Dropdown caret direction is selected from popover placement. The inner text wrapper uses HTML `dir="auto"` so localized content determines its writing direction independently of the outer Button/icon layout. Live Chrome/Edge checks cover icon mirroring, real Badge Start/End edge geometry, and the Persian `ذخیره تغییرات` label retaining RTL direction and its Persian accessible name in both LTR and RTL contexts. A separate **published Production ASP.NET Core** probe now verifies that same direction, icon placement and computed accessibility name in both InteractiveServer and InteractiveWebAssembly: **112/112 assertions** across Chrome and Edge, with 28 checks per browser/renderer route. The expanded published Production-host matrix now verifies the Button-managed dropdown open/closed lifecycle, persistent aria-controls target, full menu ARIA/keyboard contract, Escape dismissal and trigger-focus restoration, and exactly-once Copy selection: **184/184 assertions** across Chrome/Edge × InteractiveServer/InteractiveWebAssembly. The 112/112 figure above is the narrower 2026-10-27 checkpoint, not the current menu-semantics result. Full Persian typography, candidate font approval and native assistive-technology/Windows contrast acceptance remain open.

## Accessibility and keyboard interaction

The simple action renders a native `<button type="button">` unless `Href` is non-empty and enabled, in which case it renders an `<a>`. A Button with both `Href` and `disabled` renders a native disabled button without `href`; anchors do not implement native disabled semantics. The click handler exits before changing `Toggled` or invoking `ToggledChanged`/`OnClick` when disabled. When `Toggled` has a value, the native button exposes that current state through one component-owned `aria-pressed="true|false"`; this value overrides a conflicting caller-supplied `aria-pressed` attribute case-insensitively. The runnable showcase separately demonstrates the direct `Toggled` + `ToggledChanged` pattern (without `@bind-Toggled`), displaying the current state and callback count; the live Chrome/Edge probe verifies one callback per trusted pointer or Space activation and preserves the action name before and after toggling. When `Toggled` is `null`, the component does not generate toggle state and a caller-provided `aria-pressed` is preserved. Enabled link mode does not generate `aria-pressed`. A disabled `Href` renders as a native button; when `Toggled` has a value it follows the button toggle-state contract and exposes `aria-pressed`. Native button/link keyboard semantics apply to the simple form. Button-owned Regular/Filled icons and dropdown indicators render with `aria-hidden="true"`: they are visual affordances, not accessible names. This keeps icon-plus-text names equal to the visible text and prevents a Regular/Filled swap from changing the name. The inner text wrapper also uses `dir="auto"`, so localized Persian text retains its own RTL direction even when the Button is placed in an LTR row; the caller-provided text still supplies the accessible name. Icon-only Buttons must supply a meaningful accessible name through a caller-provided attribute such as `aria-label`; the component does not guess a verb from an icon catalog entry. The split-button secondary trigger has the stable label `Open menu`. The new real Chrome/Edge accessibility-tree checks verify the icon glyphs are hidden, visible-text names stay clean across the toggle change, explicit icon-only names are preserved, and the caret trigger is named. This is scoped to icons owned by Button; it does not establish a global semantic policy for standalone Icon or other component families, which remain in #429 and shared conventions in #420. Chrome and Edge browser tests also cover toggle semantics on published Production InteractiveServer and InteractiveWebAssembly; native Windows contrast-theme and screen-reader acceptance remain unverified.

Button-managed Dropdown-only and split-button menu triggers expose `aria-haspopup="menu"`, `aria-expanded` synchronized with the actual popover lifecycle, and `aria-controls` pointing to the popup surface. Component-owned menu ARIA values take precedence over conflicting caller values while the trigger manages the menu. The popup `MenuList` exposes `role="menu"` and an accessible name through `aria-label` or `aria-labelledby` (default name: `Menu`); `MenuItem` exposes `role="menuitem"`, roving-focus `tabindex="-1"`, and `aria-disabled="true"` for disabled items. The keyboard contract covers ArrowDown/ArrowUp navigation with wrapping, Home/End, character type-ahead, skipping disabled items, exactly-once Enter/Space leaf activation, direction-aware submenu arrows, Escape dismissal with focus restoration, and Tab dismissal without a focus trap. Internal Button-owned surfaces remain mounted while hidden so the `aria-controls` relationship stays valid, and menu state is retained across close/reopen. The published Production host probe passes **184/184 assertions** across Chrome/Edge × InteractiveServer/InteractiveWebAssembly. This is browser evidence only; native Windows Contrast Themes, named screen-reader acceptance, final approved #418 tokens, and complete Fluent visual parity remain open.

## Hosting and render modes

See [Hosting models and render modes](../compatibility/hosting-and-render-modes.md).

| Render mode | Status | Notes |
| --- | --- | --- |
| Standalone WebAssembly | Browser behavior verified; design/AT acceptance open | Expanded live Button browser probe passed **211/211 assertions in Chrome and 211/211 in Edge** on 2026-10-28, including all twelve TooltipPlacement values and the 54 Appearance × Size × Shape matrix. Temporary focus research styling is injected only in the disposable browser tab. Menu role/keyboard behavior is also covered by the production-host matrix below. This is not full component parity. |
| Interactive Server | Toggle + menu keyboard slice browser-verified | Published Production route: **46/46 assertions each** in Chrome and Edge; includes computed accessibility-tree state, menu roles, arrow-key navigation, submenu lifecycle and focus behavior. |
| Interactive WebAssembly | Toggle + menu keyboard slice browser-verified | Published Production route: **46/46 assertions each** in Chrome and Edge; confirms actual WebAssembly rendering and the same menu keyboard contract. |
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
- The shared Tooltip surface currently has no explicit `role="tooltip"` or trigger `aria-describedby` relation in its source markup. The live Button probe proves visual show/hide and placement only, not screen-reader announcement. Track the shared semantic contract in the Tooltip family issue (#456), rather than claiming Button AT support from hover/focus tests.

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
- Source rechecked on 2026-10-28 against the current Button markup, code-behind, inherited component API, and published browser evidence.
- Verification date: 2026-10-28
- Published interactive toggle evidence: [Button toggle semantic slice](../v3/quality/BUTTON-TOGGLE-ARIA-SLICE.md), with the reproducible [Production render-mode probe](../../scripts/quality/probe_v3_button_toggle_interactive_server.mjs).


## Published Button-managed dropdown lifecycle verification - 2026-10-27

The real published Production browser probe additionally exercises the Button-owned Dropdown in InteractiveServer and InteractiveWebAssembly, in Chrome and Edge. Across the four route/browser combinations, **112/112 assertions pass**: the native trigger and caret render, `aria-controls` points to its persistent surface, `aria-expanded` tracks the actual open/closed lifecycle, Escape closes the popup and restores focus to the trigger, and activating the real Copy MenuItem invokes its callback exactly once and closes the popup. The same fixture is compiled into both interactive modes.

At this 2026-10-27 checkpoint, the probe intentionally did **not** claim that the shared menu was a complete ARIA menu: `aria-haspopup="menu"`, menu/menuitem roles, and arrow-key navigation were still missing then. That historical 112/112 run is superseded for menu semantics by the 2026-10-28 evidence below. The earlier probe used a temporary local Production publish, not a deployment; native Windows Contrast Themes, named assistive-technology acceptance, and final approved #418 token/visual parity remain open.

## Latest published Button-managed menu keyboard verification — 2026-10-28

The fresh published Production browser matrix passes **184/184 assertions, zero failures** across Chrome/Edge × InteractiveServer/InteractiveWebAssembly (46 checks per browser/renderer). It exercises initial and expanded trigger state, stable `aria-controls`, the `menu`/`menuitem` roles, accessible menu name, disabled-item skipping, Arrow/Home/End/type-ahead, exactly-once Enter/Space leaf activation, submenu navigation, Escape focus restoration, and Tab dismissal without a focus trap. The older 112/112 section above is the 2026-10-27 lifecycle-only checkpoint and should not be read as current keyboard/roles status. This is browser evidence from a local temporary Production publish, not a deployment; native Windows Contrast Themes, named screen-reader acceptance, approved #418 mappings, and visual parity remain open. See [Button-managed MenuList keyboard and ARIA slice](../v3/quality/BUTTON-MENU-KEYBOARD-SLICE.md).
