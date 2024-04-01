namespace Bluent.UI.Interops.Abstractions;

public interface ITooltipService
{
    Task SetTooltip(string elementSelector, string tooltipSelector);
}
