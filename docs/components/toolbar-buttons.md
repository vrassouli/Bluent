# ToolbarButtons utilities

## Purpose

`SaveToolbarButton`, `UndoToolbarButton`, and `RedoToolbarButton` are `Bluent.UI.Utilities` helpers that compose Bluent `ToolbarButton` with a `Bluent.Core.CommandManager`.

Use them when an editor already uses `CommandManager` and should expose conventional save/undo/redo commands without duplicating command-state wiring.

## Package and namespace

- Package: `Bluent.UI.Utilities`
- Namespace: `Bluent.UI.Utilities`
- Depends on the main Bluent UI toolbar/button components.

## Minimal usage

```razor
<SaveToolbarButton CommandManager="_commands"
                   Text="Save"
                   OnSave="SaveAsync" />
<UndoToolbarButton CommandManager="_commands" Text="Undo" />
<RedoToolbarButton CommandManager="_commands" Text="Redo" />
```

## Verified API

### SaveToolbarButton

- `CommandManager` — required `CommandManager`.
- `Text` — optional text.
- `Tooltip` — optional tooltip.
- `OnSave` — callback invoked when the save button is clicked.

The button is disabled unless `CommandManager.HasChanges` is true. The helper does **not** perform persistence or mark a save point itself; application code owns `OnSave` behavior.

### UndoToolbarButton / RedoToolbarButton

Both expose:

- `CommandManager` — editor-required `CommandManager?`.
- `Text` — optional text.
- `Tooltip` — optional tooltip.

Undo invokes `CommandManager.Undo()` and enables from `CanUndo`. Redo invokes `CommandManager.Redo()` and enables from `CanRedo`.

All three helpers subscribe to relevant `CommandManager` events, update their enabled state, switch subscriptions when the parameter changes, and unsubscribe on disposal.

## Composition and setup

These are thin utilities over `ToolbarButton`; place them where a normal Bluent toolbar button is appropriate. Their icons are typed `FluentIcons.Save`, `FluentIcons.ArrowUndo`, and `FluentIcons.ArrowRedo`.

## Accessibility, RTL, and localization

Provide localized `Text` and/or `Tooltip` appropriate to the application. Do not assume these helpers localize command labels automatically.

## Common mistakes

- Do not expect `SaveToolbarButton` to save application state by itself.
- Do not create a second command history just for these buttons; pass the same `CommandManager` used by the editor/document.
- Do not manually force enabled state; the helper derives it from command-manager state.

## Evidence and limitations

Source verified against:

- `src/Bluent.UI.Utilities/ToolbarButtons/SaveToolbarButton.razor`
- `src/Bluent.UI.Utilities/ToolbarButtons/UndoToolbarButton.razor`
- `src/Bluent.UI.Utilities/ToolbarButtons/RedoToolbarButton.razor`

Runtime keyboard/accessibility behavior is inherited from the underlying `ToolbarButton`/`Button` path and should use those canonical references for guarantees.