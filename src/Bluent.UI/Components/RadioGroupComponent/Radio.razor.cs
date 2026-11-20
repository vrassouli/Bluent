using Microsoft.AspNetCore.Components;
using System.Globalization;

namespace Bluent.UI.Components;

public partial class Radio<TValue>
{
    [CascadingParameter] public RadioGroup<TValue> RadioGroup { get; set; } = default!;
    [Parameter, EditorRequired] public TValue Value { get; set; } = default!;
    [Parameter] public string? Label { get; set; }

    private bool IsChecked =>
        RadioGroup is not null &&
        EqualityComparer<TValue?>.Default.Equals(RadioGroup.Value, Value);

    protected override void OnInitialized()
    {
        if (RadioGroup is null)
            throw new InvalidOperationException($"{nameof(Radio<TValue>)} needs to be nested in a {nameof(RadioGroup)} component.");

        RadioGroup.OnValueChanged += OnValueChanged;

        base.OnInitialized();
    }

    public override ValueTask DisposeAsync()
    {
        if (RadioGroup is not null)
            RadioGroup.OnValueChanged -= OnValueChanged;

        return base.DisposeAsync();
    }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-radio-box";

        if (RadioGroup.ItemsLabelPosition != LabelPosition.After)
            yield return "label-before";
    }

    private string GetInputValue() =>
        Convert.ToString(Value, CultureInfo.InvariantCulture) ?? string.Empty;

    private void HandleOnChange(ChangeEventArgs _)
    {
        RadioGroup.SetValue(Value);
    }

    private void OnValueChanged(object? sender, EventArgs e)
    {
        StateHasChanged();
    }

    protected Dictionary<string, object>? GetInputAdditionalAttributes()
    {
        if (AdditionalAttributes is null && !RadioGroup.HasValidationErrors)
            return null;

        var attributes = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);

        if (AdditionalAttributes is not null)
        {
            foreach (var attribute in AdditionalAttributes)
            {
                if (attribute.Key.Equals("class", StringComparison.OrdinalIgnoreCase) ||
                    attribute.Key.Equals("type", StringComparison.OrdinalIgnoreCase) ||
                    attribute.Key.Equals("name", StringComparison.OrdinalIgnoreCase) ||
                    attribute.Key.Equals("value", StringComparison.OrdinalIgnoreCase) ||
                    attribute.Key.Equals("checked", StringComparison.OrdinalIgnoreCase) ||
                    attribute.Key.Equals("id", StringComparison.OrdinalIgnoreCase) ||
                    attribute.Key.Equals("tabindex", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                attributes[attribute.Key] = attribute.Value;
            }
        }

        if (RadioGroup.HasValidationErrors)
            attributes["aria-invalid"] = "true";

        return attributes.Count == 0 ? null : attributes;
    }
}
