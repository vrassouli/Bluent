using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.JSInterop;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;

namespace Bluent.UI.Components;

public partial class Checkbox<TValue> : IAsyncDisposable
{
    [Inject] private IJSRuntime JsRuntime { get; set; } = default!;

    [Parameter] public string? Label { get; set; }
    [Parameter] public string? UncheckedLabel { get; set; }
    [Parameter] public string? IndeterminateLabel { get; set; }
    [Parameter] public string? Required { get; set; }
    [Parameter] public bool Circular { get; set; }
    [Parameter] public CheckboxSize Size { get; set; } = CheckboxSize.Medium;
    [Parameter] public LabelPosition LabelPosition { get; set; } = LabelPosition.After;

    private Task<IJSObjectReference>? _moduleTask;
    private IJSObjectReference? _module;
    private bool _disposed;

    private static bool SupportsIndeterminate => Nullable.GetUnderlyingType(typeof(TValue)) == typeof(bool);

    private bool? ValueAsBool
    {
        get
        {
            if (string.IsNullOrEmpty(CurrentValueAsString))
                return null;

            return bool.TryParse(CurrentValueAsString, out var currentBool)
                ? currentBool
                : null;
        }
    }

    private bool IsChecked => ValueAsBool == true;
    private bool IsNativeDisabled => HasNativeBooleanAttribute("disabled");
    private bool IsNativeRequired => HasNativeBooleanAttribute("required");
    private bool IsFieldInvalid =>
        HasNativeAriaInvalid ||
        EditContext?.GetValidationMessages(FieldIdentifier).Any() == true;

    private string InputId
    {
        get
        {
            if (AdditionalAttributes is not null)
            {
                foreach (var attribute in AdditionalAttributes)
                {
                    if (string.Equals(attribute.Key, "id", StringComparison.OrdinalIgnoreCase) &&
                        !string.IsNullOrWhiteSpace(attribute.Value?.ToString()))
                    {
                        return attribute.Value!.ToString()!;
                    }
                }
            }

            // Id always provides a stable generated id outside EditForm as well.
            return Id;
        }
    }

    private string? CurrentLabel => ValueAsBool switch
    {
        true => Label,
        false => UncheckedLabel ?? Label,
        null => IndeterminateLabel ?? Label
    };

    private string AccessibleLabelId => $"{InputId}-label";

    public Checkbox()
    {
        var type = Nullable.GetUnderlyingType(typeof(TValue)) ?? typeof(TValue);
        if (type != typeof(bool))
        {
            throw new InvalidOperationException(
                $"Unsupported {GetType()} type param '{type}'. Checkbox supports bool and bool? values only.");
        }
    }

    protected override IEnumerable<string> GetClasses()
    {
        yield return "bui-checkbox";

        if (Size == CheckboxSize.Large)
            yield return "large";

        if (LabelPosition == LabelPosition.Before)
            yield return "label-before";

        yield return ValueAsBool switch
        {
            true => "checked",
            false => "unchecked",
            null => "indeterminate"
        };

        if (IsNativeDisabled)
            yield return "disabled";

        if (Circular)
            yield return "circular";

        if (IsFieldInvalid)
            yield return "invalid";
    }

    /// <summary>
    /// Toggles the value through the InputBase binding pipeline.
    /// A nullable mixed value follows native checkbox behavior: null → true → false.
    /// </summary>
    public void Toggle()
    {
        if (IsNativeDisabled)
            return;

        TrySetValue(ValueAsBool != true);
    }

    protected void ChangeHandler(ChangeEventArgs args)
    {
        if (IsNativeDisabled || !bool.TryParse(args.Value?.ToString(), out var isChecked))
            return;

        TrySetValue(isChecked);
    }

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        await base.OnAfterRenderAsync(firstRender);

        if (!SupportsIndeterminate || Element is null || _disposed)
            return;

        try
        {
            var module = await GetModuleAsync();
            if (module is not null && !_disposed)
                await module.InvokeVoidAsync("setIndeterminate", Element.Value, ValueAsBool is null);
        }
        catch (JSDisconnectedException)
        {
            // InteractiveServer can disconnect between render and the DOM update.
        }
    }

    private Dictionary<string, object>? GetCheckboxAttributes()
    {
        var originalAttributes = GetInputAdditionalAttributes();
        var hasValidationErrors = EditContext?.GetValidationMessages(FieldIdentifier).Any() == true;
        var needsGeneratedLabelReference =
            !string.IsNullOrEmpty(Required) &&
            !string.IsNullOrEmpty(CurrentLabel) &&
            !HasCallerAccessibleName;

        if (originalAttributes is null && !hasValidationErrors && !needsGeneratedLabelReference)
            return null;

        var attributes = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);
        if (originalAttributes is not null)
        {
            foreach (var attribute in originalAttributes)
                attributes[attribute.Key] = attribute.Value;
        }

        // These values are owned by the native Checkbox contract. Do not let differently-cased
        // AdditionalAttributes create duplicate/conflicting HTML attributes or ARIA semantics.
        RemoveAttribute(attributes, "id");
        RemoveAttribute(attributes, "type");
        RemoveAttribute(attributes, "checked");
        RemoveAttribute(attributes, "value");
        RemoveAttribute(attributes, "onchange");
        RemoveAttribute(attributes, "role");
        RemoveAttribute(attributes, "aria-checked");

        if (!string.IsNullOrEmpty(Required) &&
            !string.IsNullOrEmpty(CurrentLabel) &&
            !HasCallerAccessibleName)
        {
            RemoveAttribute(attributes, "aria-labelledby");
            attributes["aria-labelledby"] = AccessibleLabelId;
        }

        NormalizeBooleanAttribute(attributes, "disabled", IsNativeDisabled);
        NormalizeBooleanAttribute(attributes, "required", IsNativeRequired);

        if (hasValidationErrors)
        {
            RemoveAttribute(attributes, "aria-invalid");
            attributes["aria-invalid"] = "true";
        }

        return attributes.Count == 0 ? null : attributes;
    }

    private bool HasNativeBooleanAttribute(string name)
    {
        if (AdditionalAttributes is null)
            return false;

        bool enabled = false;
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

            bool invalid = false;
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

    private async Task<IJSObjectReference?> GetModuleAsync()
    {
        if (_disposed)
            return null;

        _moduleTask ??= JsRuntime.InvokeAsync<IJSObjectReference>(
            "import",
            "./_content/Bluent.UI/bluent.ui.checkbox.js").AsTask();

        var module = await _moduleTask;
        if (_disposed)
        {
            await module.DisposeAsync();
            return null;
        }

        return _module ??= module;
    }

    public async ValueTask DisposeAsync()
    {
        _disposed = true;

        try
        {
            if (_module is not null)
                await _module.DisposeAsync();
        }
        catch (JSDisconnectedException)
        {
            // The browser-side module proxy is already unavailable after a disconnected circuit.
        }
        finally
        {
            _module = null;
            _moduleTask = null;
        }
    }

    protected override bool TryParseValueFromString(
        string? value,
        [MaybeNullWhen(false)] out TValue result,
        [NotNullWhen(false)] out string? validationErrorMessage)
    {
        throw new NotSupportedException(
            $"This component does not parse string inputs. Bind to the '{nameof(CurrentValue)}' property, not '{nameof(CurrentValueAsString)}'.");
    }

    private void TrySetValue(bool isChecked)
    {
        if (BindConverter.TryConvertTo(isChecked, CultureInfo.CurrentCulture, out TValue? result))
            CurrentValue = result;
    }
}
