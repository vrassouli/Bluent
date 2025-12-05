using System.Text.Json.Serialization;

namespace Bluent.UI.Charts.ChartJs;

internal class ChartSubtitlePlugin : ChartPlugin
{
    [JsonIgnore]
    public override string Key => "subtitle";

    public bool Display { get; set; }
    public string Text { get; set; } = string.Empty;

    public ChartSubtitlePlugin()
    {
    }

    public ChartSubtitlePlugin(bool display, string text)
    {
        Display = display;
        Text = text;
    }
}
