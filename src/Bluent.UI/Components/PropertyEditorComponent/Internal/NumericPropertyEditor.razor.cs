using Bluent.UI.Extensions;
using Microsoft.AspNetCore.Components;
using System.Reflection;

namespace Bluent.UI.Components.PropertyEditorComponent.Internal;

public partial class NumericPropertyEditor<TValue>
where TValue : struct
{
    [Parameter] public PropertyInfo Property { get; set; } = null!;
    [Parameter] public object Object { get; set; } = null!;
    [Parameter] public EventCallback ValueUpdated { get; set; }
    [CascadingParameter] public PropertyEditor Editor { get; set; } = default!;

    private TValue? Value
    {
        get
        {
            var value = Property.GetValue(Object);
            if (value is null)
            {
                return null;
            }

            return (TValue)value;
        }
    }

    private async Task OnValueChanged(TValue? newValue)
    {
        try
        {
            if (newValue is null)
            {
                //Property.SetValue(Object, null);
                Editor.SetPropertyValue(Object, null, Property);
            }
            else
            {
                var convertedValue = Convert.ChangeType(newValue, Property.PropertyType.GetUnderlyingType());
                //Property.SetValue(Object, convertedValue);
                Editor.SetPropertyValue(Object, convertedValue, Property);
            }

            await ValueUpdated.InvokeAsync();
        }
        catch (Exception)
        {
            throw;
        }
    }
}
