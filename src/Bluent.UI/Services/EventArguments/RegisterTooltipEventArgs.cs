using Bluent.UI.Components;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Services.EventArguments;

internal class RegisterTooltipEventArgs : EventArgs
{
    public RegisterTooltipEventArgs(string elementId, RenderFragment tooltipContent, TooltipPlacement placement, bool displayArrow)
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
