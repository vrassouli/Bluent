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
    }

    protected string GetComponentClass() => $"{string.Join(' ', GetClasses())} {Class}";
    
    protected string? GetComponentStyle()
    {
        var style = Style;

        foreach (var kv in GetStyles())
        {
            style = MergeStyle(style, kv.key, kv.value);
        }
        
        return style;
    }

    public virtual IEnumerable<string> GetClasses()
    {
        return Enumerable.Empty<string>();
    }

    public virtual IEnumerable<(string key, string value)> GetStyles()
    {
        return Enumerable.Empty<(string key, string value)>();
    }

    private string? GetUserProvidedId()
    {
        return AdditionalAttributes?.TryGetValue("id", out var attribute) is true ? attribute.ToString() : null;
    }

    private string MergeStyle(string? style, string key, string value)
    {
        var styles = style?.Split(';').ToList() ?? [];
        
        var currentStyle = styles.FirstOrDefault(s => s.StartsWith(key));
        if (currentStyle is not null)
            styles.Remove(currentStyle);
        
        styles.Add($"{key}:{value}");
        
        return string.Join(";", styles);
    }
}
