# Bluent consumer service and infrastructure surface

This page classifies the non-component public surface that coding agents may encounter while using `Bluent.UI`. It is intentionally a routing/classification reference, not a duplicate API encyclopedia.

## Consumer-facing services

These services are valid application-facing APIs and are registered by `AddBluentUI()`:

| Service | Consumer role | Canonical component guidance |
| --- | --- | --- |
| `IDialogService` | open/await modal workflows | [Dialog](dialog.md) |
| `IDrawerService` | open/await drawer workflows | [Drawer](drawer.md) |
| `IDockService` | coordinate named dock panels/tool windows | [DockPanel](dock-panel.md) |
| `IToastService` | show transient application feedback | [Toast](toast.md) |
| `IPopoverService` | infrastructure behind anchored popovers | [Popover](popover.md) |
| `ITooltipService` | infrastructure behind inherited tooltip capability | [Tooltip](tooltip.md) |

Use the higher-level component/service pattern documented on each family page. Do not instantiate concrete service implementations directly.

## Shared host infrastructure

`<Containers />` is a consumer-facing infrastructure component. Place one host in the active application layout when service-backed Dialog, Drawer, Popover, Tooltip, or Toast features are used. See [Containers](containers.md).

Container implementation components and their internal event plumbing are not separate consumer choices and should not appear in normal generated application markup.

## DOM/interoperability helpers

`IDomHelper`, `DomHelper`, and `DomRect` are public because Bluent components use them for browser measurement, focus, pointer, overflow, and file-input integration. They are **low-level infrastructure**, not the default API for ordinary consumer UI.

An agent should prefer the relevant Bluent component first. Use `IDomHelper` directly only when implementing a genuine custom/browser integration that cannot be expressed through an existing Bluent component, and treat that code as interactive/JS-dependent.

## PropertyEditor extension points

`IPropertyEditorProvider` and `IPropertyEditorTypeRegistry` are consumer-facing extension points for the reflection-driven [PropertyEditor](property-editor.md) family. They are configuration/provider APIs, not visual component families.

Use them only when customizing how property types are mapped/rendered by PropertyEditor. Do not count them as additional entries in the component-family inventory.

## Configuration, result, and event types

Public configuration/result/event types used by Dialog, Drawer, Popover, Toast, DockPanel, tooltip, fields, and other components belong to their owning family documentation. They should be loaded on demand with that family rather than copied into a global API catalog.

Examples include service configuration records/builders, placement/size/appearance enums, dialog/drawer results, popover settings, and event arguments.

## Base classes and internal composition

Public/abstract base classes such as Bluent component/input/field/overflow bases exist to support the library and advanced extension scenarios. They are not normally the first consumer choice and should not cause an agent to generate abstract/non-instantiable tags.

The canonical exception worth knowing directly is abstract `Overflow`, because concrete `Toolbar` and `TabList` inherit its overflow model; see [Overflow](overflow.md).

## Selection rule for agents

When a task mentions a service/helper type:

1. identify the owning component family;
2. load that canonical component page;
3. use the service only when the documented family workflow requires it;
4. avoid direct concrete implementation or low-level DOM helper usage unless there is a real component gap;
5. preserve interactive/render-mode constraints for anything backed by JS/DOM measurement.

## Evidence

Classification was reconciled against current public source under:

- `src/Bluent.UI/Services/Abstractions/`
- `src/Bluent.UI/Services/`
- `src/Bluent.UI/Components/`

and against the current source-verified component references for Dialog, Drawer, DockPanel, Popover, Toast, Tooltip, PropertyEditor, Containers, and Overflow.
