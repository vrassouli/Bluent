using Bluent.UI.Charts.ChartJs;
using Bluent.UI.Components;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Charts.Components;

public class Dataset<TDataSource> : ComponentBase, IDisposable
{
    [CascadingParameter] public Chart<TDataSource> Chart { get; set; } = default!;
    [Parameter, EditorRequired] public TDataSource Data { get; set; } = default!;
    [Parameter] public ChartType ChartType { get; set; } = ChartType.Bar;

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
            throw new InvalidOperationException($"{nameof(Dataset<TDataSource>)} should be nested in a Chart component.");

        Chart.Add(this);

        base.OnInitialized();
    }

    internal ChartDataset<TDataSource> ToDataset()
    {
        AreaFill? fill = null;

        if (FillTarget is not null)
        {
            fill = new AreaFill(FillTarget.Value);
        }

        return new ChartDataset<TDataSource>(ChartType, Data)
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
