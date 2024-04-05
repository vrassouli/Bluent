using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Extensions;

internal static class DateTimeExtensions
{
    public static DateTime SetYear(this DateTime date, int year)
    {
        return date.SetYear(year, CultureInfo.CurrentCulture);
    }

    public static DateTime SetYear(this DateTime date, int year, CultureInfo culture)
    {
        var month = culture.Calendar.GetMonth(date);
        var day = culture.Calendar.GetDayOfMonth(date);
        var daysInMonth = culture.Calendar.GetDaysInMonth(year, month);

        if (day > daysInMonth)
            day = daysInMonth;

        return culture.Calendar.ToDateTime(year, month, day, date.Hour, date.Minute, date.Second, date.Millisecond);
    }

    public static DateTime SetMonth(this DateTime date, int month, CultureInfo culture)
    {
        var year = culture.Calendar.GetYear(date);
        var day = culture.Calendar.GetDayOfMonth(date);
        var daysInMonth = culture.Calendar.GetDaysInMonth(year, month);

        if (day > daysInMonth)
            day = daysInMonth;

        return culture.Calendar.ToDateTime(year, month, day, date.Hour, date.Minute, date.Second, date.Millisecond);
    }

    public static DateTime AddMonths(this DateTime date, int months, CultureInfo culture)
    {
        return culture.Calendar.AddMonths(date, months);
    }

    public static DateTime GetMonthStart(this DateTime date)
    {
        return date.GetMonthStart(CultureInfo.CurrentCulture);
    }

    public static DateTime GetMonthStart(this DateTime date, CultureInfo culture)
    {
        return date.GetMonthStart(culture.Calendar);
    }

    public static DateTime GetMonthStart(this DateTime date, Calendar calendar)
    {
        var year = calendar.GetYear(date);
        var month = calendar.GetMonth(date);
        var day = 1;

        return calendar.ToDateTime(year, month, day, 0, 0, 0, 0);
    }

    public static DateTime GetMonthEnd(this DateTime date)
    {
        return date.GetMonthEnd(CultureInfo.CurrentCulture);
    }

    public static DateTime GetMonthEnd(this DateTime date, CultureInfo culture)
    {
        return date.GetMonthEnd(culture.Calendar);
    }

    public static DateTime GetMonthEnd(this DateTime date, Calendar calendar)
    {
        var year = calendar.GetYear(date);
        var month = calendar.GetMonth(date);
        var day = calendar.GetDaysInMonth(year, month);

        return calendar.ToDateTime(year, month, day, 23, 59, 59, 999);
    }
}
