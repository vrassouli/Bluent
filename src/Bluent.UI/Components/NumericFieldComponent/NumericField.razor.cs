using Bluent.UI.Components.NumericFieldComponent.Internal;
using Bluent.UI.Components.NumericFieldComponent.Resources;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.JSInterop;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using System.Resources;

namespace Bluent.UI.Components;

public partial class NumericField<TValue> : IAsyncDisposable
{
    private static readonly ResourceManager Resources = new(
        "Bluent.UI.Components.NumericFieldComponent.Resources.NumericFieldResources",
        typeof(NumericFieldResources).Assembly);

    [Inject] private IJSRuntime JsRuntime { get; set; } = default!;

    private TValue? _minDefault;
    private TValue? _maxDefault;
    private TValue? _stepDefault;
    private TValue? _effectiveMin;
    private TValue? _effectiveMax;
    private TValue? _effectiveStep;
    private bool _minWasProvided;
    private bool _maxWasProvided;
    private bool _stepWasProvided;
    private bool _focused;
    private bool _disposed;
    private IJSObjectReference? _module;
    private IJSObjectReference? _listener;
    private Task<IJSObjectReference>? _moduleTask;
    private DotNetObjectReference<NumericFieldKeyboardCallback>? _selfReference;
    private TValue? _lastObservedValue;

    [Parameter] public string? ParsingErrorMessage { get; set; }
    [Parameter] public string? MinimumErrorMessage { get; set; }
    [Parameter] public string? MaximumErrorMessage { get; set; }
    [Parameter] public string? OverflowErrorMessage { get; set; }
    [Parameter] public bool GainFocus { get; set; }
    [Parameter] public string? Format { get; set; }
    [Parameter] public TValue? Min { get; set; }
    [Parameter] public TValue? Max { get; set; }
    [Parameter] public TValue? Step { get; set; }
    [Parameter] public EventCallback OnBlur { get; set; }
    [Parameter] public EventCallback OnFocus { get; set; }

    private string? _editingBuffer;
    private bool HasExplicitMin => _minWasProvided && Min is not null;
    private bool HasExplicitMax => _maxWasProvided && Max is not null;
    private bool IsReadOnly => HasNativeAttribute("readonly");
    private new bool IsDisabled => HasNativeAttribute("disabled");
    private bool IsInvalid => HasNativeAttribute("aria-invalid") ||
                              EditContext?.GetValidationMessages(FieldIdentifier).Any() == true;
    private string IncrementLabel => GetResource("IncreaseValue", "Increase value");
    private string DecrementLabel => GetResource("DecreaseValue", "Decrease value");
    private string? AriaInvalid => IsInvalid ? "true" : GetNativeAttribute("aria-invalid")?.ToString();
    private string? AriaValueNow => TryGetAccessibleValue(out var value) ? NumericFieldValuePipeline.FormatAriaValue(value) : null;
    // ARIA ranges describe caller-configured bounds, not the CLR type's storage limits.
    private string? AriaValueMin => HasExplicitMin ? NumericFieldValuePipeline.FormatAriaValue(Min) : null;
    private string? AriaValueMax => HasExplicitMax ? NumericFieldValuePipeline.FormatAriaValue(Max) : null;

    private string? UserValue
    {
        get => _editingBuffer ?? CurrentValueAsString;
        set
        {
            _editingBuffer = value;
            CurrentValueAsString = value;
        }
    }

    public NumericField()
    {
        if (!NumericFieldValuePipeline.IsSupportedType(typeof(TValue)))
            throw new InvalidOperationException($"NumericField does not support the value type '{typeof(TValue)}'.");

        var type = NumericFieldValuePipeline.GetUnderlyingType(typeof(TValue));
        object min;
        object max;
        if (type == typeof(sbyte)) { min = sbyte.MinValue; max = sbyte.MaxValue; }
        else if (type == typeof(byte)) { min = byte.MinValue; max = byte.MaxValue; }
        else if (type == typeof(short)) { min = short.MinValue; max = short.MaxValue; }
        else if (type == typeof(ushort)) { min = ushort.MinValue; max = ushort.MaxValue; }
        else if (type == typeof(int)) { min = int.MinValue; max = int.MaxValue; }
        else if (type == typeof(uint)) { min = uint.MinValue; max = uint.MaxValue; }
        else if (type == typeof(long)) { min = long.MinValue; max = long.MaxValue; }
        else if (type == typeof(ulong)) { min = ulong.MinValue; max = ulong.MaxValue; }
        else if (type == typeof(float)) { min = float.MinValue; max = float.MaxValue; }
        else if (type == typeof(double)) { min = double.MinValue; max = double.MaxValue; }
        else { min = decimal.MinValue; max = decimal.MaxValue; }

        _minDefault = (TValue)(object)min;
        _maxDefault = (TValue)(object)max;
        _stepDefault = (TValue)Convert.ChangeType(1, type, CultureInfo.InvariantCulture);
    }

    public override Task SetParametersAsync(ParameterView parameters)
    {
        if (parameters.TryGetValue<TValue?>(nameof(Min), out var min))
            _minWasProvided = min is not null;
        if (parameters.TryGetValue<TValue?>(nameof(Max), out var max))
            _maxWasProvided = max is not null;
        if (parameters.TryGetValue<TValue?>(nameof(Step), out var step))
            _stepWasProvided = step is not null;
        return base.SetParametersAsync(parameters);
    }

    protected override void OnParametersSet()
    {
        _effectiveMin = HasExplicitMin ? Min : _minDefault;
        _effectiveMax = HasExplicitMax ? Max : _maxDefault;
        _effectiveStep = _stepWasProvided && Step is not null ? Step : _stepDefault;
        ValidateNumericConfiguration();

        if (!_focused && !EqualityComparer<TValue?>.Default.Equals(_lastObservedValue, Value))
            _editingBuffer = null;
        _lastObservedValue = Value;
        base.OnParametersSet();
    }

    protected override IEnumerable<string> GetClasses()
    {
        foreach (var cssClass in base.GetClasses())
            yield return cssClass;
        yield return "bui-numeric-field";
        if (IsReadOnly) yield return "readonly";
        if (IsInvalid) yield return "invalid";
    }

    protected override string? FormatValueAsString(TValue? value) =>
        NumericFieldValuePipeline.Format(value, Format, CultureInfo.CurrentCulture);

    protected override bool TryParseValueFromString(
        string? value,
        [MaybeNullWhen(false)] out TValue result,
        [NotNullWhen(false)] out string? validationErrorMessage)
    {
        if (!NumericFieldValuePipeline.TryParse(value, CultureInfo.CurrentCulture, out result, out var failure))
        {
            validationErrorMessage = failure switch
            {
                NumericFieldParseFailure.Overflow or NumericFieldParseFailure.NonFinite =>
                    FormatValidationMessage(OverflowErrorMessage, "OverflowErrorMessage", "The value for {0} is outside the supported numeric range."),
                NumericFieldParseFailure.Empty =>
                    FormatValidationMessage(ParsingErrorMessage, "RequiredNumberErrorMessage", "The {0} field must contain a number."),
                _ => FormatValidationMessage(ParsingErrorMessage, "ParsingErrorMessage", "The {0} must be a number."),
            };
            return false;
        }

        if (HasExplicitMin && Min is not null && NumericFieldValuePipeline.Compare(result, Min) < 0)
        {
            validationErrorMessage = string.Format(CultureInfo.CurrentCulture,
                MinimumErrorMessage ?? GetResource("MinimumErrorMessage", "The {0} must be at least {1}."),
                DisplayName ?? FieldIdentifier.FieldName, FormatValueAsString(Min));
            return false;
        }

        if (HasExplicitMax && Max is not null && NumericFieldValuePipeline.Compare(result, Max) > 0)
        {
            validationErrorMessage = string.Format(CultureInfo.CurrentCulture,
                MaximumErrorMessage ?? GetResource("MaximumErrorMessage", "The {0} must be at most {1}."),
                DisplayName ?? FieldIdentifier.FieldName, FormatValueAsString(Max));
            return false;
        }

        validationErrorMessage = null;
        return true;
    }

    private string FormatValidationMessage(string? suppliedMessage, string resourceKey, string fallback) =>
        string.Format(CultureInfo.CurrentCulture,
            string.IsNullOrWhiteSpace(suppliedMessage) ? GetResource(resourceKey, fallback) : suppliedMessage,
            DisplayName ?? FieldIdentifier.FieldName,
            FormatValueAsString(_effectiveMin),
            FormatValueAsString(_effectiveMax));

    private static string GetResource(string key, string fallback) =>
        Resources.GetString(key, CultureInfo.CurrentUICulture) ?? fallback;

    private void ValidateNumericConfiguration()
    {
        if (HasExplicitMin && Min is not null && !NumericFieldValuePipeline.IsFinite(Min))
            throw new ArgumentOutOfRangeException(nameof(Min), "NumericField Min must be finite.");
        if (HasExplicitMax && Max is not null && !NumericFieldValuePipeline.IsFinite(Max))
            throw new ArgumentOutOfRangeException(nameof(Max), "NumericField Max must be finite.");
        if (_effectiveMin is not null && _effectiveMax is not null &&
            NumericFieldValuePipeline.Compare(_effectiveMin, _effectiveMax) > 0)
            throw new ArgumentException("NumericField Min must be less than or equal to Max.");
        if (!NumericFieldValuePipeline.IsPositiveFinite(_effectiveStep))
            throw new ArgumentOutOfRangeException(nameof(Step), "NumericField Step must be a positive finite number.");
    }

    private bool HasNativeAttribute(string name)
    {
        if (AdditionalAttributes is null) return false;
        foreach (var attribute in AdditionalAttributes)
        {
            if (!string.Equals(attribute.Key, name, StringComparison.OrdinalIgnoreCase)) continue;
            return attribute.Value switch
            {
                bool value => value,
                string value when string.Equals(value, "false", StringComparison.OrdinalIgnoreCase) => false,
                null => true,
                _ => true,
            };
        }
        return false;
    }

    private object? GetNativeAttribute(string name) =>
        AdditionalAttributes?.FirstOrDefault(attribute => string.Equals(attribute.Key, name, StringComparison.OrdinalIgnoreCase)).Value;

    private bool TryGetEditingValue(out TValue value, out bool hasValue)
    {
        hasValue = true;
        var rawValue = _editingBuffer ?? CurrentValueAsString;
        if (!NumericFieldValuePipeline.TryParse(rawValue, CultureInfo.CurrentCulture, out value, out _))
            return false;
        hasValue = value is not null;
        return true;
    }

    private bool IsWithinConfiguredRange(TValue value) =>
        (!HasExplicitMin || Min is null || NumericFieldValuePipeline.Compare(value, Min) >= 0) &&
        (!HasExplicitMax || Max is null || NumericFieldValuePipeline.Compare(value, Max) <= 0);
    private bool TryGetAccessibleValue(out object? value)
    {
        value = null;
        if (!TryGetEditingValue(out var parsed, out var hasValue) || !hasValue || !NumericFieldValuePipeline.IsFinite(parsed))
            return false;
        if (HasExplicitMin && Min is not null && NumericFieldValuePipeline.Compare(parsed, Min) < 0) return false;
        if (HasExplicitMax && Max is not null && NumericFieldValuePipeline.Compare(parsed, Max) > 0) return false;
        value = parsed;
        return true;
    }

    private bool CanStep(int direction) => TryCreateSteppedValue(direction, out _);

    private bool TryCreateSteppedValue(int direction, out TValue nextValue)
    {
        nextValue = default!;
        if (IsDisabled || IsReadOnly || !TryGetEditingValue(out var current, out var hasCurrentValue))
            return false;

        if (!NumericFieldValuePipeline.TryStep(
            current, _effectiveStep!, _effectiveMin!, _effectiveMax!, hasCurrentValue,
            HasExplicitMin, HasExplicitMax, direction, out nextValue))
            return false;

        return !hasCurrentValue || NumericFieldValuePipeline.Compare(current, nextValue) != 0;
    }
    private async Task StepAsync(int direction)
    {
        if (!TryCreateSteppedValue(direction, out var nextValue)) return;
        CurrentValue = nextValue;
        _editingBuffer = _focused ? FormatValueAsString(nextValue) : null;
        await InvokeAsync(StateHasChanged);
    }

    private async Task MoveToBoundAsync(bool moveToMinimum)
    {
        if (IsDisabled || IsReadOnly) return;
        if (moveToMinimum && HasExplicitMin && Min is not null) CurrentValue = Min;
        else if (!moveToMinimum && HasExplicitMax && Max is not null) CurrentValue = Max;
        else return;
        _editingBuffer = _focused ? FormatValueAsString(Value) : null;
        await InvokeAsync(StateHasChanged);
    }

    private Task HandleNumericFieldKeyAsync(string command) => InvokeAsync(async () =>
    {
        switch (command)
        {
            case "increment": await StepAsync(1); break;
            case "decrement": await StepAsync(-1); break;
            case "minimum": await MoveToBoundAsync(true); break;
            case "maximum": await MoveToBoundAsync(false); break;
        }
    });

    private async Task HandleFocus()
    {
        _focused = true;
        _editingBuffer ??= CurrentValueAsString ?? string.Empty;
        await OnFocus.InvokeAsync();
    }

    private async Task HandleBlur()
    {
        if (_editingBuffer is not null)
            CurrentValueAsString = _editingBuffer;

        _focused = false;
        if (TryGetEditingValue(out var parsed, out var hasValue) && (!hasValue || IsWithinConfiguredRange(parsed)))
            _editingBuffer = null;

        await OnBlur.InvokeAsync();
    }
    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender && Element is not null)
        {
            if (GainFocus) await Element.Value.FocusAsync();
            var module = await GetModuleAsync();
            if (module is not null && !_disposed)
            {
                _selfReference ??= DotNetObjectReference.Create(new NumericFieldKeyboardCallback(HandleNumericFieldKeyAsync));
                _listener = await module.InvokeAsync<IJSObjectReference>("attachNumericField", Element.Value, _selfReference);
            }
        }
        await base.OnAfterRenderAsync(firstRender);
    }

    private async Task<IJSObjectReference?> GetModuleAsync()
    {
        if (_disposed) return null;
        _moduleTask ??= JsRuntime.InvokeAsync<IJSObjectReference>("import", "./_content/Bluent.UI/bluent.ui.numeric-field.js").AsTask();
        var module = await _moduleTask;
        if (_disposed)
        {
            await module.DisposeAsync();
            return null;
        }
        return _module ??= module;
    }

    async ValueTask IAsyncDisposable.DisposeAsync()
    {
        _disposed = true;
        _selfReference?.Dispose();
        try
        {
            if (_listener is not null)
            {
                await _listener.InvokeVoidAsync("dispose");
                await _listener.DisposeAsync();
            }
            if (_module is not null) await _module.DisposeAsync();
        }
        catch (JSDisconnectedException)
        {
            // InteractiveServer circuits can disconnect before component disposal.
        }
        finally
        {
            _listener = null;
            _module = null;
            _moduleTask = null;
        }
    }
}
