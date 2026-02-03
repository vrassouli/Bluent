using System.Collections;
using System.ComponentModel;
using Bluent.UI.Services.Abstractions;
using Microsoft.AspNetCore.Components;
using System.ComponentModel.DataAnnotations;
using System.Reflection;
using Bluent.Core;
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
    

    private Type PropertyType => Property.PropertyType.GetUnderlyingType();

    private bool IsEnumerable => Property.PropertyType.IsAssignableTo(typeof(IEnumerable));

    private bool IsComplexType => !IsSimpleType(PropertyType);

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
            { nameof(Property), Property },
            { nameof(Object), Object },
            { nameof(LabelWidth), LabelWidth },
            { nameof(ValueUpdated), EventCallback.Factory.Create(this, () => ValueUpdated.InvokeAsync()) }
        };
    }
    
    public bool IsSimpleType(Type t)
    {
        if (t.IsPrimitive) return true;
        if (t.IsEnum) return true;
        if (t == typeof(string)) return true;
        if (t == typeof(decimal)) return true;
        if (t == typeof(DateTime)) return true;
        if (t == typeof(Guid)) return true;
        if (t == typeof(TimeSpan)) return true;
        if (t == typeof(System.Xml.XmlQualifiedName)) return true;
        return false;
    }
}