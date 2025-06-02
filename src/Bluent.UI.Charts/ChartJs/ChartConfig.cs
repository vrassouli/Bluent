namespace Bluent.UI.Charts.ChartJs;

internal class ChartConfig
{
    public string Type { get; }
    public ChartData Data { get; }
    public ChartOptions? Options { get; }

    public ChartConfig(string type, ChartData data, ChartOptions? options)
    {
        Type = type;
        Data = data;
        Options = options;
    }
}
