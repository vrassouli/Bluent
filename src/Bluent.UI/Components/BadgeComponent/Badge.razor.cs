using Humanizer;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class Badge
{
    [Parameter] public BadgeAppearance Appearance { get; set; } = BadgeAppearance.Filled;
    [Parameter] public BadgeSize Size { get; set; } = BadgeSize.Medium;
    [Parameter] public BadgeShape Shape { get; set; } = BadgeShape.Circular;
    [Parameter] public BadgeColor Color { get; set; } = BadgeColor.Brand;
    [Parameter] public string? Icon { get; set; }
    [Parameter] public string? Text { get; set; }
    
    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-badge";
        
        yield return Appearance.ToString().ToLower();
        yield return Size.ToString().Kebaberize();
        yield return Shape.ToString().ToLower();
        yield return Color.ToString().ToLower();
    }
}