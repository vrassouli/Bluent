using System.Reflection;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components.PropertyEditorComponent;

public interface IPropertyEditor
{
    public PropertyInfo Property { get; set; }
    public object Object { get; set; }
    public EventCallback ValueUpdated { get; set; }
}