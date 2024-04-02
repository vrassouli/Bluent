using Bluent.UI.Components;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Services.EventArguments;

internal class ShowPopoverEventArgs : EventArgs
{
    public ShowPopoverEventArgs(string popoverId, RenderFragment content, Placement placement, bool displayArrow)
    {
        PopoverId = popoverId;
        Content = content;
        Placement = placement;
        DisplayArrow = displayArrow;
    }

    public string PopoverId { get; }
    public RenderFragment Content { get; }
    public Placement Placement { get; }
    public bool DisplayArrow { get; }
}
