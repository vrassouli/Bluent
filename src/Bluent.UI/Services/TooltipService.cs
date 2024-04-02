using Bluent.UI.Components;
using Bluent.UI.Services.Abstractions;
using Bluent.UI.Services.EventArguments;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Services;

internal class TooltipService : ITooltipService
{
    public event EventHandler<RegisterTooltipEventArgs>? OnRegister;
    public event EventHandler<RemoveTooltipEventArgs>? OnRemove;

    public void RegisterTooltip(string elementId, RenderFragment tooltipContent, TooltipPlacement placement, bool displayArrow)
    {
        OnRegister?.Invoke(this, new RegisterTooltipEventArgs(elementId, tooltipContent, placement, displayArrow));
    }
    
    public void RemoveTooltip(string elementId)
    {
        OnRemove?.Invoke(this, new RemoveTooltipEventArgs(elementId));
    }
}
