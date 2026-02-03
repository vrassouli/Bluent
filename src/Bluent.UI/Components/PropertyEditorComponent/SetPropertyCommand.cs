using System.Collections.ObjectModel;
using System.Reflection;
using Bluent.Core;

namespace Bluent.UI.Components.PropertyEditorComponent;

public sealed class SetPropertyCommand : ICommand
{
    private readonly object _obj;
    private readonly PropertyInfo[] _properties;
    private readonly object? _value;
    private readonly object? _oldValue;

    private readonly List<ICommand> _innerCommands = [];
    
    public SetPropertyCommand(object obj, object? value, params PropertyInfo[] properties)
    {
        _obj = obj;
        _properties = properties;
        _value = value;

        if (properties.Length > 1)
        {
            foreach (var prop in properties)
                _innerCommands.Add(new SetPropertyCommand(obj, value, prop));
        }
        else
            _oldValue = properties[0].GetValue(obj);
    }

    public void Do()
    {
        if (_innerCommands.Count > 1)
        {
            foreach (var cmd in _innerCommands)
                cmd.Do();
            return;
        }
        
        _properties[0].SetValue(_obj, _value);
    }

    public void Undo()
    {
        if (_innerCommands.Count > 1)
        {
            foreach (var cmd in _innerCommands)
                cmd.Undo();
            return;
        }
        
        _properties[0].SetValue(_obj, _oldValue);
    }
}