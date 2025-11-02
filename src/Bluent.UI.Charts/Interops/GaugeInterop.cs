using Bluent.UI.Charts.Interops.Abstractions;
using Microsoft.JSInterop;

namespace Bluent.UI.Charts.Interops;

internal class GaugeInterop : IAsyncDisposable
{
    private readonly IGaugeHost _host;
    private readonly Lazy<Task<IJSObjectReference>> _moduleTask;
    private IJSObjectReference? _module;
    private IJSObjectReference? _reference;
    private DotNetObjectReference<IGaugeHost>? _hostReference;

    private DotNetObjectReference<IGaugeHost> HostReference
    {
        get
        {
            if (_hostReference == null)
                _hostReference = DotNetObjectReference.Create(_host);

            return _hostReference;
        }
    }

    public GaugeInterop(IGaugeHost host, IJSRuntime jsRuntime)
    {
        _host = host;
        _moduleTask = new(() =>
            jsRuntime.InvokeAsync<IJSObjectReference>("import", "./_content/Bluent.UI.Charts/bluent.ui.charts.js")
                .AsTask());
    }

    public async ValueTask DisposeAsync()
    {
        try
        {
            //await DestroyAsync();

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

    public async Task InitializeAsync(GuageConfig config)
    {
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

    public async Task SetValueAsync(double value, bool animated)
    {
        try
        {
            var module = await GetModuleAsync();
            if (animated)
                await module.InvokeVoidAsync("setValueAnimated", value);
            else
                await module.InvokeVoidAsync("setValue", value);
        }
        catch
        {
            // swallow!
        }
    }

    // public async Task DestroyAsync()
    // {
    //     try
    //     {
    //         var module = await GetModuleAsync();
    //         await module.InvokeVoidAsync("destroy");
    //     }
    //     catch
    //     {
    //         // swallow!
    //     }
    // }

    private async Task<IJSObjectReference> GetModuleAsync()
    {
        if (_module == null)
            _module = await _moduleTask.Value;

        if (_reference == null)
            _reference = await _module.InvokeAsync<IJSObjectReference>("Gauge.create", HostReference, _host.Id);

        return _reference;
    }
}

internal class GuageConfig
{
    public int? StartAngle { get; init; }
    public int? EndAngle { get; init; }
    public int? Radius { get; init; }
    public double? Min { get; init; }
    public double? Max { get; init; }
    public bool ShowValue { get; init; }
    public string? GaugeClass { get; init; }
    public string? DialClass { get; init; }
    public string? ValueDialClass { get; init; }
    public string? ValueClass { get; init; }
    public string? ViewBox { get; init; }
    public Dictionary<double, string>? Colors { get; init; }
}