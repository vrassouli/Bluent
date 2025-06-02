using Bluent.UI.Charts.ChartJs;
using Bluent.UI.Charts.Components;
using Bluent.UI.Charts.Interops;
using Bluent.UI.Charts.Interops.Abstractions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;
using Microsoft.JSInterop;

namespace Bluent.UI.Components;

public abstract partial class Chart : BluentComponentBase, IChartJsHost, IAsyncDisposable
{
    private ChartJsInterop _interop = default!;
    [Inject] private IJSRuntime JsRuntime { get; set; } = default!;
    [Parameter] public IEnumerable<string>? Labels { get; set; }
    [Parameter] public IEnumerable<string>? XLabels { get; set; }
    [Parameter] public IEnumerable<string>? YLabels { get; set; }
    [Parameter] public RenderFragment? ChildContent { get; set; }

    protected List<Dataset> DatasetsList { get; } = new();
    protected List<ChartPlugin> PluginsList { get; } = new();

    protected override void OnInitialized()
    {
        _interop = new ChartJsInterop(this, JsRuntime, BuildConfig());

        base.OnInitialized();
    }

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender && _interop != null)
        {
            await _interop.Initialize();
        }

        await base.OnAfterRenderAsync(firstRender);
    }

    public async ValueTask DisposeAsync()
    {
        if (_interop != null)
            await _interop.DisposeAsync();
    }

    protected abstract ChartConfig BuildConfig();

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
    }

    internal void Remove(ChartPlugin plugin)
    {
        PluginsList.Add(plugin);
    }
}
