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
            if (_reference is not null)
                await _reference.DisposeAsync();
        }
        catch (JSDisconnectedException)
        {
            // Expected when the circuit ends during cleanup.
        }
        finally
        {
            try
            {
                if (_module is not null)
                    await _module.DisposeAsync();
            }
            catch (JSDisconnectedException)
            {
                // Module may already be disconnected.
            }
            finally
            {
                _reference = null;
                _module = null;
            }
        }
    }

    public async Task InitializeAsync(string id)
    {
        try
        {
            var module = await GetModuleAsync();
            await module.InvokeVoidAsync("init", id);
        }
        catch (JSDisconnectedException)
        {
            // Expected if the interactive circuit closes during initialization.
            // Unexpected JavaScript failures are not silently ignored.
        }
    }

    private async Task<IJSObjectReference> GetModuleAsync()
    {
        _module ??= await _moduleTask.Value;

        _reference ??= await _module.InvokeAsync<IJSObjectReference>("OtpField.create");

        return _reference;
    }
}
