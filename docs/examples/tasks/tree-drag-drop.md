# Tree selection and drag/drop

Use `Tree` when the consumer needs a hierarchical UI with expansion, nullable checkbox state, and application-owned drag/drop or reorder handling.

## Requirements

- Package: `Bluent.UI`
- Namespace: `Bluent.UI.Components`
- Interactive Blazor render mode for click/drag/drop behavior

## Complete source

[`TreeDragDrop.razor`](../../../samples/Bluent.TaskExamples/Pages/Tasks/TreeDragDrop.razor) is the canonical compiled source. It enables cascade checkboxes, drag/drop and ordering, handles item clicks, and receives both drop-on-item and insert-after callbacks.

## Expected behavior

The example demonstrates the verified consumer contract:

- item clicks identify the selected `TreeItem`;
- checkbox state uses the component's nullable/cascade model;
- `OnItemDrop` and `OnInsertAfter` deliver `DndContext` events;
- the application remains responsible for modifying and persisting its backing hierarchy.

## Common mistakes

- Do not assume `Draggable` or `Orderable` automatically mutates application data.
- Do not replace nullable tree check state with an assumed non-nullable Boolean model.
- `Data` is an `object`; bind typed/string values as Razor expressions when needed rather than relying on string-literal inference.
- Do not claim a complete keyboard-accessible WAI-ARIA tree or keyboard drag/drop model from source alone.

## Validation boundary

The task is part of the standalone `Bluent.TaskExamples` compilation gate. Browser drag/drop, keyboard operation, assistive-technology behavior, and RTL interaction remain runtime evidence work and are not implied by compilation.
