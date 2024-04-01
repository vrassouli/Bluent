using Bluent.UI.Interops.Abstractions;
using Microsoft.JSInterop;

namespace Bluent.UI.Interops;

internal class TooltipService : ITooltipService
{
    private readonly Lazy<Task<IJSObjectReference>> _moduleTask;
    private IJSObjectReference? _tooltipModule;

    public TooltipService(IJSRuntime jsRuntime)
    {
        _moduleTask = new(() => jsRuntime.InvokeAsync<IJSObjectReference>("import", "./_content/Bluent.UI/bluent.ui.js").AsTask());
    }

    public async Task SetTooltip(string elementSelector, string tooltipSelector)
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("setTooltip", elementSelector, tooltipSelector);
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
