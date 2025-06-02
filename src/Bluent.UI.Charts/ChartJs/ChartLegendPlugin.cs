using System.Text.Json.Serialization;

namespace Bluent.UI.Charts.ChartJs;

internal class ChartLegendPlugin : ChartPlugin
{
    [JsonIgnore]
    public override string Key => "legend";

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Position { get; private set; }

    public bool Display { get; private set; }

    public ChartLegendPlugin(Position position, bool display)
    {
        Display = display;

        if (Display)
            Position = position.ToString().ToLower();
    }
}
