namespace Bluent.UI.Charts.ChartJs;

public sealed class BarChartConfig : ChartConfig
{
    private BarChartData _data;
    private readonly BarChartOptions _options;

    public override string Type => "bar";
    public override ChartData Data => _data;
    public override ChartOptions? Options => _options;

    public BarChartConfig(BarChartData data, BarChartOptions options)
    {
        _data = data;
        _options = options;
    }
}

public sealed class BarChartData : ChartData
{
    public BarChartData(IEnumerable<ChartDataset> datasets) : base(datasets)
    {
    }
}
public sealed class BarChartOptions : ChartOptions
{
    
}
