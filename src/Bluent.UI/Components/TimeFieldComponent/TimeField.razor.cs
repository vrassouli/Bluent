using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Forms;
using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;

namespace Bluent.UI.Components;

public partial class TimeField<TValue>
{
    private string _parsingErrorMessage = default!;

    public TimeField()
    {
        var type = Nullable.GetUnderlyingType(typeof(TValue)) ?? typeof(TValue);

        if (type != typeof(TimeSpan) &&
            type != typeof(TimeOnly))
        {
            throw new InvalidOperationException($"Unsupported {GetType()} type param '{type}'.");
        }
    }

    /// <summary>
    /// Gets or sets the error message used when displaying an a parsing error.
    /// </summary>
    [Parameter] public string ParsingErrorMessage { get; set; } = string.Empty;
    [Parameter] public bool Seconds { get; set; }
    [Parameter] public CultureInfo Culture { get; set; } = CultureInfo.CurrentUICulture;

    /// <inheritdoc />
    protected override void OnParametersSet()
    {
        _parsingErrorMessage = string.IsNullOrEmpty(ParsingErrorMessage)
            ? $"The {{0}} is not a valid time."
            : ParsingErrorMessage;

        base.OnParametersSet();
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
            return @"^(\d{1,3}\.)?\d{1,2}:\d{1,2}:\d{1,2}$";

        return @"^(\d{1,3}\.)?\d{1,2}:\d{1,2}$";
    }
}
