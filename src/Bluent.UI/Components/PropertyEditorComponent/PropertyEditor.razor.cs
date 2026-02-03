using System.Collections;
using System.Collections.ObjectModel;
using System.Linq.Expressions;
using System.Reflection;
using Bluent.Core;
using Bluent.UI.Components.PropertyEditorComponent;
using Bluent.UI.Extensions;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class PropertyEditor
{
    private object? _object;
    private PropertyEditorContext? _context;

    [Parameter] public int LabelWidth { get; set; } = 120;
    [Parameter] public object? EditorRootObject { get; set; }
    [Parameter] public object? Object { get; set; }
    [Parameter] public bool Categorize { get; set; } = true;
    [Parameter] public EventCallback PropertyUpdated { get; set; }
    [Parameter] public CommandManager? CommandManager { get; set; }
  

    protected override void OnParametersSet()
    {
        if (_object != Object)
        {
            _object = Object;

            if (_object != null)
                _context = new PropertyEditorContext(_object.GetType());
            else
                _context = null;
        }

        base.OnParametersSet();
    }

    public override IEnumerable<string> GetClasses()
    {
        foreach (var c in base.GetClasses())
            yield return c;

        yield return "bui-property-editor";
    }

    public void SetPropertyValue<T>(Object obj, T? value, Expression<Func<T>> expression)
    {
        var prop = expression.GetPropertyInfo();
        if (prop is not null)
            SetPropertyValue(obj, value, prop);
    }
    
    public void SetPropertyValue(Object obj, object? value, params PropertyInfo[] properties)
    {
        var cmd = new SetPropertyCommand(obj, value, properties);

        Do(cmd);
    }

    public SetPropertyCommand? CreateSetPropertyValueCommand<T>(Object obj, T? value, Expression<Func<T>> expression)
    {
        var prop = expression.GetPropertyInfo();
        if (prop is not null)
            return CreateSetPropertyValueCommand(obj, value, prop);
        
        return null;
    }
    
    public SetPropertyCommand CreateSetPropertyValueCommand(Object obj, object? value, params PropertyInfo[] properties)
    {
        var cmd = new SetPropertyCommand(obj, value, properties);
        return cmd;
    }

    public void AddToCollection(object collection, object item)
    {
        var cmd = new AddToCollectionCommand(collection, item);
        
        Do(cmd);
    }

    public AddToCollectionCommand GetAddToCollectionCommand<T>(ICollection<T> collection, T item)
    {
        var cmd = new AddToCollectionCommand(collection, item!);
        return cmd;
    }

    public void RemoveFromCollection(object collection, object item)
    {
        var cmd = new RemoveFromCollectionCommand(collection, item);
        
        Do(cmd);
    }

    public RemoveFromCollectionCommand GetRemoveFromCollectionCommand<T>(ICollection<T> collection, T item)
    {
        var cmd = new RemoveFromCollectionCommand(collection, item!);
        return cmd;
    }

    public void ReorderCollection(IEnumerable value, object item, int index)
    {
        var cmd = new ReorderCollectionCommand(value, item, index);
        
        Do(cmd);
    }
    
    public void Do(ICommand command)
    {
        if (CommandManager != null)
            CommandManager.Do(command);
        else 
            command.Do();
    }

}
