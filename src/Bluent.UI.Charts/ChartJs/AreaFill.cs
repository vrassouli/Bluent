using System.Text.Json.Serialization;

namespace Bluent.UI.Charts.ChartJs;

internal class AreaFill
{
    public string Target { get; }
    
    //[JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] 
    //public string? Above { get; }
    
    //[JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    //public string? Below { get; }

    public AreaFill(FillTarget target)
    {
        Target = target.ToString().ToLower();
    }
}
