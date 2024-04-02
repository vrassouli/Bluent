using Bluent.UI.Components;
using Bluent.UI.Interops.Abstractions;
using Humanizer;
using Microsoft.JSInterop;

namespace Bluent.UI.Interops;

internal class TooltipInteropService : ITooltipInteropService
{
    private readonly Lazy<Task<IJSObjectReference>> _moduleTask;
    private IJSObjectReference? _tooltipModule;

    public TooltipInteropService(IJSRuntime jsRuntime)
    {
        _moduleTask = new(() => jsRuntime.InvokeAsync<IJSObjectReference>("import", "./_content/Bluent.UI/bluent.ui.js").AsTask());
    }

    public async Task SetTooltip(string elementSelector, string tooltipSelector, TooltipPlacement placement)
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("setTooltip", elementSelector, tooltipSelector, placement.ToString().Kebaberize());
    }

    private async Task<IJSObjectReference> GetModuleAsync()
    {
        if(_tooltipModule != null)
            return _tooltipModule;

        var module = await _moduleTask.Value;
        _tooltipModule = await module.InvokeAsync<IJSObjectReference>("Tooltip.create");

        return _tooltipModule;
    }
}
