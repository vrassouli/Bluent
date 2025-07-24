namespace Bluent.UI.Diagrams.Elements;

public record ScreenPoint(double X, double Y)
{
    public ScreenPoint() : this(0, 0)
    {

    }

    public static Distance2D operator -(ScreenPoint a, ScreenPoint b)
    {
        return new Distance2D(a.X - b.X, a.Y - b.Y);
    }
}
