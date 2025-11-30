namespace Bluent.UI.Services.Abstractions;

public interface IPropertyEditorTypeRegistry
{
    public IReadOnlyList<Type> GetPossibleTypes(Type baseType);
}