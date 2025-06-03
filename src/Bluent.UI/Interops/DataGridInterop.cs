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
            if (_reference != null)
                await _reference.DisposeAsync();

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

    public async Task Initialize()
    {
        try
        {
            var module = await GetModuleAsync();
            //await module.InvokeVoidAsync("init");
        }
        catch
        {
            // swallow!
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
