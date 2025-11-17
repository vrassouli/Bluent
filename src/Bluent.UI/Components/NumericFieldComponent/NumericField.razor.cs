using Microsoft.AspNetCore.Components;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;

namespace Bluent.UI.Components;

public partial class NumericField<TValue>
{
    private string? _userValue;
    private TValue? _step;
    private TValue? _max;
    private TValue? _min;
    private readonly TValue? _minDefault;
    private readonly TValue? _maxDefault;
    private readonly TValue? _stepDefault;
    private bool _maxHasValue;
    private bool _minHasValue;
    private bool _stepHasValue;
    private bool _focused;

    /// <summary>
    /// Gets or sets the error message used when displaying a parsing error.
    /// </summary>
    [Parameter]
    public string ParsingErrorMessage { get; set; } = "The {0} must be a number.";

    [Parameter] public string MinimumErrorMessage { get; set; } = "The {0} must be greater than {1}.";
    [Parameter] public string MaximumErrorMessage { get; set; } = "The {0} must be less than {1}.";
    [Parameter] public string OverflowErrorMessage { get; set; } = "The value for {0} must be between {1} and {2}.";
    [Parameter] public bool GainFocus { get; set; }
    [Parameter] public string? Format { get; set; }
    [Parameter] public TValue? Min { get; set; }
    [Parameter] public TValue? Max { get; set; }
    [Parameter] public TValue? Step { get; set; }
    [Parameter] public EventCallback OnBlur { get; set; }
    [Parameter] public EventCallback OnFocus { get; set; }

    private string? UserValue
    {
        get
        {
            if (!_focused || _userValue is null)
                return CurrentValueAsString;

            return _userValue;
        }
        set
        {
            _userValue = value;
            CurrentValueAsString = value;
        }
    }

    public NumericField()
    {
        #region parameters default depending on TValue

        //sbyte
        if (typeof(TValue) == typeof(sbyte) || typeof(TValue) == typeof(sbyte?))
        {
            _minDefault = (TValue)(object)sbyte.MinValue;
            _maxDefault = (TValue)(object)sbyte.MaxValue;
            _stepDefault = (TValue)(object)(sbyte)1;
        }
        // byte
        else if (typeof(TValue) == typeof(byte) || typeof(TValue) == typeof(byte?))
        {
            _minDefault = (TValue)(object)byte.MinValue;
            _maxDefault = (TValue)(object)byte.MaxValue;
            _stepDefault = (TValue)(object)(byte)1;
        }
        // short
        else if (typeof(TValue) == typeof(short) || typeof(TValue) == typeof(short?))
        {
            _minDefault = (TValue)(object)short.MinValue;
            _maxDefault = (TValue)(object)short.MaxValue;
            _stepDefault = (TValue)(object)(short)1;
        }
        // ushort
        else if (typeof(TValue) == typeof(ushort) || typeof(TValue) == typeof(ushort?))
        {
            _minDefault = (TValue)(object)ushort.MinValue;
            _maxDefault = (TValue)(object)ushort.MaxValue;
            _stepDefault = (TValue)(object)(ushort)1;
        }
        // int
        else if (typeof(TValue) == typeof(int) || typeof(TValue) == typeof(int?))
        {
            _minDefault = (TValue)(object)int.MinValue;
            _maxDefault = (TValue)(object)int.MaxValue;
            _stepDefault = (TValue)(object)1;
        }
        // uint
        else if (typeof(TValue) == typeof(uint) || typeof(TValue) == typeof(uint?))
        {
            _minDefault = (TValue)(object)uint.MinValue;
            _maxDefault = (TValue)(object)uint.MaxValue;
            _stepDefault = (TValue)(object)1u;
        }
        // long
        else if (typeof(TValue) == typeof(long) || typeof(TValue) == typeof(long?))
        {
            _minDefault = (TValue)(object)long.MinValue;
            _maxDefault = (TValue)(object)long.MaxValue;
            _stepDefault = (TValue)(object)1L;
        }
        // ulong
        else if (typeof(TValue) == typeof(ulong) || typeof(TValue) == typeof(ulong?))
        {
            _minDefault = (TValue)(object)ulong.MinValue;
            _maxDefault = (TValue)(object)ulong.MaxValue;
            _stepDefault = (TValue)(object)1ul;
        }
        // float
        else if (typeof(TValue) == typeof(float) || typeof(TValue) == typeof(float?))
        {
            _minDefault = (TValue)(object)float.MinValue;
            _maxDefault = (TValue)(object)float.MaxValue;
            _stepDefault = (TValue)(object)1.0f;
        }
        // double
        else if (typeof(TValue) == typeof(double) || typeof(TValue) == typeof(double?))
        {
            _minDefault = (TValue)(object)double.MinValue;
            _maxDefault = (TValue)(object)double.MaxValue;
            _stepDefault = (TValue)(object)1.0;
        }
        // decimal
        else if (typeof(TValue) == typeof(decimal) || typeof(TValue) == typeof(decimal?))
        {
            _minDefault = (TValue)(object)decimal.MinValue;
            _maxDefault = (TValue)(object)decimal.MaxValue;
            _stepDefault = (TValue)(object)1M;
        }

        #endregion parameters default depending on T
    }

    public override Task SetParametersAsync(ParameterView parameters)
    {
        // Check which parameters were set by the user
        if (parameters.TryGetValue<TValue?>(nameof(Min), out _))
            _minHasValue = true;

        if (parameters.TryGetValue<TValue?>(nameof(Max), out _))
            _maxHasValue = true;

        if (parameters.TryGetValue<TValue?>(nameof(Step), out _))
            _stepHasValue = true;
        
        return base.SetParametersAsync(parameters);
    }

    protected override void OnParametersSet()
    {
        _min = _minHasValue ? Min : _minDefault;
        _max = _maxHasValue ? Max : _maxDefault;
        _step = _stepHasValue ? Step : _stepDefault;

        base.OnParametersSet();
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

    /// <inheritdoc />
    protected override bool TryParseValueFromString(string? value, [MaybeNullWhen(false)] out TValue result,
        [NotNullWhen(false)] out string? validationErrorMessage)
    {
        result = default!;

        try
        {
            if (BindConverter.TryConvertTo<TValue>(value, CultureInfo.InvariantCulture, out var tempResult))
            {
                validationErrorMessage = null;

                // Check minimum
                if (Min is not null && Comparer<TValue>.Default.Compare(tempResult, _min) < 0)
                {
                    validationErrorMessage = string.Format(CultureInfo.InvariantCulture, MinimumErrorMessage,
                        DisplayName ?? FieldIdentifier.FieldName, _min);
                    return false;
                }

                // Check maximum
                if (Max is not null && Comparer<TValue>.Default.Compare(tempResult, _max) > 0)
                {
                    validationErrorMessage = string.Format(CultureInfo.InvariantCulture, MaximumErrorMessage,
                        DisplayName ?? FieldIdentifier.FieldName, _max);
                    return false;
                }

                result = tempResult;
                return true;
            }
            else
            {
                validationErrorMessage = string.Format(CultureInfo.InvariantCulture, ParsingErrorMessage,
                    DisplayName ?? FieldIdentifier.FieldName);

                return false;
            }
        }
        catch (OverflowException)
        {
            validationErrorMessage = string.Format(CultureInfo.InvariantCulture, OverflowErrorMessage,
                DisplayName ?? FieldIdentifier.FieldName, _min, _max);

            return false;
        }
        catch (ArgumentException e) when(e.InnerException is OverflowException)
        {
            validationErrorMessage = string.Format(CultureInfo.InvariantCulture, OverflowErrorMessage,
                DisplayName ?? FieldIdentifier.FieldName, _min, _max);

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
            byte v => v.ToString(Format, CultureInfo.CurrentUICulture),
            sbyte v => v.ToString(Format, CultureInfo.CurrentUICulture),
            short v => v.ToString(Format, CultureInfo.CurrentUICulture),
            ushort v => v.ToString(Format, CultureInfo.CurrentUICulture),
            int v => v.ToString(Format, CultureInfo.CurrentUICulture),
            uint v => v.ToString(Format, CultureInfo.CurrentUICulture),
            long v => v.ToString(Format, CultureInfo.CurrentUICulture),
            ulong v => v.ToString(Format, CultureInfo.CurrentUICulture),
            float v => v.ToString(Format, CultureInfo.CurrentUICulture),
            double v => v.ToString(Format, CultureInfo.CurrentUICulture),
            decimal v => v.ToString(Format, CultureInfo.CurrentUICulture),
            _ => throw new InvalidOperationException($"Unsupported type {value.GetType()}")
        };

        return valueString;
    }
    
    private async Task HandleFocus()
    {
        _focused = true;
        
        await OnFocus.InvokeAsync();
    }

    private async Task HandleBlur()
    {
        _focused = false;
        _userValue = null;
        
        await OnBlur.InvokeAsync();
    }
}