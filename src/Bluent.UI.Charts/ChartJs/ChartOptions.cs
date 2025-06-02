namespace Bluent.UI.Charts.ChartJs;

internal class ChartOptions
{
    public bool Responsive { get; set; } = true;
    public Dictionary<string, ChartPlugin> Plugins { get; } = new Dictionary<string, ChartPlugin>();
    public Dictionary<string, ChartScale> Scales { get; } = new Dictionary<string, ChartScale>();
}
