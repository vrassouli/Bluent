using Bluent.UI.Charts.ChartJs;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Charts.Components;

public class Subtitle : ComponentBase, IDisposable
{
    private ChartSubtitlePlugin _plugin = default!;

    [CascadingParameter] public ChartJs Chart { get; set; } = default!;
    [Parameter] public bool Display { get; set; } = true;
    [Parameter, EditorRequired] public string Text { get; set; } = default!;
    [Parameter] public string? Family { get; set; }
    [Parameter] public int? Size { get; set; }
    [Parameter] public string? Weight { get; set; }
    [Parameter] public string? Style { get; set; }
    [Parameter] public int? Bottom { get; set; }
    [Parameter] public int? Left { get; set; }
    [Parameter] public int? Right { get; set; }
    [Parameter] public int? Top { get; set; }
    private ChartFontConfig ChartFontConfig => new(Family, Size, Weight, Style);
    private ChartPaddingConfig PaddingConfig => new(Bottom, Left, Right, Top); 
    
    public void Dispose()
    {
        
        Chart.Remove(_plugin);
    }

    protected override void OnInitialized()
    {
        if (Chart is null)
            throw new InvalidOperationException("Subtitle should be nested in a Chart component.");

        _plugin = new ChartSubtitlePlugin(Display, Text)
        {
            Font = ChartFontConfig,
            Padding = PaddingConfig
        };
        Chart.Add(_plugin);

        base.OnInitialized();
    }

    protected override void OnParametersSet()
    {
        _plugin.Display = Display;
        _plugin.Text = Text;
        _plugin.Font = ChartFontConfig;
        _plugin.Padding = PaddingConfig;
        
        base.OnParametersSet();
    }

}