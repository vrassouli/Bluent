using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components.TooltipManagerComponent;

public class TooltipConfiguration
{
    public TooltipConfiguration(string elementId, RenderFragment tooltipContent, TooltipPlacement placement, bool displayArrow)
    {
        ElementId = elementId;
        TooltipContent = tooltipContent;
        Placement = placement;
        DisplayArrow = displayArrow;
    }

    public string ElementId { get; }
    public RenderFragment TooltipContent { get; }
    public TooltipPlacement Placement { get; }
    public bool DisplayArrow { get; }
}
