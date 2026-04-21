using Bluent.Core;
using Bluent.Core.Utilities;
using Bluent.UI.Extensions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Forms;
using System.Diagnostics.CodeAnalysis;
using System.Reflection;
using Bluent.UI.Services.Abstractions;

namespace Bluent.UI.Components;

public abstract class BluentInputComponentBase<TValue> : InputBase<TValue>, IBluentComponent
{
    private string? _platform;

    [Parameter] public string? Class { get; set; }
    [Parameter] public string? Style { get; set; }
    [Inject] protected IDomHelper? DomHelper { get; set; }
    [DisallowNull] protected ElementReference? Element { get; set; }

    protected bool IsDisabled => AdditionalAttributes?.ContainsKey("disabled") == true &&
                                 AdditionalAttributes["disabled"] is true;

    /// <summary>
    /// Gets the <see cref="FieldIdentifier"/> for the bound value.
    /// </summary>
    public FieldIdentifier Field => FieldIdentifier;

    public string Id
    {
        get
        {
            var providedId = GetUserProvidedId();

            if (!string.IsNullOrEmpty(providedId))
                return providedId;

            field ??= Identifier.NewId();

            return field;
        }

        protected set;
    }

    #region InputBase Overrides

    private readonly TValue? _temp = default;

    public override Task SetParametersAsync(ParameterView parameters)
    {
        // InputBase, throws and exception if ValueExpression is null, although the field is not in a form!
        // ValueExpression, is needed for validations, when inside a form.
        // We try to bypass it, when the field is not in a form!
        if (ValueExpression is null)
        {
            ValueExpression = () => _temp!;
        }
        
        return base.SetParametersAsync(parameters);
    }

    #endregion
    
    // #region InputBase Overrides
    //
    //
    //
    // private bool _hasInitializedParameters;
    // private bool _shouldGenerateFieldNames;
    //
    // public override Task SetParametersAsync(ParameterView parameters)
    // {
    //     parameters.SetParameterProperties(this);
    //
    //     if (!_hasInitializedParameters)
    //     {
    //         // This is the first run
    //         // Could put this logic in OnInit, but its nice to avoid forcing people who override OnInit to call base.OnInit()
    //
    //         if (ValueExpression == null)
    //         {
    //             throw new InvalidOperationException($"{GetType()} requires a value for the 'ValueExpression' " +
    //                 $"parameter. Normally this is provided automatically when using 'bind-Value'.");
    //         }
    //
    //         FieldIdentifier = FieldIdentifier.Create(ValueExpression);
    //
    //         if (CascadedEditContextProxy != null)
    //         {
    //             EditContext = CascadedEditContextProxy;
    //             EditContext.OnValidationStateChanged += ValidationStateChangedHandlerProxy;
    //             _shouldGenerateFieldNames = EditContext.ShouldUseFieldIdentifiers;
    //         }
    //         else
    //         {
    //             // Ideally we'd know if we were in an SSR context but we don't
    //             _shouldGenerateFieldNames = !OperatingSystem.IsBrowser();
    //         }
    //
    //         NullableUnderlyingTypeProxy = Nullable.GetUnderlyingType(typeof(TValue));
    //         _hasInitializedParameters = true;
    //     }
    //     else if (CascadedEditContextProxy != EditContext)
    //     {
    //         // Not the first run
    //
    //         // We don't support changing EditContext because it's messy to be clearing up state and event
    //         // handlers for the previous one, and there's no strong use case. If a strong use case
    //         // emerges, we can consider changing this.
    //         throw new InvalidOperationException($"{GetType()} does not support changing the " +
    //             $"{nameof(EditContext)} dynamically.");
    //     }
    //
    //     UpdateAdditionalValidationAttributesProxy();
    //
    //     // For derived components, retain the usual lifecycle with OnInit/OnParametersSet/etc.
    //     return base.SetParametersAsync(ParameterView.Empty);
    // }
    //
    // private void OnValidateStateChanged(object? sender, ValidationStateChangedEventArgs eventArgs)
    // {
    //     UpdateAdditionalValidationAttributesProxy();
    //
    //     StateHasChanged();
    // }
    //
    // private EditContext? CascadedEditContextProxy =>
    //     GetType().GetProperty("CascadedEditContext", BindingFlags.Instance | BindingFlags.NonPublic)?.GetValue(this) as EditContext;
    //
    // private Type? NullableUnderlyingTypeProxy
    // {
    //     set
    //     {
    //         GetType().GetField("_nullableUnderlyingType", BindingFlags.Instance | BindingFlags.NonPublic)
    //             ?.SetValue(this, value);;
    //     }
    // }
    // private EventHandler<ValidationStateChangedEventArgs>? ValidationStateChangedHandlerProxy 
    // {
    //     get
    //     {
    //         var value = GetType()
    //             .GetField("_validationStateChangedHandler", BindingFlags.NonPublic | BindingFlags.Instance)?
    //             .GetValue(this) as EventHandler<ValidationStateChangedEventArgs>;
    //
    //         return value;
    //     }
    // }
    // private void UpdateAdditionalValidationAttributesProxy()
    // {
    //     var method = GetType().GetMethod("UpdateAdditionalValidationAttributes", BindingFlags.Instance | BindingFlags.NonPublic);
    //     method?.Invoke(this, null);
    // }
    //
    // #endregion

    protected string GetComponentClass() => $"{string.Join(' ', GetClasses())} {Class} {CssClass}";

    protected abstract IEnumerable<string> GetClasses();

    private string? GetUserProvidedId()
    {
        return AdditionalAttributes?.TryGetValue("id", out var attribute) is true ? attribute.ToString() : null;
    }

    protected string? GetInputId()
    {
        string? id = null;

        if (AdditionalAttributes?.TryGetValue("id", out var attribute) is true)
            id = attribute.ToString();

        if (!string.IsNullOrEmpty(id))
            return id;

        var memberName = ValueExpression?.GetMemberName();

        if (!string.IsNullOrEmpty(memberName))
            Id = memberName;

        return memberName;
    }

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender && 
            AdditionalAttributes?.GetValueOrDefault("accesskey") is not null &&
            DomHelper is not null)
        {
            _platform = await DomHelper.GetOsInfoAsync();
            StateHasChanged();
        }
        await base.OnAfterRenderAsync(firstRender);
    }

    protected Dictionary<string, object>? GetInputAdditionalAttributes()
    {
        if (AdditionalAttributes == null)
        {
            return null;
        }

        var dic = new Dictionary<string, object>();

        foreach (var item in AdditionalAttributes)
        {
            if (!item.Key.Equals("class", StringComparison.InvariantCultureIgnoreCase))
                dic[item.Key] = item.Value;
        }
        
        var placeholder = AdditionalAttributes.GetValueOrDefault("placeholder")?.ToString();
        var accesskey = AdditionalAttributes.GetValueOrDefault("accesskey")?.ToString();
        if (!string.IsNullOrEmpty(accesskey) && _platform is not null)
        {
            var holder = BuildAccessKeyPlaceholder(_platform, placeholder, accesskey);
            dic["placeholder"]= holder;
        }
        
        return dic;
    }
    
    private string BuildAccessKeyPlaceholder(string platform, string? placeholder, string accesskey)
    {
        var shortcutText = platform switch
        {
            "Windows" => $"(Alt+{accesskey.ToUpper()})",
            "macOS"     => $"(⌃ ⌥ {accesskey.ToUpper()})", // ⌃ = Control, ⌥ = Option
            "Linux"   => $"(Alt/Shift/Control+{accesskey.ToUpper()})",
            _         => $"({accesskey.ToUpper()})"
        };

        return $"{placeholder} {shortcutText}".Trim();
    }
}