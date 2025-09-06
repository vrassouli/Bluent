using Bluent.UI.Extensions;
using Microsoft.AspNetCore.Components;
using System.Reflection;

namespace Bluent.UI.Components.PropertyEditorComponent.Internal;

public partial class IntPropertyEditor
{
    [Parameter] public PropertyInfo Property { get; set; } = null!;
    [Parameter] public object Object { get; set; } = null!;
    [Parameter] public EventCallback ValueUpdated { get; set; }

    private int? Value => Property.GetValue(Object) as int?;

    private async Task OnValueChanged(int? newValue)
    {
        try
        {
            if (newValue is null)
            {
                Property.SetValue(Object, null);
            }
            else
            {
                var convertedValue = Convert.ChangeType(newValue, Property.PropertyType.GetUnderlyingType());
                Property.SetValue(Object, convertedValue);
            }

            await ValueUpdated.InvokeAsync();
        }
        catch (Exception)
        {
            throw;
        }
    }
}
