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

    public static double GetDistance(ScreenPoint a, ScreenPoint b)
    {
        return Math.Sqrt(Math.Pow(a.X - b.X, 2) + Math.Pow(a.Y - b.Y, 2));
    }

    internal static ScreenPoint GetCenter(ScreenPoint a, ScreenPoint b)
    {
        var x = (b.X - a.X) / 2 + a.X;
        var y = (b.Y - a.Y) / 2 + a.Y;

        return new ScreenPoint(x, y);
    }
}
