# MDI tab utilities

## Purpose

`MdiTabList`, `MdiTab`, and the `IMdiService`/`IMdiDocument` abstractions provide a desktop-style multi-document tab workflow in `Bluent.UI.Utilities`.

Use this family when application documents are opened dynamically, keep independent command state, expose activation/deactivation lifecycle, and need tab selection/closing coordinated through a service.

## Package and namespaces

- Package: `Bluent.UI.Utilities`
- Components: `Bluent.UI.Utilities`
- Abstractions: `Bluent.UI.Utilities.Abstractions`
- Registration extension: `Bluent.UI.Utilities.Extensions`

Register the utilities service set:

```csharp
builder.Services.AddBluentUtilities();
```

The registration adds `IMdiService`/`MdiService` and `IBusyIndicator`/`BusyIndicator`; the optional lifetime parameter defaults to `ServiceLifetime.Scoped`.

## Consumer model

`MdiTabList` listens to the registered MDI service and owns the active tab set. `MdiTab` dynamically renders a supplied component type and exposes it as `Document` when the component implements `IMdiDocument`.

A document can participate in activation/deactivation and expose title/icon/change-state behavior through the public MDI abstractions.

## Verified `MdiTabList` API

- `TabChanged` — callback with the newly selected `IMdiTab?`.
- `Class` — defaults to `"h-100 overflow-auto"`.
- `EmptyContent` — optional content when there are no open documents.
- public `Add(IMdiTab)`, `Remove(IMdiTab)`, and `CloseTab(IMdiTab)` methods are part of the current surface.

The list subscribes to concrete `MdiService` open/close/state-change events and unsubscribes during async disposal. Selection changes call `OnDeactivated()` on the previous document and `OnActivated()` on the new one.

## Verified `MdiTab` API

- `ComponentType` — editor-required dynamic component type.
- `TabId` — editor-required document identity.
- `Parameters` — editor-required `Dictionary<string, object>?`.
- `CommandManager` — editor-required `CommandManager?`.
- `Class` — optional class.
- `Document` — public `IMdiDocument?` projection of the captured component instance.

`MdiTab` obtains a command manager from the explicit parameter, then from `Parameters[nameof(CommandManager)]`, then creates a private one. Before rendering the dynamic component it inserts the selected command manager into the supplied `Parameters` dictionary when one is present.

The visible title is derived from `IMdiDocument.Title` and gets `*` when either the document or command manager reports changes.

## Composition and lifecycle

Use the registered `IMdiService` to request document open/close operations rather than manually synchronizing tab-list internals. Keep stable, unique `TabId` values for documents that should map to one tab.

Current source contains a lifecycle caveat: when an `MdiTab` is cascaded from a `Popover`, initialization skips `Parent.Add(this)`, but `Dispose()` still calls `Parent.Remove(this)` without a null guard. Treat popover-hosted `MdiTab` disposal as a known product defect until fixed; tracked in #411.

## Common mistakes

- Do not omit `AddBluentUtilities()` when consuming `IMdiService`.
- Do not assume `Parameters` is immutable: current `MdiTab` mutates the supplied dictionary to inject `CommandManager`.
- Do not treat MDI as persistence; opening/closing tabs and saving document state are separate concerns.
- Do not infer browser-style route synchronization; this is an application document/tab service.

## Accessibility, RTL, and runtime

Tab interaction is composed from Bluent tab/popover/toolbar primitives. Full keyboard/focus behavior and dynamic-document lifecycle should be verified in a representative interactive host before claiming desktop-grade accessibility behavior.

## Evidence

Source verified against:

- `src/Bluent.UI.Utilities/MdiTab/MdiTab.razor(.cs)`
- `src/Bluent.UI.Utilities/MdiTab/MdiTabList.razor(.cs)`
- `src/Bluent.UI.Utilities/Abstractions/IMdiDocument.cs`
- `src/Bluent.UI.Utilities/Abstractions/IMdiService.cs`
- `src/Bluent.UI.Utilities/Abstractions/IMdiTab.cs`
- `src/Bluent.UI.Utilities/Extensions/ServiceCollectionExtensions.cs`