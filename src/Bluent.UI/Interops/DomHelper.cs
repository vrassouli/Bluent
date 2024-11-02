using Microsoft.JSInterop;

namespace Bluent.UI.Interops;

public class DomHelper : IAsyncDisposable
{
    private readonly Lazy<Task<IJSObjectReference>> _moduleTask;
    private IJSObjectReference? _module;
    private IJSObjectReference? _popoverReference;

    public DomHelper(IJSRuntime jsRuntime)
    {
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

    public async void DownloadAsync(string fileName, Stream stream)
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("downloadFileFromStream", fileName, stream);
    }

    private async Task<IJSObjectReference> GetModuleAsync()
    {
        if (_module == null)
            _module = await _moduleTask.Value;

        if (_popoverReference == null)
            _popoverReference = await _module.InvokeAsync<IJSObjectReference>("DomHelper.create");

        return _popoverReference;
    }
}
