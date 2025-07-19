using Bluent.Core.Utilities;
using Microsoft.AspNetCore.Components;

namespace Bluent.Core;

public abstract class BluentComponentBase : ComponentBase, IBluentComponent
{
    private string? _id;
    [Parameter(CaptureUnmatchedValues = true)] public Dictionary<string, object>? AdditionalAttributes { get; set; }
    [Parameter] public string? Class { get; set; }
    [Parameter] public string? Style { get; set; }

    public string Id
    {
        get
        {
            var providedId = GetUserProvidedId();

            if (!string.IsNullOrEmpty(providedId))
                return providedId;

            _id ??= Identifier.NewId();

            return _id;
        }

        protected set { _id = value; }
    }
    public string GetComponentClass() => $"{string.Join(' ', GetClasses())} {Class}";

    public virtual IEnumerable<string> GetClasses()
    {
        return Enumerable.Empty<string>();
    }

    private string? GetUserProvidedId()
    {
        return AdditionalAttributes?.TryGetValue("id", out var attribute) is true ? attribute.ToString() : null;
    }
}
