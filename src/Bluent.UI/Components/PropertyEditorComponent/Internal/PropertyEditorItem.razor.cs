using Bluent.UI.Services.Abstractions;
using Microsoft.AspNetCore.Components;
using System.ComponentModel.DataAnnotations;
using System.Reflection;

namespace Bluent.UI.Components.PropertyEditorComponent.Internal;

public partial class PropertyEditorItem
{
    [Parameter] public PropertyInfo Property { get; set; } = null!;
    [Parameter] public object Object { get; set; } = null!;
    [Parameter] public int LabelWidth { get; set; } = 120;
    [Parameter] public EventCallback ValueUpdated { get; set; }

    [Inject] private IPropertyEditorTypeRegistery TypeRegistery { get; set; } = default!;


    private bool HasTypeRegistery(Type propertyType)
    {
        return TypeRegistery.GetPossibleTypes(propertyType).Any();
    }

    private bool IsEditable()
    {
        var editableAttribute = Property.GetCustomAttribute<EditableAttribute>();

        if (editableAttribute is null)
            return true;

        return editableAttribute.AllowEdit;
    }
}
