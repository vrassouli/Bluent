using System.Text.Json.Serialization;

namespace Bluent.UI.Charts.ChartJs;

internal class ChartData
{
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public IEnumerable<string>? Labels { get; }

    public IEnumerable<ChartDataset> Datasets { get; }

    public ChartData(IEnumerable<ChartDataset> datasets, IEnumerable<string>? labels)
    {
        Datasets = datasets;
        Labels = labels;
    }
}
