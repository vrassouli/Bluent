using Microsoft.AspNetCore.Components;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;

namespace Bluent.UI.Components;

public partial class NumericField<TValue>
{
    /// <summary>
    /// Gets or sets the error message used when displaying an a parsing error.
    /// </summary>
    [Parameter] public string ParsingErrorMessage { get; set; } = "The {0} field must be a number.";
    [Parameter] public bool GainFocus { get; set; }
    [Parameter] public string? Format { get; set; }
    //[Parameter] public bool TrimTrailingZeros { get; set; }

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

    private static string GetStepAttributeValue()
    {
        // Unwrap Nullable<T>, because InputBase already deals with the Nullable aspect
        // of it for us. We will only get asked to parse the T for nonempty inputs.
        var targetType = Nullable.GetUnderlyingType(typeof(TValue)) ?? typeof(TValue);
        if (targetType == typeof(int) ||
            targetType == typeof(long) ||
            targetType == typeof(short) ||
            targetType == typeof(float) ||
            targetType == typeof(double) ||
            targetType == typeof(decimal))
        {
            return "any";
        }
        else
        {
            throw new InvalidOperationException($"The type '{targetType}' is not a supported numeric type.");
        }
    }

    /// <inheritdoc />
    protected override bool TryParseValueFromString(string? value, [MaybeNullWhen(false)] out TValue result, [NotNullWhen(false)] out string? validationErrorMessage)
    {
        if (BindConverter.TryConvertTo<TValue>(value, CultureInfo.InvariantCulture, out result))
        {
            validationErrorMessage = null;
            return true;
        }
        else
        {
            validationErrorMessage = string.Format(CultureInfo.InvariantCulture, ParsingErrorMessage, DisplayName ?? FieldIdentifier.FieldName);
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
        string? valueString = null;

        valueString = value switch
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


        //// Avoiding a cast to IFormattable to avoid boxing.
        //valueString = value switch
        //{
        //    null => null,
        //    int @int => BindConverter.FormatValue(@int, CultureInfo.InvariantCulture),
        //    long @long => BindConverter.FormatValue(@long, CultureInfo.InvariantCulture),
        //    short @short => BindConverter.FormatValue(@short, CultureInfo.InvariantCulture),
        //    float @float => BindConverter.FormatValue(@float, CultureInfo.InvariantCulture),
        //    double @double => BindConverter.FormatValue(@double, CultureInfo.InvariantCulture),
        //    decimal @decimal => BindConverter.FormatValue(@decimal, CultureInfo.InvariantCulture),
        //    _ => throw new InvalidOperationException($"Unsupported type {value.GetType()}")
        //};

        //if (TrimTrailingZeros && valueString != null)
        //{
        //    // Trim trailing zeroes and decimal point if necessary
        //    valueString = valueString.TrimEnd('0').TrimEnd('.');
        //}

        return valueString;
    }
}
