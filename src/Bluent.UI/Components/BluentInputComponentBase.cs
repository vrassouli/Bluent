using Bluent.UI.Extensions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Forms;
using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Components;

public abstract class BluentInputComponentBase<TValue> : InputBase<TValue>
{
    private Guid? _id;

    [Parameter] public string? Class { get; set; }
    [Parameter] public string? Style { get; set; }

    [DisallowNull] public ElementReference? Element { get; protected set; }
    
    protected bool IsDisabled => AdditionalAttributes?.ContainsKey("disabled") == true &&
        AdditionalAttributes["disabled"] != null &&
        AdditionalAttributes["disabled"] is bool b &&
        b != false;

    /// <summary>
    /// Gets the <see cref="FieldIdentifier"/> for the bound value.
    /// </summary>
    public FieldIdentifier Field => base.FieldIdentifier;

    public string Id
    {
        get
        {
            var providedId = GetUserProvidedId();

            if (!string.IsNullOrEmpty(providedId))
                return providedId;

            _id ??= Guid.NewGuid();

            return $"_{_id}".Replace('-', '_');
        }
    }

    public string GetComponentClass() => $"{string.Join(' ', GetClasses())} {Class} {CssClass}";

    public abstract IEnumerable<string> GetClasses();

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
    }

    private string? GetUserProvidedId()
    {
        return AdditionalAttributes?.TryGetValue("id", out var attribute) is true ? attribute.ToString() : null;
    }

    protected string? GetInputId()
    {
        string? id = null;

        if (AdditionalAttributes?.ContainsKey("id") == true)
            id = AdditionalAttributes["id"]?.ToString();

        if (!string.IsNullOrEmpty(id))
            return id;

        var memberName = ValueExpression?.GetMemberName();
        return memberName;
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
