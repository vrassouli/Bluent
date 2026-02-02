using Bluent.Core;

namespace Bluent.UI.Components.PropertyEditorComponent;

public sealed class RemoveFromCollectionCommand : ICommand
{
    private readonly object _collection;
    private readonly object _value;

    public RemoveFromCollectionCommand(object collection, object value)
    {
        _collection = collection;
        _value = value;
    }
    
    public void Do()
    {
        var removeMethod = _collection.GetType().GetMethod("Remove");
        removeMethod?.Invoke(_collection, [_value]);
    }

    public void Undo()
    {
        var addMethod = _collection.GetType().GetMethod("Add");
        addMethod?.Invoke(_collection, [_value]);
    }
}

public sealed class ReorderCollectionCommand : ICommand
{
    private readonly object _collection;
    private readonly object _item;
    private readonly int _newIndex;
    private readonly int _oldIndex;

    public ReorderCollectionCommand(object collection, object item, int newIndex)
    {
        _collection = collection;
        _item = item;
        _newIndex = newIndex;

        _oldIndex = GetIndex();
    }
    
    public void Do()
    {
        var removeMethod = _collection.GetType().GetMethod("Remove");
        var insertMethod = _collection.GetType().GetMethod("Insert");
        if (removeMethod == null || insertMethod == null)
            return;
        
        removeMethod.Invoke(_collection, [_item]);
        insertMethod.Invoke(_collection, [_newIndex, _item]);
    }

    public void Undo()
    {
        var removeMethod = _collection.GetType().GetMethod("Remove");
        var insertMethod = _collection.GetType().GetMethod("Insert");
        if (removeMethod == null || insertMethod == null)
            return;
        
        removeMethod.Invoke(_collection, [_item]);
        insertMethod.Invoke(_collection, [_oldIndex, _item]);
    }
    
    private int GetIndex()
    {
        var indexOfMethod = _collection.GetType().GetMethod("IndexOf");
        if (indexOfMethod == null)
            return -1;

        return Convert.ToInt32(indexOfMethod.Invoke(_collection, [_item]));
    }
}