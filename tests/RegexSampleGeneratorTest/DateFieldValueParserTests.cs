using System.Globalization;
using Bluent.UI.Components;
using Bluent.UI.Components.DateFieldComponent.Internal;

namespace RegexSampleGeneratorTest;

public sealed class DateFieldValueParserTests
{
    [TestCase(CalendarMode.DaySelect, "yyyy/MM/dd")]
    [TestCase(CalendarMode.MonthSelect, "yyyy/MM")]
    [TestCase(CalendarMode.YearSelect, "yyyy")]
    public void GetFormat_matches_the_visible_precision(CalendarMode mode, string expected)
    {
        Assert.That(DateFieldValueParser.GetFormat(mode), Is.EqualTo(expected));
    }

    [Test]
    public void TryParse_day_select_returns_a_DateTime_date_without_time()
    {
        var success = DateFieldValueParser.TryParse(
            "2026/04/09", typeof(DateTime), CalendarMode.DaySelect,
            CultureInfo.GetCultureInfo("en-US"), null, null,
            out var result, out var violation);

        Assert.Multiple(() =>
        {
            Assert.That(success, Is.True);
            Assert.That(result, Is.EqualTo(new DateTime(2026, 4, 9)));
            Assert.That(violation, Is.EqualTo(DateFieldRangeViolation.None));
        });
    }

    [Test]
    public void TryParse_month_and_year_modes_use_the_first_day_of_the_period()
    {
        var culture = CultureInfo.GetCultureInfo("en-US");
        var monthSuccess = DateFieldValueParser.TryParse(
            "2026/04", typeof(DateOnly), CalendarMode.MonthSelect,
            culture, null, null, out var monthResult, out _);
        var yearSuccess = DateFieldValueParser.TryParse(
            "2026", typeof(DateOnly), CalendarMode.YearSelect,
            culture, null, null, out var yearResult, out _);

        Assert.Multiple(() =>
        {
            Assert.That(monthSuccess, Is.True);
            Assert.That(monthResult, Is.EqualTo(new DateOnly(2026, 4, 1)));
            Assert.That(yearSuccess, Is.True);
            Assert.That(yearResult, Is.EqualTo(new DateOnly(2026, 1, 1)));
        });
    }

    [Test]
    public void TryParse_empty_input_maps_only_nullable_values_to_null()
    {
        var culture = CultureInfo.GetCultureInfo("en-US");
        var nullableSuccess = DateFieldValueParser.TryParse(
            string.Empty, typeof(DateOnly?), CalendarMode.DaySelect,
            culture, null, null, out var nullableResult, out _);
        var nonNullableSuccess = DateFieldValueParser.TryParse(
            string.Empty, typeof(DateOnly), CalendarMode.DaySelect,
            culture, null, null, out _, out _);

        Assert.Multiple(() =>
        {
            Assert.That(nullableSuccess, Is.True);
            Assert.That(nullableResult, Is.Null);
            Assert.That(nonNullableSuccess, Is.False);
        });
    }

    [Test]
    public void TryParse_respects_inclusive_minimum()
    {
        var minimum = new DateTime(2026, 4, 9);
        var onMinimum = DateFieldValueParser.TryParse(
            "2026/04/09", typeof(DateTime?), CalendarMode.DaySelect,
            CultureInfo.GetCultureInfo("en-US"), minimum, null,
            out var result, out var violation);
        var beforeMinimum = DateFieldValueParser.TryParse(
            "2026/04/08", typeof(DateTime?), CalendarMode.DaySelect,
            CultureInfo.GetCultureInfo("en-US"), minimum, null,
            out _, out var beforeViolation);

        Assert.Multiple(() =>
        {
            Assert.That(onMinimum, Is.True);
            Assert.That(result, Is.EqualTo(minimum));
            Assert.That(violation, Is.EqualTo(DateFieldRangeViolation.None));
            Assert.That(beforeMinimum, Is.False);
            Assert.That(beforeViolation, Is.EqualTo(DateFieldRangeViolation.Minimum));
        });
    }

    [Test]
    public void TryParse_respects_inclusive_maximum()
    {
        var maximum = new DateTime(2026, 4, 9);
        var onMaximum = DateFieldValueParser.TryParse(
            "2026/04/09", typeof(DateTime), CalendarMode.DaySelect,
            CultureInfo.GetCultureInfo("en-US"), null, maximum, out var result, out var violation);
        var afterMaximum = DateFieldValueParser.TryParse(
            "2026/04/10", typeof(DateTime), CalendarMode.DaySelect,
            CultureInfo.GetCultureInfo("en-US"), null, maximum, out _, out var afterViolation);

        Assert.Multiple(() =>
        {
            Assert.That(onMaximum, Is.True);
            Assert.That(result, Is.EqualTo(maximum));
            Assert.That(violation, Is.EqualTo(DateFieldRangeViolation.None));
            Assert.That(afterMaximum, Is.False);
            Assert.That(afterViolation, Is.EqualTo(DateFieldRangeViolation.Maximum));
        });
    }

    [Test]
    public void TryParse_rejects_invalid_dates_and_invalid_months()
    {
        var culture = CultureInfo.GetCultureInfo("en-US");
        var invalidDay = DateFieldValueParser.TryParse(
            "2026/02/30", typeof(DateTime), CalendarMode.DaySelect,
            culture, null, null, out _, out _);
        var invalidMonth = DateFieldValueParser.TryParse(
            "2026/13", typeof(DateTime), CalendarMode.MonthSelect,
            culture, null, null, out _, out _);
        var invalidShape = DateFieldValueParser.TryParse(
            "2026/04/09", typeof(DateTime), CalendarMode.YearSelect,
            culture, null, null, out _, out _);

        Assert.Multiple(() =>
        {
            Assert.That(invalidDay, Is.False);
            Assert.That(invalidMonth, Is.False);
            Assert.That(invalidShape, Is.False);
        });
    }

    [Test]
    public void TryParse_supports_the_thirteenth_month_of_a_leap_year_calendar()
    {
        var culture = (CultureInfo)CultureInfo.GetCultureInfo("he-IL").Clone();
        culture.DateTimeFormat.Calendar = new HebrewCalendar();
        var separator = culture.DateTimeFormat.DateSeparator;
        const int leapYear = 5784;
        var input = string.Join(separator, leapYear, 13, 1);
        var expected = culture.DateTimeFormat.Calendar.ToDateTime(leapYear, 13, 1, 0, 0, 0, 0);
        var nonLeapInput = string.Join(separator, 5783, 13, 1);

        var success = DateFieldValueParser.TryParse(
            input, typeof(DateTime), CalendarMode.DaySelect,
            culture, null, null, out var result, out _);
        var nonLeapSuccess = DateFieldValueParser.TryParse(
            nonLeapInput, typeof(DateTime), CalendarMode.DaySelect,
            culture, null, null, out _, out _);

        Assert.Multiple(() =>
        {
            Assert.That(culture.DateTimeFormat.Calendar.GetMonthsInYear(leapYear), Is.EqualTo(13));
            Assert.That(success, Is.True);
            Assert.That(result, Is.EqualTo(expected));
            Assert.That(nonLeapSuccess, Is.False);
        });
    }

    [Test]
    public void TryParse_year_only_uses_the_selected_calendar()
    {
        var culture = (CultureInfo)CultureInfo.GetCultureInfo("he-IL").Clone();
        culture.DateTimeFormat.Calendar = new HebrewCalendar();
        var expected = culture.DateTimeFormat.Calendar.ToDateTime(5784, 1, 1, 0, 0, 0, 0);

        var success = DateFieldValueParser.TryParse(
            "5784", typeof(DateTime), CalendarMode.YearSelect,
            culture, null, null, out var result, out _);

        Assert.Multiple(() =>
        {
            Assert.That(success, Is.True);
            Assert.That(result, Is.EqualTo(expected));
            Assert.That(culture.DateTimeFormat.Calendar.GetYear((DateTime)result!), Is.EqualTo(5784));
        });
    }


    [Test]
    public void TryParse_month_select_clamps_to_first_in_range_day_of_month()
    {
        var culture = CultureInfo.GetCultureInfo("en-US");
        var minimum = new DateTime(2026, 4, 9);
        var success = DateFieldValueParser.TryParse(
            "2026/04", typeof(DateTime), CalendarMode.MonthSelect,
            culture, minimum, null, out var result, out var violation);

        Assert.Multiple(() =>
        {
            Assert.That(success, Is.True);
            Assert.That(result, Is.EqualTo(minimum));
            Assert.That(violation, Is.EqualTo(DateFieldRangeViolation.None));
        });
    }

    [Test]
    public void TryParse_year_select_clamps_to_first_in_range_day_of_year()
    {
        var culture = CultureInfo.GetCultureInfo("en-US");
        var minimum = new DateTime(2026, 10, 12);
        var success = DateFieldValueParser.TryParse(
            "2026", typeof(DateOnly), CalendarMode.YearSelect,
            culture, minimum, null, out var result, out var violation);

        Assert.Multiple(() =>
        {
            Assert.That(success, Is.True);
            Assert.That(result, Is.EqualTo(DateOnly.FromDateTime(minimum)));
            Assert.That(violation, Is.EqualTo(DateFieldRangeViolation.None));
        });
    }

    [Test]
    public void TryParse_rejects_month_and_year_periods_entirely_outside_range()
    {
        var culture = CultureInfo.GetCultureInfo("en-US");
        var minimum = new DateTime(2026, 10, 12);

        var monthBefore = DateFieldValueParser.TryParse(
            "2026/09", typeof(DateTime), CalendarMode.MonthSelect,
            culture, minimum, null, out _, out var monthViolation);
        var yearBefore = DateFieldValueParser.TryParse(
            "2025", typeof(DateTime), CalendarMode.YearSelect,
            culture, minimum, null, out _, out var yearViolation);

        Assert.Multiple(() =>
        {
            Assert.That(monthBefore, Is.False);
            Assert.That(monthViolation, Is.EqualTo(DateFieldRangeViolation.Minimum));
            Assert.That(yearBefore, Is.False);
            Assert.That(yearViolation, Is.EqualTo(DateFieldRangeViolation.Minimum));
        });
    }
}