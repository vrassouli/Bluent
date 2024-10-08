﻿using Bluent.UI.Extensions;
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

    [Parameter] public TValue SelectedDate { get; set; } = default!;
    [Parameter] public EventCallback<TValue> SelectedDateChanged { get; set; }
    [Parameter] public EventCallback<DateOnly> MonthChanged { get; set; }
    [Parameter] public CultureInfo Culture { get; set; } = CultureInfo.CurrentUICulture;
    [Parameter] public CalendarMode Mode { get; set; } = CalendarMode.DaySelect;
    [Parameter] public Func<DateOnly, string>? DateClass { get; set; }
    [Parameter] public DateTime? Max { get; set; }
    [Parameter] public DateTime? Min { get; set; }
    [CascadingParameter] public Popover? Popover { get; set; }

    private DateTime ViewDate
    {
        get => _viewDate;
        set
        {
            if (_viewDate != value)
            {
                var prevViewDate = _viewDate;
                _viewDate = value;

                if (prevViewDate.GetMonthStart() != _viewDate.GetMonthStart())
                    OnMonthChanged();
            }
        }
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
            Popover.Close();
        }
    }

    private void OnGoToToday()
    {
        ViewDate = DateTime.Today;
    }

    private async Task OnClearSelection()
    {
        await OnSelectDate(null);
    }

    private void OnPreviousMonth()
    {
        ViewDate = MonthStart.AddMonths(-1, Culture);
        _transitionClass = "down";
    }

    private void OnNextMonth()
    {
        ViewDate = MonthStart.AddMonths(1, Culture);
        _transitionClass = "up";
    }

    private void OnPreviousYear()
    {
        ViewDate = MonthStart.AddYears(-1, Culture);
        _transitionClass = "down";
    }

    private void OnNextYear()
    {
        ViewDate = MonthStart.AddYears(1, Culture);
        _transitionClass = "up";
    }

    private void OnPreviousYearRange()
    {
        ViewDate = MonthStart.AddYears(-13, Culture);
        _transitionClass = "down";
    }

    private void OnNextYearRange()
    {
        ViewDate = MonthStart.AddYears(13, Culture);
        _transitionClass = "up";
    }

    private async void OnYearChanged(ChangeEventArgs args)
    {
        if (int.TryParse(args.Value?.ToString(), out var year))
        {
            ViewDate = ViewDate.SetYear(year, Culture);

            if (Mode == CalendarMode.MonthSelect)
            {
                await OnSelectDate(ViewDate);
            }
        }
    }

    private async void OnMonthChanged(ChangeEventArgs args)
    {
        if (int.TryParse(args.Value?.ToString(), out var year))
        {
            ViewDate = ViewDate.SetMonth(year, Culture);

            if (Mode == CalendarMode.MonthSelect)
            {
                await OnSelectDate(ViewDate);
            }
        }
    }

    private async void OnMonthSelected(DateTime monthStart)
    {
        ViewDate = monthStart;

        if (Mode == CalendarMode.MonthSelect)
        {
            await OnSelectDate(ViewDate);
        }
        else if (_viewMode == CalendarMode.MonthSelect)
        {
            _viewMode = CalendarMode.DaySelect;
        }
    }
    private async void OnYearSelected(DateTime yearStart)
    {
        ViewDate = yearStart;

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

    private void OnMonthChanged()
    {
        var date = DateOnly.FromDateTime(ViewDate);

        InvokeAsync(() => MonthChanged.InvokeAsync(date));
    }
}
