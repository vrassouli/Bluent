namespace Bluent.UI.Diagrams.Tools.Drawings;

public interface IElementDrawingTool : ITool
{
    string? Fill { get; set; }
    string? Stroke { get; set; }
    double? StrokeWidth { get; set; }
}
