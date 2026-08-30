# Hierarchy utilities

## Purpose

The `Bluent.UI.Utilities` hierarchy family provides two higher-level browsing/selection workflows over hierarchical data:

- `HierarchyTreeBrowser` — expandable tree navigation with path/item selection callbacks.
- `HierarchyItemBrowser` — file-picker-style path browsing with back/forward/up navigation, selection, create/rename/delete hooks, and optional Dialog result flow.

Use these utilities when application data is hierarchical but the consumer needs a ready-made browser workflow rather than assembling raw `Tree` primitives.

## Package and namespace

- Package: `Bluent.UI.Utilities`
- Namespace: `Bluent.UI.Utilities`

The family uses typed `IconDefinition` icons and main Bluent UI components internally. `HierarchyItemBrowser` can optionally consume a cascaded Bluent `Dialog`.

## Data contract

Both browsers load items through the public delegate:

```csharp
public delegate ValueTask<List<HierarchyItem>> ReadHierarchyItemsDelegate(string? path);
```

`null` means the root path. `HierarchyRootItem` represents a navigable container/root-like entry; regular `HierarchyItem` values represent selectable items.

## `HierarchyTreeBrowser`

Verified parameters:

- `RootItemIcon` — defaults to `FluentIcons.Folder`.
- `RootItemExpandedIcon` — defaults to `FluentIcons.FolderOpen`.
- `ItemIcon` — defaults to `FluentIcons.Document`.
- `RootOnly`.
- `ItemOptions` — optional `RenderFragment<HierarchyItem>`.
- `OnPathSelected` — receives `HierarchyPathSelection`.
- `OnItemSelected` — receives `HierarchyItemSelection`.
- `OnItemDeselected`.
- `GetHierarchyItems` — editor-required `ReadHierarchyItemsDelegate`.

Public `RefreshAsync()` reloads root data and refreshes registered tree items.

Selection is single-item state inside the browser: clicking a different item selects it; clicking the currently selected item clears selection. Root items invoke path selection while normal items invoke item selection.

## `HierarchyItemBrowser`

Verified presentation/navigation parameters include:

- `EmptyMessage` = `"Nothing to display."`
- `LabelTitle` = `"Item:"`
- `SelectButtonTitle` = `"Select"`
- `CancelButtonTitle` = `"Cancel"`
- `CreateButtonTitle` = `"New"`
- `RootTitle` = `"Root"`
- root/expanded/item typed icons
- `HideCancel`
- `MustExist`
- `DefaultFileName`
- editor-required `GetHierarchyItems`

Verified callbacks:

- `OnSelect` with `HierarchyItemSelection`
- `OnCancel`
- `OnCreateRootItem`
- `OnRenameItem`
- `OnDeleteItem`

If `OnSelect` is not supplied and the component is hosted inside a Bluent `Dialog`, successful selection closes the dialog with the `HierarchyItemSelection` result. Likewise, cancel closes the dialog when no explicit `OnCancel` handler is supplied.

Public `RefreshAsync()` reloads the current path and refreshes the embedded tree browser.

## Selection semantics and known caveat

`MustExist=true` allows selection only when the entered name exists in the current item list. Current source performs that existence check with case-sensitive equality, while the `MustExist=false` create-path collision check uses `StringComparison.OrdinalIgnoreCase`. This inconsistent casing policy is tracked as a product gap in #411; consumers should not assume one canonical case-sensitivity rule until resolved.

## Localization and RTL

The default labels/messages are hard-coded English parameters. Applications should supply localized strings explicitly. Path splitting accepts both `/` and `\` separators. Do not infer locale-aware path semantics beyond the verified source behavior.

## Accessibility and runtime

The browsers compose several interactive Bluent controls and maintain navigation/selection state. Keyboard, focus, screen-reader, deep-tree, and async-loading behavior still require representative runtime verification; use the canonical `Tree` reference for lower-level verified limitations.

## Common mistakes

- Do not call the data provider only once and cache forever if external hierarchy state changes; use `RefreshAsync()` when appropriate.
- Do not assume the utility persists create/rename/delete changes: callbacks delegate those operations to the application.
- Do not rely on the default English labels in localized applications.
- Do not assume the current `MustExist` case comparison is a deliberate cross-platform filesystem policy.

## Evidence

Source verified against:

- `src/Bluent.UI.Utilities/Hierarchy/HierarchyTreeBrowser.razor(.cs)`
- `src/Bluent.UI.Utilities/Hierarchy/HierarchyTreeItem.razor(.cs)`
- `src/Bluent.UI.Utilities/Hierarchy/HierarchyItemBrowser.razor(.cs)`
- `src/Bluent.UI.Utilities/Hierarchy/HierarchyItem*.cs`
- `src/Bluent.UI.Utilities/Hierarchy/HierarchyPathSelection.cs`