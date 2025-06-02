using System.Text.Json.Serialization;

namespace Bluent.UI.Charts.ChartJs;

public class ChartTitlePlugin : ChartPlugin
{
    [JsonIgnore]
    public override string Key => "title";

    public bool Display { get; private set; }
    public string Text { get; private set; }

    public ChartTitlePlugin(bool display, string text)
    {
        Display = display;
        Text = text;
    }
}

public class ChartTooltipPlugin : ChartPlugin
{
    [JsonIgnore]
    public override string Key => "tooltip";

    public bool Enabled { get; private set; }

    public ChartTooltipPlugin(bool enabled)
    {
        Enabled = enabled;
    }
}
