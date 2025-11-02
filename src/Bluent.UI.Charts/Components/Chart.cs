using Bluent.Core;
using Bluent.UI.Charts.ChartJs;
using Bluent.UI.Charts.Interops;
using Bluent.UI.Charts.Interops.Abstractions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;
using Microsoft.JSInterop;

namespace Bluent.UI.Charts.Components;

public abstract class ChartJs : BluentComponentBase 
{ 
    protected List<ChartPlugin> PluginsList { get; } = new();
    protected List<ChartScale> ScalesList { get; } = new();

    internal void Add(ChartPlugin plugin)
    {
        PluginsList.Add(plugin);
    }

    internal void Remove(ChartPlugin plugin)
    {
        PluginsList.Remove(plugin);
    }

    internal void Add(ChartScale scale)
    {
        ScalesList.Add(scale);
    }

    internal void Remove(ChartScale scale)
    {
        ScalesList.Remove(scale);
    }
}
public class Chart<TDataSource> : ChartJs, IChartJsHost, IAsyncDisposable
{
    private ChartJsInterop _interop = default!;
    [Inject] private IJSRuntime JsRuntime { get; set; } = default!;
    [Parameter] public IEnumerable<string>? Labels { get; set; }
    [Parameter] public RenderFragment? ChildContent { get; set; }

    protected List<Dataset<TDataSource>> DatasetsList { get; } = new();

    protected override void OnInitialized()
    {
        _interop = new ChartJsInterop(this, JsRuntime);

        base.OnInitialized();
    }

    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        var seq = -1;

        builder.OpenComponent<CascadingValue<Chart<TDataSource>>>(++seq);
        builder.AddComponentParameter(++seq, nameof(CascadingValue<Chart<TDataSource>>.Value), this);
        builder.AddComponentParameter(++seq, nameof(CascadingValue<Chart<TDataSource>>.IsFixed), true);
        builder.AddComponentParameter(++seq, nameof(CascadingValue<Chart<TDataSource>>.ChildContent), ChildContent);
        builder.CloseComponent();

        builder.OpenElement(++seq, "canvas");
        builder.AddMultipleAttributes(++seq, AdditionalAttributes);
        builder.AddAttribute(++seq, "id", Id);
        builder.AddAttribute(++seq, "class", GetComponentClass());
        builder.AddAttribute(++seq, "style", Style);
        builder.CloseElement();
    }

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
            await _interop.InitializeAsync(BuildConfig());
        }
        else
        {
            //await _interop.DestroyAsync();
            await _interop.UpdateAsync(BuildConfig());
        }

        await base.OnAfterRenderAsync(firstRender);
    }

    public async ValueTask DisposeAsync()
    {
        if (_interop != null)
            await _interop.DisposeAsync();
    }


    internal void Add(Dataset<TDataSource> dataset)
    {
        DatasetsList.Add(dataset);
        //StateHasChanged();
    }

    internal void Remove(Dataset<TDataSource> dataset)
    {
        DatasetsList.Remove(dataset);
        //StateHasChanged();
    }


    internal ChartConfig<TDataSource> BuildConfig()
    {
        return new ChartConfig<TDataSource>(BuildChartData(BuildDatasets()), BuildChartOptions());
    }

    internal ChartOptions BuildChartOptions()
    {
        ChartOptions options = new ChartOptions();

        foreach (var plugin in PluginsList)
            options.Add(plugin);

        foreach (var scale in ScalesList)
            options.Add(scale);


        return options;
    }

    internal IEnumerable<ChartDataset<TDataSource>> BuildDatasets()
    {
        return DatasetsList.Select(x => x.ToDataset());
    }

    internal ChartData<TDataSource> BuildChartData(IEnumerable<ChartDataset<TDataSource>> datasets)
    {
        var data = new ChartData<TDataSource>(datasets, Labels);
        return data;
    }

}
