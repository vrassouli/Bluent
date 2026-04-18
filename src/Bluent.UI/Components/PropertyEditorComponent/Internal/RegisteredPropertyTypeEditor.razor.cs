using Bluent.UI.Extensions;
using Bluent.UI.Services.Abstractions;
using Microsoft.AspNetCore.Components;
using System.Reflection;

namespace Bluent.UI.Components.PropertyEditorComponent.Internal;

public partial class RegisteredPropertyTypeEditor
{
    [Parameter] public PropertyInfo Property { get; set; } = null!;
    [Parameter] public object Object { get; set; } = null!;
    [Parameter] public int LabelWidth { get; set; } = 120;
    [Parameter] public EventCallback ValueUpdated { get; set; }
    [CascadingParameter] public PropertyEditor Editor { get; set; } = default!;

    [Inject] private IPropertyEditorTypeRegistry TypeRegistry { get; set; } = default!;
    
    private string? SelectedType
    {
        get => GetCurrentType()?.FullName;
        set => SetCurrentType(value);
    }
    private object? GetPropertyValue() => Property.GetValue(Object);
    private IReadOnlyList<Type> GetPossibleTypes()
    {
        return TypeRegistry.GetPossibleTypes(Property.PropertyType);
    }

    private void CreateInstance(Type? type)
    {
        if (type is null)
        {
            Editor.SetPropertyValue(Object, null, Property);
        }
        else
        {
            var instance = Activator.CreateInstance(type);

            //Property.SetValue(Object, instance);
            Editor.SetPropertyValue(Object, instance, Property);
        }        
    }

    private void SetCurrentType(string? typeName)
    {
        var type = GetPossibleTypes().FirstOrDefault(t => t.FullName == typeName);
        CreateInstance(type);
    }
    private Type? GetCurrentType() => GetPropertyValue()?.GetType();

    private string GetDropdownTitle()
    {
        var type = GetCurrentType();
        if (type is null)
        {
            return "Select...";
        }
        else
        {
            return type.GetDisplayName();
        }
    }
}
