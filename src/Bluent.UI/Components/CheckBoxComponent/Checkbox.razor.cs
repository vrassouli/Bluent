using Humanizer;
using Microsoft.AspNetCore.Components;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;

namespace Bluent.UI.Components;

public partial class Checkbox<TValue>
{
    [Parameter] public string? Label { get; set; }
    [Parameter] public string? UncheckedLabel { get; set; }
    [Parameter] public string? IndeterminateLabel { get; set; }
    [Parameter] public string? Required { get; set; }
    [Parameter] public bool Circular { get; set; }
    [Parameter] public CheckboxSize Size { get; set; } = CheckboxSize.Medium;
    [Parameter] public CheckboxLabelPosition LabelPosition { get; set; } = CheckboxLabelPosition.After;

    private bool? ValueAsBool
    {
        get
        {
            if (string.IsNullOrEmpty(CurrentValueAsString))
                return null;
            else
            {
                if (bool.TryParse(CurrentValueAsString, out bool _currentBool))
                    return _currentBool;
                else
                    return null;
            }
        }
    }

    public Checkbox()
    {
        var type = Nullable.GetUnderlyingType(typeof(TValue)) ?? typeof(TValue);

        if (type != typeof(bool))
        {
            throw new InvalidOperationException($"Unsupported {GetType()} type param '{type}'. Checkbox supports bool and bool? values only.");
        }

    }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-checkbox";

        if (Size != CheckboxSize.Medium)
            yield return Size.ToString().Kebaberize();

        if (LabelPosition != CheckboxLabelPosition.After)
            yield return "label-before";

        if (ValueAsBool == null)
            yield return "indeterminate";
        else if (ValueAsBool == true)
            yield return "checked";
        else
            yield return "unchecked";

        if(IsDisabled)
            yield return "disabled";

        if(Circular)
            yield return "circular";
    }

    public void Toggle()
    {
        var isChecked = ValueAsBool == true;

        TrySetValue(!isChecked);
    }

    protected override bool TryParseValueFromString(string? value, [MaybeNullWhen(false)] out TValue result, [NotNullWhen(false)] out string? validationErrorMessage)
    {
        throw new NotSupportedException($"This component does not parse string inputs. Bind to the '{nameof(CurrentValue)}' property, not '{nameof(CurrentValueAsString)}'.");
    }

    protected void ChangeHandler(ChangeEventArgs args)
    {
        if (!bool.TryParse(args.Value?.ToString(), out var isChecked))
            return;

        TrySetValue(isChecked);
    }

    private void TrySetValue(bool isChecked)
    {
        if (BindConverter.TryConvertTo(isChecked, CultureInfo.CurrentCulture, out TValue? result))
        {
            CurrentValue = result;
        }
    }
}
