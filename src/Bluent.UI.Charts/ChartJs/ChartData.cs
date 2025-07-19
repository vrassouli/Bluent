using System.Text.Json.Serialization;

namespace Bluent.UI.Charts.ChartJs;

internal class ChartData<TDataSource>
{
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public IEnumerable<string>? Labels { get; }

    public IEnumerable<ChartDataset<TDataSource>> Datasets { get; }

    public ChartData(IEnumerable<ChartDataset<TDataSource>> datasets, IEnumerable<string>? labels)
    {
        Datasets = datasets;
        Labels = labels;
    }
}
