using System.Text.Json.Serialization;

namespace Bluent.UI.Charts.ChartJs;

//[JsonPolymorphic(TypeDiscriminatorPropertyName = "$type")]
[JsonDerivedType(typeof(ChartLegendPlugin), "legend")]
[JsonDerivedType(typeof(ChartSubtitlePlugin), "subtitle")]
[JsonDerivedType(typeof(ChartTitlePlugin), "title")]
[JsonDerivedType(typeof(ChartTooltipPlugin), "tooltip")]
public abstract class ChartPlugin
{
    [JsonIgnore]
    public abstract string Key { get; }
}
