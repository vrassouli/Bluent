---
name: bluent
description: Use when building or migrating Blazor apps that reference the Bluent component libraries. Covers Bluent.UI, Bluent.UI.Charts, Bluent.UI.Diagrams, Bluent.UI.Utilities, setup, services, components, strongly typed icons, themes, CSS utilities, and self-contained usage patterns for consuming projects that only have the NuGet packages.
---

# Bluent Skill

Use this when a project references Bluent packages or when the user asks for Fluent-styled Blazor UI using Bluent.

This skill describes the **Bluent 2.x** public API. Bluent 2.0 introduced a breaking redesign of icons: consumer-facing icon APIs are strongly typed and use `IconDefinition` / `FluentIcons.*` rather than Fluent CSS class strings.

## First Moves

1. Check the consuming project for installed packages: `Bluent.UI`, `Bluent.UI.Charts`, `Bluent.UI.Diagrams`, `Bluent.UI.Utilities`, and `Bluent.UI.Core`/`Bluent.Core` as applicable.
2. Keep directly installed Bluent packages on the same release version unless release notes explicitly say otherwise.
3. Add imports where the corresponding APIs are used:

```razor
@using Bluent.UI.Components
@using Bluent.UI.Icons
@using Bluent.UI.Charts.Components
@using Bluent.UI.Diagrams.Components
@using Bluent.UI.Utilities
@using Bluent.UI.Services.Abstractions
```

4. Register services in `Program.cs`:

```csharp
using Bluent.UI.Extensions;
using Bluent.UI.Utilities.Extensions;

builder.Services.AddBluentUI();
builder.Services.AddBluentUtilities(); // only when using MDI/busy/hierarchy utilities
```

`AddBluentUI()` registers localization, theme, DOM, dialog, drawer, popover, toast, tooltip, and dock services. `AddBluentUtilities()` registers MDI and busy-indicator services.

5. Link styles in the host page/layout. The base UI needs one theme plus component CSS:

```html
<link href="_content/Bluent.UI/bluent.ui.theme.default.min.css" rel="stylesheet" />
<link href="_content/Bluent.UI/bluent.ui.components.min.css" rel="stylesheet" />
```

For diagrams also add:

```html
<link href="_content/Bluent.UI.Diagrams/bluent.ui.diagrams.min.css" rel="stylesheet" />
```

Available theme files: `default`, `excel`, `office`, `outlook`, `powerapps`, `powerbi`, `powerpoint`, `stream`, `teams`, `word`.

6. Put `<Containers />` once near the end of the root layout/app shell. It renders global drawer, dialog, popover, tooltip, and toast containers.

```razor
<main>@Body</main>
<Containers />
```

7. If an API detail is uncertain, prefer package IntelliSense, compiler errors, and public XML/assembly metadata over inventing compatibility wrappers or guessing parameter names.

## Bluent 2.x Strongly Typed Icons

### Core model

Bluent 2.x uses these icon types from `Bluent.UI.Icons`:

- `IconDefinition`: one logical icon, containing a regular source and optionally a filled source.
- `IconSource`: one explicit renderable source.
- `IconSourceKind`: distinguishes CSS class, SVG markup, and image sources.
- `IconVariant`: `Regular` or `Filled`.
- `FluentIcons`: generated IntelliSense-discoverable catalog of bundled Fluent icons.

Use the catalog instead of memorizing Fluent CSS class names:

```razor
@using Bluent.UI.Icons

<Button Text="Save" Icon="@FluentIcons.Save" />
<MenuItem Title="Delete" Icon="@FluentIcons.Delete" />
<NavItem Text="Settings" Icon="@FluentIcons.Settings" />
```

`FluentIcons.Save` is an `IconDefinition`. When the Fluent set contains both regular and filled forms, the definition carries both. Stateful Bluent components select the appropriate variant internally; consumers do not normally pass a separate active icon.

### Direct icon rendering

Render an icon directly with `Value`:

```razor
<Icon Value="@FluentIcons.Settings" />
```

Request a filled variant explicitly when needed:

```razor
<Icon Value="@FluentIcons.Settings" Variant="IconVariant.Filled" />
```

If a definition has no filled source, `Filled` falls back to the regular source.

### Custom icons

Custom SVG:

```csharp
private static readonly IconDefinition ProductIcon = IconDefinition.FromSvg("""
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="..." />
    </svg>
    """);
```

Custom image:

```csharp
private static readonly IconDefinition PowerPointIcon =
    IconDefinition.FromImage("/assets/icons/powerpoint.svg");
```

Custom CSS-backed icon:

```csharp
private static readonly IconDefinition AppIcon =
    IconDefinition.FromCss("my-app-icon", "my-app-icon-filled");
```

Custom regular/filled pair:

```csharp
private static readonly IconDefinition CustomAction = new(
    IconSource.Svg(RegularSvg),
    IconSource.Svg(FilledSvg));
```

Pass any `IconDefinition` to a typed icon parameter or `<Icon Value="..." />`.

SVG strings are rendered as markup. Only use trusted developer-controlled SVG; never feed unsanitized user input to `IconDefinition.FromSvg`.

## Migrating Icons from Bluent 1.x to 2.x

Bluent 2.0 intentionally removed the old polymorphic/string icon surface. When migrating a consuming project, do a repository-wide migration rather than adding a compatibility wrapper.

### Bundled Fluent icons

**Bluent 1.x:**

```razor
<Button Text="Save"
        Icon="icon-ic_fluent_save_20_regular"
        ActiveIcon="icon-ic_fluent_save_20_filled" />
```

**Bluent 2.x:**

```razor
<Button Text="Save" Icon="@FluentIcons.Save" />
```

### Direct rendering

**Bluent 1.x:**

```razor
<Icon Content="icon-ic_fluent_settings_20_regular" />
```

**Bluent 2.x:**

```razor
<Icon Value="@FluentIcons.Settings" />
```

### Dynamic icons

Do not build Fluent class names dynamically. Map application state to typed definitions instead:

```csharp
private IconDefinition GetIcon(Item item) => item.Kind switch
{
    ItemKind.Folder => FluentIcons.Folder,
    ItemKind.Document => FluentIcons.Document,
    _ => FluentIcons.Question
};
```

### Utility contracts

Icon-bearing APIs in `Bluent.UI.Utilities` also moved from string values to `IconDefinition` / `IconDefinition?`.

**Before:**

```csharp
public string? Icon => "icon-ic_fluent_document_20_regular";
```

**After:**

```csharp
public IconDefinition? Icon => FluentIcons.Document;
```

This applies to icon-bearing MDI, hierarchy, and document-toolbar contracts.

### Legacy surface to remove

During a Bluent 1.x -> 2.x migration, search the entire consuming repository for these old API markers:

```text
icon-ic_fluent_
ActiveIcon
ActiveIconClass
IconClass
<Icon Content
SvgGenerator
```

Treat matches as migration candidates. A match may be intentional only if it is clearly unrelated to Bluent's icon API.

Do **not** reintroduce a converter that accepts old strings and returns typed icons merely to make the build pass. Migrate call sites to `FluentIcons.*` or explicit `IconDefinition` instances.

## Common Conventions

- Most UI components live in `Bluent.UI.Components` and inherit common `Class`/`Style` support.
- Components derived from `BluentUiComponentBase` also support common tooltip behavior such as `Tooltip`, `TooltipContent`, `TooltipPlacement`, `TooltipAppearance`, and `DisplayTooltipArrow` where exposed.
- Form fields follow Blazor `InputBase<TValue>` conventions: use `@bind-Value`, `Value`, `ValueChanged`, `ValueExpression`, `disabled`, `placeholder`, `id`, validation messages, and `EditForm`.
- Field components commonly support `StartAddon`, `EndAddon`, `Size`, and `BindValueEvent`.
- Use `FluentIcons.*` for bundled icons. Do not write Fluent icon CSS class names in application code.
- `Href`/`href` parameters are present on many navigation/action components. Prefer explicit Blazor parameter casing (`Href`) unless passing through arbitrary HTML attributes.
- Do not invent custom modal/popover/toast infrastructure. Use Bluent services and `<Containers />`.

## Core Enums

Common enums include:

- `Orientation`: `Horizontal`, `Vertical`
- `SelectionMode`: `None`, `Single`, `Multiple`
- `Breakpoints`: `Xs`, `Sm`, `Md`, `Lg`, `Xl`, `Xxl`
- `LabelPosition`: `After`, `Before`
- `Placement`: `Top`, `Bottom`, `Left`, `Right`, `TopStart`, `TopEnd`, `RightStart`, `RightEnd`, `BottomStart`, `BottomEnd`, `LeftStart`, `LeftEnd`
- `FieldSize`: `Small`, `Medium`, `Large`
- `ButtonAppearance`: `Default`, `Primary`, `Danger`, `Outline`, `Subtle`, `Transparent`
- `ButtonShape`: `Rounded`, `Circular`, `Square`
- `ButtonSize`: `Small`, `Medium`, `Large`

Use installed package metadata for the authoritative enum member list when a version-specific detail matters.

## Layout, Shell, and Utilities

`Stack`: flex layout with `Orientation`, alignment, fill, wrapping, reverse, overflow, and child content.

```razor
<Stack Orientation="Orientation.Horizontal" Class="gap-3 align-items-center">
    <Button Text="Save" Appearance="ButtonAppearance.Primary" />
    <Button Text="Cancel" Appearance="ButtonAppearance.Subtle" />
</Stack>
```

`SplitPanelContainer`: app-frame layout with slots such as `Header`, `Footer`, `StartSide`, `EndSide`, `Top`, `Bottom`, `Start`, `End`, and `Center`, plus resize modes and min/max sizes.

`MasterContainer`: responsive master/detail layout.

`TileLayout`: responsive grid layout.

`Spacer`: spacing/flex filler.

`MediaQuery`: emits current breakpoint through `OnChange`.

`Overlay`: clickable overlay.

`Overflow`: responsive overflow container for overflow-aware children such as toolbar buttons. It depends on `AddBluentUI()` and `<Containers />`.

`BluentDynamicComponent`: runtime-selected component renderer. Use required `Type`, optional `Parameters`, and `OnComponentCaptured`.

`Containers`: include exactly once in the active root shell when using global Bluent surfaces.

## Buttons and Actions

`Button` is the primary action component. Important parameters include `Text`, `SecondaryText`, `Icon`, `Toggled`, `ToggledChanged`, `Rotated`, `Orientation`, `OnClick`, `Shape`, `Appearance`, `Size`, `Href`, `Badge`, `Dropdown`, `ShowDropdownIndicator`, `Compact`, and `DropdownPlacement`.

```razor
<Button Text="Save"
        Icon="@FluentIcons.Save"
        Appearance="ButtonAppearance.Primary"
        OnClick="SaveAsync" />
```

Dropdown button:

```razor
<Button Text="More" ShowDropdownIndicator>
    <Dropdown>
        <MenuList>
            <MenuItem Title="Rename" OnClick="Rename" />
            <MenuItem Title="Delete" Icon="@FluentIcons.Delete" OnClick="Delete" />
        </MenuList>
    </Dropdown>
</Button>
```

`ButtonGroup`: groups buttons.

`Toolbar`: command strip. `ToolbarButton` supports typed `Icon` plus text/menu/click/link/dropdown/toggled/appearance behavior.

```razor
<Toolbar>
    <ToolbarButton Icon="@FluentIcons.ArrowUndo" OnClick="Undo" disabled="@(!CanUndo)" />
    <ToolbarButton Icon="@FluentIcons.ArrowRedo" OnClick="Redo" disabled="@(!CanRedo)" />
    <ToolbarDivider />
    <ToolbarButton Text="Open" Appearance="ToolbarButtonAppearance.Primary" OnClick="Open" />
</Toolbar>
```

`ActionCard`/`ActionCardGroup`: settings-like action rows/cards. `ActionCard.Icon` is typed.

## Text, Labels, Links, and Icons

`Icon`: render an `IconDefinition` with `Value` and optionally select `Variant`.

```razor
<Icon Value="@FluentIcons.Settings" />
```

`Label`: form label with text/expression/required/info/size support.

`Link`: link/action text with `Text`, `Href`, `Target`, `OnClick`, and appearance.

`Badge`, `Tag`, and `Avatar` expose typed `Icon` parameters where applicable.

## Forms and Inputs

`TextField`: text input/textarea with standard Blazor binding and field-base behavior.

```razor
<TextField @bind-Value="_query" BindValueEvent="oninput" placeholder="Search...">
    <StartAddon><Icon Value="@FluentIcons.Search" /></StartAddon>
</TextField>
```

`NumericField<TValue>`: numeric input with parsing/range/format/step/focus behavior.

`MaskedField`: regex-mask input.

`DateField`: date/month/year picker field.

`TimeField`: time-like input.

`SelectField<TValue>`: native select wrapper.

`Checkbox`, `Switch`, `RadioGroup<TValue>`, and `Radio<TValue>` provide standard choice controls.

`DropdownSelect<TValue>`: simple option select.

`DropdownList<TItem,TValue>`: virtualized searchable dropdown supporting single- or multi-select patterns.

`OtpField`: one-time-password input.

`FileSelect`: file picker. Its `Icon` is an `IconDefinition`; do not supply a separate active-icon string. Other important behavior includes accept filters, file info/removal, single/multiple selection, limits, and file events.

`AudioCapture`: microphone capture button. Its `Icon` is an `IconDefinition`; recording/active state is handled through the typed icon model rather than a separate string icon pair. It also exposes format and capture/not-supported/not-available events.

`Slider<TValue>` and `RangeSlider<TValue>` provide scalar and range inputs.

## Navigation and Collections

`Breadcrumb` / `BreadcrumbItem`: breadcrumb trail. `BreadcrumbItem.Icon` is typed.

`ItemsList` / `ListItem`: selectable list. `ListItem.Icon` is typed; selected state does not require a separate active-icon string.

`NavList` / `NavItem`: side navigation. `NavItem.Icon` is typed.

`Menu`: popover menu wrapper with trigger/items/placement.

```razor
<Menu Placement="Placement.BottomStart">
    <Trigger><Button Text="Actions" /></Trigger>
    <Items>
        <MenuList>
            <MenuItem Title="Edit" Icon="@FluentIcons.Edit" OnClick="Edit" />
            <MenuDivider />
            <MenuItem Title="Archive" OnClick="Archive" />
        </MenuList>
    </Items>
</Menu>
```

`MenuItem.Icon` is typed.

`TabList` / `Tab`: tabs. `Tab.Icon` is typed and carries regular/filled state through one definition.

`Tree` / `TreeItem`: tree view with drag/reorder/check behavior. `TreeItem.Icon` and semantically distinct `ExpandedIcon` are both `IconDefinition?`. `ExpandedIcon` remains separate because it represents a different semantic icon, not merely the filled variant of the same icon.

```razor
<TreeItem Title="Documents"
          Icon="@FluentIcons.Folder"
          ExpandedIcon="@FluentIcons.FolderOpen" />
```

`DataList<TItem>`: virtualized list.

`DataGrid<TItem>` / `DataGridColumn<TItem>`: virtualized table/grid.

`DataPager`: pagination control. Navigation icons are typed definitions in Bluent 2.x; do not use legacy icon-class or active-icon-class parameters.

## Surfaces and Feedback

`Popover`: floating surface with `Trigger`, `Surface`, placement/offset/padding/arrow/trigger behavior.

`Tooltip`: commonly use tooltip parameters on Bluent components; global tooltips depend on `<Containers />`.

`Dialog`: inline dialog. Prefer `IDialogService` for app-level dialogs.

`Drawer`: inline drawer. Prefer `IDrawerService` for app-level drawers.

`Toast`: inline toast. Prefer `IToastService` for app-level notifications.

`MessageBar`: inline status message.

`ProgressBar`: progress indicator; its `Icon` is typed.

`Spinner` and `Skeleton`: loading indicators/placeholders.

## Cards, Accordions, and Wizard

`Card`: content card with orientation, size, appearance, selection, link, and content slots.

`Accordion` / `AccordionPanel`: collapsible content. Icon-bearing parameters such as `HeaderIcon` use the typed icon model where exposed.

`Wizard` / `WizardStep`: multi-step workflow with navigation labels, events, and current-step state.

## Dock, Property Editor, MDI, and Hierarchy

`DockBar`, `DockContainer`, `DockPanel`: docking surface; service is `IDockService`.

`PropertyEditor`: reflection-based object editor with optional command-managed updates.

`MdiTabList`, `MdiTab`, `MdiTabToolbarItem`: multiple-document-interface utilities. Register `AddBluentUtilities()`. Icon-bearing document and toolbar contracts use `IconDefinition` / `IconDefinition?` in Bluent 2.x.

`AppBusyIndicator`: global busy indicator tied to `IBusyIndicator`.

`HierarchyTreeBrowser` / `HierarchyItemBrowser`: hierarchy pickers. Root/item icon contracts are typed definitions in Bluent 2.x.

## Charts

Package/namespace: `Bluent.UI.Charts`, `Bluent.UI.Charts.Components`. The JS module is bundled at `_content/Bluent.UI.Charts/bluent.ui.charts.js`; no manual script tag is normally needed because components import it.

`Chart`: container for datasets and chart options.

`Dataset<TKey,TValue>`: data series with `ChartType`, label, colors, border options, smoothing, and fill behavior.

Common chart children include `Legend`, `Title`, `Subtitle`, `Tooltip`, `Colors`, `XScale`, and `YScale`.

```razor
@using Bluent.UI.Charts.ChartJs

<Chart>
    <Legend Position="Position.Left" />
    <Title Text="Revenue" />
    <Dataset ChartType="ChartType.Line"
             Data="_series"
             Label="Revenue"
             Smooth
             BorderWidth="2"
             BorderColor="@DefaultColors.Orange"
             BackgroundColor="@DefaultColors.Orange.Opacity(127)" />
</Chart>
```

`Gauge`: SVG/JS gauge with min/max/angle/radius/color/animation options.

## Diagrams and Drawing Canvas

Package/namespace: `Bluent.UI.Diagrams`, `Bluent.UI.Diagrams.Components`; link `bluent.ui.diagrams.min.css`.

`DrawingCanvas`: SVG drawing surface with command manager, tool, selection, drag/pan/scale/delete/options, snapping, and selection events.

Use `CommandManager` for undo/redo. Drawing tools live under `Bluent.UI.Diagrams.Tools` and related namespaces.

`Diagram` extends the drawing canvas for node/connector diagrams.

## Theme and Styling

Use Bluent CSS variables/classes before hand-writing colors and spacing. Themes are applied via `IBluentTheme`:

```razor
@inject IBluentTheme Theme

await Theme.SetThemeAsync("teams");
await Theme.SetThemeModeAsync("dark");
await Theme.SetDirectionAsync("rtl");
```

Theme names are lowercase variants of the CSS files: `default`, `excel`, `office`, `outlook`, `powerapps`, `powerbi`, `powerpoint`, `stream`, `teams`, `word`.

The host element uses `data-bui-theme="light"` or `dark` and `dir="ltr"`/`rtl`.

Bluent includes responsive spacing, flex, gap, sizing, position, overflow, text, shadow, radius, border, animation, neutral/brand/status color utilities, and Fluent CSS variables. Prefer those utilities to custom CSS when they express the desired layout or appearance.

## Good Bluent Habits

- Use Bluent primitives (`Stack`, `Button`, `Toolbar`, `Card`, `Drawer`, `Dialog`, `Toast`) instead of custom infrastructure when a component exists.
- Use `Class` for spacing/layout utilities and `Style` only for one-off values or CSS variables.
- Use service-based surfaces for cross-page dialogs/drawers/toasts and inline components for local component-scoped cases.
- Use `CommandManager` for diagram/property-editor/MDI workflows that need undo/redo.
- Use `FluentIcons.*` for bundled icons and `IconDefinition` for custom icons.
- Do not pair regular and filled icons manually just to represent component state; one `IconDefinition` should normally carry both variants.
- Keep semantically different icons separate when the API expresses different meaning, for example `TreeItem.Icon` vs `TreeItem.ExpandedIcon`.
- Keep `<Containers />` and CSS links in the consuming app before debugging missing popovers, tooltips, dialogs, drawers, or toasts.
- When an API is uncertain, use installed package metadata and `dotnet build`; do not invent string compatibility layers.

## Bluent 2.x Migration Validation

After migrating a consuming application to Bluent 2.x:

1. Restore and build the complete solution.
2. Fix every icon-related compiler error rather than suppressing it with wrappers.
3. Exercise normal, hover, selected, toggled, expanded, and disabled states for icon-bearing components the app uses.
4. Verify custom SVG/image icons render at the expected size and styling.
5. Verify MDI, hierarchy, and document-toolbar implementations compile against typed icon contracts.
6. Search again for legacy icon API markers listed above.
7. Report any remaining string icon usages and explain why they are intentionally outside Bluent's icon API.

For the full icon model, see `docs/guides/icons.md`. For the canonical version-specific migration path, see `docs/compatibility/migration-and-upgrades.md`, especially **Migrating from 1.0.368 to 2.0.0**.
