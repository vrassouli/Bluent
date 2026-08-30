# DockPanel family

The DockPanel family provides service-backed application docking: `DockPanel` registers content into a named dock area, `DockBar` renders controls for panels registered to that area, and `DockContainer` renders the currently active panel for a dock name. It is intended for tool-window/application-shell style UI rather than a standalone card or drawer.

## Package and namespace

```razor
@using Bluent.UI.Components
```

Package: `Bluent.UI`

Register Bluent services with the normal `AddBluentUI()` setup so the dock service is available.

## Core pieces

### `DockPanel`

`DockPanel` is a registration/content component with these parameters:

| Parameter | Type | Notes |
| --- | --- | --- |
| `DockName` | `string` | Required dock-area name. |
| `Icon` | `IconDefinition?` | Required by the component contract. |
| `Title` | `string` | Required panel title. |
| `ChildContent` | `RenderFragment` | Required panel body. |
| `HeaderContent` | `RenderFragment?` | Optional custom header replacing the default icon/title header. |
| `MoreActionsContent` | `RenderFragment?` | Optional extra header actions. |

It registers itself with `IDockService` during initialization and unregisters on disposal.

Public methods:

- `SetDockName(string name)` — changes the panel's dock name and registers it with that name.
- `SetStateHasChanged()` — asks the dock service to notify the matching area.
- `Activate()` — activates this panel through the dock service.

### `DockBar`

`DockBar` displays controls for panels registered to one dock name.

| Parameter | Type | Default |
| --- | --- | --- |
| `DockName` | `string` | required |
| `DisplayTitle` | `bool` | `false` |
| `Orientation` | `Orientation` | `Horizontal` |
| `RotateItems` | `bool` | `false` |

The bar subscribes to dock-service activation/registration/mode events and toggles panels through the service.

### `DockContainer`

`DockContainer` renders the active panel for a dock area.

| Parameter | Type | Default |
| --- | --- | --- |
| `DockName` | `string` | required |
| `DefaultSize` | `int` | `150` |
| `DockMode` | `DockMode` | `Pinned` |

`DockMode` currently contains:

```csharp
public enum DockMode
{
    Pinned,
    Floating
}
```

`DockContainer` can consume a cascading split-panel region when nested in the split-panel layout. In floating mode it asks that region to float and manages its size.

## Representative composition

```razor
<SplitPanelContainer>
    <Start>
        <DockContainer DockName="tools" />
    </Start>
    <Center>
        Main workspace
    </Center>
</SplitPanelContainer>

<DockBar DockName="tools" Orientation="Orientation.Vertical" />

<DockPanel DockName="tools"
           Title="Explorer"
           Icon="@FluentIcons.Folder">
    Explorer content
</DockPanel>
```

Treat this as a source-shaped composition example, not proof of browser/runtime behavior for every docking transition.

## Runtime behavior

The family is stateful and service-backed:

- `DockPanel` instances register/unregister with `IDockService`.
- `DockContainer` subscribes to dock-service events and rerenders as panels activate, deactivate, register, unregister, or request state changes.
- Interactive `DockContainer` instances register pointer handlers through `IDomHelper` and may measure their rendered bounds.
- When integrated with the split-panel layout, the container can set floating state, resize allowance, and pixel size on its containing region.
- `DockContainer` removes its dock-service subscriptions during disposal and catches `JSDisconnectedException` around pointer-handler cleanup.

## Current source gaps / cautions

- `DockBar.DisposeAsync()` currently removes most event handlers with `-=` but uses `+=` for `PanelDockModeChanged`. This is a source-observed cleanup bug; do not claim that subscription is correctly removed until the implementation is fixed.
- Floating alignment classes in `DockContainer` are physical (`left-aligned` / `right-aligned`) even though split regions include logical `Start`/`End`. Do not promise RTL-perfect physical alignment without runtime verification.
- The built-in container header uses English tooltips (`More`, `Close`) and enum `ToString()` labels for dock modes; no localization layer is established in this source path.
- Docking behavior is not equivalent to drag-and-drop window docking. Current public source shown here exposes named areas, activation, pinned/floating mode, and split-region integration; do not invent draggable docking targets, tab tear-off, or persistence APIs.
- Current source does not establish a complete ARIA window/tab pattern for the dock system.

## Accessibility and render modes

Initial markup can be produced server-side, but measurement/pointer-dependent behavior requires interactivity. Verify focus order, keyboard operation, RTL behavior, and assistive-technology semantics in the target host before making stronger guarantees.

## Evidence boundary

Source verified from `DockPanel.cs`, `DockBar.razor.cs`, `DockContainer.razor`, `DockContainer.razor.cs`, and `DockMode.cs`. The canonical API is the public DockPanel family plus `IDockService` as provided by normal Bluent registration; do not invent a separate portal/container host requirement for docking.
