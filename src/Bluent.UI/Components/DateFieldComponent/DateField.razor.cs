using Bluent.UI.Components.DateFieldComponent.Internal;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.Extensions.Localization;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using System.Text.RegularExpressions;

namespace Bluent.UI.Components;

public partial class DateField<TValue>
{
    private string _format = DateFieldValueParser.GetFormat(CalendarMode.DaySelect);
    private string _formatDescription = string.Empty;
    private string _parsingErrorMessage = string.Empty;

    [Parameter] public CultureInfo Culture { get; set; } = CultureInfo.CurrentUICulture;
    [Parameter] public CalendarMode Mode { get; set; } = CalendarMode.DaySelect;
    [Parameter] public Func<DateTime, string>? DateClass { get; set; }
    [Parameter] public DateTime? Max { get; set; }
    [Parameter] public DateTime? Min { get; set; }
    [Parameter] public bool DisplayCalendar { get; set; } = true;
    [Inject] private IStringLocalizer<DateFieldComponent.Resources.DateField> Localizer { get; set; } = default!;

    /// <summary>
    /// Gets or sets the error message used when displaying a parsing error.
    /// </summary>
    [Parameter] public string ParsingErrorMessage { get; set; } = string.Empty;

    public DateField()
    {
        var type = Nullable.GetUnderlyingType(typeof(TValue)) ?? typeof(TValue);
        if (type != typeof(DateTime) && type != typeof(DateOnly))
            throw new InvalidOperationException($"Unsupported {GetType()} type parameter '{type}'.");
    }

    protected override IEnumerable<string> GetClasses()
    {
        foreach (var cssClass in base.GetClasses())
            yield return cssClass;

        yield return "bui-date-field";
    }

    protected override void OnParametersSet()
    {
        if (Min.HasValue && Max.HasValue && Min.Value.Date > Max.Value.Date)
            throw new ArgumentException($"{nameof(Min)} must not be later than {nameof(Max)}.");

        _format = DateFieldValueParser.GetFormat(Mode);
        _formatDescription = Mode switch
        {
            CalendarMode.DaySelect => Localizer["date"],
            CalendarMode.MonthSelect => Localizer["year and month"],
            CalendarMode.YearSelect => Localizer["year"],
            _ => throw new InvalidOperationException($"Unsupported calendar mode '{Mode}'.")
        };

        _parsingErrorMessage = string.IsNullOrEmpty(ParsingErrorMessage)
            ? Localizer["ParsingErrorMessage"]
            : ParsingErrorMessage;

        base.OnParametersSet();
    }

    private void OnDatePicked(TValue? value)
    {
        CurrentValue = value!;
    }

    private ButtonSize GetButtonSize() => Size switch
    {
        FieldSize.Small => ButtonSize.Small,
        FieldSize.Medium => ButtonSize.Medium,
        FieldSize.Large => ButtonSize.Large,
        _ => throw new ArgumentOutOfRangeException(nameof(Size), Size, "Unsupported field size.")
    };

    protected override string? FormatValueAsString(TValue? value) => FormatValue(value);

    protected string? FormatValue(TValue? value)
    {
        DateTime? date = value switch
        {
            DateTime dateTime => dateTime.Date,
            DateOnly dateOnly => dateOnly.ToDateTime(TimeOnly.MinValue),
            _ => null
        };

        if (!date.HasValue || !IsSupported(date.Value))
            return null;

        return BindConverter.FormatValue(date.Value, _format, Culture);
    }

    private bool IsSupported(DateTime value) =>
        value >= Culture.Calendar.MinSupportedDateTime &&
        value <= Culture.Calendar.MaxSupportedDateTime;

    protected override bool TryParseValueFromString(
        string? value,
        [MaybeNullWhen(false)] out TValue result,
        [NotNullWhen(false)] out string? validationErrorMessage)
    {
        if (DateFieldValueParser.TryParse(
                value,
                typeof(TValue),
                Mode,
                Culture,
                Min,
                Max,
                out var parsed,
                out var rangeViolation))
        {
            result = parsed is null ? default! : (TValue)parsed;
            validationErrorMessage = null;
            return true;
        }

        result = default!;
        validationErrorMessage = rangeViolation switch
        {
            DateFieldRangeViolation.Minimum when Min.HasValue =>
                Localizer["MinimumErrorMessage", DisplayName ?? FieldIdentifier.FieldName, Min.Value.ToString(_format, Culture)],
            DateFieldRangeViolation.Maximum when Max.HasValue =>
                Localizer["MaximumErrorMessage", DisplayName ?? FieldIdentifier.FieldName, Max.Value.ToString(_format, Culture)],
            _ => string.Format(Culture, _parsingErrorMessage, DisplayName ?? FieldIdentifier.FieldName, _formatDescription)
        };
        return false;
    }

    private string GetMask()
    {
        var separator = Regex.Escape(Culture.DateTimeFormat.DateSeparator);
        return Mode switch
        {
            CalendarMode.DaySelect => $@"^\d{{4}}{separator}\d{{2}}{separator}\d{{2}}$",
            CalendarMode.MonthSelect => $@"^\d{{4}}{separator}\d{{2}}$",
            CalendarMode.YearSelect => @"^\d{4}$",
            _ => throw new InvalidOperationException($"Unsupported calendar mode '{Mode}'.")
        };
    }

    private Func<DateOnly, string>? GetCalendarDateClass()
    {
        if (DateClass is null)
            return null;

        return date => DateClass(date.ToDateTime(TimeOnly.MinValue));
    }

    private RenderFragment GetEndAddon()
    {
        if (EndAddon is not null)
            return EndAddon;

        if (!DisplayCalendar)
            return builder => { };

        return builder =>
        {
            builder.OpenComponent<CascadingValue<Func<DateOnly, string>?>>(0);
            builder.AddAttribute(1, "Name", "BluentDateFieldDateClass");
            builder.AddAttribute(2, "Value", GetCalendarDateClass());
            builder.AddAttribute(3, "ChildContent", (RenderFragment)(pickerBuilder =>
            {
                pickerBuilder.OpenComponent<DateFieldPicker<TValue>>(0);
                pickerBuilder.AddAttribute(1, nameof(DateFieldPicker<TValue>.ButtonSize), GetButtonSize());
                pickerBuilder.AddAttribute(2, nameof(DateFieldPicker<TValue>.IsDisabled), IsDisabled);
                pickerBuilder.AddAttribute(3, nameof(DateFieldPicker<TValue>.Culture), Culture);
                pickerBuilder.AddAttribute(4, nameof(DateFieldPicker<TValue>.Value), Value);
                pickerBuilder.AddAttribute(5, nameof(DateFieldPicker<TValue>.Mode), Mode);
                pickerBuilder.AddAttribute(6, nameof(DateFieldPicker<TValue>.Min), Min);
                pickerBuilder.AddAttribute(7, nameof(DateFieldPicker<TValue>.Max), Max);
                pickerBuilder.AddAttribute(8, nameof(DateFieldPicker<TValue>.OnDatePicked), EventCallback.Factory.Create<TValue>(this, OnDatePicked));
                pickerBuilder.CloseComponent();
            }));
            builder.CloseComponent();
        };
    }
}
