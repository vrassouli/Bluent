using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class Radio<TValue>
{
    [CascadingParameter] public RadioGroup<TValue> RadioGroup { get; set; } = default!;
    [Parameter, EditorRequired] public TValue Value { get; set; } = default!;
    [Parameter] public string? Label { get; set; }

    private bool IsChecked
    {
        get
        {
            var isChecked = RadioGroup.Value?.Equals(Value) == true;

            return isChecked;
        }
    }

    protected override void OnInitialized()
    {
        if (RadioGroup == null)
            throw new InvalidOperationException($"{nameof(Radio<TValue>)} needs to be nested in a {nameof(RadioGroup)} component.");

        RadioGroup.OnValueChanged += OnValueChanged;

        base.OnInitialized();
    }

    public override ValueTask DisposeAsync()
    {
        RadioGroup.OnValueChanged -= OnValueChanged;
        return base.DisposeAsync();
    }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-radio-box";

        if (RadioGroup.ItemsLabelPosition != LabelPosition.After)
            yield return "label-before";
    }

    private void HandleOnChange(ChangeEventArgs args)
    {
        if (args.Value?.ToString()?.ToLower() == "on")
            RadioGroup.SetValue(Value);
    }

    private void OnValueChanged(object? sender, EventArgs e)
    {
        StateHasChanged();
    }


    protected Dictionary<string, object>? GetInputAdditionalAttributes()
    {
        if (AdditionalAttributes == null)
        {
            return null;
        }
        else
        {
            var dic = new Dictionary<string, object>();
            foreach (var item in AdditionalAttributes)
            {
                if (!item.Key.Equals("class", StringComparison.InvariantCultureIgnoreCase))
                    dic.Add(item.Key, item.Value);
            }

            return dic;
        }
    }

}
