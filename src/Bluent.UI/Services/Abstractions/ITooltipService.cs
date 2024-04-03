using Bluent.UI.Components;
using Bluent.UI.Services.EventArguments;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Services.Abstractions;

internal interface ITooltipService:IPopoverService
{
    //event EventHandler<RegisterTooltipEventArgs>? OnRegister;
    //event EventHandler<DestroyTooltipEventArgs>? OnDestroy;

    //void RegisterTooltip(string elementId, RenderFragment tooltipContent, Placement placement, bool displayArrow);
    //void DestroyTooltip(string elementId);
}
