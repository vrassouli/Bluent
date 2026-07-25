---
name: bluent
description: Use when building Blazor apps that reference the Bluent component libraries. Covers Bluent.UI, Bluent.UI.Charts, Bluent.UI.Diagrams, Bluent.UI.Utilities, setup, services, components, enums, icons, themes, CSS utilities, and self-contained usage patterns for consuming projects that only have the NuGet packages.
---

# Bluent Skill

Use this when a project references Bluent packages or when the user asks for Fluent-styled Blazor UI using Bluent.

## First Moves

1. Check the consuming project for installed packages: `Bluent.UI`, `Bluent.UI.Charts`, `Bluent.UI.Diagrams`, `Bluent.UI.Utilities`, and `Bluent.Core`.
2. Add imports where components are used:

```razor
@using Bluent.UI.Components
@using Bluent.UI.Charts.Components
@using Bluent.UI.Diagrams.Components
@using Bluent.UI.Utilities
@using Bluent.UI.Services.Abstractions
```

3. Register services in `Program.cs`:

```csharp
using Bluent.UI.Extensions;
using Bluent.UI.Utilities.Extensions;

builder.Services.AddBluentUI();
builder.Services.AddBluentUtilities(); // only when using MDI/busy/hierarchy utilities
```

`AddBluentUI()` registers localization, theme, DOM, dialog, drawer, popover, toast, tooltip, and dock services. `AddBluentUtilities()` registers MDI and busy indicator services.

4. Link styles in host page/layout. The base UI needs a theme plus component CSS:

```html
<link href="_content/Bluent.UI/bluent.ui.theme.default.min.css" rel="stylesheet" />
<link href="_content/Bluent.UI/bluent.ui.components.min.css" rel="stylesheet" />
```

For diagrams also add:

```html
<link href="_content/Bluent.UI.Diagrams/bluent.ui.diagrams.min.css" rel="stylesheet" />
```

Available theme files: `default`, `excel`, `office`, `outlook`, `powerapps`, `powerbi`, `powerpoint`, `stream`, `teams`, `word`.

5. Put `<Containers />` once near the end of the root layout/app shell. It renders the global drawer, dialog, popover, tooltip, and toast containers.

```razor
<main>@Body</main>
<Containers />
```

6. Treat this skill as the portable Bluent reference for consuming projects. If an API detail is uncertain, rely on package IntelliSense, compiler errors, and the public XML/metadata exposed by the installed NuGet assemblies rather than assuming the Bluent repository is present.

## Common Conventions

- Most UI components live in `Bluent.UI.Components` and inherit common `Class`/`Style` support.
- Components that inherit `BluentUiComponentBase` also support `Tooltip`, `TooltipContent`, `TooltipPlacement`, `TooltipAppearance`, and `DisplayTooltipArrow`.
- Form fields inherit Blazor `InputBase<TValue>` conventions: use `@bind-Value`, `Value`, `ValueChanged`, `ValueExpression`, `disabled`, `placeholder`, `id`, validation messages, and `EditForm`.
- Field components also support `StartAddon`, `EndAddon`, `Size`, and `BindValueEvent`.
- Icons use Fluent icon CSS classes, usually `icon-ic_fluent_<name>_20_regular` and an optional filled active state such as `icon-ic_fluent_<name>_20_filled`.
- `Href`/`href` parameters are present on many navigation/action components. Prefer the explicit Blazor parameter casing documented here (`Href`) unless a component is passing through arbitrary HTML attributes.
- Do not invent custom modal/popover/toast infrastructure. Use the Bluent services and `<Containers />`.

## Core Enums

- `Orientation`: `Horizontal`, `Vertical`
- `SelectionMode` from `Bluent.Core`: `None`, `Single`, `Multiple`
- `Breakpoints`: `Xs`, `Sm`, `Md`, `Lg`, `Xl`, `Xxl`
- `LabelPosition`: `After`, `Before`
- `Placement`: `Top`, `Bottom`, `Left`, `Right`, `TopStart`, `TopEnd`, `RightStart`, `RightEnd`, `BottomStart`, `BottomEnd`, `LeftStart`, `LeftEnd`
- `FieldSize`: `Small`, `Medium`, `Large`
- `ButtonAppearance`: `Default`, `Primary`, `Danger`, `Outline`, `Subtle`, `Transparent`
- `ButtonShape`: `Rounded`, `Circular`, `Square`
- `ButtonSize`: `Small`, `Medium`, `Large`
- `ColorPalette`: `Brand`, `Nuetral`, `Red`, `Green`, `DarkOrange`, `Yellow`, `Berry`, `LightGreen`, `Marigold`, `DarkRed`, `Cranberry`, `Pumpkin`, `Peach`, `Gold`, `Brass`, `Brown`, `Forest`, `Seafoam`, `DarkGreen`, `LightTeal`, `Teal`, `Steel`, `Blue`, `RoyalBlue`, `Cornflower`, `Navy`, `Lavender`, `Purple`, `Grape`, `Lilac`, `Pink`, `Magenta`, `Plum`, `Beige`, `Mink`, `Platinum`, `Anchor`

## Layout, Shell, and Utilities

`Stack`: flex layout. Parameters: `Orientation`, `HorizontalAlignment`, `VerticalAlignment`, `Fill`, `Wrap`, `Reverse`, `Overflow`, `ChildContent`. Alignments are `Start`, `Center`, `End`, `Stretch`; overflow is `Default`, `Auto`, `Hidden`.

```razor
<Stack Orientation="Orientation.Horizontal" Class="gap-3 align-items-center">
    <Button Text="Save" Appearance="ButtonAppearance.Primary" />
    <Button Text="Cancel" Appearance="ButtonAppearance.Subtle" />
</Stack>
```

`SplitPanelContainer`: app-frame layout with slots `Header`, `Footer`, `StartSide`, `EndSide`, `Top`, `Bottom`, `Start`, `End`, `Center`. Each area has resize mode (`Auto`, `Fixed`, `Resizable`) and min/max size parameters, e.g. `StartResizeMode`, `StartMinSize`, `StartMaxSize`.

`MasterContainer`: responsive master/detail. Parameters: `MasterPanel`, `DetailPanel`, `Breakpoint` default `Md`, `MasterWidth`, `DrawerHeader`, `OpenDetails`, `OnClose`.

`TileLayout`: responsive grid. Parameters: `CellMinWidth`, `CellGap`, `ChildContent`.

`Spacer`: simple spacing/flex filler component.

`MediaQuery`: emits current `Breakpoints` through `OnChange`.

`Overlay`: clickable overlay with `ChildContent` and `OnClick`.

`Overflow`: responsive overflow container for overflow-aware children such as toolbar buttons. Parameters: `ChildContent`, `Orientation`. It renders extra items through a popover, so it depends on `AddBluentUI()` and `<Containers />`.

`BluentDynamicComponent`: dynamic component renderer. Parameters: required `Type`, optional `Parameters`, `OnComponentCaptured`; exposes `Instance`. Use it when the component type is chosen at runtime.

`Containers`: required once for services (`DrawerContainer`, `DialogContainer`, `PopoverContainer`, `TooltipContainer`, `ToastContainer`).

## Buttons and Actions

`Button`: primary action component. Parameters: `Text`, `SecondaryText`, `Icon`, `ActiveIcon`, `Toggled`, `ToggledChanged`, `Rotated`, `Orientation`, `OnClick`, `Shape`, `Appearance`, `Size`, `Href`, `Badge`, `BadgeHorizontalPosition`, `BadgeVerticalPosition`, `Dropdown`, `ShowDropdownIndicator`, `Compact`, `DropdownPlacement`, plus icon/text class parameters.

```razor
<Button Text="Save"
        Icon="icon-ic_fluent_save_20_regular"
        ActiveIcon="icon-ic_fluent_save_20_filled"
        Appearance="ButtonAppearance.Primary"
        OnClick="SaveAsync" />
```

Use `Dropdown` for split/dropdown buttons:

```razor
<Button Text="More" ShowDropdownIndicator>
    <Dropdown>
        <MenuList>
            <MenuItem Title="Rename" OnClick="Rename" />
            <MenuItem Title="Delete" Icon="icon-ic_fluent_delete_20_regular" OnClick="Delete" />
        </MenuList>
    </Dropdown>
</Button>
```

`ButtonGroup`: groups buttons.

`Toolbar`: command strip. Parameters: `Orientation`, `ChildContent`. `ToolbarButton` supports `Text`, `MenuLabel`, `Icon`, `ActiveIcon`, `OnClick`, `Href`, `Dropdown`, `ShowDropdownIndicator`, `Toggled`, `ToggledChanged`, `DropdownPlacement`, and `Appearance` (`Default`, `Primary`, `Subtle`). `ToolbarDivider` separates groups.

```razor
<Toolbar>
    <ToolbarButton Icon="icon-ic_fluent_arrow_undo_20_regular" OnClick="Undo" disabled="@(!CanUndo)" />
    <ToolbarButton Icon="icon-ic_fluent_arrow_redo_20_regular" OnClick="Redo" disabled="@(!CanRedo)" />
    <ToolbarDivider />
    <ToolbarButton Text="Open" Appearance="ToolbarButtonAppearance.Primary" OnClick="Open" />
</Toolbar>
```

`ActionCard`/`ActionCardGroup`: settings-like action rows/cards. `ActionCard` parameters: `HeaderAction`, `ChildContent`, `IsExpanded`, `IsExpandedChanged`, `OnClick`, `Icon`, `IconContent`, `Href`, `Description`, `DescriptionContent`, `DeferredLoading`.

## Text, Labels, Links, Icons

`Icon`: render a Fluent icon CSS class with `Content`.

```razor
<Icon Content="icon-ic_fluent_settings_20_regular" />
```

`Label`: form label. Parameters: `Text`, `ForExpression`, `RequiredSymbol`, `Info`, `Size`, `Required`. Use `ForExpression` to derive label text/id from a bound field.

`Link`: link/action text. Parameters include `Text`, `Href`, `Target`, `OnClick`, `Appearance` (`Default`, `Subtle`).

`Badge`: small status marker. Parameters: `Appearance` (`Filled`, `Ghost`, `Outlined`, `Tint`), `Size` (`Tiny`, `ExtraSmall`, `Small`, `Medium`, `Large`, `ExtraLarge`), `Shape` (`Square`, `Rounded`, `Circular`), `Color` (`Brand`, `Danger`, `Important`, `Informative`, `Sever`, `Subtle`, `Success`, `Warning`), `Icon`, `Text`, `DropShadow`, `AnimateShadow`.

`Tag`: compact labeled chip. Parameters: `Title`, `Dismissable`, `Icon`, `OnClick`, `OnDismiss`.

`Avatar`: persona/avatar. Parameters: `Initials`, `Name`, `ImageSource`, `Icon`, `InitialsSeperator`, `AutoColor`, `OnClick`, `Size` (`Size16` through `Size128`), `Shape` (`Circle`, `Square`), `Color`.

## Forms and Inputs

`TextField`: text input/textarea. Parameters: `Rows`, `ResizeTextarea`, `GainFocus`, `DigitOnly`, `AsciiDigits`, `ArabicToPersianConversion`, plus field base parameters.

```razor
<TextField @bind-Value="_query" BindValueEvent="oninput" placeholder="Search...">
    <StartAddon><Icon Content="icon-ic_fluent_search_20_regular" /></StartAddon>
</TextField>
```

`NumericField<TValue>`: numeric input. Parameters: `ParsingErrorMessage`, `MinimumErrorMessage`, `MaximumErrorMessage`, `OverflowErrorMessage`, `GainFocus`, `Format`, `Min`, `Max`, `Step`, `OnBlur`, `OnFocus`.

```razor
<NumericField TValue="decimal"
              @bind-Value="_price"
              Min="0m"
              Format="N2"
              BindValueEvent="oninput" />
```

`MaskedField`: regex-mask input. Required `Mask`; optional `AsciiDigits`, `ArabicToPersianConversion`.

```razor
<MaskedField @bind-Value="_phone" Mask="^09[0-9]{9}$" autocomplete="off" />
```

`DateField`: date/month/year picker field. Parameters: `Culture`, `Mode` (`DaySelect`, `MonthSelect`, `YearSelect`), `DateClass`, `Max`, `Min`, `DisplayCalendar`, `ParsingErrorMessage`.

`TimeField`: binds to time-like values. Parameters: `ParsingErrorMessage`, `Seconds`, `Culture`.

`SelectField<TValue>`: native select wrapper. Put `<option>` children inside. Supports array `TValue` for multiple select.

```razor
<SelectField @bind-Value="_status">
    <option value="Open">Open</option>
    <option value="Closed">Closed</option>
</SelectField>
```

`Checkbox`: checkbox with labels. Parameters: `Label`, `UncheckedLabel`, `IndeterminateLabel`, `Required`, `Circular`, `Size` (`Medium`, `Large`), `LabelPosition`. Bind with `@bind-Value`.

`Switch`: toggle styled as a switch. Inherits checkbox label behavior; supports `Label`, `UncheckedLabel`, `LabelPosition`, `disabled`, `@bind-Value`.

`RadioGroup<TValue>` and `Radio<TValue>`: grouped radio inputs. `RadioGroup` parameters: `Label`, `ItemsLabelPosition`, `Orientation`, `ChildContent`. `Radio` uses `Label` and the bound value pattern from Blazor.

`DropdownSelect<TValue>`: simple option select. Parameters: `DropdownPlacement`, `CanClear`, `EmptyMessage`, `ClearOption`; use `DropdownOption<TValue>(Text, Value)`.

`DropdownList<TItem,TValue>`: virtualized searchable dropdown. Important parameters: `ItemValue`, `ItemText`, `ItemsProvider`, `ItemProvider`, `Value`/`ValueChanged`, `Values`/`ValuesChanged` for multiselect, `DropdownPlacement`, `MaxHeight`, `HideFilter`, `HideClear`, `FilterPlaceholder`, `EmptyDisplayText`, `ItemSize`, `ItemContent`, `Placeholder`, `EmptyContent`.

```razor
<DropdownList TItem="Customer"
              TValue="int?"
              ItemValue="item => item.Id"
              ItemText="item => item?.Name ?? \"Select customer...\""
              ItemsProvider="LoadCustomers"
              ItemProvider="GetCustomer"
              @bind-Value="_customerId"
              Class="w-100">
    <ItemContent>@context.Name</ItemContent>
</DropdownList>
```

`OtpField`: one-time-password input. Parameters: `Length`, `Password`, `AutoSubmit`; bind with `@bind-Value`.

`FileSelect`: file picker. Parameters: `Text`, `Icon`, `ActiveIcon`, `Accept`, `ShowFileInfo`, `AllowRemove`, `Disabled`, `Appearance`, `Shape`, `OnChange`, `OnFileSelected`, `OnFileRemoved`, `Multiple`, `MaxFiles`. Events use `SelectedFile`, which wraps `IBrowserFile`.

`AudioCapture`: microphone capture button. Parameters: `Text`, `Icon`, `ActiveIcon`, `Format` default `audio/mp3`, `Appearance`, `CaptureStarted`, `CaptureEnded` (`byte[]`), `NotSupported`, `NotAvailable`.

```razor
<AudioCapture Format="audio/ogg; codecs=opus"
              CaptureStarted="OnCaptureStarted"
              CaptureEnded="OnCaptureEnded"
              NotSupported="OnNotSupported"
              NotAvailable="OnNotAvailable" />
```

`Slider<TValue>`: single-value slider. Parameters: `Min`, `Max`, `Value`, `ValueChanged`, `Orientation`, `Size`, `ThumbSize`.

`RangeSlider<TValue>`: range slider. Parameters: `Min`, `Max`, `Value`, `ValueChanged`, `ThumbSize`; value type is `ValueRange<TValue>`.

## Navigation and Collections

`Breadcrumb` and `BreadcrumbItem`: breadcrumb trail. `Breadcrumb` has `Size`; `BreadcrumbItem` has `Href`, `Target`, `Icon`, `ActiveIcon`.

`ItemsList` and `ListItem`: selectable list. `ItemsList` parameters: `SelectionMode`, `SelectedItemsChanged`, `ChildContent`. `ListItem` parameters: `Text`, `Icon`, `ActiveIcon`, `Selected`, `SelectedChanged`, `OnClick`, `Href`, `Match`, `Data`, `ChildContent`.

`NavList` and `NavItem`: side navigation. `NavList` parameters: `Compact`, `CollapsedWidth`, `ChildContent`. `NavItem` parameters: `Text`, `Icon`, `Href`, `Match`, `ActiveIcon`, `ChildContent`, `Options`, `Expanded`, `AutoCloseDrawer`, `ExpandedChanged`.

`Menu`: popover menu wrapper with required `Trigger` and `Items`, plus `Placement`.

```razor
<Menu Placement="Placement.BottomStart">
    <Trigger><Button Text="Actions" /></Trigger>
    <Items>
        <MenuList>
            <MenuItem Title="Edit" Icon="icon-ic_fluent_edit_20_regular" OnClick="Edit" />
            <MenuDivider />
            <MenuItem Title="Archive" OnClick="Archive" />
        </MenuList>
    </Items>
</Menu>
```

`MenuList`, `MenuItem`, `MenuItemGroup`, `MenuDivider`: menu content. `MenuItem` parameters: required `Title`, `OnClick`, `ChildContent` for submenus, `Icon`, `ActiveIcon`, `Checked`, `Data`, `Href`.

`TabList` and `Tab`: tabs. `TabList` parameters: `Appearance` (`Transparent`, `Subtle`), `Size` (`Small`, `Medium`, `Large`), `SelectedIndex`, `SelectedIndexChanged`, `OnTabAdded`, `EmptyContent`. `Tab` parameters: `Text`, `MenuLabel`, `Icon`, `ActiveIcon`, `Href`, `Match`, `Data`, `DeferredLoading`, `OnClick`, `Orientation`, `ChildContent`, `Actions`.

`Tree` and `TreeItem`: tree view with optional drag/reorder and checkboxes. `Tree` parameters: `CheckboxMode` (`None`, `Independent`, `Cascade`, `CascadeDown`, `CascadeUp`), `CircularCheckboxes`, `Draggable`, `Orderable`, `ToggleSubItemsOnClick`, `ToggleCheckStateOnClick`, `OnClick`, `OnItemDrop`, `OnInsertAfter`, `CanDrop`, `CanDrag`, `CanReorder`. `TreeItem` parameters: `Title`, `Icon`, `ExpandedIcon`, `Expanded`, `DisableCheckBox`, `ExpandedChanged`, `IsChecked`, `IsCheckedChanged`, `OnClick`, `Data`, `Href`, `Target`, `DragData`, `ChildContent`, `ItemTemplate`, `Expandable`.

`DataList<TItem>`: virtualized list. Parameters: `Items`, `ItemsProvider`, `ItemsSize`, `PlaceHolder`, `EmptyContent`, `ItemKey`, `SelectedData`, `SelectedItem`, `SelectedItemChanged`, `SelectedDataChanged`.

`DataGrid<TItem>` and `DataGridColumn<TItem>`: virtualized table/grid. `DataGrid` parameters: `ItemsProvider`, `Columns`, `RowSize`. `DataGridColumn` parameters: `Header`, `Field`, `CellClasses`, `HeaderClasses`, `ChildContent`, `Format`, `Width`, `Wrap`, `Freezed`.

```razor
<DataGrid TItem="Order" ItemsProvider="LoadOrders" RowSize="44">
    <Columns>
        <DataGridColumn TItem="Order" Header="Order" Field="x => x.Number" Width="140" Freezed />
        <DataGridColumn TItem="Order" Header="Customer" Field="x => x.CustomerName" Width="240" />
        <DataGridColumn TItem="Order" Header="Total" Field="x => x.Total" Format="C" Width="120" />
    </Columns>
</DataGrid>
```

`DataPager`: pagination buttons. Parameters include `Page`, `PageChanged`, `MaxPageButtons`, `PageQueryParameter`, `ButtonShape`, show/hide first/previous/next/last, button texts, and icon/active-icon classes for each navigation button.

## Surfaces and Feedback

`Popover`: inline floating surface. Required slots: `Trigger`, `Surface`. Parameters: `Placement`, `Offset`, `Padding`, `DisplayArrow`, `KeepSurface`, `TriggerEvents` default `click`, `HideEvents`, `SameWidth`, `Appearance` (`Default`, `Brand`, `Inverted`). For manual show, set `TriggerEvents="@(null)"`, keep a component ref, call `SetTrigger(triggerComponent)`, then `Show()`, `Close()`, or `RefreshSurface(updatePosition)`.

`Tooltip`: usually use the common `Tooltip`/`TooltipContent` parameters on components. Tooltips depend on `<Containers />`.

`Dialog`: inline dialog component with `ChildContent`, `Size`, `OnClose`. Prefer `IDialogService` for app dialogs:

```razor
@inject IDialogService DialogService

@code {
    private async Task Edit()
    {
        var result = await DialogService.ShowAsync<EditCustomerDialog>(
            "Edit customer",
            new Dictionary<string, object?> { ["CustomerId"] = _id },
            c => c.SetSize(DialogSize.Large)
                  .SetModal(true)
                  .SetCloseButton(true)
                  .AddAction("Cancel", false)
                  .AddAction("Save", true, primary: true));
    }
}
```

`DialogSize`: `Small`, `Medium`, `Large`, `FullWidth`. Message boxes use `ShowMessageBoxAsync(title, message, buttons, primaryButton)` with `MessageBoxButton` flags (`Ok`, `Yes`, `Cancel`, `No`, `Retry`, `Abort`) and return `MessageBoxResult`.

`Drawer`: inline drawer with `ChildContent`, `Position`, `Size`, `OnClose`, `Breakpoint`. Use `DrawerContent` inside with `Title`, `ShowDismissButton`, `ContentComponentType`, `ContentParameters`.

Prefer `IDrawerService` for global drawers:

```razor
@inject IDrawerService DrawerService

await DrawerService.ShowAsync<CustomerPanel>(
    "Customer",
    new Dictionary<string, object?> { ["Id"] = id },
    c => c.SetPosition(DrawerPosition.End)
          .SetSize(DrawerSize.Medium)
          .SetModal(true));
```

`DrawerPosition`: `Start`, `End`, `Top`, `Bottom`. `DrawerSize`: `Small`, `Medium`, `Large`, `Full`.

`Toast`: inline toast with `ChildContent`, `Duration`, `Placement`, `OnClose`. Prefer `IToastService`:

```razor
@inject IToastService ToastService

await ToastService.ShowAsync("Saved",
    c => c.SetMessage("Changes were saved.")
          .SetIntend(ToastIntend.Success)
          .SetDuration(2500)
          .SetPlace(ToastPlacement.BottomEnd));
```

`ToastIntend`: `None`, `Success`, `Info`, `Warning`, `Error`. `ToastPlacement`: `TopStart`, `TopCenter`, `TopEnd`, `BottomStart`, `BottomCenter`, `BottomEnd`.

`MessageBar`: inline status message. Parameters include `Type` (`Default`, `Warning`, `Danger`, `Success`, `Information`), dismiss support, and content.

`ProgressBar`: progress indicator. Parameters: `Value`, `Message`, `Icon`, `Color` (`Brand`, `Success`, `Error`, `Warning`), `Size` (`Small`, `Large`), `Indeterminate`.

`Spinner`: loading indicator. Parameters: `Appearance` (`Primary`, `Inverted`), `LabelPosition` (`Before`, `After`, `Above`, `Below`), `Size` (`ExtraTiny`, `Tiny`, `ExtraSmall`, `Small`, `Medium`, `Large`, `ExtraLarge`, `Huge`), `Label`.

`Skeleton`: loading placeholder. Parameter: `Shape` (`Rectangle`, `Circle`).

## Cards, Accordions, Wizard

`Card`: content card. Parameters: `Orientation` (`Vertical`, `Horizontal`), `Size` (`Small`, `Medium`, `Large`), `Appearance` (`Filled`, `FilledAlternative`, `Outline`, `Subtle`), `ChildContent`, `OnClick`, `Selected`, `SelectedChanged`, `Href`.

Child components: `CardHeader` (`Image`, `Header`, `Description`, `Action`, `ContextualAction`), `CardPreview` (`ChildContent`, `Logo`), `CardContent`, `CardFooter`, `CardFloatingAction`.

`Accordion` and `AccordionPanel`: collapsible content. `Accordion` parameters: `HeaderAction` (`Expand`, `Toggle`), `Multiple`, `ChildContent`. `AccordionPanel` parameters: `Header`, `HeaderAction`, `HeaderIcon`, `PanelClasses`, `DeferredLoading`, `Expanded`, `ExpandedChanged`, expanded/collapsed class parameters.

`Wizard` and `WizardStep`: multi-step workflow. `Wizard` parameters: `Orientation`, `DisplayStepTitles`, `StepTitleClass`, `DisplayNavigationButtons`, `NavigateOnStepClick`, labels (`LabelNext`, `LabelPrevious`, `LabelCancel`, `LabelDone`), `SubmitWhenDone`, `CanCancel`, `AllowNext`, `AllowPrevious`, `CurrentStep`, events (`OnNext`, `OnDone`, `OnPrevious`, `OnCancel`). `WizardStep` parameters: `Title`, `DeferredLoading`, `Index`, `IndexChanged`, `ChildContent`.

## Dock, Property Editor, MDI, Hierarchy

`DockBar`, `DockContainer`, `DockPanel`: docking surface. `DockBar` parameters: `DisplayTitle`, `Orientation`, `RotateItems`. `DockContainer` parameters: `DefaultSize`, `DockMode` (`Pinned`, `Floating`). `DockPanel` parameters: `HeaderContent`, `MoreActionsContent`; service is `IDockService`.

`PropertyEditor`: reflection-based object editor. Parameters: `LabelWidth`, `EditorRootObject`, `Object`, `Categorize`, `PropertyUpdated`, `CommandManager`. It supports command-managed property updates and collection operations. Use `CommandManager` when undo/redo should work.

`MdiTabList`, `MdiTab`, `MdiTabToolbarItem`: multiple document interface utilities. Register `AddBluentUtilities()`. Documents implement `IMdiDocument` and component type must be `ComponentBase, IMdiDocument`. Open with `IMdiService.OpenDocument<TComponent>(id, commandManager, parameters)`. Use `MdiTabToolbarItem Document="_tab?.Document"` with `UndoToolbarButton`, `RedoToolbarButton`, `SaveToolbarButton` where relevant.

`AppBusyIndicator`: global busy indicator tied to `IBusyIndicator.SetBusy()` and `SetIdeal()`.

`HierarchyTreeBrowser`/`HierarchyItemBrowser`: filesystem-like hierarchy pickers. `HierarchyTreeBrowser` parameters: root/item icons, `RootOnly`, `ItemOptions`, `OnPathSelected`, `OnItemSelected`, `OnItemDeselected`. `HierarchyItemBrowser` adds labels/buttons, `HideCancel`, `MustExist`, `DefaultFileName`, and create/rename/delete callbacks.

## Charts

Package/namespace: `Bluent.UI.Charts`, `Bluent.UI.Charts.Components`. The JS module is bundled at `_content/Bluent.UI.Charts/bluent.ui.charts.js`; no manual script tag is normally needed because components import it.

`Chart`: parameters `Labels`, `ChildContent`.

`Dataset<TKey,TValue>`: generic data series. Use `Data` (from component generic support), `ChartType`, `Label`, `BorderColor`, `BackgroundColor`, `BorderWidth`, `BorderRadius`, `BorderSkipped`, `Smooth`, `FillTarget`. `ChartType`: `Bar`, `Line`, `Pie`, `Doughnut`, `PolarArea`, `Radar`, `Scatter`.

Chart children:
- `Legend`: `Position`, `Display`
- `Title`: `Text`, `Display`, font family/size/weight/style and padding (`Top`, `Bottom`, `Left`, `Right`)
- `Subtitle`: same as `Title`
- `Tooltip`: `Enabled`
- `Colors`: enables automatic colors
- `XScale`/`YScale`: `Display`, `Text`

Use Chart.js concepts. `Position` comes from `Bluent.UI.Charts.ChartJs` and includes positions such as `Left`. `FillTarget` supports area fills; use `FillTarget.Start` for the common baseline area-fill case. `DefaultColors` provides common colors and `.Opacity(...)`.

```razor
@using Bluent.UI.Charts.ChartJs

<Chart>
    <Legend Position="Position.Left" />
    <Title Text="Revenue" />
    <Subtitle Text="@_period" />
    <XScale Text="Month" />
    <YScale Text="Value" />
    <Dataset ChartType="ChartType.Line"
             Data="_series"
             Label="Revenue"
             Smooth
             BorderWidth="2"
             BorderColor="@DefaultColors.Orange"
             BackgroundColor="@DefaultColors.Orange.Opacity(127)" />
</Chart>
```

`Gauge`: SVG/JS gauge. Parameters: `Value`, `Min`, `Max`, `StartAngle`, `EndAngle`, `Radius`, `HideValue`, `GaugeClass`, `DialClass`, `ValueDialClass`, `ValueClass`, `ViewBox`, `Colors`, `DisableAnimation`.

## Diagrams and Drawing Canvas

Package/namespace: `Bluent.UI.Diagrams`, `Bluent.UI.Diagrams.Components`; link `bluent.ui.diagrams.min.css`.

`DrawingCanvas`: SVG drawing surface. Parameters: `CommandManager`, `ChildContent`, `Defs`, `Tool`, `Selection`, `OnToolOperationCompleted`, `AllowDrag`, `AllowPan`, `AllowScale`, `AllowDelete`, `AllowOptions`, `SnapSize`, `SelectionPadding`, `OnSelectionChanged`.

Use `CommandManager` from `Bluent.Core` for undo/redo. Tools live under `Bluent.UI.Diagrams.Tools` and drawing-specific namespaces. Common tools include `AreaSelectTool`, `DrawLineTool`, `DrawRectTool<TSelectionOptions>`, `DrawCircleTool`, `DrawDiamondTool`, `InkToShapeTool`, plus diagram tools under `Tools.Drawings.Diagram`.

Basic SVG elements/components:
- `Rect`: `X`, `Y`, `Rx`, `Ry`, `StrokeWidth`, `Fill`, `Stroke`
- `Circle`: `StrokeWidth`, `Fill`, `Stroke`
- `Line`: `StrokeWidth`, `Fill`, `Stroke`

`Diagram` extends the canvas for node/connector diagrams. Parameter: `ConnectorMarkerEnd`, plus inherited drawing canvas parameters. Diagram model types include rectangle/circle nodes, boundary nodes, containers, connectors, and command classes for add/drag/delete.

```razor
<DrawingCanvas Tool="_tool"
               CommandManager="_commandManager"
               Selection="SelectionMode.Multiple"
               SnapSize="10"
               AllowDrag
               AllowPan
               AllowScale
               Class="flex-fill">
    <Defs>
        <pattern id="grid-pattern" patternUnits="userSpaceOnUse" width="10" height="10">
            <path fill="none" stroke="#aaa" stroke-width="0.5" d="M 0 0 h 10 M 0 0 v 10"></path>
        </pattern>
    </Defs>
    <ChildContent>
        <rect width="100%" height="100%" fill="url(#grid-pattern)"></rect>
    </ChildContent>
</DrawingCanvas>
```

## Theme and Styling

Use Bluent CSS variables/classes before hand-writing colors and spacing. Themes are applied via `IBluentTheme`:

```razor
@inject IBluentTheme Theme

await Theme.SetThemeAsync("teams");
await Theme.SetThemeModeAsync("dark"); // or "light"
await Theme.SetDirectionAsync("rtl");  // or "ltr"
```

Theme names are lowercase variants of the CSS files: `default`, `excel`, `office`, `outlook`, `powerapps`, `powerbi`, `powerpoint`, `stream`, `teams`, `word`.

The host element uses `data-bui-theme="light"` or `dark` and `dir="ltr"`/`rtl`.

### Typography

Semantic text classes:

`body1`, `body1Strong`, `body1Stronger`, `body2`, `caption2`, `caption2strong`, `caption1`, `caption1strong`, `caption1Stronger`, `subtitle2`, `subtitle2Stronger`, `subtitle1`, `title3`, `title2`, `title1`, `largeTitle`, `display`.

Token sizes: 10, 12, 14, 16, 20, 24, 28, 32, 40, 68px. Utility classes use `fs-1` etc. Font weights: `fw-regular`, `fw-medium`, `fw-semi`, `fw-bold`.

### Spacing and Layout Utilities

Bluent includes Bootstrap-like responsive utilities backed by Fluent spacing tokens:

- Spacing: `p-*`, `px-*`, `py-*`, `pt-*`, `pe-*`, `pb-*`, `ps-*`, `m-*`, `mx-*`, `my-*`, `mt-*`, `me-*`, `mb-*`, `ms-*`; values are indexed from `0` upward, plus `auto` for margins. Common examples: `p-5`, `p-7`, `py-md-10`, `px-md-12`, `m-auto`.
- Display/flex: `d-flex`, `d-block`, `d-none`, `flex-row`, `flex-column`, `flex-fill`, `flex-wrap`, `justify-content-*`, `align-items-*`, `align-self-*`, `order-*`.
- Gaps: `gap-*`, `row-gap-*`, `column-gap-*`.
- Size: `w-0`, `w-25`, `w-50`, `w-75`, `w-100`, `w-auto`, `w-fit`; same pattern for `h-*`; viewport helpers `vw-100`, `vh-100`, `min-vw-100`, `min-vh-100`.
- Position: `position-relative`, `position-absolute`, `top-0`, `top-50`, `top-100`, `start-0`, `end-0`, `translate-middle`, `translate-middle-x`, `translate-middle-y`.
- Overflow: `overflow-auto`, `overflow-hidden`, `overflow-x-auto`, `overflow-y-auto`.
- Text: `text-start`, `text-end`, `text-center`, `text-nowrap`, `text-break`, `text-uppercase`, `text-capitalize`, `text-decoration-none`.
- Shadows: `shadow-0` through `shadow-6`, and brand versions `shadow-brand-0` through `shadow-brand-6`.

Utilities are responsive when generated with breakpoint infixes, e.g. `w-md-50`, `d-lg-flex`.

### Colors

Neutral/background classes:

- Background: `bg-1`/`bg-neutral-1` through `bg-5`, `bg-brand-1`, `bg-brand-1-hover`, `bg-brand-1-hovered`, `bg-brand-1-press`, `bg-brand-1-pressed`, `bg-brand-2`, `bg-brand-2-hover`, `bg-brand-2-hovered`, `bg-brand-2-press`, `bg-brand-2-pressed`
- Foreground: `color-1`/`color-neutral-1` through `color-4`, `color-brand-1`, `color-brand-2`

Status/persona color utility families exist as `bg-<name>-1`, `bg-<name>-2`, `bg-<name>-3`, `color-<name>-1`, `color-<name>-2`, `color-<name>-3`, `border-<name>-1`, `border-<name>-2`, `border-<name>-active`. Status names include success/warning/danger-like families from Fluent shared colors; persona names mirror `ColorPalette`.

Prefer CSS variables such as `var(--colorNeutralBackground1)`, `var(--colorNeutralForeground1)`, `var(--colorNeutralStroke1)`, `var(--colorBrandBackground)`, `var(--colorBrandForeground1)`, and status variables when custom CSS is necessary.

### Radius, Borders, Animation

Radius classes follow:

- Whole element: `radius-none`, `radius-small`, `radius-medium`, `radius-large`, `radius-xlarge`, `radius-circular`
- Side: `radius-t-*`, `radius-b-*`, `radius-s-*`, `radius-e-*`
- Corner: `radius-ts-*`, `radius-te-*`, `radius-bs-*`, `radius-be-*`

There are also generated `rounded-*` utilities from radius indexes and named values (`circle`, `pill`, `circular`).

Border utilities: `border`, `border-0`, side variants, border widths from Fluent stroke tokens.

Animation utility families include `anim-duration-*`, `anim-time-*`, `anim-direction-*`, `anim-fill-*`; common animation classes include `anim-slide-in-end` and `anim-fade-in`.

## Good Bluent Habits

- Use Bluent primitives (`Stack`, `Button`, `Toolbar`, `Card`, `Drawer`, `Dialog`, `Toast`) instead of raw Bootstrap or custom HTML where a component exists.
- Use `Class` for spacing/layout utilities and `Style` only for one-off values or CSS variables.
- Use service-based surfaces for cross-page dialogs/drawers/toasts and inline components for local, component-scoped cases.
- Use `CommandManager` for diagram/property-editor/MDI workflows that need undo/redo.
- Keep icons paired: regular icon for normal state and filled icon for active/toggled state.
- Keep `<Containers />` and CSS links in the consuming app before debugging missing popovers, tooltips, dialogs, drawers, or toasts.
- When an API is uncertain in a consuming project, use the installed package metadata: let IntelliSense complete parameters, run `dotnet build` to catch wrong names/types, and prefer the patterns in this skill over inventing custom wrappers.
