namespace Bluent.UI.Extensions;

public static class TypeExtensions
{
    public static Type GetUnderlyingType(this Type type)
    {
        // For Nullable<T> (value types)
        if (Nullable.GetUnderlyingType(type) is Type underlyingType)
            return underlyingType;

        // For reference types like string?, just return the type itself
        return type;
    }
}
