using Bluent.UI.Components;
using Bluent.UI.Services.EventArguments;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Services.Abstractions;

internal interface ITooltipService
{
    event EventHandler<RegisterTooltipEventArgs>? OnRegister;
    event EventHandler<RemoveTooltipEventArgs>? OnRemove;

    void RegisterTooltip(string elementId, RenderFragment tooltipContent, Placement placement, bool displayArrow);
    void RemoveTooltip(string elementId);
}
