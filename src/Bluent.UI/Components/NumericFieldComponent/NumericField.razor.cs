﻿using Microsoft.AspNetCore.Components;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;

namespace Bluent.UI.Components;

public partial class NumericField<TValue>
{
    /// <summary>
    /// Gets or sets the error message used when displaying an a parsing error.
    /// </summary>
    [Parameter] public string ParsingErrorMessage { get; set; } = "The {0} field must be a number.";

    public override IEnumerable<string> GetClasses()
    {
        foreach (var c in base.GetClasses())
            yield return c;

        yield return "bui-numeric-field";
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
        // Avoiding a cast to IFormattable to avoid boxing.
        switch (value)
        {
            case null:
                return null;

            case int @int:
                return BindConverter.FormatValue(@int, CultureInfo.InvariantCulture);

            case long @long:
                return BindConverter.FormatValue(@long, CultureInfo.InvariantCulture);

            case short @short:
                return BindConverter.FormatValue(@short, CultureInfo.InvariantCulture);

            case float @float:
                return BindConverter.FormatValue(@float, CultureInfo.InvariantCulture);

            case double @double:
                return BindConverter.FormatValue(@double, CultureInfo.InvariantCulture);

            case decimal @decimal:
                return BindConverter.FormatValue(@decimal, CultureInfo.InvariantCulture);

            default:
                throw new InvalidOperationException($"Unsupported type {value.GetType()}");
        }
    }
}
