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

    [Inject] private IPropertyEditorTypeRegistry TypeRegistry { get; set; } = default!;

    private object? GetPropertyValue() => Property?.GetValue(Object);
    private IReadOnlyList<Type> GetPossibleTypes()
    {
        return TypeRegistry.GetPossibleTypes(Property.PropertyType);
    }

    private void CreateInstance(Type type)
    {
        var instance = Activator.CreateInstance(type);

        Property.SetValue(Object, instance);
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
