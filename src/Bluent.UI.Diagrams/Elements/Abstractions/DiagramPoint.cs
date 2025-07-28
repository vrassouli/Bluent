namespace Bluent.UI.Diagrams.Elements;

public record DiagramPoint(double X, double Y)
{
    public DiagramPoint() : this(0, 0)
    {

    }

    public static Distance2D operator -(DiagramPoint a, DiagramPoint b)
    {
        return new Distance2D(a.X - b.X, a.Y - b.Y);
    }

    public static double GetDistance(DiagramPoint a, DiagramPoint b)
    {
        return Math.Sqrt(Math.Pow(a.X - b.X, 2) + Math.Pow(a.Y - b.Y, 2));
    }

    internal static DiagramPoint GetCenter(DiagramPoint a, DiagramPoint b)
    {
        var x = (b.X - a.X) / 2 + a.X;
        var y = (b.Y - a.Y) / 2 + a.Y;

        return new DiagramPoint(x, y);
    }

    public override string ToString()
    {
        return $"({X}, {Y})";
    }
}
