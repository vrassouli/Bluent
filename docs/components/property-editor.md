# PropertyEditor

`PropertyEditor` reflects over an object and renders Bluent's property-editing surface. It also exposes command-based mutation helpers so property/collection changes can participate in a supplied `CommandManager`.

## Package and namespace

```razor
@using Bluent.UI.Components
```

Package: `Bluent.UI`

## Basic usage

```razor
<PropertyEditor Object="@model"
                EditorRootObject="@model"
                PropertyUpdated="OnPropertyUpdated" />
```

## Public parameters

| Parameter | Type | Default / notes |
| --- | --- | --- |
| `LabelWidth` | `int` | `120` |
| `EditorRootObject` | `object?` | optional root context |
| `Object` | `object?` | object being reflected/edited |
| `Categorize` | `bool` | `true` |
| `PropertyUpdated` | `EventCallback` | property-update notification path used by the editor composition |
| `CommandManager` | `CommandManager?` | optional command manager for mutations |

When `Object` changes by reference, the component creates a new `PropertyEditorContext` from the object's runtime type; null clears the context.

## Mutation helpers

Public helpers include:

```csharp
SetPropertyValue<T>(object obj, T? value, Expression<Func<T>> expression)
SetPropertyValue(object obj, object? value, params PropertyInfo[] properties)
CreateSetPropertyValueCommand(...)
AddToCollection(object collection, object item)
GetAddToCollectionCommand<T>(ICollection<T> collection, T item)
RemoveFromCollection(object collection, object item)
GetRemoveFromCollectionCommand<T>(ICollection<T> collection, T item)
ReorderCollection(IEnumerable value, object item, int index)
Do(ICommand command)
```

`Do` routes through `CommandManager.Do(command)` when a manager exists; otherwise it executes `command.Do()` directly.

The family contains public command/context types such as `SetPropertyCommand`, `AddToCollectionCommand`, `RemoveFromCollectionCommand`, `ReorderCollectionCommand`, `PropertyEditorContext`, and `PropertyEditorCategory`. Treat these as the source-backed command/configuration surface, not as a reason to invent a second generic editing API.

## Reflection and editor selection

The rendered editor is driven from reflection metadata and PropertyEditor context/internal renderer logic. Do not assume every CLR type receives the same control or that arbitrary custom-editor registration APIs exist unless verified in the matching source/version.

`Categorize=true` groups the reflected properties according to the editor's category metadata path; `LabelWidth` controls the label column sizing used by current rendering.

## Command/history boundary

Supplying a `CommandManager` changes how mutations are executed, but PropertyEditor itself should not be described as an automatic persistence layer. It edits object/collection state through commands; saving to a database/API remains application responsibility.

## Accessibility/runtime boundary

Accessibility and validation behavior depend on the concrete generated Bluent editors for reflected property types. Verify keyboard flow, labels, nested collections, validation, and undo/redo behavior for the actual object model before making broad guarantees.

## Evidence boundary

Source verified from `PropertyEditor.razor(.cs)` and the public PropertyEditor command/context family. Do not invent persistence, arbitrary editor-plugin APIs, automatic deep validation, or serialization behavior absent from current source.
