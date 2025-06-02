using Bluent.UI.Charts.ChartJs;
using Bluent.UI.Charts.Interops.Abstractions;
using Microsoft.JSInterop;

namespace Bluent.UI.Charts.Interops;

internal class ChartJsInterop : IAsyncDisposable
{
    private readonly IChartJsHost _host;
    private readonly ChartConfig _config;
    private readonly Lazy<Task<IJSObjectReference>> _moduleTask;
    private IJSObjectReference? _module;
    private IJSObjectReference? _reference;
    private DotNetObjectReference<IChartJsHost>? _hostReference;

    private DotNetObjectReference<IChartJsHost> HostReference
    {
        get
        {
            if (_hostReference == null)
                _hostReference = DotNetObjectReference.Create(_host);

            return _hostReference;
        }
    }

    public ChartJsInterop(IChartJsHost host, IJSRuntime jsRuntime, ChartConfig config)
    {
        _host = host;
        _config = config;
        _moduleTask = new(() => jsRuntime.InvokeAsync<IJSObjectReference>("import", "./_content/Bluent.UI.Charts/bluent.ui.charts.js").AsTask());
    }

    public async ValueTask DisposeAsync()
    {
        try
        {
            await DestroyAsync();

            if (_reference != null)
                await _reference.DisposeAsync();

            if (_module != null)
                await _module.DisposeAsync();

            if (_hostReference != null)
                _hostReference.Dispose();
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
        }
        catch
        {
            // swallow!
        }
    }

    public async Task DestroyAsync()
    {
        try
        {
            var module = await GetModuleAsync();
            await module.InvokeVoidAsync("destroy");
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
            _reference = await _module.InvokeAsync<IJSObjectReference>("ChartJs.create", HostReference, _host.Id, _config);

        return _reference;
    }
}
