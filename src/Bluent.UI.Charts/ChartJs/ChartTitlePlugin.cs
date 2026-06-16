using System.Text.Json.Serialization;

namespace Bluent.UI.Charts.ChartJs;

public class ChartTitlePlugin : ChartPlugin
{
    [JsonIgnore]
    public override string Key => "title";

    public bool Display { get; set; }
    public string Text { get; set; }
    
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public ChartFontConfig? Font { get; set; }
    
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public ChartPaddingConfig? Padding { get; set; }

    public ChartTitlePlugin(bool display, string text)
    {
        Display = display;
        Text = text;
    }
}
