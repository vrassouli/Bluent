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

    public override string ToString()
    {
        return $"({X}, {Y})";
    }
}
