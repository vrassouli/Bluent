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
    [DisallowNull] public ElementReference? Element { get; set; }

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
    
    protected string GetComponentClass() => $"{string.Join(' ', GetClasses())} {Class} {CssClass}";

    protected abstract IEnumerable<string> GetClasses();

    private string? GetUserProvidedId()
    {
        return AdditionalAttributes?.TryGetValue("id", out var attribute) is true && attribute != null! ? attribute.ToString() : null;
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