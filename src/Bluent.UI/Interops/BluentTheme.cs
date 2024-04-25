using Bluent.UI.Interops.Abstractions;
using Microsoft.JSInterop;

namespace Bluent.UI.Interops;

internal class BluentTheme : IBluentTheme, IAsyncDisposable
{
    private readonly Lazy<Task<IJSObjectReference>> _moduleTask;
        private IJSObjectReference? _module;
    public BluentTheme(IJSRuntime jsRuntime)
    {
        _moduleTask = new(() => jsRuntime.InvokeAsync<IJSObjectReference>("import", "./_content/Bluent.UI/bluent.ui.js").AsTask());
    }
    public async ValueTask DisposeAsync()
    {
        try
        {
            if (_module != null)
                await _module.DisposeAsync();
        }
        catch (Exception)
        {
            // swallow
        }
    }

    public async Task<string> GetDirectionAsync()
    {
        var module = await GetModuleAsync();
        return await module.InvokeAsync<string>("Theme.getDir");
    }

    public async void SetDirection(string dir)
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("Theme.setDir", dir);
    }

    public void SetLtrDirection() => SetDirection("ltr");

    public void SetRtlDirection() => SetDirection("rtl");


    public async Task<string> GetThemeModeAsync()
    {
        var module = await GetModuleAsync();
        return await module.InvokeAsync<string>("Theme.getThemeMode");
    }

    public async void SetThemeMode(string mode)
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("Theme.setThemeMode", mode);
    }

    public void SetDarkThemeMode() => SetThemeMode("dark");

    public void SetLightThemeMode() => SetThemeMode("light");

    private async Task<IJSObjectReference> GetModuleAsync()
    {
        if (_module == null)
            _module = await _moduleTask.Value;

        return _module;
    }

    public async void SetTheme(string theme)
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("Theme.setTheme", theme);
    }

}
