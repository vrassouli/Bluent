namespace Bluent.UI.Services.Abstractions;

public interface IPropertyEditorTypeRegistery
{
    public IReadOnlyList<Type> GetPossibleTypes(Type baseType);
}
