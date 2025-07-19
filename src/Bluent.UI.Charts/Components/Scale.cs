using Bluent.UI.Charts.ChartJs;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Charts.Components;

public abstract class Scale : ComponentBase, IDisposable
{
    private ChartScale _scale = default!;
    private readonly string _key;

    [CascadingParameter] public ChartJs Chart { get; set; } = default!;
    [Parameter] public bool Display { get; set; } = true;
    [Parameter] public string? Text { get; set; }

    protected Scale(string key)
    {
        _key = key;
    }

    public void Dispose()
    {
        Chart.Remove(_scale);
    }

    protected override void OnInitialized()
    {
        if (Chart is null)
            throw new InvalidOperationException($"Scale should be nested in a Chart component.");

        _scale = ToPlugin();
        Chart.Add(_scale);

        base.OnInitialized();
    }

    private ChartScale ToPlugin()
    {
        return new ChartScale(_key, Display, Text);
    }
}
