using System.Collections;
using System.ComponentModel;
using System.Reflection;
using Bluent.UI.Extensions;

namespace Bluent.UI.Components.PropertyEditorComponent;

internal class PropertyEditorContext
{
    private const string DefaultCategory = "General";
    private List<PropertyEditorCategory> _categories = new();

    public IEnumerable<PropertyEditorCategory> Categories => _categories.OrderBy(x => x.Name != DefaultCategory).ThenBy(x => x.Name);
    public IEnumerable<PropertyInfo> Properties => _categories.SelectMany(x => x.Properties).OrderBy(x => x.GetDisplayName());

    public PropertyEditorContext(Type type)
    {
        Initialize(type);
    }

    private void Initialize(Type type)
    {
        var properties = type
            .GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Where(p => p.CanRead && (p.CanWrite || p.PropertyType.IsAssignableTo(typeof(IList))));

        var browsableProperties = GetBrowsableProperties(properties);

        foreach (var property in browsableProperties.OrderBy(x => x.Name))
        {
            var category = GetCategory(property);
            category.AddProperty(property);
        }
    }

    private PropertyEditorCategory GetCategory(PropertyInfo property)
    {
        var categoryAttribute = property.GetCustomAttribute<CategoryAttribute>();
        string categoryName = DefaultCategory;

        if (categoryAttribute != null)
            categoryName = categoryAttribute.Category;

        var category = Categories.FirstOrDefault(x => x.Name == categoryName);
        if (category is null)
        {
            category = new PropertyEditorCategory(categoryName);
            _categories.Add(category);
        }

        return category;
    }

    private IEnumerable<PropertyInfo> GetBrowsableProperties(IEnumerable<PropertyInfo> properties)
    {
        foreach (var property in properties)
        {
            var browsableAttribute = property.GetCustomAttribute<BrowsableAttribute>();

            if (browsableAttribute is null || browsableAttribute.Browsable)
                yield return property;
        }
    }
}
