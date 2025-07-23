namespace Bluent.UI.Diagrams.Elements;

public record Boundary(double X, double Y, double Width, double Height)
{
    public bool Contains(Boundary boundary)
    {
        if (X <= boundary.X &&
            Y <= boundary.Y &&
            X + Width >= boundary.X + boundary.Width &&
            Y + Height >= boundary.Y + boundary.Height)
            return true;

        return false;
    }
}
