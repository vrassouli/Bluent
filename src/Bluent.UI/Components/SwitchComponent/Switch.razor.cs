using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Forms;
using System.Globalization;
using System.Diagnostics.CodeAnalysis;

namespace Bluent.UI.Components;

public partial class Switch
{
    [Parameter] public string? Label { get; set; }
    [Parameter] public string? Required { get; set; }
    [Parameter] public SwitchLabelPosition LabelPosition { get; set; } = SwitchLabelPosition.After;

    private string InputId
    {
        get
        {
            if (TryGetAttributeValue("id", out var suppliedId) &&
                !string.IsNullOrWhiteSpace(suppliedId?.ToString()))
            {
                return suppliedId!.ToString()!;
            }

            // Unlike GetInputId(), Id always provides a stable generated value outside EditForm.
            return Id;
        }
    }

    private string AccessibleLabelId => $"{InputId}-label";
    private bool IsNativeDisabled => HasNativeBooleanAttribute("disabled");
    private bool IsNativeRequired => HasNativeBooleanAttribute("required");
    private bool IsNativeAriaInvalid => HasNativeAriaInvalid;
    private bool HasValidationErrors => EditContext?.GetValidationMessages(FieldIdentifier).Any() == true;
    private bool IsInvalid => IsNativeAriaInvalid || HasValidationErrors;

    protected override void OnParametersSet()
    {
        base.OnParametersSet();

        if (string.IsNullOrWhiteSpace(Label) && !HasCallerAccessibleName)
        {
            throw new InvalidOperationException(
                $"{nameof(Switch)} requires a visible {nameof(Label)} or a non-empty aria-label/aria-labelledby attribute.");
        }
    }

    protected override IEnumerable<string> GetClasses()
    {
        yield return "bui-switch";
        yield return LabelPosition switch
        {
            SwitchLabelPosition.Before => "label-before",
            SwitchLabelPosition.Above => "label-above",
            _ => "label-after"
        };

        yield return CurrentValue ? "checked" : "unchecked";

        if (IsNativeDisabled)
            yield return "disabled";

        if (IsInvalid)
            yield return "invalid";
    }

    private Dictionary<string, object> GetSwitchAttributes()
    {
        var originalAttributes = GetInputAdditionalAttributes();
        var attributes = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);

        if (originalAttributes is not null)
        {
            foreach (var attribute in originalAttributes)
                attributes[attribute.Key] = attribute.Value;
        }

        // The component owns these native and ARIA semantics. Caller-supplied aliases
        // (including differently-cased names) must not create conflicting state.
        RemoveAttribute(attributes, "id");
        RemoveAttribute(attributes, "type");
        RemoveAttribute(attributes, "checked");
        RemoveAttribute(attributes, "value");
        RemoveAttribute(attributes, "name");
        RemoveAttribute(attributes, "onchange");
        RemoveAttribute(attributes, "role");
        RemoveAttribute(attributes, "aria-checked");

        NormalizeBooleanAttribute(attributes, "disabled", IsNativeDisabled);
        NormalizeBooleanAttribute(attributes, "required", IsNativeRequired);

        if (HasValidationErrors)
        {
            RemoveAttribute(attributes, "aria-invalid");
            attributes["aria-invalid"] = "true";
        }

        return attributes;
    }

    private bool HasNativeBooleanAttribute(string name)
    {
        if (AdditionalAttributes is null)
            return false;

        var enabled = false;
        foreach (var attribute in AdditionalAttributes)
        {
            if (!string.Equals(attribute.Key, name, StringComparison.OrdinalIgnoreCase))
                continue;

            enabled = attribute.Value switch
            {
                bool value => value,
                null => false,
                string value when string.Equals(value, "false", StringComparison.OrdinalIgnoreCase) => false,
                _ => true
            };
        }

        return enabled;
    }

    private bool HasCallerAccessibleName =>
        AdditionalAttributes is not null &&
        AdditionalAttributes.Any(attribute =>
            (string.Equals(attribute.Key, "aria-label", StringComparison.OrdinalIgnoreCase) ||
             string.Equals(attribute.Key, "aria-labelledby", StringComparison.OrdinalIgnoreCase)) &&
            !string.IsNullOrWhiteSpace(attribute.Value?.ToString()));

    private bool HasNativeAriaInvalid
    {
        get
        {
            if (AdditionalAttributes is null)
                return false;

            var invalid = false;
            foreach (var attribute in AdditionalAttributes)
            {
                if (!string.Equals(attribute.Key, "aria-invalid", StringComparison.OrdinalIgnoreCase))
                    continue;

                invalid = attribute.Value switch
                {
                    bool value => value,
                    null => false,
                    string value when string.Equals(value, "false", StringComparison.OrdinalIgnoreCase) => false,
                    string value when string.IsNullOrWhiteSpace(value) => false,
                    _ => true
                };
            }

            return invalid;
        }
    }

    private bool TryGetAttributeValue(string name, out object? value)
    {
        if (AdditionalAttributes is not null)
        {
            foreach (var attribute in AdditionalAttributes)
            {
                if (string.Equals(attribute.Key, name, StringComparison.OrdinalIgnoreCase))
                {
                    value = attribute.Value;
                    return true;
                }
            }
        }

        value = null;
        return false;
    }

    private static void NormalizeBooleanAttribute(
        Dictionary<string, object> attributes,
        string name,
        bool enabled)
    {
        RemoveAttribute(attributes, name);
        if (enabled)
            attributes[name] = true;
    }

    private static void RemoveAttribute(Dictionary<string, object> attributes, string name)
    {
        foreach (var key in attributes.Keys
                     .Where(key => string.Equals(key, name, StringComparison.OrdinalIgnoreCase))
                     .ToArray())
        {
            attributes.Remove(key);
        }
    }

    private void ChangeHandler(ChangeEventArgs args)
    {
        if (IsNativeDisabled || !bool.TryParse(Convert.ToString(args.Value, CultureInfo.InvariantCulture), out var isChecked))
            return;

        CurrentValue = isChecked;
    }
    protected override bool TryParseValueFromString(
        string? value,
        [MaybeNullWhen(false)] out bool result,
        [NotNullWhen(false)] out string? validationErrorMessage)
    {
        throw new NotSupportedException(
            $"This component does not parse string inputs. Bind to the '{nameof(CurrentValue)}' property, not '{nameof(CurrentValueAsString)}'.");
    }
}
