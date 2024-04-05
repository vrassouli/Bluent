using System.Globalization;

namespace Bluent.UI.Extensions;

internal static class CalendarExtensions
{
    public static int GetYear<T>(this Calendar calendar, T date)
    {
        CheckTypeParam<T>();

        var dt = date switch
        {
            DateOnly dateOnly => dateOnly.ToDateTime(TimeOnly.MinValue),
            DateTime dateTime => dateTime,
            _ => DateTime.Now,
        };

        return calendar.GetYear(dt);
    }

    public static bool Equals<T>(this Calendar calendar, T date, DateTime dateTime)
    {
        CheckTypeParam<T>();

        var equals = date switch
        {
            DateOnly dateOnly => dateOnly == DateOnly.FromDateTime(dateTime),
            DateTime dt => dt == dateTime,
            _ => false,
        };

        return equals;
    }

    public static DateTime? ToDateTime<T>(this Calendar calendar, T? date)
    {
        CheckTypeParam<T>();

        DateTime? dt = date switch
        {
            DateOnly dateOnly => dateOnly.ToDateTime(TimeOnly.MinValue),
            DateTime dateTime => dateTime,
            _ => null,
        };

        return dt;
    }

    private static void CheckTypeParam<T>()
    {
        var type = Nullable.GetUnderlyingType(typeof(T)) ?? typeof(T);

        if (type != typeof(DateTime) &&
            type != typeof(DateOnly))
        {
            throw new InvalidOperationException($"Unsupported type param '{type}'.");
        }
    }
}
