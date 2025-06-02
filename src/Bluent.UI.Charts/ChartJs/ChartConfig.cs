using System.Text.Json.Serialization;

namespace Bluent.UI.Charts.ChartJs;

public abstract class ChartConfig
{
    public abstract string Type { get; }
    public abstract ChartData Data { get; }
    public abstract ChartOptions? Options { get; }
}

public abstract class ChartData
{
    public IEnumerable<string>? Labels { get; set; }
    public IEnumerable<string>? XLabels { get; set; }
    public IEnumerable<string>? YLabels { get; set; }
    public IEnumerable<ChartDataset> Datasets { get; }

    protected ChartData(IEnumerable<ChartDataset> datasets)
    {
        Datasets = datasets;
    }
}

public class ChartDataset
{
    public string? Label { get; set; }
    public IEnumerable<double> Data { get; }

    public string? BorderColor { get; set; }
    public string? BackgroundColor { get; set; }
    public int? BorderWidth { get; set; }
    public int? BorderRadius { get; set; } 
    public bool BorderSkiped { get; set; } 

    public ChartDataset(IEnumerable<double> data)
    {
        Data = data;
    }
}

public abstract class ChartOptions
{
    public bool Responsive { get; set; } = true;
    public Dictionary<string, ChartPlugin> Plugins { get; } = new Dictionary<string, ChartPlugin>();
}

public abstract class ChartPlugin
{
    public abstract string Key { get; }
}

public class ChartLegendPlugin : ChartPlugin
{
    [JsonIgnore]
    public override string Key => "Legend";
    public string Position { get; set; } = "top";
}
