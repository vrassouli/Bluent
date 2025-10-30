using Microsoft.AspNetCore.Components;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;

namespace Bluent.UI.Components;

public partial class NumericField<TValue>
{
    private string? _userValue;

    /// <summary>
    /// Gets or sets the error message used when displaying a parsing error.
    /// </summary>
    [Parameter]
    public string ParsingErrorMessage { get; set; } = "The {0} field must be a number.";

    [Parameter] public string MinimumErrorMessage { get; set; } = "The {0} field must be greater than {1}.";
    [Parameter] public string MaximumErrorMessage { get; set; } = "The {0} field must be less than {1}.";
    [Parameter] public bool GainFocus { get; set; }
    [Parameter] public string? Format { get; set; }
    [Parameter] public TValue? Min { get; set; }
    [Parameter] public TValue? Max { get; set; }

    private string? UserValue
    {
        get
        {
            if (_userValue is null)
                return CurrentValueAsString;

            return _userValue;
        }
        set
        {
            _userValue = value;
            CurrentValueAsString = value;
        }
    }

    protected override IEnumerable<string> GetClasses()
    {
        foreach (var c in base.GetClasses())
            yield return c;

        yield return "bui-numeric-field";
    }

    protected override Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender && GainFocus && Element != null)
        {
            InvokeAsync(() => Element.Value.FocusAsync());
        }

        return base.OnAfterRenderAsync(firstRender);
    }

    // private static string GetStepAttributeValue()
    // {
    //     // Unwrap Nullable<T>, because InputBase already deals with the Nullable aspect
    //     // of it for us. We will only get asked to parse the T for nonempty inputs.
    //     var targetType = Nullable.GetUnderlyingType(typeof(TValue)) ?? typeof(TValue);
    //     if (targetType == typeof(int) ||
    //         targetType == typeof(long) ||
    //         targetType == typeof(short) ||
    //         targetType == typeof(float) ||
    //         targetType == typeof(double) ||
    //         targetType == typeof(decimal))
    //     {
    //         return "any";
    //     }
    //     else
    //     {
    //         throw new InvalidOperationException($"The type '{targetType}' is not a supported numeric type.");
    //     }
    // }

    /// <inheritdoc />
    protected override bool TryParseValueFromString(string? value, [MaybeNullWhen(false)] out TValue result,
        [NotNullWhen(false)] out string? validationErrorMessage)
    {
        if (BindConverter.TryConvertTo<TValue>(value, CultureInfo.InvariantCulture, out var tempResult))
        {
            validationErrorMessage = null;

            // Check minimum
            if (Min is not null && Comparer<TValue>.Default.Compare(tempResult, Min) < 0)
            {
                validationErrorMessage = string.Format(CultureInfo.InvariantCulture, MinimumErrorMessage,
                    DisplayName ?? FieldIdentifier.FieldName, Min);
                result = default!;
                return false;
            }

            // Check maximum
            if (Max is not null && Comparer<TValue>.Default.Compare(tempResult, Max) > 0)
            {
                validationErrorMessage = string.Format(CultureInfo.InvariantCulture, MaximumErrorMessage,
                    DisplayName ?? FieldIdentifier.FieldName, Max);
                result = default!;
                return false;
            }

            result = tempResult;
            return true;
        }
        else
        {
            validationErrorMessage = string.Format(CultureInfo.InvariantCulture, ParsingErrorMessage,
                DisplayName ?? FieldIdentifier.FieldName);
            result = default!;

            return false;
        }
    }


    /// <summary>
    /// Formats the value as a string. Derived classes can override this to determine the formatting used for <c>CurrentValueAsString</c>.
    /// </summary>
    /// <param name="value">The value to format.</param>
    /// <returns>A string representation of the value.</returns>
    protected override string? FormatValueAsString(TValue? value)
    {
        var valueString = value switch
        {
            null => null,
            int v => v.ToString(Format, CultureInfo.CurrentUICulture),
            long v => v.ToString(Format, CultureInfo.CurrentUICulture),
            short v => v.ToString(Format, CultureInfo.CurrentUICulture),
            float v => v.ToString(Format, CultureInfo.CurrentUICulture),
            double v => v.ToString(Format, CultureInfo.CurrentUICulture),
            decimal v => v.ToString(Format, CultureInfo.CurrentUICulture),
            _ => throw new InvalidOperationException($"Unsupported type {value.GetType()}")
        };

        return valueString;
    }
}