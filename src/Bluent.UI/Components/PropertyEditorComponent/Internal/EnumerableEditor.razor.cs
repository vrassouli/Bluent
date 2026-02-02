using System.Collections;
using System.Collections.ObjectModel;
using System.Reflection;
using System.Xml.Serialization;
using Bluent.UI.Extensions;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components.PropertyEditorComponent.Internal;

public partial class EnumerableEditor : ComponentBase
{
    [Parameter] public PropertyInfo Property { get; set; } = null!;
    [Parameter] public object Object { get; set; } = null!;
    [Parameter] public EventCallback ValueUpdated { get; set; }
    [CascadingParameter] public PropertyEditor Editor { get; set; } = default!;

    private IEnumerable Value => Property.GetValue(Object) as IEnumerable ??
                                 throw new InvalidOperationException("Value is not an Enumerable");

    private Type PropertyType => Property.PropertyType;
    private IEnumerable<Type> ItemTypes => GetItemTypes();
    private bool IsCollection => PropertyType.IsAssignableTo(typeof(ICollection));
    private bool IsList => PropertyType.IsAssignableTo(typeof(IList));

    private int Count
    {
        get
        {
            var countProperty = Value.GetType().GetProperty("Count");
            if (countProperty == null)
                return 0;
            
            return Convert.ToInt32(countProperty.GetValue(Value));
        }
    }

    private bool CanAdd
    {
        get { return IsCollection || IsList; }
    }

    private void AddItem(Type itemType)
    {
        Editor.AddToCollection(Value, Activator.CreateInstance(itemType)!);
    }

    private void RemoveItem(object item)
    {
        Editor.RemoveFromCollection(Value, item);
    }

    private IEnumerable<Type> GetItemTypes()
    {
        var xmlItemAttributes = Property.GetCustomAttributes<XmlArrayItemAttribute>();

        foreach (var attribute in xmlItemAttributes)
        {
            if (attribute.Type != null)
                yield return attribute.Type;
        }
    }

    private bool CanGoUp(object item)
    {
        var index = GetIndex(item);
        
        return index > 0;
    }

    private bool CanGoDown(object item)
    {
        var index = GetIndex(item);

        return Count > 0 && index < Count - 1;
    }

    private int GetIndex(object item)
    {
        var indexOfMethod = Value.GetType().GetMethod("IndexOf");
        if (indexOfMethod == null)
            return -1;

        return Convert.ToInt32(indexOfMethod.Invoke(Value, [item]));
    }

    private void GoUp(object item)
    {
        var index = GetIndex(item);

        if (index > 0)
        {
            Editor.ReorderCollection(Value, item, index - 1);
        }
    }

    private void GoDown(object item)
    {
        var index = GetIndex(item);

        if (index < Count - 1)
        {
            Editor.ReorderCollection(Value, item, index + 1);
        }
    }
}