using Bluent.UI.Interops.Abstractions;
using Microsoft.JSInterop;

namespace Bluent.UI.Interops;

internal class DataGridInterop :  IAsyncDisposable
{
    private readonly IDataGridEventHandler _handler;
    private readonly Lazy<Task<IJSObjectReference>> _moduleTask;
    private IJSObjectReference? _module;
    private IJSObjectReference? _reference;
    private DotNetObjectReference<IDataGridEventHandler>? _handlerReference;

    private DotNetObjectReference<IDataGridEventHandler> HandlerReference
    {
        get
        {
            if (_handlerReference == null)
                _handlerReference = DotNetObjectReference.Create(_handler);

            return _handlerReference;
        }
    }

    public DataGridInterop(IDataGridEventHandler handler, IJSRuntime jsRuntime)
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
                if (_reference is not null)
                    await _reference.DisposeAsync();
            }
            catch (JSDisconnectedException)
            {
                // Circuit disconnection during teardown is expected.
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
                    // The imported JS module may already be disconnected.
                }
            }
            finally
            {
                _handlerReference?.Dispose();
                _handlerReference = null;
                _reference = null;
                _module = null;
            }
        }
    }

    public async Task Initialize()
    {
        try
        {
            // Creating the proxy registers this DataGrid's managed callback.
            await GetModuleAsync();
        }
        catch (JSDisconnectedException)
        {
            // The interactive server circuit may have disconnected.
            // Unexpected import/JS failures must remain observable.
        }
    }

    private async Task<IJSObjectReference> GetModuleAsync()
    {
        if (_module == null)
            _module = await _moduleTask.Value;

        if (_reference == null)
            _reference = await _module.InvokeAsync<IJSObjectReference>("DataGrid.create", HandlerReference, _handler.Id);

        return _reference;
    }
}
