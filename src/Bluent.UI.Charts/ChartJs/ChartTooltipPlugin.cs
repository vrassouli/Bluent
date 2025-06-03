using System.Text.Json.Serialization;

namespace Bluent.UI.Charts.ChartJs;

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
