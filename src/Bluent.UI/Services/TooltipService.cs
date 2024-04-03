using Bluent.UI.Components;
using Bluent.UI.Services.Abstractions;
using Bluent.UI.Services.EventArguments;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Services;

internal class TooltipService : PopoverService, ITooltipService
{
    //public event EventHandler<RegisterTooltipEventArgs>? OnRegister;
    //public event EventHandler<DestroyTooltipEventArgs>? OnDestroy;

    //public void RegisterTooltip(string elementId, RenderFragment tooltipContent, Placement placement, bool displayArrow)
    //{
    //    OnRegister?.Invoke(this, new RegisterTooltipEventArgs(elementId, tooltipContent, placement, displayArrow));
    //}
    
    //public void DestroyTooltip(string elementId)
    //{
    //    OnDestroy?.Invoke(this, new DestroyTooltipEventArgs(elementId));
    //}
}
