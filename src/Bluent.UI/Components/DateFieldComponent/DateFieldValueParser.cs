using System.Globalization;
using Bluent.UI.Components;

namespace Bluent.UI.Components.DateFieldComponent.Internal;

internal enum DateFieldRangeViolation
{
    None,
    Minimum,
    Maximum
}

internal static class DateFieldValueParser
{
    public static string GetFormat(CalendarMode mode) => mode switch
    {
        CalendarMode.DaySelect => "yyyy/MM/dd",
        CalendarMode.MonthSelect => "yyyy/MM",
        CalendarMode.YearSelect => "yyyy",
        _ => throw new ArgumentOutOfRangeException(nameof(mode), mode, "Unsupported calendar mode.")
    };

    public static bool TryParse(
        string? input,
        Type valueType,
        CalendarMode mode,
        CultureInfo culture,
        DateTime? min,
        DateTime? max,
        out object? result,
        out DateFieldRangeViolation rangeViolation)
    {
        result = null;
        rangeViolation = DateFieldRangeViolation.None;

        var underlyingType = Nullable.GetUnderlyingType(valueType) ?? valueType;
        var isNullable = Nullable.GetUnderlyingType(valueType) is not null;
        if (underlyingType != typeof(DateTime) && underlyingType != typeof(DateOnly))
            return false;

        if (string.IsNullOrEmpty(input))
            return isNullable;

        var calendar = culture.DateTimeFormat.Calendar;
        var parts = input.Split(culture.DateTimeFormat.DateSeparator, StringSplitOptions.None);
        var expectedParts = mode switch
        {
            CalendarMode.DaySelect => 3,
            CalendarMode.MonthSelect => 2,
            CalendarMode.YearSelect => 1,
            _ => 0
        };

        if (parts.Length != expectedParts || parts.Any(string.IsNullOrEmpty))
            return false;

        Span<int> numbers = stackalloc int[3];
        for (var index = 0; index < parts.Length; index++)
        {
            if (!int.TryParse(parts[index], NumberStyles.None, CultureInfo.InvariantCulture, out numbers[index]))
                return false;
        }

        var year = numbers[0];
        var month = mode == CalendarMode.YearSelect ? 1 : numbers[1];
        var day = mode == CalendarMode.DaySelect ? numbers[2] : 1;

        DateTime periodStart;
        DateTime periodEnd;
        try
        {
            if (year < calendar.GetYear(calendar.MinSupportedDateTime) ||
                year > calendar.GetYear(calendar.MaxSupportedDateTime))
                return false;

            var monthsInYear = calendar.GetMonthsInYear(year);
            if (month < 1 || month > monthsInYear)
                return false;

            var daysInMonth = calendar.GetDaysInMonth(year, month);
            if (day < 1 || day > daysInMonth)
                return false;

            periodStart = calendar.ToDateTime(year, month, day, 0, 0, 0, 0);
            periodEnd = mode switch
            {
                CalendarMode.DaySelect => periodStart,
                CalendarMode.MonthSelect => calendar.ToDateTime(year, month, daysInMonth, 0, 0, 0, 0),
                CalendarMode.YearSelect => calendar.ToDateTime(
                    year, monthsInYear, calendar.GetDaysInMonth(year, monthsInYear),
                    0, 0, 0, 0),
                _ => throw new ArgumentOutOfRangeException(nameof(mode), mode, "Unsupported calendar mode.")
            };
        }
        catch (ArgumentOutOfRangeException)
        {
            return false;
        }

        var earliest = periodStart.Date;
        var latest = periodEnd.Date;

        if (earliest < calendar.MinSupportedDateTime.Date)
            earliest = calendar.MinSupportedDateTime.Date;
        if (latest > calendar.MaxSupportedDateTime.Date)
            latest = calendar.MaxSupportedDateTime.Date;

        if (min.HasValue && earliest < min.Value.Date)
            earliest = min.Value.Date;
        if (max.HasValue && latest > max.Value.Date)
            latest = max.Value.Date;

        if (earliest > latest)
        {
            if (max.HasValue && periodStart.Date > max.Value.Date)
                rangeViolation = DateFieldRangeViolation.Maximum;
            else if (min.HasValue && periodEnd.Date < min.Value.Date)
                rangeViolation = DateFieldRangeViolation.Minimum;

            return false;
        }

        result = underlyingType == typeof(DateTime)
            ? earliest
            : DateOnly.FromDateTime(earliest);
        return true;
    }
}
