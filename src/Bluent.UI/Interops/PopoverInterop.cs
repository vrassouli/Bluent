using Bluent.UI.Components;
using Bluent.UI.Interops.Abstractions;
using Microsoft.JSInterop;

namespace Bluent.UI.Interops;

internal class PopoverInterop : IAsyncDisposable
{
    private readonly Lazy<Task<IJSObjectReference>> _moduleTask;
    private readonly IPopoverEventHandler _handler;
    private IJSObjectReference? _module;
    private IJSObjectReference? _popoverReference;
    private DotNetObjectReference<IPopoverEventHandler>? _handlerReference;

    private DotNetObjectReference<IPopoverEventHandler> HandlerReference
    {
        get
        {
            if (_handlerReference == null)
                _handlerReference = DotNetObjectReference.Create(_handler);

            return _handlerReference;
        }
    }

    public PopoverInterop(IPopoverEventHandler handler, IJSRuntime jsRuntime)
    {
        _handler = handler;
        _moduleTask = new(() => jsRuntime.InvokeAsync<IJSObjectReference>("import", "./_content/Bluent.UI/bluent.ui.js").AsTask());
    }

    public async ValueTask DisposeAsync()
    {
        try
        {
            try
            {
                if (_popoverReference is not null)
                {
                    try
                    {
                        // JSObjectReference.DisposeAsync frees the proxy, but
                        // DOES NOT call the JS object's own cleanup method.
                        // Detach document and trigger listeners first.
                        await _popoverReference.InvokeVoidAsync("dispose");
                    }
                    finally
                    {
                        await _popoverReference.DisposeAsync();
                    }
                }
            }
            catch (JSDisconnectedException)
            {
                // The browser connection can disappear during circuit shutdown.
            }
        }
        finally
        {
            try
            {
                try
                {
                    if (_module is not null)
                        await _module.DisposeAsync();
                }
                catch (JSDisconnectedException)
                {
                    // The module may already have disconnected.
                }
            }
            finally
            {
                _handlerReference?.Dispose();
                _handlerReference = null;
                _popoverReference = null;
                _module = null;
            }
        }
    }

    public async Task SetPopoverAsync(PopoverSettings settings)
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("setPopover", settings);
    }

    public async Task ShowSurfaceAsync(PopoverSettings settings)
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("showSurface", settings);
    }

    private async Task<IJSObjectReference> GetModuleAsync()
    {
        if (_module == null)
            _module = await _moduleTask.Value;

        if (_popoverReference == null)
            _popoverReference = await _module.InvokeAsync<IJSObjectReference>("Popover.create", HandlerReference);

        return _popoverReference;
    }
}
