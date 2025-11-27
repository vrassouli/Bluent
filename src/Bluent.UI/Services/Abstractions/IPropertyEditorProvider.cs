using System.Reflection;

namespace Bluent.UI.Services.Abstractions
{
    public interface IPropertyEditorProvider
    {
        Type? GetEditorComponentType(PropertyInfo propertyInfo);
    }
}