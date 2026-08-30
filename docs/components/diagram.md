# Diagram and DrawingCanvas

## Purpose

Use `DrawingCanvas` for Bluent's general drawing/selection/tool surface and `Diagram` for the diagram-specific specialization. `Diagram` derives from `DrawingCanvas`, restricts tools to `IDiagramTool`, manages diagram elements/containers, and supplies connector-marker definitions.

## Package and namespace

- Package: `Bluent.UI.Diagrams`
- Namespace: `Bluent.UI.Diagrams.Components`
- Stylesheet: `_content/Bluent.UI.Diagrams/bluent.ui.diagrams.min.css`
- `Bluent.UI` is separate; do not assume it is installed transitively.

## Minimal verified display usage

The repository's compiled `SimpleDiagram.razor` task is the canonical minimal display example. Constrain the diagram height so the drawing surface has useful visible space.

## `DrawingCanvas` public surface

Important parameters include:

- `ChildContent`, `Defs`
- `CommandManager`
- `Tool` (`ITool?`)
- `Selection` (`SelectionMode`, default `None`)
- `OnToolOperationCompleted`
- `AllowDrag`, `AllowPan`, `AllowScale`, `AllowDelete`, `AllowOptions`
- `SnapSize`
- `SelectionPadding`
- `OnSelectionChanged`

Public state/operations include `SelectedElements`, `Elements`, `Scale`, pointer/keyboard/wheel events, `ExecuteCommand`, `SelectElement`, `DeselectElement`, `ClearSelection`, `ResetScale`, `ResetPan`, and coordinate conversion helpers.

Source currently contains the `AllowDrag` activation block commented out. Do not assume `AllowDrag=true` activates a generic drag tool from this parameter alone.

`AllowPan`, `AllowScale`, and `AllowDelete` dynamically activate/deactivate internal tools as parameters change.

## `Diagram`

Adds:

- `ConnectorMarkerEnd` render fragment for overriding the default connector-end SVG marker.
- `DiagramElementAdded` / `DiagramElementRemoved` .NET events.
- `DiagramElements` and diagram-specific `SelectedElements` traversal.
- `AddDiagramElement`, `RemoveDiagramElement`, `CanContain`, `GetElementsAt`, and `GetElementContainer`.

If `Tool` is supplied to `Diagram`, it must implement `IDiagramTool`; otherwise parameter processing throws `InvalidOperationException`.

`RemoveDiagramElement` also calls `Clean()` on the removed diagram element.

## Interaction and runtime

Selection, pan, scale, delete, pointer events, keyboard events, command execution, and tool lifecycles are behavior-rich and require browser/runtime verification before making accessibility or input-device guarantees. The compiled simple-diagram task proves package/component composition, not editor workflows.

The repository hosting guide records representative interactive diagram runtime evidence, but the full editing/tool matrix remains intentionally unverified here.

## Common mistakes

- Do not treat the simple display task as proof of editing, touch, keyboard, persistence, or accessibility behavior.
- Do not pass a non-`IDiagramTool` tool to `Diagram`.
- Do not assume `AllowDrag` currently activates dragging; its activation code is commented in current source.
- Do not omit the Diagrams stylesheet.
- Constrain canvas dimensions in the consuming layout.

## Evidence

Source verified against current `Dev` `DrawingCanvas` and `Diagram` implementations plus the compiled simple-diagram task and hosting guide.