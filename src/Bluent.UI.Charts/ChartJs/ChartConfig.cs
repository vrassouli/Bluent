using System.Text.Json.Serialization;

namespace Bluent.UI.Charts.ChartJs;

internal class ChartConfig<TDataSource>
{
    public ChartData<TDataSource> Data { get; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public ChartOptions? Options { get; }

    public ChartConfig(ChartData<TDataSource> data, ChartOptions? options)
    {
        Data = data;
        Options = options;
    }
}
