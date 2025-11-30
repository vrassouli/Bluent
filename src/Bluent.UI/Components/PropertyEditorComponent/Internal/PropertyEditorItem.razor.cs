using System.Collections;
using System.ComponentModel;
using Bluent.UI.Services.Abstractions;
using Microsoft.AspNetCore.Components;
using System.ComponentModel.DataAnnotations;
using System.Reflection;
using Bluent.UI.Extensions;

namespace Bluent.UI.Components.PropertyEditorComponent.Internal;

public partial class PropertyEditorItem
{
    [Parameter] public PropertyInfo Property { get; set; } = null!;
    [Parameter] public object Object { get; set; } = null!;
    [Parameter] public int LabelWidth { get; set; } = 120;
    [Parameter] public EventCallback ValueUpdated { get; set; }

    [Inject] private IPropertyEditorTypeRegistry TypeRegistry { get; set; } = default!;
    [Inject] private IPropertyEditorProvider EditorProvider { get; set; } = default!;

    private object? GetPropertyValue()
    {
        var value = Property?.GetValue(Object);
        return value;
    }

    private Type PropertyType => Property.PropertyType.GetUnderlyingType();

    private bool IsEnumerable => Property.PropertyType.IsAssignableTo(typeof(IEnumerable));
    
    private bool IsComplexType
    {
        get
        {
            if (PropertyType == typeof(string))
                return false;
            
            if (PropertyType == typeof(int))
                return false;
            
            if (PropertyType == typeof(bool))
                return false;
            
            if (PropertyType.IsEnum)
                return false;

            return true;
        }
    }

    private bool HasTypeRegistry(Type propertyType)
    {
        return TypeRegistry.GetPossibleTypes(propertyType).Any();
    }

    private bool IsEditable()
    {
        var editableAttribute = Property.GetCustomAttribute<EditableAttribute>();
        if (editableAttribute is not null && !editableAttribute.AllowEdit)
            return false;

        var readOnlyAttribute = Property.GetCustomAttribute<ReadOnlyAttribute>();
        if (readOnlyAttribute is not null && readOnlyAttribute.IsReadOnly)
            return false;

        return true;
    }

    private IDictionary<string, object> GetDynamicEditorParameters()
    {
        return new Dictionary<string, object>
        {
            { nameof (Property) , Property },
            { nameof (Object) , Object },
            { nameof (ValueUpdated) , EventCallback.Factory.Create(this, () =>  ValueUpdated.InvokeAsync()) }
        };
    }
}