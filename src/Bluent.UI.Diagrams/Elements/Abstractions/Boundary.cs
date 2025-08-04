
using Bluent.UI.Diagrams.Elements.Diagram;

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

    public bool Intersects(Boundary other)
    {
        return X < other.Right && Right > other.X && Y < other.Bottom && Bottom > other.Y;
    }

    public bool Contains(DiagramPoint point)
    {
        if (point.X >= X &&
            point.X <= Right &&
            point.Y >= Y &&
            point.Y <= Bottom)
            return true;

        return false;
    }

    internal Edges GetNearestEdge(DiagramPoint point)
    {
        var left = Math.Abs(point.X - X);
        var right = Math.Abs(point.X - Right);
        var top = Math.Abs(point.Y - Y);
        var bottom = Math.Abs(point.Y - Bottom);

        Edges hEdge = left < right ? Edges.Left : Edges.Right;
        Edges vEdge = top < bottom ? Edges.Top : Edges.Bottom;

        Edges edge = (hEdge, vEdge) switch
        {
            (Edges.Left, Edges.Top) => left < top ? Edges.Left : Edges.Top,
            (Edges.Left, Edges.Bottom) => left < bottom ? Edges.Left : Edges.Bottom,

            (Edges.Right, Edges.Top) => right < top ? Edges.Right : Edges.Top,
            (Edges.Right, Edges.Bottom) => right < bottom ? Edges.Right : Edges.Bottom,

            _ => throw new ArgumentOutOfRangeException()
        };

        return edge;

    }

    public DiagramPoint Center => new DiagramPoint(Cx, Cy);

    public double Cx => X + Width / 2;
    public double Cy => Y + Height / 2;
    public double Right => X + Width;
    public double Bottom => Y + Height;
}
