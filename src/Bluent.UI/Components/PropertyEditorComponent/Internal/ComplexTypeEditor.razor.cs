using System.Reflection;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components.PropertyEditorComponent.Internal;

public partial class ComplexTypeEditor
{
    [Parameter] public PropertyInfo Property { get; set; } = null!;
    [Parameter] public object Object { get; set; } = null!;
    [Parameter] public EventCallback ValueUpdated { get; set; }

    private Object? Value => Property.GetValue(Object);

    private async Task ClearValue()
    {
        Property.SetValue(Object, null);
        await ValueUpdated.InvokeAsync(null);
    }
}