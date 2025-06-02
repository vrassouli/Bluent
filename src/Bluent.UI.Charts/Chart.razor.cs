using Bluent.UI.Charts.ChartJs;
using Bluent.UI.Charts.Components;
using Bluent.UI.Charts.Interops;
using Bluent.UI.Charts.Interops.Abstractions;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace Bluent.UI.Components;

public abstract partial class Chart : BluentComponentBase, IChartJsHost, IAsyncDisposable
{
    private ChartJsInterop _interop = default!;
    [Inject] private IJSRuntime JsRuntime { get; set; } = default!;
    //[Parameter] public IEnumerable<string>? Labels { get; set; }
    //[Parameter] public IEnumerable<string>? XLabels { get; set; }
    //[Parameter] public IEnumerable<string>? YLabels { get; set; }
    [Parameter] public RenderFragment? ChildContent { get; set; }

    protected List<Dataset> DatasetsList { get; } = new();
    protected List<ChartPlugin> PluginsList { get; } = new();
    protected List<ChartScale> ScalesList { get; } = new();

    protected override void OnInitialized()
    {
        _interop = new ChartJsInterop(this, JsRuntime);

        base.OnInitialized();
    }

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
            await _interop.InitializeAsync(BuildConfig());
        }
        else
        {
            await _interop.DestroyAsync();
            await _interop.InitializeAsync(BuildConfig());
        }

        await base.OnAfterRenderAsync(firstRender);
    }

    public async ValueTask DisposeAsync()
    {
        if (_interop != null)
            await _interop.DisposeAsync();
    }

    internal abstract ChartConfig BuildConfig();

    internal void Add(Dataset dataset)
    {
        DatasetsList.Add(dataset);
        //StateHasChanged();
    }

    internal void Remove(Dataset dataset)
    {
        DatasetsList.Remove(dataset);
        //StateHasChanged();
    }

    internal void Add(ChartPlugin plugin)
    {
        PluginsList.Add(plugin);
        //StateHasChanged();
    }

    internal void Remove(ChartPlugin plugin)
    {
        PluginsList.Remove(plugin);
        //StateHasChanged();
    }

    internal void Add(ChartScale scale)
    {
        ScalesList.Add(scale);
    }

    internal void Remove(ChartScale scale)
    {
        ScalesList.Remove(scale);
    }


    internal virtual ChartOptions BuildChartOptions()
    {
        ChartOptions options = new ChartOptions();

        foreach (var plugin in PluginsList)
            options.Plugins.Add(plugin.Key, plugin);

        foreach (var scale in ScalesList)
            options.Scales.Add(scale.Key, scale);


        return options;
    }

    internal virtual IEnumerable<ChartDataset> BuildDatasets()
    {
        return DatasetsList.Select(x => x.ToDataset());
    }

    internal virtual ChartData BuildChartData(IEnumerable<ChartDataset> datasets)
    {
        return new ChartData(datasets);
    }

}
