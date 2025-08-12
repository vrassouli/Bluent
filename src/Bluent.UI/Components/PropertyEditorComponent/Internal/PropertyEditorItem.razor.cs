using Microsoft.AspNetCore.Components;
using System.Reflection;

namespace Bluent.UI.Components.PropertyEditorComponent.Internal;

public partial class PropertyEditorItem
{
    [Parameter] public PropertyInfo Property { get; set; } = null!;
    [Parameter] public object Object { get; set; } = null!;
    [Parameter] public EventCallback ValueUpdated { get; set; }

    private Type GetUnderlyingType()
    {
        // For Nullable<T> (value types)
        if (Nullable.GetUnderlyingType(Property.PropertyType) is Type underlyingType)
            return underlyingType;

        // For reference types like string?, just return the type itself
        return Property.PropertyType;
    }
}
