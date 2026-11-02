using Bluent.UI.Extensions;
using Humanizer;
using Microsoft.AspNetCore.Components;
using System.Globalization;

namespace Bluent.UI.Components;

public partial class Calendar<TValue>
{
    private CalendarMode _viewMode = CalendarMode.DaySelect;
    private CalendarMode _mode = CalendarMode.DaySelect;
    private TValue _selectedDate = default!;
    private string _transitionClass = "up";
    private DateTime _viewDate = DateTime.Today;
    private DateOnly? _pendingParameterMonthChanged;

    [Parameter] public TValue SelectedDate { get; set; } = default!;
    [Parameter] public EventCallback<TValue> SelectedDateChanged { get; set; }
    [Parameter] public EventCallback<DateOnly> MonthChanged { get; set; }
    [Parameter] public CultureInfo Culture { get; set; } = CultureInfo.CurrentUICulture;
    [Parameter] public CalendarMode Mode { get; set; } = CalendarMode.DaySelect;
    [Parameter] public Func<DateOnly, string>? DateClass { get; set; }
    [Parameter] public DateTime? Max { get; set; }
    [Parameter] public DateTime? Min { get; set; }
    [CascadingParameter] public Popover? Popover { get; set; }

    // Keep the property synchronous and side-effect-free. UI event callbacks
    // must be awaited by their event handlers, not scheduled from a setter.
    private DateTime ViewDate
    {
        get => _viewDate;
        set => _viewDate = value;
    }

    private async Task ChangeViewDateAsync(DateTime value)
    {
        var previousMonth = ViewDate.GetMonthStart();
        ViewDate = value;
        if (previousMonth != ViewDate.GetMonthStart())
            await MonthChanged.InvokeAsync(DateOnly.FromDateTime(ViewDate));
    }

    private int DaysInMonth => Culture.Calendar.GetDaysInMonth(Culture.Calendar.GetYear(ViewDate), Culture.Calendar.GetMonth(ViewDate));
    private DateTime MonthStart => ViewDate.GetMonthStart(Culture);
    private DateTime MonthEnd => ViewDate.GetMonthEnd(Culture);
    private int FirstDayOffset => ((int)MonthStart.DayOfWeek - (int)Culture.DateTimeFormat.FirstDayOfWeek + 7) % 7;
    private bool IsNullable => Nullable.GetUnderlyingType(typeof(TValue)) != null;

    public Calendar()
    {
        var type = Nullable.GetUnderlyingType(typeof(TValue)) ?? typeof(TValue);

        if (type != typeof(DateTime) &&
            type != typeof(DateOnly))
        {
            throw new InvalidOperationException($"Unsupported {GetType()} type param '{type}'.");
        }
    }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-calendar";
        yield return _viewMode.ToString().Kebaberize();
        yield return $"transition-{_transitionClass}";
    }

    protected override void OnParametersSet()
    {
        var previousMonth = ViewDate.GetMonthStart();
        if (!IsNullable && Equals(SelectedDate, default))
        {
            SetSelectedDate(DateTime.Today);
        }

        if (!object.Equals(SelectedDate, _selectedDate))
        {
            _selectedDate = SelectedDate;

            if (SelectedDate != null)
            {
                ViewDate = Culture.Calendar.ToDateTime<TValue>(SelectedDate) ?? DateTime.Today;
            }
        }

        if (Mode != _mode)
        {
            _mode = Mode;
            _viewMode = Mode;
        }

        if (previousMonth != ViewDate.GetMonthStart())
            _pendingParameterMonthChanged = DateOnly.FromDateTime(ViewDate);

        base.OnParametersSet();
    }

    protected override async Task OnParametersSetAsync()
    {
        await base.OnParametersSetAsync();
        // Consume before awaiting: parent callbacks may synchronously set
        // parameters again; duplicate notifications must not be queued.
        var month = _pendingParameterMonthChanged;
        _pendingParameterMonthChanged = null;
        if (month is DateOnly changedMonth)
            await MonthChanged.InvokeAsync(changedMonth);
    }

    protected override void OnInitialized()
    {
        base.OnInitialized();
    }

    private void SetSelectedDate(DateTime? date)
    {
        if (Max != null && date != null && date > Max)
            date = Max;
        else if (Min != null && date != null && date < Min)
            date = Min;

        if (date == null)
        {
            SelectedDate = default!;
        }
        else if (BindConverter.TryConvertTo(date.Value.ToString(), null, out TValue? value) && value != null)
        {
            SelectedDate = value;
        }
        else
        {
            SelectedDate = default!;
        }
    }

    private async Task OnSelectDate(DateTime? date)
    {
        SetSelectedDate(date);
        await SelectedDateChanged.InvokeAsync(SelectedDate);

        if (Popover != null)
        {
            Popover.Close();
        }
    }

    private Task OnGoToToday() => ChangeViewDateAsync(DateTime.Today);

    private async Task OnClearSelection()
    {
        await OnSelectDate(null);
    }

    private async Task OnPreviousMonth()
    {
        await ChangeViewDateAsync(MonthStart.AddMonths(-1, Culture));
        _transitionClass = "down";
    }

    private async Task OnNextMonth()
    {
        await ChangeViewDateAsync(MonthStart.AddMonths(1, Culture));
        _transitionClass = "up";
    }

    private async Task OnPreviousYear()
    {
        await ChangeViewDateAsync(MonthStart.AddYears(-1, Culture));
        _transitionClass = "down";
    }

    private async Task OnNextYear()
    {
        await ChangeViewDateAsync(MonthStart.AddYears(1, Culture));
        _transitionClass = "up";
    }

    private async Task OnPreviousYearRange()
    {
        await ChangeViewDateAsync(MonthStart.AddYears(-13, Culture));
        _transitionClass = "down";
    }

    private async Task OnNextYearRange()
    {
        await ChangeViewDateAsync(MonthStart.AddYears(13, Culture));
        _transitionClass = "up";
    }

    private async Task OnMonthSelected(DateTime monthStart)
    {
        await ChangeViewDateAsync(monthStart);

        if (Mode == CalendarMode.MonthSelect)
        {
            await OnSelectDate(ViewDate);
        }
        else if (_viewMode == CalendarMode.MonthSelect)
        {
            _viewMode = CalendarMode.DaySelect;
        }
    }
    private async Task OnYearSelected(DateTime yearStart)
    {
        await ChangeViewDateAsync(yearStart);

        if (Mode == CalendarMode.YearSelect)
        {
            await OnSelectDate(ViewDate);
        }
        else if (_viewMode == CalendarMode.YearSelect)
        {
            _viewMode = CalendarMode.MonthSelect;
        }
    }

    private void OnSelectMonth()
    {
        _viewMode = CalendarMode.MonthSelect;
    }

    private void OnSelectYear()
    {
        _viewMode = CalendarMode.YearSelect;
    }

    private async Task OnSelectDayAsync()
    {
        _viewMode = CalendarMode.DaySelect;
        await OnSelectDate(ViewDate);
    }

}
