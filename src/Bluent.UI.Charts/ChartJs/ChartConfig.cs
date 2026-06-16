using System.Text.Json.Serialization;

namespace Bluent.UI.Charts.ChartJs;

internal class ChartConfig
{
    public ChartData Data { get; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public ChartOptions? Options { get; }

    public ChartConfig(ChartData data, ChartOptions? options)
    {
        Data = data;
        Options = options;
    }
}
