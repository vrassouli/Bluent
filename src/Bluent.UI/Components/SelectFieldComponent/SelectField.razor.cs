using Bluent.UI.Extensions;
using Microsoft.AspNetCore.Components;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;

namespace Bluent.UI.Components;

public partial class SelectField<TValue>
{
    [Parameter] public RenderFragment? ChildContent { get; set; }

    private readonly bool _isMultipleSelect = typeof(TValue).IsArray;

    protected override IEnumerable<string> GetClasses()
    {
        foreach (var c in base.GetClasses())
            yield return c;

        yield return "bui-select-field";
    }

    // HTML multiple-select events provide the selected values as string[] even
    // when TValue is an array of another supported scalar type (for example int[]).
    // This mirrors InputSelect's typed array conversion without widening our API.
    private string?[]? CurrentValueAsStringArray
    {
        get
        {
            if (CurrentValue is not Array values)
                return [];

            return values
                .Cast<object?>()
                .Select(FormatValueAsStringForArray)
                .ToArray();
        }
        set
        {
            if (typeof(TValue) == typeof(bool[]))
            {
                var parsedValues = new bool[value?.Length ?? 0];
                for (var index = 0; index < parsedValues.Length; index++)
                {
                    if (!bool.TryParse(value![index], out parsedValues[index]))
                    {
                        CurrentValue = default;
                        return;
                    }
                }

                CurrentValue = (TValue)(object)parsedValues;
                return;
            }

            if (typeof(TValue) == typeof(bool?[]))
            {
                var parsedValues = new bool?[value?.Length ?? 0];
                for (var index = 0; index < parsedValues.Length; index++)
                {
                    var item = value![index];
                    if (string.IsNullOrEmpty(item))
                        continue;

                    if (!bool.TryParse(item, out var parsed))
                    {
                        CurrentValue = default;
                        return;
                    }

                    parsedValues[index] = parsed;
                }

                CurrentValue = (TValue)(object)parsedValues;
                return;
            }

            CurrentValue = BindConverter.TryConvertTo<TValue>(
                value, CultureInfo.CurrentCulture, out var parsedValue)
                ? parsedValue
                : default;
        }
    }

    private static string? FormatValueAsStringForArray(object? value)
    {
        // BindConverter treats bool as a conditional attribute; keep the option
        // string representation identical to the scalar InputSelect contract.
        if (value is bool boolean)
            return boolean ? "true" : "false";

        return value is null ? null : Convert.ToString(value, CultureInfo.CurrentCulture);
    }
    protected override bool TryParseValueFromString(
        string? value,
        [MaybeNullWhen(false)] out TValue result,
        [NotNullWhen(false)] out string? validationErrorMessage)
        => this.TryParseSelectableValueFromString(value, out result, out validationErrorMessage);

    protected override string? FormatValueAsString(TValue? value)
    {
        if (typeof(TValue) == typeof(bool))
            return (bool)(object)value! ? "true" : "false";

        if (typeof(TValue) == typeof(bool?))
            return value is not null && (bool)(object)value ? "true" : "false";

        return base.FormatValueAsString(value);
    }
}
