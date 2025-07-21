namespace Bluent.UI.Diagrams.Tools;

public interface ISvgDrawingTool : ISvgTool
{
    string? Fill { get; set; }
    string? Stroke { get; set; }
    double? StrokeWidth { get; set; }
}