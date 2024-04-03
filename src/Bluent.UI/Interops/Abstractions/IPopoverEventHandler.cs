using Bluent.UI.Components;

namespace Bluent.UI.Interops.Abstractions;

internal interface IPopoverEventHandler
{
    void HideSurface(PopoverSettings settings);
    void RenderSurface(PopoverSettings settings);
}
