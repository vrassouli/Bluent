using System.Text.Json.Serialization;

namespace Bluent.UI.Charts.ChartJs;

internal class ChartSubtitlePlugin : ChartPlugin
{
    [JsonIgnore]
    public override string Key => "subtitle";

    public bool Display { get; set; }
    public string Text { get; set; }
    
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public ChartFontConfig? Font { get; set; }
    
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public ChartPaddingConfig? Padding { get; set; }

    public ChartSubtitlePlugin(bool display, string text)
    {
        Display = display;
        Text = text;
    }
}
