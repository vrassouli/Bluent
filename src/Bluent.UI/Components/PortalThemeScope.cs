namespace Bluent.UI.Components;

/// <summary>
/// Experimental v3 opt-in ownership snapshot for detached Dialog/Popover.
/// No global DOM or document theme is changed.
/// </summary>
/// <remarks>
/// #418 research API; final v3 names are not approved. Existing consumers not
/// supplying the scope keep v2 behavior. Existing brand styles are still page-wide by default; the research CSS can
/// explicitly override their varying variables inside a scoped host.
/// </remarks>
public sealed record PortalThemeScope
{
    public PortalThemeScope(string mode, string direction = "ltr", string density = "comfortable", bool useV3Tokens = true, string? brand = null)
    {
        Mode = mode switch
        {
            "light" or "dark" => mode,
            _ => throw new ArgumentOutOfRangeException(nameof(mode), "Expected light or dark.")
        };
        Direction = direction switch
        {
            "ltr" or "rtl" => direction,
            _ => throw new ArgumentOutOfRangeException(nameof(direction), "Expected ltr or rtl.")
        };
        Density = density switch
        {
            "comfortable" or "compact" => density,
            _ => throw new ArgumentOutOfRangeException(nameof(density), "Expected comfortable or compact.")
        };
        if (brand != null && brand is not (
            "default" or "excel" or "office" or "outlook" or "powerapps" or
            "powerbi" or "powerpoint" or "stream" or "teams" or "word"))
            throw new ArgumentOutOfRangeException(nameof(brand), "Unknown Bluent source brand.");
        Brand = brand;
        UseV3Tokens = useV3Tokens;
    }

    public string Mode { get; }
    public string Direction { get; }
    public string Density { get; }
    public bool UseV3Tokens { get; }
    /// <summary>Optional existing source brand, if a scoped-brand CSS source is loaded.</summary>
    public string? Brand { get; }
}
