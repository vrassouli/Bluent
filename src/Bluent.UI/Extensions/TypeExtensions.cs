namespace Bluent.UI.Extensions;

public static class TypeExtensions
{
    extension(Type type)
    {
        public Type GetUnderlyingType()
        {
            // For Nullable<T> (value types)
            if (Nullable.GetUnderlyingType(type) is { } underlyingType)
                return underlyingType;

            // For reference types like string?, just return the type itself
            return type;
        }

        public bool IsNullable() => Nullable.GetUnderlyingType(type) != null;
    }
}
