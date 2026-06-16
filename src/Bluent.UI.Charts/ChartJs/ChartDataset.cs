using System.Collections;
using Bluent.UI.Charts.Components;
using Humanizer;
using System.Text.Json.Serialization;

namespace Bluent.UI.Charts.ChartJs;

internal class ChartDataset 
{
    public IEnumerable Data { get; }

    public string Type { get;  }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Label { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? BorderColor { get; set; }
    
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? BackgroundColor { get; set; }
    
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public int? BorderWidth { get; set; }
    
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public int? BorderRadius { get; set; } 
    public bool BorderSkipped { get; set; }
    
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public float? Tension { get; set; }
    
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public AreaFill? Fill { get; set; }

    public ChartDataset(ChartType type, IEnumerable data)
    {
        Type = type.ToString().Camelize();
        Data = data;
    }
}
