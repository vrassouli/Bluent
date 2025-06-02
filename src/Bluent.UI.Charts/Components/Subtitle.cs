using Bluent.UI.Charts.ChartJs;
using Bluent.UI.Components;
using Microsoft.AspNetCore.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Charts.Components;

public class Subtitle : ComponentBase, IDisposable
{
    private ChartPlugin _plugin = default!;

    [CascadingParameter] public Chart Chart { get; set; } = default!;
    [Parameter] public bool Display { get; set; } = true;
    [Parameter, EditorRequired] public string Text { get; set; } = default!;

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

    private ChartPlugin ToPlugin()
    {
        return new ChartSubtitlePlugin(Display, Text);
    }
}

public class Tooltip : ComponentBase, IDisposable
{
    private ChartPlugin _plugin = default!;

    [CascadingParameter] public Chart Chart { get; set; } = default!;
    [Parameter] public bool Enabled { get; set; } = true;

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

    private ChartPlugin ToPlugin()
    {
        return new ChartTooltipPlugin(Enabled);
    }
}
