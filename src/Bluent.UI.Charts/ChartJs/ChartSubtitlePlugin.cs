using System.Text.Json.Serialization;

namespace Bluent.UI.Charts.ChartJs;

internal class ChartSubtitlePlugin : ChartPlugin
{
    [JsonIgnore]
    public override string Key => "subtitle";

    public bool Display { get; private set; }
    public string Text { get; private set; }

    public ChartSubtitlePlugin(bool display, string text)
    {
        Display = display;
        Text = text;
    }
}
