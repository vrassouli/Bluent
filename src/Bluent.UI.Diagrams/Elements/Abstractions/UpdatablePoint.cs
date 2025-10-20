namespace Bluent.UI.Diagrams.Elements.Abstractions;

public class UpdatablePoint
{
    public object? Data { get; set; }

    public DiagramPoint Point { get; set; }

    public string? Cursor { get; set; }

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

    public static UpdatablePoint CreateTopLeft(Boundary boundary) =>
        new(new DiagramPoint(boundary.X, boundary.Y), "TopLeft") { Cursor = "nwse-resize" };

    public static UpdatablePoint CreateTopRight(Boundary boundary) =>
        new(new DiagramPoint(boundary.X + boundary.Width, boundary.Y), "TopRight") { Cursor = "nesw-resize" };

    public static UpdatablePoint CreateBottomLeft(Boundary boundary) =>
        new(new DiagramPoint(boundary.X, boundary.Y + boundary.Height), "BottomLeft") { Cursor = "nesw-resize" };

    public static UpdatablePoint CreateBottomRight(Boundary boundary) =>
        new(new DiagramPoint(boundary.X + boundary.Width, boundary.Y + boundary.Height), "BottomRight") { Cursor = "nwse-resize" };

    public static UpdatablePoint CreateRight(Boundary boundary) =>
        new(new DiagramPoint(boundary.X + boundary.Width, boundary.Y + boundary.Height/2), "Right") { Cursor = "ew-resize" };

    public static UpdatablePoint CreateLeft(Boundary boundary) =>
        new UpdatablePoint(new DiagramPoint(boundary.X, boundary.Y + boundary.Height / 2), "Left") { Cursor = "ew-resize" };

    public static UpdatablePoint CreateBottom(Boundary boundary) =>
        new(new DiagramPoint(boundary.X + boundary.Width/2, boundary.Y + boundary.Height), "Bottom") { Cursor = "ns-resize" };

    public static UpdatablePoint CreateTop(Boundary boundary) =>
        new(new DiagramPoint(boundary.X + boundary.Width/2, boundary.Y), "Top") { Cursor = "ns-resize" };

}
