using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Diagrams.Elements.Basic;

public class PathElement : DrawingElementBase
{
    private List<DiagramPoint> _points = new();

    public IReadOnlyList<DiagramPoint> Points => _points;

    public override Boundary Boundary
    {
        get
        {
            var minX = _points.Min(x => x.X);
            var maxX = _points.Max(x => x.X);
            var minY = _points.Min(y => y.Y);
            var maxY = _points.Max(y => y.Y);

            return new Boundary(minX, minY, maxX - maxY, maxY - minY);
        }
    }

    public override RenderFragment Render()
    {
        return builder =>
        {
            int seq = 0;

            builder.OpenElement(seq++, "path");

            builder.AddAttribute(seq++, "d", GetPathData());

            builder.AddAttribute(seq++, "fill", Fill);
            builder.AddAttribute(seq++, "stroke", Stroke);
            builder.AddAttribute(seq++, "stroke-width", StrokeWidth);
            builder.AddAttribute(seq++, "stroke-dasharray", StrokeDashArray);

            builder.CloseElement();
        };
    }

    private string? GetPathData()
    {
        if (_points.Any())
        {
            string? data = null;

            foreach (var point in _points)
            {
                if (data is null)
                    data = $"M{point.X} {point.Y} ";
                else
                    data += $"L{point.X} {point.Y} ";
            }

            //data += "Z";

            return data;
        }

        return null;
    }

    public void AddPoint(DiagramPoint point)
    {
        _points.Add(point);
        NotifyPropertyChanged();
    }

    public override void ApplyDrag()
    {
        //_x1 += Drag.Dx;
        //_x2 += Drag.Dx;
        //_y1 += Drag.Dy;
        //_y2 += Drag.Dy;
        //NotifyPropertyChanged();

        base.ApplyDrag();
    }
}
