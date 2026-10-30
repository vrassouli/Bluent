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
    private Task<IJSObjectReference>? _popoverReferenceTask;
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
            if (_popoverReference != null)
                await _popoverReference.DisposeAsync();

            if (_module != null)
                await _module.DisposeAsync();

            if (_handlerReference != null)
                _handlerReference.Dispose();
        }
        catch (Exception)
        {
            // swallow!
        }
    }

    public async void SetPopover(PopoverSettings settings)
    {
        try
        {
            var module = await GetModuleAsync();
            await module.InvokeVoidAsync("setPopover", settings);
        }
        catch
        {
            // swallow!
        }
    }

    // #418 draft: only owners that explicitly opted into document Escape
    // listeners need JS cleanup on Blazor component removal/navigation.
    public async Task UnregisterOptInEscapeAsync(string triggerId)
    {
        if (_popoverReference is null)
            return;
        try
        {
            await _popoverReference.InvokeVoidAsync("unregisterOptInEscapeByTriggerId", triggerId);
        }
        catch (JSDisconnectedException) { }
        catch (ObjectDisposedException) { }
    }
    public async void ShowSurface(PopoverSettings settings)
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("showSurface", settings);
    }

    public async Task ShowSurfaceAsync(PopoverSettings settings)
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("showSurface", settings);
    }

    public async void HideSurface(PopoverSettings settings, bool restoreFocus = false)
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("hideSurface", settings, restoreFocus);
    }

    public async Task HideSurfaceAsync(PopoverSettings settings, bool restoreFocus = false)
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("hideSurface", settings, restoreFocus);
    }
    private async Task<IJSObjectReference> GetModuleAsync()
    {
        if (_module == null)
            _module = await _moduleTask.Value;

        // These async-void handlers can arrive concurrently during the first render.
        // Share the create task so SetPopover, ShowSurface and HideSurface use one JS instance.
        if (_popoverReferenceTask == null)
            _popoverReferenceTask = _module.InvokeAsync<IJSObjectReference>("Popover.create", HandlerReference).AsTask();

        try
        {
            _popoverReference = await _popoverReferenceTask;
            return _popoverReference;
        }
        catch
        {
            _popoverReferenceTask = null;
            throw;
        }
    }
}
