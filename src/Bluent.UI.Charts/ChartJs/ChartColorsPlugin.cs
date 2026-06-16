using System.Text.Json.Serialization;

namespace Bluent.UI.Charts.ChartJs
{
    public class ChartColorsPlugin : ChartPlugin
    {
        [JsonIgnore]
        public override string Key => "colors";

        public bool Enabled { get; private set; }

        public ChartColorsPlugin(bool enabled)
        {
            Enabled = enabled;
        }
    }
}