using Bluent.UI.Components;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Charts.Components;

public class Dataset : ComponentBase, IDisposable
{
    [CascadingParameter] public Chart Chart { get; set; } = default!;
    [Parameter] public IEnumerable<double> Data { get; set; } = Enumerable.Empty<double>();
    [Parameter] public string? Label { get; set; }

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
        return new ChartJs.ChartDataset(Data)
        {
            Label = Label,
        };
    }
}
