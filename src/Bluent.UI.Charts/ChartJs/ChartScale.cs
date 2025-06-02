using System.Text.Json.Serialization;

namespace Bluent.UI.Charts.ChartJs;

public class ChartScale
{
    public string Key { get; }
    public bool Display { get; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] 
    public ChartTitlePlugin? Title { get; }

    public ChartScale(string key, bool display, string? title)
    {
        Key = key;
        Display = display;
        if (!string.IsNullOrEmpty(title))
            Title = new ChartTitlePlugin(true, title);
    }
}
