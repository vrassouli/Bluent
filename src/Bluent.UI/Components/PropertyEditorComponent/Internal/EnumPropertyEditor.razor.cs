using Bluent.UI.Extensions;
using Microsoft.AspNetCore.Components;
using System.Reflection;

namespace Bluent.UI.Components.PropertyEditorComponent.Internal;

public partial class EnumPropertyEditor
{
    [Parameter] public PropertyInfo Property { get; set; } = null!;
    [Parameter] public object Object { get; set; } = null!;
    [Parameter] public EventCallback ValueUpdated { get; set; }

    private int? Value => (int)Property.GetValue(Object, null)!;

    protected override void OnInitialized()
    {

        base.OnInitialized();
    }

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
                object convertedValue = Enum.ToObject(Property.PropertyType.GetUnderlyingType(), newValue);

                Property.SetValue(Object, convertedValue, null);
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
