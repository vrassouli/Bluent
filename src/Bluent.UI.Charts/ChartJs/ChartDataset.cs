namespace Bluent.UI.Charts.ChartJs;

internal class ChartDataset
{
    public string? Label { get; set; }
    public Dictionary<string, object> Data { get; }

    public string? BorderColor { get; set; }
    public string? BackgroundColor { get; set; }
    public int? BorderWidth { get; set; }
    public int? BorderRadius { get; set; } 
    public bool BorderSkiped { get; set; }
    public float? Tension { get; set; }
    public AreaFill? Fill { get; set; }

    public ChartDataset(Dictionary<string, object> data)
    {
        Data = data;
    }
}
