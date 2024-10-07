using System.ComponentModel.DataAnnotations;
using System.Reflection;

namespace Bluent.UI.Extensions;

public static class EnumExtensions
{
    public static TAttribute? GetAttribute<TAttribute>(this Enum enumValue) where TAttribute : Attribute
    {
        var memberInfo = enumValue.GetType().GetMember(enumValue.ToString()).FirstOrDefault();
        if (memberInfo == null)
        {
            return null;
        }

        return memberInfo.GetCustomAttribute<TAttribute>();
    }

    public static string GetDisplayName(this Enum enumValue)
    {
        var attribute = enumValue.GetAttribute<DisplayAttribute>();
        if (!string.IsNullOrEmpty(attribute?.Name))
        {
            return attribute.Name;
        }

        return enumValue.ToString();
    }

    public static IEnumerable<T> GetFlags<T>(this T value) where T : struct, Enum
    {
        return GetFlags(value, Enum.GetValues(value.GetType()).Cast<T>().ToArray());
    }

    private static IEnumerable<T> GetFlags<T>(T value, T[] values) where T : struct, Enum
    {
        if (!typeof(T)!.IsEnum)
        {
            throw new ArgumentException("Type must be an enum.");
        }

        ulong num = Convert.ToUInt64(value);
        var list = new List<T>();
        for (int num2 = values.Length - 1; num2 >= 0; num2--)
        {
            ulong num3 = Convert.ToUInt64(values[num2]);
            if (num2 == 0 && num3 == 0L)
            {
                break;
            }

            if ((num & num3) == num3)
            {
                list.Add(values[num2]);
                num -= num3;
            }
        }

        if (num != 0L)
        {
            return Enumerable.Empty<T>();
        }

        if (Convert.ToUInt64(value) != 0L)
        {
            return Enumerable.Reverse(list);
        }

        if (num == Convert.ToUInt64(value) && values.Length != 0 && Convert.ToUInt64(values[0]) == 0L)
        {
            return values.Take(1);
        }

        return Enumerable.Empty<T>();
    }

    public static T Next<T>(this T src) where T : struct, Enum
    {
        if (!typeof(T)!.IsEnum)
        {
            throw new ArgumentException($"Argument {typeof(T)!.FullName} is not an Enum");
        }

        T[] array = (T[])Enum.GetValues(src.GetType());
        int num = Array.IndexOf(array, src) + 1;
        if (array.Length != num)
        {
            return array[num];
        }

        return array[0];
    }

    public static T Previus<T>(this T src) where T : struct, Enum
    {
        if (!typeof(T)!.IsEnum)
        {
            throw new ArgumentException($"Argument {typeof(T)!.FullName} is not an Enum");
        }

        T[] array = (T[])Enum.GetValues(src.GetType());
        int num = Array.IndexOf(array, src) - 1;
        if (-1 != num)
        {
            return array[num];
        }

        return array[^1];
    }
}
