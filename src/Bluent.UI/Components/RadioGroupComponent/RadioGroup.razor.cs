using Microsoft.AspNetCore.Components;
using System.Diagnostics.CodeAnalysis;

namespace Bluent.UI.Components;

public partial class RadioGroup<TValue>
{
    private TValue? _value;

    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public string? Label { get; set; }
    [Parameter] public LabelPosition ItemsLabelPosition { get; set; } = LabelPosition.After;
    [Parameter] public Orientation Orientation { get; set; } = Orientation.Horizontal;

    internal event EventHandler? OnValueChanged;

    protected override void OnParametersSet()
    {
        if ((_value is null && Value is not null) ||
            (_value is not null && !_value.Equals(Value)))
        {
            _value = Value;
            OnValueChanged?.Invoke(this, EventArgs.Empty);
        }

        base.OnParametersSet();
    }

    protected override IEnumerable<string> GetClasses()
    {
        yield return "bui-radio-group";

        if (Orientation == Orientation.Vertical)
            yield return "vertical";
    }

    protected override bool TryParseValueFromString(string? value, [MaybeNullWhen(false)] out TValue? result, [NotNullWhen(false)] out string? validationErrorMessage)
    {
        result = Value;
        validationErrorMessage = null;

        return true;
    }

    internal void SetValue(object? value)
    {
        if (value is null)
            CurrentValue = default;

        if(value is TValue val)
            CurrentValue = val;

        OnValueChanged?.Invoke(this, EventArgs.Empty);
    }
}
