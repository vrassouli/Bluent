using Bluent.UI.Charts.ChartJs;
using Bluent.UI.Components;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Charts.Components;

public class Legend : ComponentBase, IDisposable
{
    private ChartLegendPlugin _plugin = default!;

    [CascadingParameter] public Chart Chart { get; set; } = default!;
    [Parameter] public string Position { get; set; } = "top";

    public void Dispose()
    {
        Chart.Remove(_plugin);
    }

    protected override void OnInitialized()
    {
        if (Chart is null)
            throw new InvalidOperationException($"{nameof(Dataset)} should be nested in a Chart component.");

        _plugin = ToPlugin();
        Chart.Add(_plugin);

        base.OnInitialized();
    }

    private ChartLegendPlugin ToPlugin()
    {
        return new ChartJs.ChartLegendPlugin
        {
            Position = Position,
        };
    }
}
