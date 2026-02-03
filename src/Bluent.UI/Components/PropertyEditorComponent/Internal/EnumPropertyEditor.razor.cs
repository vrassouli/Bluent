using Bluent.UI.Extensions;
using Microsoft.AspNetCore.Components;
using System.Reflection;

namespace Bluent.UI.Components.PropertyEditorComponent.Internal;

public partial class EnumPropertyEditor
{
    [Parameter] public PropertyInfo Property { get; set; } = null!;
    [Parameter] public object Object { get; set; } = null!;
    [Parameter] public EventCallback ValueUpdated { get; set; }
    [CascadingParameter] public PropertyEditor Editor { get; set; } = default!;

    private int? Value
    {
        get
        {
            var value = Property.GetValue(Object, null);
            if (value is null)
                return null;
            
            return Convert.ToInt32(value);
        }
    }

    private async Task OnValueChanged(int? newValue)
    {
        try
        {
            if (newValue is null)
            {
                Editor.SetPropertyValue(Object, null, Property);

                //Property.SetValue(Object, null);
            }
            else
            {
                object convertedValue = Enum.ToObject(Property.PropertyType.GetUnderlyingType(), newValue);

                //Property.SetValue(Object, convertedValue, null);
                Editor.SetPropertyValue(Object, convertedValue, Property);
            }

            await ValueUpdated.InvokeAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            throw;
        }
    }
}
