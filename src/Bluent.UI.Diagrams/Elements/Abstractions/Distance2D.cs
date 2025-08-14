namespace Bluent.UI.Diagrams.Elements;

public record Distance2D
{
    public double Dx { get; set; }
    public double Dy { get; set; }


    public Distance2D() : this(0, 0)
    {

    }

    public Distance2D(double dx, double dy)
    {
        Dx = dx;
        Dy = dy;
    }

    public static Distance2D operator +(Distance2D a, Distance2D b)
    {
        return new Distance2D(a.Dx - b.Dx, a.Dy - b.Dy);
    }

}