using Bluent.Core;

namespace Bluent.UI.Components.PropertyEditorComponent;

public sealed class AddToCollectionCommand : ICommand
{
    private readonly object _collection;
    private readonly object _value;

    public AddToCollectionCommand(object collection, object value)
    {
        _collection = collection;
        _value = value;
    }
    
    public void Do()
    {
        var addMethod = _collection.GetType().GetMethod("Add");
        if (addMethod != null)
        {
            addMethod.Invoke(_collection, [_value]);
        }
    }

    public void Undo()
    {
        var removeMethod = _collection.GetType().GetMethod("Remove");
        if (removeMethod != null)
        {
            removeMethod.Invoke(_collection, [_value]);
        }
    }
}