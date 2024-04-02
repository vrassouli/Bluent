using Bluent.UI.Components;
using Bluent.UI.Services.Abstractions;
using Bluent.UI.Services.EventArguments;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Services;

internal class PopoverService : IPopoverService
{
    public event EventHandler<ShowPopoverEventArgs>? ShowPopover;

    public void Show(string popoverId, RenderFragment content, Placement placement, bool displayArrow)
    {
        ShowPopover?.Invoke(this, new ShowPopoverEventArgs(popoverId, content, placement, displayArrow));
    }
}
