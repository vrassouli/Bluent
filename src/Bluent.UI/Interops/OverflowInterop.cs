using Microsoft.JSInterop;

namespace Bluent.UI.Interops;

internal class OverflowInterop : IAsyncDisposable
{
    private readonly Lazy<Task<IJSObjectReference>> _moduleTask;
    private IJSObjectReference? _module;
    private IJSObjectReference? _overflowReference;

    public OverflowInterop(IJSRuntime jsRuntime)
    {
        _moduleTask = new(() => jsRuntime.InvokeAsync<IJSObjectReference>("import", "./_content/Bluent.UI/bluent.ui.js").AsTask());
    }

    public async ValueTask DisposeAsync()
    {
        try
        {
            if (_overflowReference is not null)
                await _overflowReference.DisposeAsync();
        }
        catch (JSDisconnectedException)
        {
            // Expected when the Blazor circuit disconnects during teardown.
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
                // The module can already be disconnected.
            }
            finally
            {
                _overflowReference = null;
                _module = null;
            }
        }
    }

    public async Task InitAsync(string id)
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("init", id);
    }

    // Still called from a protected synchronous Overflow member. Its
    // lifecycle/consumer API transition is tracked separately under #420.
    public async void CheckOverflow()
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("checkOverflow");
    }

    private async Task<IJSObjectReference> GetModuleAsync()
    {
        if (_module == null)
            _module = await _moduleTask.Value;

        if (_overflowReference == null)
            _overflowReference = await _module.InvokeAsync<IJSObjectReference>("Overflow.create");

        return _overflowReference;
    }

}
