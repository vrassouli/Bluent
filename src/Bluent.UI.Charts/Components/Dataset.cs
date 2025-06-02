using Bluent.UI.Charts.ChartJs;
using Bluent.UI.Components;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Charts.Components;

public class Dataset : ComponentBase, IDisposable
{
    [CascadingParameter] public Chart Chart { get; set; } = default!;
    [Parameter] public Dictionary<string, object> Data { get; set; } = new Dictionary<string, object>();
    [Parameter] public string? Label { get; set; }
    [Parameter] public string? BorderColor { get; set; }
    [Parameter] public string? BackgroundColor { get; set; }
    [Parameter] public int? BorderWidth { get; set; }
    [Parameter] public int? BorderRadius { get; set; }
    [Parameter] public bool BorderSkiped { get; set; }
    [Parameter] public bool Smooth { get; set; }
    [Parameter] public FillTarget? FillTarget { get; set; }

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

    internal ChartJs.ChartDataset ToDataset()
    {
        AreaFill? fill = null;

        if (FillTarget is not null)
        {
            fill = new AreaFill(FillTarget.Value);
        }

        return new ChartJs.ChartDataset(Data)
        {
            Label = Label,
            BackgroundColor = BackgroundColor,
            BorderColor = BorderColor,
            BorderRadius = BorderRadius,
            BorderSkiped = BorderSkiped,
            BorderWidth = BorderWidth,
            Fill = fill,
            Tension = Smooth ? 0.4f : (float?)null
        };
    }
}
