using Microsoft.AspNetCore.Components.Forms;
using Microsoft.AspNetCore.Components;
using System.Diagnostics.CodeAnalysis;
using System.Diagnostics;
using System.Globalization;

namespace Bluent.UI.Components;

public partial class DateField<TValue>
{
    private Guid _key = Guid.NewGuid();
    private const string DateFormat = "yyyy/MM/dd";                     // Compatible with HTML 'date' inputs
    private const string DateTimeLocalFormat = "yyyy-MM-ddTHH:mm:ss";   // Compatible with HTML 'datetime-local' inputs
    private const string MonthFormat = "yyyy/MM";                       // Compatible with HTML 'month' inputs
    private const string TimeFormat = "HH:mm:ss";                       // Compatible with HTML 'time' inputs

    private string _format = default!;
    private string _parsingErrorMessage = default!;

    [Parameter] public CultureInfo Culture { get; set; } = CultureInfo.CurrentUICulture;
    [Parameter] public CalendarMode Mode { get; set; } = CalendarMode.DaySelect;
    [Parameter] public Func<DateTime, string>? DateClass { get; set; }
    [Parameter] public DateTime? Max { get; set; }
    [Parameter] public DateTime? Min { get; set; }
    [Parameter] public bool DisplayCalendar { get; set; } = true;

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

    public override IEnumerable<string> GetClasses()
    {
        foreach (var c in base.GetClasses())
            yield return c;

        yield return "bui-date-field";
    }

    /// <inheritdoc />
    protected override void OnParametersSet()
    {
        (_format, var formatDescription) = Mode switch
        {
            CalendarMode.DaySelect => (DateFormat, "date"),
            CalendarMode.MonthSelect => (MonthFormat, "year and month"),
            CalendarMode.YearSelect => (MonthFormat, "year"),
            _ => throw new InvalidOperationException($"Unsupported {nameof(InputDateType)} '{Mode}'.")
        };

        _parsingErrorMessage = string.IsNullOrEmpty(ParsingErrorMessage)
            ? $"The {{0}} field must be a {formatDescription}."
            : ParsingErrorMessage;
        base.OnParametersSet();
    }

    private void OnDatePicked(TValue? value)
    {
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

    protected override string FormatValueAsString(TValue? value)
        => value switch
        {
            DateTime dateTimeValue => BindConverter.FormatValue(dateTimeValue, _format, Culture),
            DateOnly dateOnlyValue => BindConverter.FormatValue(dateOnlyValue, _format, Culture),
            _ => string.Empty, // Handles null for Nullable<DateTime>, etc.
        };

    protected override bool TryParseValueFromString(string? value, [MaybeNullWhen(false)] out TValue result, [NotNullWhen(false)] out string? validationErrorMessage)
    {
        if (BindConverter.TryConvertTo(value, Culture, out result))
        {
            Debug.Assert(result != null);
            validationErrorMessage = null;
            return true;
        }
        else
        {
            validationErrorMessage = string.Format(Culture, _parsingErrorMessage, DisplayName ?? FieldIdentifier.FieldName);
            return false;
        }
    }
}