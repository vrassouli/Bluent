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
        if (_overflowReference != null)
            await _overflowReference.DisposeAsync();

        if (_module != null)
            await _module.DisposeAsync();

    }

    public async void Init(string id)
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("init", id);
    }

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
