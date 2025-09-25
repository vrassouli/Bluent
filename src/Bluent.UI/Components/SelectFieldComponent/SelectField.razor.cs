using Bluent.UI.Extensions;
using Microsoft.AspNetCore.Components;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;

namespace Bluent.UI.Components;

public partial class SelectField<TValue>
{
    [Parameter] public RenderFragment? ChildContent { get;set; }

    private readonly bool _isMultipleSelect;

    public SelectField()
    {
        _isMultipleSelect = typeof(TValue).IsArray;
    }

    protected override IEnumerable<string> GetClasses()
    {
        foreach (var c in base.GetClasses())
            yield return c;

        yield return "bui-select-field";
    }

    private string? GetValue()
    {
        if (_isMultipleSelect)
        {
            BindConverter.FormatValue(CurrentValue)?.ToString();
        }

        return CurrentValueAsString;
    }

    private void OnValueChanged(ChangeEventArgs args)
    {
        if (_isMultipleSelect)
        {
            CurrentValue = BindConverter.TryConvertTo<TValue>(args.Value, CultureInfo.CurrentCulture, out var result)
                ? result
                : default;
        }
        else
        {
            CurrentValueAsString = args.Value?.ToString();
        }
    }
    /// <inheritdoc />
    protected override bool TryParseValueFromString(string? value, [MaybeNullWhen(false)] out TValue result, [NotNullWhen(false)] out string? validationErrorMessage)
        => this.TryParseSelectableValueFromString(value, out result, out validationErrorMessage);

    /// <inheritdoc />
    protected override string? FormatValueAsString(TValue? value)
    {
        // We special-case bool values because BindConverter reserves bool conversion for conditional attributes.
        if (typeof(TValue) == typeof(bool))
        {
            return (bool)(object)value! ? "true" : "false";
        }
        else if (typeof(TValue) == typeof(bool?))
        {
            return value is not null && (bool)(object)value ? "true" : "false";
        }

        return base.FormatValueAsString(value);
    }

    private void SetCurrentValueAsStringArray(string?[]? value)
    {
        CurrentValue = BindConverter.TryConvertTo<TValue>(value, CultureInfo.CurrentCulture, out var result)
            ? result
            : default;
    }
}
