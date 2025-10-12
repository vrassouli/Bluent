using Microsoft.JSInterop;

namespace Bluent.UI.Interops;

internal class OptFieldInterop : IAsyncDisposable
{
    private readonly Lazy<Task<IJSObjectReference>> _moduleTask;
    private IJSObjectReference? _module;
    private IJSObjectReference? _reference;

    public OptFieldInterop(IJSRuntime jsRuntime)
    {
        _moduleTask = new(() =>
            jsRuntime.InvokeAsync<IJSObjectReference>("import", "./_content/Bluent.UI/bluent.ui.js").AsTask());
    }

    public async ValueTask DisposeAsync()
    {
        try
        {
            if (_reference != null)
                await _reference.DisposeAsync();

            if (_module != null)
                await _module.DisposeAsync();
        }
        catch (Exception)
        {
            // swallow!
        }
    }

    public async Task InitializeAsync(string id)
    {
        try
        {
            var module = await GetModuleAsync();
            await module.InvokeVoidAsync("init", id);
        }
        catch (Exception)
        {
            // swallow!
        }
    }

    private async Task<IJSObjectReference> GetModuleAsync()
    {
        _module ??= await _moduleTask.Value;

        _reference ??= await _module.InvokeAsync<IJSObjectReference>("OtpField.create");

        return _reference;
    }
}