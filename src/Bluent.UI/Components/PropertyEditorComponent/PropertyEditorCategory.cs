using System.Reflection;

namespace Bluent.UI.Components.PropertyEditorComponent;

internal class PropertyEditorCategory
{
    private List<PropertyInfo> _properties = new();
    public IEnumerable<PropertyInfo> Properties => _properties;

    public string Name { get; }

    public PropertyEditorCategory(string name)
    {
        Name = name;
    }

    public void AddProperty(PropertyInfo property) => _properties.Add(property);
}
