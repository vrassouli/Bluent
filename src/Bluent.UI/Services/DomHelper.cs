using Bluent.Core;
using Bluent.UI.Interops.Abstractions;
using Bluent.UI.Services.Abstractions;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace Bluent.UI.Services;

internal class DomHelper : IDomHelper, IAsyncDisposable
{
    private readonly Lazy<Task<IJSObjectReference>> _moduleTask;
    private IJSObjectReference? _module;
    private IJSObjectReference? _moduleReference;
    private readonly Dictionary<string, DotNetObjectReference<IPointerMoveEventHandler>> _pointerMoveReferences = new();
    private readonly Dictionary<string, DotNetObjectReference<IPointerUpEventHandler>> _pointerUpReferences = new();

    public DomHelper(IJSRuntime jsRuntime)
    {
        _moduleTask = new(() => jsRuntime.InvokeAsync<IJSObjectReference>("import", "./_content/Bluent.UI/bluent.ui.js").AsTask());
    }

    public async ValueTask DisposeAsync()
    {
        try
        {
            try
            {
                if (_moduleReference is not null)
                    await _moduleReference.DisposeAsync();
            }
            catch (JSDisconnectedException)
            {
                // Expected while interactive server circuits are being destroyed.
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
                    // Module can be disconnected independently of child proxy.
                }
            }
            finally
            {
                foreach (var reference in _pointerMoveReferences.Values)
                    reference.Dispose();
                foreach (var reference in _pointerUpReferences.Values)
                    reference.Dispose();
                _pointerMoveReferences.Clear();
                _pointerUpReferences.Clear();
                _moduleReference = null;
                _module = null;
            }
        }
    }

    public async Task InvokeClickEvent(string selector)
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("invokeClickEvent", selector);
    }

    public async Task InvokeClickEvent(ElementReference element)
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("invokeClickEvent", element);
    }

    public async Task DownloadAsync(string fileName, Stream stream)
    {
        var module = await GetModuleAsync();
        using var streamRef = new DotNetStreamReference(stream);
        await module.InvokeVoidAsync("downloadFileFromStream", fileName, streamRef);
    }

    public async Task RequestFullscreen(string selector)
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("requestFullscreen", selector);
    }

    public async Task ExitFullscreen()
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("exitFullscreen");
    }

    public async Task EvalVoidAsync(string script)
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("eval", script);
    }

    public async ValueTask<bool> MatchMediaAsync(string mediaQuery)
    {
        var module = await GetModuleAsync();

        return await module.InvokeAsync<bool>("matchMedia", mediaQuery);
    }

    public async ValueTask<bool> IsPwaInstalledAsync()
    {
        var module = await GetModuleAsync();

        return await module.InvokeAsync<bool>("isPwaInstalled");
    }

    public async ValueTask<bool> InstallPwaAsync()
    {
        var module = await GetModuleAsync();

        return await module.InvokeAsync<bool>("installPwa");
    }

    public async ValueTask<bool> CanInstallPwaAsync()
    {
        var module = await GetModuleAsync();

        return await module.InvokeAsync<bool>("canInstallPwa");
    }

    public async ValueTask<string> GetBrowserInfoAsync()
    {
        var module = await GetModuleAsync();

        return await module.InvokeAsync<string>("getBrowserInfo");
    }

    public async ValueTask<bool> IsMobileAsync()
    {
        var module = await GetModuleAsync();

        return await module.InvokeAsync<bool>("isMobile");
    }

    public async ValueTask<string> GetOsInfoAsync()
    {
        var module = await GetModuleAsync();

        return await module.InvokeAsync<string>("getOsInfo");
    }

    public async ValueTask<DomRect?> GetBoundingClientRectAsync(string selector)
    {
        var module = await GetModuleAsync();

        return await module.InvokeAsync<DomRect?>("getBoundingClientRect", selector);
    }

    public async Task RegisterPointerMoveHandler<THandler>(THandler handler)
        where THandler : IPointerMoveEventHandler, IBluentComponent
    {
        var reference = DotNetObjectReference.Create<IPointerMoveEventHandler>(handler);
        var transferred = false;
        try
        {
            var module = await GetModuleAsync();
            await module.InvokeVoidAsync("registerPointerMoveHandler", handler.Id, reference);
            _pointerMoveReferences.TryGetValue(handler.Id, out var previous);
            _pointerMoveReferences[handler.Id] = reference;
            transferred = true;
            previous?.Dispose();
        }
        finally
        {
            if (!transferred)
                reference.Dispose();
        }
    }

    public async Task UnregisterPointerMoveHandler<THandler>(THandler handler)
        where THandler : IPointerMoveEventHandler, IBluentComponent
    {
        try
        {
            var module = await GetModuleAsync();
            await module.InvokeVoidAsync("unregisterPointerMoveHandler", handler.Id);
        }
        finally
        {
            if (_pointerMoveReferences.Remove(handler.Id, out var reference))
                reference.Dispose();
        }
    }

    public async Task RegisterPointerUpHandler<THandler>(THandler handler)
        where THandler : IPointerUpEventHandler, IBluentComponent
    {
        var reference = DotNetObjectReference.Create<IPointerUpEventHandler>(handler);
        var transferred = false;
        try
        {
            var module = await GetModuleAsync();
            await module.InvokeVoidAsync("registerPointerUpHandler", handler.Id, reference);
            _pointerUpReferences.TryGetValue(handler.Id, out var previous);
            _pointerUpReferences[handler.Id] = reference;
            transferred = true;
            previous?.Dispose();
        }
        finally
        {
            if (!transferred)
                reference.Dispose();
        }
    }

    public async Task UnregisterPointerUpHandler<THandler>(THandler handler)
        where THandler : IPointerUpEventHandler, IBluentComponent
    {
        try
        {
            var module = await GetModuleAsync();
            await module.InvokeVoidAsync("unregisterPointerUpHandler", handler.Id);
        }
        finally
        {
            if (_pointerUpReferences.Remove(handler.Id, out var reference))
                reference.Dispose();
        }
    }

    private async Task<IJSObjectReference> GetModuleAsync()
    {
        if (_module == null)
            _module = await _moduleTask.Value;

        if (_moduleReference == null)
            _moduleReference = await _module.InvokeAsync<IJSObjectReference>("DomHelper.create");

        return _moduleReference;
    }
}
