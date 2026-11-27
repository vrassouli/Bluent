using Bluent.UI.Extensions;
using Humanizer;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.JSInterop;
using Microsoft.Extensions.Localization;
using System.Globalization;

namespace Bluent.UI.Components;

public partial class Calendar<TValue>
{
    private CalendarMode _viewMode = CalendarMode.DaySelect;
    private CalendarMode _mode = CalendarMode.DaySelect;
    private TValue _selectedDate = default!;
    private string _transitionClass = "up";
    private DateTime _viewDate = DateTime.Today;
    private DateTime _focusDate = DateTime.Today;
    private DateOnly? _pendingParameterMonthChanged;
    private ElementReference _root;
    private bool _focusPending;
    private bool _hasInitializedParameters;
    private IJSObjectReference? _focusModule;
    private IJSObjectReference? _focusListener;
    private DotNetObjectReference<Calendar<TValue>>? _focusReference;

    [Parameter] public TValue SelectedDate { get; set; } = default!;
    [Parameter] public EventCallback<TValue> SelectedDateChanged { get; set; }
    [Parameter] public EventCallback<DateOnly> MonthChanged { get; set; }
    [Parameter] public CultureInfo Culture { get; set; } = CultureInfo.CurrentUICulture;
    [Parameter] public CalendarMode Mode { get; set; } = CalendarMode.DaySelect;
    [Parameter] public Func<DateOnly, string>? DateClass { get; set; }
    [Parameter] public DateTime? Max { get; set; }
    [Parameter] public DateTime? Min { get; set; }
    [Parameter] public bool AutoFocusSelectedDate { get; set; }
    [CascadingParameter] public Popover? Popover { get; set; }
    [Inject] private IJSRuntime JsRuntime { get; set; } = default!;
    [Inject] private IStringLocalizer<CalendarComponent.Resources.CalendarResources> Localizer { get; set; } = default!;

    private DateTime ViewDate
    {
        get => _viewDate;
        set => _viewDate = value;
    }

    private System.Globalization.Calendar ActiveCalendar => Culture.DateTimeFormat.Calendar;

    // DateField renders selection options in three columns; standalone Calendar uses four.
    private int SelectionGridColumnCount =>
        (Class ?? string.Empty)
            .Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries)
            .Contains("datefield-calendar", StringComparer.Ordinal)
                ? 3
                : 4;

    private int DaysInMonth => ActiveCalendar.GetDaysInMonth(
        ActiveCalendar.GetYear(ViewDate),
        ActiveCalendar.GetMonth(ViewDate));

    private DateTime MonthStart => GetMonthStart(ActiveCalendar.GetYear(ViewDate), ActiveCalendar.GetMonth(ViewDate));
    private DateTime MonthEnd => GetMonthEnd(ActiveCalendar.GetYear(ViewDate), ActiveCalendar.GetMonth(ViewDate));
    private int FirstDayOffset => ((int)MonthStart.DayOfWeek - (int)Culture.DateTimeFormat.FirstDayOfWeek + 7) % 7;
    private bool IsNullable => Nullable.GetUnderlyingType(typeof(TValue)) is not null;
    private DateTime? SelectedDateAsDate => ToDateTime(SelectedDate);

    private int MinimumYear => ActiveCalendar.GetYear(ActiveCalendar.MinSupportedDateTime);
    private int MaximumYear => ActiveCalendar.GetYear(ActiveCalendar.MaxSupportedDateTime);
    private int VisibleYearRangeStart
    {
        get
        {
            var year = ActiveCalendar.GetYear(ViewDate);
            return MinimumYear + Math.Max(0, (year - MinimumYear) / 12) * 12;
        }
    }

    private bool CanNavigateToPreviousMonth =>
        TryAddMonths(MonthStart, -1) is DateTime previous &&
        TryGetFirstSelectableDate(GetMonthStart(ActiveCalendar.GetYear(previous), ActiveCalendar.GetMonth(previous)),
            GetMonthEnd(ActiveCalendar.GetYear(previous), ActiveCalendar.GetMonth(previous)), out _);

    private bool CanNavigateToNextMonth =>
        TryAddMonths(MonthStart, 1) is DateTime next &&
        TryGetFirstSelectableDate(GetMonthStart(ActiveCalendar.GetYear(next), ActiveCalendar.GetMonth(next)),
            GetMonthEnd(ActiveCalendar.GetYear(next), ActiveCalendar.GetMonth(next)), out _);

    private bool CanNavigateToPreviousYear =>
        TryAddYears(ViewDate, -1) is DateTime previous &&
        TryGetFirstSelectableDate(GetYearStart(ActiveCalendar.GetYear(previous)),
            GetYearEnd(ActiveCalendar.GetYear(previous)), out _);

    private bool CanNavigateToNextYear =>
        TryAddYears(ViewDate, 1) is DateTime next &&
        TryGetFirstSelectableDate(GetYearStart(ActiveCalendar.GetYear(next)),
            GetYearEnd(ActiveCalendar.GetYear(next)), out _);

    private bool CanNavigateToPreviousYearRange => VisibleYearRangeStart > MinimumYear;
    private bool CanNavigateToNextYearRange => VisibleYearRangeStart + 12 <= MaximumYear;

    public Calendar()
    {
        var type = Nullable.GetUnderlyingType(typeof(TValue)) ?? typeof(TValue);
        if (type != typeof(DateTime) && type != typeof(DateOnly))
            throw new InvalidOperationException($"Unsupported {GetType()} type parameter '{type}'.");
    }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-calendar";
        yield return _viewMode.ToString().Kebaberize();
        yield return $"transition-{_transitionClass}";
    }

    protected override void OnParametersSet()
    {
        if (Min.HasValue && Max.HasValue && Min.Value.Date > Max.Value.Date)
            throw new ArgumentException($"{nameof(Min)} must not be later than {nameof(Max)}.");

        var previousMonth = MonthStart;
        var selected = ToDateTime(SelectedDate);

        if (!IsNullable && EqualityComparer<TValue>.Default.Equals(SelectedDate, default!))
        {
            var initialDate = GetInitialSelectableDate(DateTime.Today);
            if (initialDate is DateTime date)
            {
                SetSelectedDate(date);
                selected = ToDateTime(SelectedDate);
            }
        }
        var selectedChanged = !EqualityComparer<TValue>.Default.Equals(SelectedDate, _selectedDate);
        if (selectedChanged)
        {
            _selectedDate = SelectedDate;
            if (selected is DateTime selectedDate)
                ViewDate = ClampToCalendarSupport(selectedDate);
        }

        if (Mode != _mode)
        {
            _mode = Mode;
            _viewMode = Mode;
        }

        var preferredFocus = selected ?? _focusDate;
        _focusDate = GetInitialSelectableDate(preferredFocus) ?? GetInitialSelectableDate(DateTime.Today) ?? ViewDate.Date;

        if ((selectedChanged || !_hasInitializedParameters) && (!selected.HasValue || !IsWithinSelectionRange(selected.Value)))
            ViewDate = _focusDate;

        if (selectedChanged || !_hasInitializedParameters)
            _focusPending = AutoFocusSelectedDate;
        _hasInitializedParameters = true;

        if (previousMonth != MonthStart)
            _pendingParameterMonthChanged = DateOnly.FromDateTime(ViewDate);

        base.OnParametersSet();
    }

    protected override async Task OnParametersSetAsync()
    {
        await base.OnParametersSetAsync();

        var month = _pendingParameterMonthChanged;
        _pendingParameterMonthChanged = null;
        if (month is DateOnly changedMonth)
            await MonthChanged.InvokeAsync(changedMonth);
    }

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        await base.OnAfterRenderAsync(firstRender);
        if (firstRender && AutoFocusSelectedDate)
            await AttachTabExitObserverAsync();
        if (_focusPending && _focusModule is not null)
        {
            _focusPending = false;
            await FocusCurrentGridItemAsync();
        }
    }

    private async Task AttachTabExitObserverAsync()
    {
        _focusModule = await JsRuntime.InvokeAsync<IJSObjectReference>(
            "import", "./_content/Bluent.UI/bluent.ui.calendar.js");

        _focusReference = DotNetObjectReference.Create(this);
        _focusListener = await _focusModule.InvokeAsync<IJSObjectReference>(
            "observeCalendarTabExit", _root, _focusReference);
    }

    private Task FocusCurrentGridItemAsync() =>
        _focusModule!.InvokeVoidAsync("focusActiveCalendarItem", _root).AsTask();

    private int GetDayTabIndex(DateTime date) =>
        DateOnly.FromDateTime(date) == DateOnly.FromDateTime(_focusDate) ? 0 : -1;

    private string GetDayButtonId(DateTime date) =>
        $"{Id}_day_{ActiveCalendar.GetYear(date):D4}_{ActiveCalendar.GetMonth(date):D2}_{ActiveCalendar.GetDayOfMonth(date):D2}";

    [JSInvokable]
    public void HandleCalendarTabExit()
    {
        Popover?.Close();
    }

    private async Task ChangeViewDateAsync(DateTime value)
    {
        var previousMonth = MonthStart;
        ViewDate = ClampToCalendarSupport(value);
        if (previousMonth != MonthStart)
            await MonthChanged.InvokeAsync(DateOnly.FromDateTime(ViewDate));
    }

    private DateTime GetMonthStart(int year, int month) =>
        ActiveCalendar.ToDateTime(year, month, 1, 0, 0, 0, 0);

    private DateTime GetMonthEnd(int year, int month)
    {
        var lastDay = ActiveCalendar.GetDaysInMonth(year, month);
        return ActiveCalendar.ToDateTime(year, month, lastDay, 0, 0, 0, 0);
    }

    private DateTime GetYearStart(int year) =>
        ActiveCalendar.ToDateTime(year, 1, 1, 0, 0, 0, 0);

    private DateTime GetYearEnd(int year)
    {
        var lastMonth = ActiveCalendar.GetMonthsInYear(year);
        var lastDay = ActiveCalendar.GetDaysInMonth(year, lastMonth);
        return ActiveCalendar.ToDateTime(year, lastMonth, lastDay, 0, 0, 0, 0);
    }

    private DateTime GetDateForMonth(int year, int month)
    {
        var day = Math.Min(ActiveCalendar.GetDayOfMonth(ViewDate),
            ActiveCalendar.GetDaysInMonth(year, month));
        return ActiveCalendar.ToDateTime(year, month, day, 0, 0, 0, 0);
    }

    private DateTime GetDateForYear(int year)
    {
        var monthCount = ActiveCalendar.GetMonthsInYear(year);
        var month = Math.Min(ActiveCalendar.GetMonth(ViewDate), monthCount);
        var day = Math.Min(ActiveCalendar.GetDayOfMonth(ViewDate),
            ActiveCalendar.GetDaysInMonth(year, month));
        return ActiveCalendar.ToDateTime(year, month, day, 0, 0, 0, 0);
    }

    private string GetMonthDisplayName(int month)
    {
        var name = Culture.DateTimeFormat.GetMonthName(month);
        return string.IsNullOrWhiteSpace(name) ? month.ToString(Culture) : name;
    }

    private string GetMonthShortName(int month)
    {
        var name = Culture.DateTimeFormat.GetAbbreviatedMonthName(month);
        if (string.IsNullOrWhiteSpace(name))
            name = GetMonthDisplayName(month);

        return name;
    }

    private (int Start, int End) GetVisibleYearRange()
    {
        var start = VisibleYearRangeStart;
        return (start, Math.Min(MaximumYear, start + 11));
    }

    private bool IsWithinCalendarSupport(DateTime date) =>
        date.Date >= ActiveCalendar.MinSupportedDateTime.Date &&
        date.Date <= ActiveCalendar.MaxSupportedDateTime.Date;

    private bool IsWithinSelectionRange(DateTime date) =>
        IsWithinCalendarSupport(date) &&
        (!Min.HasValue || date.Date >= Min.Value.Date) &&
        (!Max.HasValue || date.Date <= Max.Value.Date);

    private bool TryGetFirstSelectableDate(DateTime start, DateTime end, out DateTime date)
    {
        var first = start.Date;
        if (first < ActiveCalendar.MinSupportedDateTime.Date)
            first = ActiveCalendar.MinSupportedDateTime.Date;
        if (Min.HasValue && first < Min.Value.Date)
            first = Min.Value.Date;

        var last = end.Date;
        if (last > ActiveCalendar.MaxSupportedDateTime.Date)
            last = ActiveCalendar.MaxSupportedDateTime.Date;
        if (Max.HasValue && last > Max.Value.Date)
            last = Max.Value.Date;

        date = first;
        return first <= last;
    }

    private DateTime? GetInitialSelectableDate(DateTime preferred)
    {
        var earliest = ActiveCalendar.MinSupportedDateTime.Date;
        var latest = ActiveCalendar.MaxSupportedDateTime.Date;
        if (Min.HasValue && Min.Value.Date > earliest)
            earliest = Min.Value.Date;
        if (Max.HasValue && Max.Value.Date < latest)
            latest = Max.Value.Date;

        if (earliest > latest)
            return null;

        if (preferred.Date < earliest)
            return earliest;
        if (preferred.Date > latest)
            return latest;
        return preferred.Date;
    }

    private DateTime ClampToCalendarSupport(DateTime date)
    {
        if (date.Date < ActiveCalendar.MinSupportedDateTime.Date)
            return ActiveCalendar.MinSupportedDateTime.Date;
        if (date.Date > ActiveCalendar.MaxSupportedDateTime.Date)
            return ActiveCalendar.MaxSupportedDateTime.Date;
        return date.Date;
    }

    private static DateTime? ToDateTime(object? value) => value switch
    {
        DateTime dateTime => dateTime.Date,
        DateOnly dateOnly => dateOnly.ToDateTime(TimeOnly.MinValue),
        _ => null
    };

    private bool SetSelectedDate(DateTime? date)
    {
        if (date is DateTime selected && !IsWithinSelectionRange(selected))
            return false;

        if (date is null)
        {
            SelectedDate = default!;
        }
        else
        {
            var underlyingType = Nullable.GetUnderlyingType(typeof(TValue)) ?? typeof(TValue);
            object typedValue = underlyingType == typeof(DateOnly)
                ? DateOnly.FromDateTime(date.Value.Date)
                : date.Value.Date;
            SelectedDate = (TValue)typedValue;
        }

        _selectedDate = SelectedDate;
        return true;
    }

    private async Task OnSelectDate(DateTime? date)
    {
        if (!SetSelectedDate(date))
            return;

        _focusDate = date?.Date ?? _focusDate;
        await SelectedDateChanged.InvokeAsync(SelectedDate);
        if (Popover is not null)
            await Popover.CloseAsync(restoreFocus: true);
    }

    private DateTime? TryAddMonths(DateTime date, int amount)
    {
        try
        {
            var result = ActiveCalendar.AddMonths(date, amount);
            return IsWithinCalendarSupport(result) ? result : null;
        }
        catch (ArgumentOutOfRangeException)
        {
            return null;
        }
    }

    private DateTime? TryAddYears(DateTime date, int amount)
    {
        try
        {
            var result = ActiveCalendar.AddYears(date, amount);
            return IsWithinCalendarSupport(result) ? result : null;
        }
        catch (ArgumentOutOfRangeException)
        {
            return null;
        }
    }

    private async Task OnPreviousMonth()
    {
        if (TryAddMonths(MonthStart, -1) is DateTime previous)
        {
            await ChangeViewDateAsync(previous);
            _transitionClass = "down";
        }
    }

    private async Task OnNextMonth()
    {
        if (TryAddMonths(MonthStart, 1) is DateTime next)
        {
            await ChangeViewDateAsync(next);
            _transitionClass = "up";
        }
    }

    private async Task OnPreviousYear()
    {
        if (TryAddYears(ViewDate, -1) is DateTime previous)
        {
            await ChangeViewDateAsync(previous);
            _transitionClass = "down";
        }
    }

    private async Task OnNextYear()
    {
        if (TryAddYears(ViewDate, 1) is DateTime next)
        {
            await ChangeViewDateAsync(next);
            _transitionClass = "up";
        }
    }

    private async Task OnPreviousYearRange()
    {
        var nextYear = Math.Max(MinimumYear, VisibleYearRangeStart - 12);
        await ChangeViewDateAsync(GetDateForYear(nextYear));
        _transitionClass = "down";
    }

    private async Task OnNextYearRange()
    {
        var nextYear = Math.Min(MaximumYear, VisibleYearRangeStart + 12);
        await ChangeViewDateAsync(GetDateForYear(nextYear));
        _transitionClass = "up";
    }

    private async Task OnMonthSelected(DateTime monthDate)
    {
        var year = ActiveCalendar.GetYear(monthDate);
        var month = ActiveCalendar.GetMonth(monthDate);
        var start = GetMonthStart(year, month);
        var end = GetMonthEnd(year, month);

        if (!TryGetFirstSelectableDate(start, end, out var firstSelectable))
            return;

        var selectedDate = SelectedDateAsDate is DateTime selected &&
                           selected >= start && selected <= end &&
                           IsWithinSelectionRange(selected)
            ? selected
            : firstSelectable;

        _focusDate = selectedDate;
        await ChangeViewDateAsync(selectedDate);
        if (Mode == CalendarMode.MonthSelect)
            await OnSelectDate(selectedDate);
        else if (_viewMode == CalendarMode.MonthSelect)
            _viewMode = CalendarMode.DaySelect;
    }

    private async Task OnYearSelected(DateTime yearDate)
    {
        var year = ActiveCalendar.GetYear(yearDate);
        if (!TryGetFirstSelectableDate(GetYearStart(year), GetYearEnd(year), out var firstSelectable))
            return;

        var selected = SelectedDateAsDate is DateTime current &&
                       ActiveCalendar.GetYear(current) == year &&
                       IsWithinSelectionRange(current)
            ? current
            : firstSelectable;

        _focusDate = selected;
        await ChangeViewDateAsync(selected);
        if (Mode == CalendarMode.YearSelect)
            await OnSelectDate(selected);
        else if (_viewMode == CalendarMode.YearSelect)
            _viewMode = CalendarMode.MonthSelect;
    }

    private async Task OnMonthGridKeyDown(KeyboardEventArgs args, DateTime activeMonth)
    {
        var rtl = Culture.TextInfo.IsRightToLeft;
        var delta = args.Key switch
        {
            "ArrowLeft" => rtl ? 1 : -1,
            "ArrowRight" => rtl ? -1 : 1,
            "ArrowUp" => -SelectionGridColumnCount,
            "ArrowDown" => SelectionGridColumnCount,
            _ => 0
        };
        var year = ActiveCalendar.GetYear(activeMonth);
        var direction = delta != 0 ? Math.Sign(delta) : args.Key == "End" ? -1 : 1;
        DateTime? candidate = args.Key switch
        {
            "Home" => GetMonthStart(year, 1),
            "End" => GetMonthStart(year, ActiveCalendar.GetMonthsInYear(year)),
            "ArrowLeft" or "ArrowRight" or "ArrowUp" or "ArrowDown" => TryAddMonths(activeMonth, delta),
            _ => null
        };

        if (candidate is null)
            return;

        for (var attempt = 0; candidate is DateTime value && attempt < 13; attempt++)
        {
            var candidateYear = ActiveCalendar.GetYear(value);
            var candidateMonth = ActiveCalendar.GetMonth(value);
            if (TryGetFirstSelectableDate(GetMonthStart(candidateYear, candidateMonth), GetMonthEnd(candidateYear, candidateMonth), out var firstSelectable))
            {
                _focusDate = firstSelectable;
                await ChangeViewDateAsync(firstSelectable);
                _focusPending = true;
                _transitionClass = firstSelectable >= activeMonth ? "up" : "down";
                return;
            }
            candidate = TryAddMonths(value, direction);
        }
    }

    private async Task OnYearGridKeyDown(KeyboardEventArgs args, DateTime activeYear)
    {
        var rtl = Culture.TextInfo.IsRightToLeft;
        var delta = args.Key switch
        {
            "ArrowLeft" => rtl ? 1 : -1,
            "ArrowRight" => rtl ? -1 : 1,
            "ArrowUp" => -SelectionGridColumnCount,
            "ArrowDown" => SelectionGridColumnCount,
            _ => 0
        };
        var range = GetVisibleYearRange();
        var year = ActiveCalendar.GetYear(activeYear);
        var targetYear = args.Key switch
        {
            "Home" => range.Start,
            "End" => range.End,
            "ArrowLeft" or "ArrowRight" or "ArrowUp" or "ArrowDown" => year + delta,
            _ => year
        };

        if (targetYear < range.Start || targetYear > range.End || targetYear == year)
            return;

        var direction = targetYear >= year ? 1 : -1;
        for (var attempt = 0; attempt < 12 && targetYear >= range.Start && targetYear <= range.End; attempt++, targetYear += direction)
        {
            if (TryGetFirstSelectableDate(GetYearStart(targetYear), GetYearEnd(targetYear), out var firstSelectable))
            {
                _focusDate = firstSelectable;
                await ChangeViewDateAsync(firstSelectable);
                _focusPending = true;
                _transitionClass = firstSelectable >= activeYear ? "up" : "down";
                return;
            }
        }
    }

    private void OnSelectMonth()
    {
        _viewMode = CalendarMode.MonthSelect;
        _focusPending = AutoFocusSelectedDate;
    }

    private void OnSelectYear()
    {
        _viewMode = CalendarMode.YearSelect;
        _focusPending = AutoFocusSelectedDate;
    }
    private async Task OnDateKeyDown(KeyboardEventArgs args, DateTime activeDate)
    {
        DateTime? target = null;
        var horizontalStep = Culture.TextInfo.IsRightToLeft ? 1 : -1;

        try
        {
            target = args.Key switch
            {
                "ArrowLeft" => activeDate.AddDays(horizontalStep),
                "ArrowRight" => activeDate.AddDays(-horizontalStep),
                "ArrowUp" => activeDate.AddDays(-7),
                "ArrowDown" => activeDate.AddDays(7),
                "Home" => activeDate.AddDays(-((int)activeDate.DayOfWeek - (int)Culture.DateTimeFormat.FirstDayOfWeek + 7) % 7),
                "End" => activeDate.AddDays(6 - ((int)activeDate.DayOfWeek - (int)Culture.DateTimeFormat.FirstDayOfWeek + 7) % 7),
                "PageUp" => args.ShiftKey ? TryAddYears(activeDate, -1) : TryAddMonths(activeDate, -1),
                "PageDown" => args.ShiftKey ? TryAddYears(activeDate, 1) : TryAddMonths(activeDate, 1),
                _ => null
            };
        }
        catch (ArgumentOutOfRangeException)
        {
            target = null;
        }

        if (target is not DateTime nextDate)
            return;

        var focusDate = GetInitialSelectableDate(nextDate.Date);
        if (focusDate is not DateTime date || !IsWithinSelectionRange(date))
            return;

        if (ActiveCalendar.GetYear(date) != ActiveCalendar.GetYear(ViewDate) || ActiveCalendar.GetMonth(date) != ActiveCalendar.GetMonth(ViewDate))
            await ChangeViewDateAsync(date);

        _focusDate = date.Date;
        _focusPending = true;
        _transitionClass = date > activeDate ? "up" : "down";
        StateHasChanged();
    }

    public override async ValueTask DisposeAsync()
    {
        try
        {
            if (_focusListener is not null)
            {
                try { await _focusListener.InvokeVoidAsync("dispose"); }
                catch (JSDisconnectedException) { }
                await _focusListener.DisposeAsync();
            }

            if (_focusModule is not null)
                await _focusModule.DisposeAsync();
        }
        catch (JSDisconnectedException) { }
        finally
        {
            _focusReference?.Dispose();
            await base.DisposeAsync();
        }
    }
}
