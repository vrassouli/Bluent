using System.Collections;
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
public class Chart : ChartJs, IChartJsHost, IAsyncDisposable
{
    private ChartJsInterop _interop = default!;
    [Inject] private IJSRuntime JsRuntime { get; set; } = default!;
    // [Parameter] public IEnumerable<string>? Labels { get; set; }
    [Parameter] public RenderFragment? ChildContent { get; set; }

    protected List<Dataset> DatasetsList { get; } = new();

    protected override void OnInitialized()
    {
        _interop = new ChartJsInterop(this, JsRuntime);

        base.OnInitialized();
    }

    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        var seq = -1;

        builder.OpenComponent<CascadingValue<Chart>>(++seq);
        builder.AddComponentParameter(++seq, nameof(CascadingValue<>.Value), this);
        builder.AddComponentParameter(++seq, nameof(CascadingValue<>.IsFixed), true);
        builder.AddComponentParameter(++seq, nameof(CascadingValue<>.ChildContent), ChildContent);
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
        if (_interop != null!)
            await _interop.DisposeAsync();
    }


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


    internal ChartConfig BuildConfig()
    {
        return new ChartConfig(BuildChartData(BuildDatasets()), BuildChartOptions());
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

    internal IEnumerable<ChartDataset> BuildDatasets()
    {
        var mergedLabels = MergeOrderedLists(DatasetsList.Select(x => x.Keys));
        return DatasetsList.Select(x => x.ToDataset(mergedLabels));
    }

    internal ChartData BuildChartData(IEnumerable<ChartDataset> datasets)
    {
        var mergedLabels = MergeOrderedLists(DatasetsList.Select(x => x.Keys));
        var data = new ChartData(datasets, mergedLabels);
        return data;
    }
    
    public static List<string> MergeOrderedLists(IEnumerable<IEnumerable> lists)
    {
        var graph = new Dictionary<string, HashSet<string>>();
        var indegree = new Dictionary<string, int>();

        foreach (var list in lists)
        {
            var items = list
                .Cast<object?>()
                .Select(x => x?.ToString() ?? string.Empty)
                .ToList();

            foreach (var item in items)
            {
                graph.TryAdd(item, []);
                indegree.TryAdd(item, 0);
            }

            for (var i = 0; i < items.Count - 1; i++)
            {
                var from = items[i];
                var to = items[i + 1];

                if (from == to)
                    continue;

                if (graph[from].Add(to))
                    indegree[to]++;
            }
        }

        var queue = new Queue<string>(
            indegree
                .Where(x => x.Value == 0)
                .Select(x => x.Key));

        var result = new List<string>();

        while (queue.Count > 0)
        {
            var current = queue.Dequeue();
            result.Add(current);

            foreach (var next in graph[current])
            {
                indegree[next]--;

                if (indegree[next] == 0)
                    queue.Enqueue(next);
            }
        }

        if (result.Count != indegree.Count)
            throw new InvalidOperationException("Lists contain conflicting orderings.");

        return result;
    }
}
