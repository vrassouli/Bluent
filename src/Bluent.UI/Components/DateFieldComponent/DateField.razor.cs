using Microsoft.AspNetCore.Components.Forms;
using Microsoft.AspNetCore.Components;
using System.Diagnostics.CodeAnalysis;
using System.Diagnostics;
using System.Globalization;
using Bluent.UI.Components.DateFieldComponent.Internal;
using Microsoft.Extensions.Localization;

namespace Bluent.UI.Components;

public partial class DateField<TValue>
{
    private Guid _key = Guid.NewGuid();
    private const string DateFormat = "yyyy/MM/dd";                     // Compatible with HTML 'date' inputs
    private const string DateTimeLocalFormat = "yyyy-MM-ddTHH:mm:ss";   // Compatible with HTML 'datetime-local' inputs
    private const string MonthFormat = "yyyy/MM";                       // Compatible with HTML 'month' inputs
    private const string TimeFormat = "HH:mm:ss";                       // Compatible with HTML 'time' inputs

    private string _format = default!;
    private string _formatDescription = default!;
    private string _parsingErrorMessage = default!;
    private string? _lastValidInput;

    [Parameter] public CultureInfo Culture { get; set; } = CultureInfo.CurrentUICulture;
    [Parameter] public CalendarMode Mode { get; set; } = CalendarMode.DaySelect;
    [Parameter] public Func<DateTime, string>? DateClass { get; set; }
    [Parameter] public DateTime? Max { get; set; }
    [Parameter] public DateTime? Min { get; set; }
    [Parameter] public bool DisplayCalendar { get; set; } = true;
    [Inject] private IStringLocalizer<DateFieldComponent.Resources.DateField> Localizer { get; set; } = default!;

    /// <summary>
    /// Gets or sets the error message used when displaying an a parsing error.
    /// </summary>
    [Parameter] public string ParsingErrorMessage { get; set; } = string.Empty;

    /// <summary>
    /// Constructs an instance of <see cref="InputDate{TValue}"/>
    /// </summary>
    public DateField()
    {
        var type = Nullable.GetUnderlyingType(typeof(TValue)) ?? typeof(TValue);

        if (type != typeof(DateTime) &&
            type != typeof(DateOnly))
        {
            throw new InvalidOperationException($"Unsupported {GetType()} type param '{type}'.");
        }
    }

    protected override IEnumerable<string> GetClasses()
    {
        foreach (var c in base.GetClasses())
            yield return c;

        yield return "bui-date-field";
    }

    /// <inheritdoc />
    protected override void OnParametersSet()
    {
        (_format, _formatDescription) = Mode switch
        {
            CalendarMode.DaySelect => (DateFormat, Localizer["date"]),
            CalendarMode.MonthSelect => (MonthFormat, Localizer["year and month"]),
            CalendarMode.YearSelect => (MonthFormat, Localizer["year"]),
            _ => throw new InvalidOperationException($"Unsupported {nameof(InputDateType)} '{Mode}'.")
        };

        _parsingErrorMessage = string.IsNullOrEmpty(ParsingErrorMessage)
            ? Localizer["ParsingErrorMessage"]
            : ParsingErrorMessage;

        var currentValueAsString = FormatValueAsString(Value);
        if (currentValueAsString != CurrentValueAsString)
            CurrentValueAsString = currentValueAsString;

        base.OnParametersSet();
    }

    private void OnDatePicked(TValue? value)
    {
        _lastValidInput = FormatValue(value);
        var str = FormatValueAsString(value);

        base.CurrentValueAsString = str;
    }

    private ButtonSize GetButtonSize()
    {
        return Size switch
        {
            FieldSize.Small => ButtonSize.Small,
            FieldSize.Medium => ButtonSize.Medium,
            FieldSize.Large => ButtonSize.Large,
            _ => throw new NotImplementedException(),
        };
    }

    protected override string? FormatValueAsString(TValue? value)
    {
        if(!string.IsNullOrEmpty(_lastValidInput))
            return _lastValidInput;

        return FormatValue(value);
    }

    protected string? FormatValue(TValue? value)
    {
        return value switch
        {
            DateTime dateTimeValue => BindConverter.FormatValue(dateTimeValue, _format, Culture),
            DateOnly dateOnlyValue => BindConverter.FormatValue(dateOnlyValue, _format, Culture),
            _ => null, // Handles null for Nullable<DateTime>, etc.
        };
    }

    protected override bool TryParseValueFromString(string? value, [MaybeNullWhen(false)] out TValue result, [NotNullWhen(false)] out string? validationErrorMessage)
    {
        if (Mode == CalendarMode.MonthSelect)
            value = $"{value}{Culture.DateTimeFormat.DateSeparator}01";
        else if (Mode == CalendarMode.YearSelect)
            value = $"{value}{Culture.DateTimeFormat.DateSeparator}01{Culture.DateTimeFormat.DateSeparator}01";

        if (BindConverter.TryConvertTo(value, Culture, out result))
        {
            _lastValidInput = value ;
            Debug.Assert(result != null);
            validationErrorMessage = null;
            return true;
        }
        else
        {
            validationErrorMessage = string.Format(Culture, _parsingErrorMessage, DisplayName ?? FieldIdentifier.FieldName, _formatDescription);
            return false;
        }
    }

    private string GetMask()
    {
        string mask;

        if (Mode == CalendarMode.YearSelect)
            mask = $"^\\d{{4}}$";
        else if (Mode == CalendarMode.MonthSelect)
            mask = $"^\\d{{4}}{Culture.DateTimeFormat.DateSeparator}\\d{{2}}$";
        else
            mask = $"^\\d{{4}}{Culture.DateTimeFormat.DateSeparator}\\d{{2}}{Culture.DateTimeFormat.DateSeparator}\\d{{2}}$";

        return mask;
    }

    private RenderFragment GetEndAddon()
    {
        if (EndAddon != null)
            return EndAddon;
        
        if (!DisplayCalendar)
            return builder => { };

        return builder =>
        {
            builder.OpenComponent<DateFieldPicker<TValue>>(0);

            builder.AddAttribute(0, nameof(DateFieldPicker<TValue>.ButtonSize), GetButtonSize());
            builder.AddAttribute(0, nameof(DateFieldPicker<TValue>.IsDisabled), IsDisabled);
            builder.AddAttribute(0, nameof(DateFieldPicker<TValue>.Culture), Culture);
            builder.AddAttribute(0, nameof(DateFieldPicker<TValue>.Value), Value);
            builder.AddAttribute(0, nameof(DateFieldPicker<TValue>.Mode), Mode);
            builder.AddAttribute(0, nameof(DateFieldPicker<TValue>.Min), Min);
            builder.AddAttribute(0, nameof(DateFieldPicker<TValue>.Max), Max);
            builder.AddAttribute(0, nameof(DateFieldPicker<TValue>.OnDatePicked), EventCallback.Factory.Create<TValue>(this, OnDatePicked));

            builder.CloseComponent();
        };
    }
}