using Bluent.UI.Services.Abstractions;
using Microsoft.JSInterop;

namespace Bluent.UI.Services;

internal class DomHelper : IDomHelper, IAsyncDisposable
{
    private readonly Lazy<Task<IJSObjectReference>> _moduleTask;
    private IJSObjectReference? _module;
    private IJSObjectReference? _moduleReference;

    public DomHelper(IJSRuntime jsRuntime)
    {
        _moduleTask = new(() => jsRuntime.InvokeAsync<IJSObjectReference>("import", "./_content/Bluent.UI/bluent.ui.js").AsTask());
    }

    public async ValueTask DisposeAsync()
    {
        try
        {
            if (_moduleReference != null)
                await _moduleReference.DisposeAsync();

            if (_module != null)
                await _module.DisposeAsync();
        }
        catch (Exception)
        {
            // swallow!
        }
    }

    public async void InvokeClickEvent(string selector)
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("invokeClickEvent", selector);
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

    private async Task<IJSObjectReference> GetModuleAsync()
    {
        if (_module == null)
            _module = await _moduleTask.Value;

        if (_moduleReference == null)
            _moduleReference = await _module.InvokeAsync<IJSObjectReference>("DomHelper.create");

        return _moduleReference;
    }
}
