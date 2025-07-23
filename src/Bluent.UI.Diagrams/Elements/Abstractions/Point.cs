namespace Bluent.UI.Diagrams.Elements;

public record Point(double X, double Y)
{
    public static Distance2D operator -(Point a, Point b)
    {
        return new Distance2D(a.X - b.X, a.Y - b.Y);
    }
}
