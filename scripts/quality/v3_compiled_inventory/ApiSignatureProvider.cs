using System.Collections.Immutable;
using System.Reflection.Metadata;

internal sealed class ApiSignatureProvider : ISignatureTypeProvider<string, object?>
{
    public string GetArrayType(string elementType, ArrayShape shape) =>
        $"{elementType}[{new string(',', Math.Max(0, shape.Rank - 1))}]";
    public string GetByReferenceType(string elementType) => $"ref {elementType}";
    public string GetFunctionPointerType(MethodSignature<string> signature) =>
        $"fnptr({string.Join(",", signature.ParameterTypes)})->{signature.ReturnType}";
    public string GetGenericInstantiation(string genericType, ImmutableArray<string> typeArguments) =>
        $"{genericType}<{string.Join(",", typeArguments)}>";
    public string GetGenericMethodParameter(object? genericContext, int index) => $"!!{index}";
    public string GetGenericTypeParameter(object? genericContext, int index) => $"!{index}";
    public string GetModifiedType(string modifierType, string unmodifiedType, bool isRequired) =>
        $"{unmodifiedType} mod{(isRequired ? "req" : "opt")}({modifierType})";
    public string GetPinnedType(string elementType) => $"pinned {elementType}";
    public string GetPointerType(string elementType) => $"{elementType}*";
    public string GetPrimitiveType(PrimitiveTypeCode typeCode) => typeCode.ToString();
    public string GetSZArrayType(string elementType) => $"{elementType}[]";
    public string GetTypeFromDefinition(MetadataReader reader, TypeDefinitionHandle handle, byte rawTypeKind)
    {
        var value = reader.GetTypeDefinition(handle);
        return Join(reader.GetString(value.Namespace), reader.GetString(value.Name));
    }
    public string GetTypeFromReference(MetadataReader reader, TypeReferenceHandle handle, byte rawTypeKind)
    {
        var value = reader.GetTypeReference(handle);
        return Join(reader.GetString(value.Namespace), reader.GetString(value.Name));
    }
    public string GetTypeFromSpecification(MetadataReader reader, object? genericContext, TypeSpecificationHandle handle, byte rawTypeKind) =>
        reader.GetTypeSpecification(handle).DecodeSignature(this, genericContext);

    internal static string Join(string ns, string name) =>
        string.IsNullOrEmpty(ns) ? name : $"{ns}.{name}";
}
