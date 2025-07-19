using Bluent.UI.Charts.ChartJs;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Charts.Components;

public class Subtitle : ComponentBase, IDisposable
{
    private ChartPlugin _plugin = default!;

    [CascadingParameter] public ChartJs Chart { get; set; } = default!;
    [Parameter] public bool Display { get; set; } = true;
    [Parameter, EditorRequired] public string Text { get; set; } = default!;

    public void Dispose()
    {
        Chart.Remove(_plugin);
    }

    protected override void OnInitialized()
    {
        if (Chart is null)
            throw new InvalidOperationException($"Subtitle should be nested in a Chart component.");

        _plugin = ToPlugin();
        Chart.Add(_plugin);

        base.OnInitialized();
    }

    private ChartPlugin ToPlugin()
    {
        return new ChartSubtitlePlugin(Display, Text);
    }
}
