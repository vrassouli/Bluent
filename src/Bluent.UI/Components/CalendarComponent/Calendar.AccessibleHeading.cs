namespace Bluent.UI.Components;

public partial class Calendar<TValue>
{
    private string GetAccessibleHeading()
    {
        var calendar = Culture.DateTimeFormat.Calendar;

        return _viewMode switch
        {
            CalendarMode.DaySelect =>
                $"{GetMonthDisplayName(calendar.GetMonth(ViewDate))} {calendar.GetYear(ViewDate).ToString(Culture)}",
            CalendarMode.MonthSelect => calendar.GetYear(ViewDate).ToString(Culture),
            CalendarMode.YearSelect => GetAccessibleYearRangeHeading(),
            _ => string.Empty
        };
    }

    private string GetAccessibleYearRangeHeading()
    {
        var range = GetVisibleYearRange();
        return $"{range.Start.ToString(Culture)} – {range.End.ToString(Culture)}";
    }
}
