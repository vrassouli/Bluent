using Bluent.UI.Extensions;
using Humanizer;
using Microsoft.AspNetCore.Components;
using Microsoft.Extensions.Localization;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Components;

public partial class Calendar<TValue>
{
    private CalendarMode _viewMode = CalendarMode.DaySelect;
    private CalendarMode _mode = CalendarMode.DaySelect;
    private TValue _selectedDate = default!;
    private DateTime _viewDate;
    private string _transitionClass = "up";

    [Parameter] public TValue SelectedDate { get; set; } = default!;
    [Parameter] public EventCallback<TValue> SelectedDateChanged { get; set; }
    [Parameter] public CultureInfo Culture { get; set; } = CultureInfo.CurrentUICulture;
    [Parameter] public CalendarMode Mode { get; set; } = CalendarMode.DaySelect;
    [Parameter] public Func<DateTime, string>? DateClass { get; set; }
    [Parameter] public DateTime? Max { get; set; }
    [Parameter] public DateTime? Min { get; set; }
    [CascadingParameter] public Popover? Popover { get; set; }
    [Inject] private IStringLocalizer<CalendarComponent.Resources.Calendar> Localizer { get; set; } = default!;

    private int DaysInMonth => Culture.Calendar.GetDaysInMonth(Culture.Calendar.GetYear(_viewDate), Culture.Calendar.GetMonth(_viewDate));
    private DateTime MonthStart => _viewDate.GetMonthStart(Culture);
    private DateTime MonthEnd => _viewDate.GetMonthEnd(Culture);
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

        _viewDate = DateTime.Today;
    }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-calendar";
        yield return _viewMode.ToString().Kebaberize();
        yield return $"transition-{_transitionClass}";
    }

    protected override void OnParametersSet()
    {
        if (!IsNullable && Equals(SelectedDate, default))
        {
            SetSelectedDate(DateTime.Today);
        }

        if (!object.Equals(SelectedDate, _selectedDate))
        {
            _selectedDate = SelectedDate;

            if (SelectedDate != null)
            {
                _viewDate = Culture.Calendar.ToDateTime<TValue>(SelectedDate) ?? DateTime.Today;
            }
        }

        if (Mode != _mode)
        {
            _mode = Mode;
            _viewMode = Mode;
        }

        base.OnParametersSet();
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
            Popover.Hide();
        }
    }

    private void OnGoToToday()
    {
        _viewDate = DateTime.Today;
    }

    private async Task OnClearSelection()
    {
        await OnSelectDate(null);
    }

    private void OnPreviousMonth()
    {
        _viewDate = MonthStart.AddMonths(-1, Culture);
        _transitionClass = "down";
    }

    private void OnNextMonth()
    {
        _viewDate = MonthStart.AddMonths(1, Culture);
        _transitionClass = "up";
    }

    private void OnPreviousYear()
    {
        _viewDate = MonthStart.AddYears(-1, Culture);
        _transitionClass = "down";
    }

    private void OnNextYear()
    {
        _viewDate = MonthStart.AddYears(1, Culture);
        _transitionClass = "up";
    }

    private void OnPreviousYearRange()
    {
        _viewDate = MonthStart.AddYears(-13, Culture);
        _transitionClass = "down";
    }

    private void OnNextYearRange()
    {
        _viewDate = MonthStart.AddYears(13, Culture);
        _transitionClass = "up";
    }

    private async void OnYearChanged(ChangeEventArgs args)
    {
        if (int.TryParse(args.Value?.ToString(), out var year))
        {
            _viewDate = _viewDate.SetYear(year, Culture);

            if (Mode == CalendarMode.MonthSelect)
            {
                await OnSelectDate(_viewDate);
            }
        }
    }

    private async void OnMonthChanged(ChangeEventArgs args)
    {
        if (int.TryParse(args.Value?.ToString(), out var year))
        {
            _viewDate = _viewDate.SetMonth(year, Culture);

            if (Mode == CalendarMode.MonthSelect)
            {
                await OnSelectDate(_viewDate);
            }
        }
    }

    private async void OnMonthSelected(DateTime monthStart)
    {
        _viewDate = monthStart;

        if (Mode == CalendarMode.MonthSelect)
        {
            await OnSelectDate(_viewDate);
        }
        else if (_viewMode == CalendarMode.MonthSelect)
        {
            _viewMode = CalendarMode.DaySelect;
        }
    }
    private async void OnYearSelected(DateTime yearStart)
    {
        _viewDate = yearStart;

        if (Mode == CalendarMode.YearSelect)
        {
            await OnSelectDate(_viewDate);
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
        await OnSelectDate(_viewDate);
    }
}
