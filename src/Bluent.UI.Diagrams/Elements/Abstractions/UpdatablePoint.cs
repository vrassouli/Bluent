namespace Bluent.UI.Diagrams.Elements.Abstractions;

public class UpdatablePoint
{
    public object? Data { get; set; }

    public DiagramPoint Point { get; set; }

    public UpdatablePoint(DiagramPoint point, object? data = null)
    {
        Point = point;
        Data = data;
    }

    public UpdatablePoint(double x, double y, object? data = null)
    {
        Point = new DiagramPoint(x, y);
        Data = data;
    }
}
