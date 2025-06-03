using Bluent.UI.Charts.ChartJs;
using Bluent.UI.Charts.Interops.Abstractions;
using Microsoft.JSInterop;
using System.Data.Common;
using System.Text.Json;

namespace Bluent.UI.Charts.Interops;

internal class ChartJsInterop : IAsyncDisposable
{
    private readonly IChartJsHost _host;
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

    public ChartJsInterop(IChartJsHost host, IJSRuntime jsRuntime)
    {
        _host = host;
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

    public async Task InitializeAsync<TDataSource>(ChartConfig<TDataSource> config)
    {
#if DEBUG
        var ser = JsonSerializer.Serialize(config);
        Console.WriteLine(ser);
#endif

        try
        {
            var module = await GetModuleAsync();
            await module.InvokeVoidAsync("init", config);
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

    public async Task UpdateAsync<TDataSource>(ChartConfig<TDataSource> config)
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("update", config);
    }

    private async Task<IJSObjectReference> GetModuleAsync()
    {
        if (_module == null)
            _module = await _moduleTask.Value;

        if (_reference == null)
            _reference = await _module.InvokeAsync<IJSObjectReference>("ChartJs.create", HostReference, _host.Id);

        return _reference;
    }
}
