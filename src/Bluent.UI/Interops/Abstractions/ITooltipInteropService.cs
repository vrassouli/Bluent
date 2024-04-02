using Bluent.UI.Components;

namespace Bluent.UI.Interops.Abstractions;

internal interface ITooltipInteropService
{
    Task SetTooltip(string elementSelector, string tooltipSelector, TooltipPlacement placement);
}
