using System.Collections;
using Bluent.UI.Charts.ChartJs;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Charts.Components;

public abstract class Dataset : ComponentBase
{
    internal abstract ChartDataset ToDataset(IEnumerable<string> keys);
    internal abstract IEnumerable<object?> Keys { get; }
}

public class Dataset<TKey, TValue> : Dataset, IDisposable
{
    [CascadingParameter] public Chart Chart { get; set; } = default!;
    [Parameter, EditorRequired] public IEnumerable<KeyValuePair<TKey, TValue>> Data { get; set; } = default!;
    [Parameter] public ChartType ChartType { get; set; } = ChartType.Bar;
    [Parameter] public string? Label { get; set; }
    [Parameter] public string? BorderColor { get; set; }
    [Parameter] public string? BackgroundColor { get; set; }
    [Parameter] public int? BorderWidth { get; set; }
    [Parameter] public int? BorderRadius { get; set; }
    [Parameter] public bool BorderSkipped { get; set; }
    [Parameter] public bool Smooth { get; set; }
    [Parameter] public FillTarget? FillTarget { get; set; }
    
    internal override IEnumerable<object?> Keys => Data.Select(x => (object?)x.Key);

    public void Dispose()
    {
        Chart.Remove(this);
    }

    protected override void OnInitialized()
    {
        if (Chart is null)
            throw new InvalidOperationException($"{nameof(Dataset)} should be nested in a Chart component.");

        Chart.Add(this);

        base.OnInitialized();
    }

    internal override ChartDataset ToDataset(IEnumerable<string> keys)
    {
        AreaFill? fill = null;

        if (FillTarget is not null)
        {
            fill = new AreaFill(FillTarget.Value);
        }

        return new ChartDataset(ChartType, GetValues(keys))
        {
            Label = Label,
            BackgroundColor = BackgroundColor,
            BorderColor = BorderColor,
            BorderRadius = BorderRadius,
            BorderSkipped = BorderSkipped,
            BorderWidth = BorderWidth,
            Fill = fill,
            Tension = Smooth ? 0.4f : null
        };
    }
    
    private IEnumerable GetValues(IEnumerable<string> keys)
    {
        List<TValue> list = new List<TValue>();

        if (Data.Any())
        {
            foreach (var key in keys)
            {
                var value = Data.FirstOrDefault(x => x.Key?.ToString() == key).Value;
                list.Add(value);
            }
        }

        return list;
    }

}
