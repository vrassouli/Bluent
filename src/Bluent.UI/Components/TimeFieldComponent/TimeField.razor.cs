using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.Extensions.Localization;
using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;

namespace Bluent.UI.Components;

public partial class TimeField<TValue>
{
    private string _parsingErrorMessage = default!;

    /// <summary>
    /// Gets or sets the error message used when displaying an a parsing error.
    /// </summary>
    [Parameter] public string ParsingErrorMessage { get; set; } = string.Empty;
    [Parameter] public bool Seconds { get; set; }
    [Parameter] public CultureInfo Culture { get; set; } = CultureInfo.CurrentUICulture;
    [Inject] private IStringLocalizer<TimeFieldComponent.Resources.TimeField> Localizer { get; set; } = default!;

    public TimeField()
    {
        var type = Nullable.GetUnderlyingType(typeof(TValue)) ?? typeof(TValue);

        if (type != typeof(TimeSpan) &&
            type != typeof(TimeOnly))
        {
            throw new InvalidOperationException($"Unsupported {GetType()} type param '{type}'.");
        }
    }

    /// <inheritdoc />
    protected override void OnParametersSet()
    {
        _parsingErrorMessage = string.IsNullOrEmpty(ParsingErrorMessage)
            ? Localizer["ParsingErrorMessage"]
            : ParsingErrorMessage;

        var currentValueAsString = FormatValueAsString(Value);
        if (currentValueAsString != CurrentValueAsString)
            CurrentValueAsString = currentValueAsString;

        base.OnParametersSet();
    }

    protected override string? FormatValueAsString(TValue? value)
    {
        if (value is null)
            return null;

        if (value is TimeOnly timeOnly)
        {
            var dt = new DateTime(timeOnly.Ticks);

            if (Seconds)
                return dt.ToString("H:m:s");

            return dt.ToString("H:m");
        }
        else if (value is TimeSpan timeSpan)
        {
            if (timeSpan.Days >= 1)
            {
                if (Seconds)
                    return timeSpan.ToString(@"d\.h\:m\:s");

                return timeSpan.ToString(@"d\.h\:m");
            }
            else
            {
                if (Seconds)
                    return timeSpan.ToString(@"h\:m\:s");

                return timeSpan.ToString(@"h\:m");
            }
        }

        return null;
    }

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

    private string GetMask()
    {
        var type = Nullable.GetUnderlyingType(typeof(TValue)) ?? typeof(TValue);

        if (type == typeof(TimeOnly))
        {
            if (Seconds)
                return @"^\d{1,2}:\d{1,2}:\d{1,2}$";

            return @"^\d{1,2}:\d{1,2}$";
        }

        if (Seconds)
            return @"^(\d{1,10}\.)?\d{1,2}:\d{1,2}:\d{1,2}$";

        return @"^(\d{1,10}\.)?\d{1,2}:\d{1,2}$";
    }
}
