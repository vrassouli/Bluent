namespace Bluent.UI.Charts.ChartJs;

internal class ChartData
{
    public IEnumerable<ChartDataset> Datasets { get; }

    public ChartData(IEnumerable<ChartDataset> datasets)
    {
        Datasets = datasets;
    }
}
