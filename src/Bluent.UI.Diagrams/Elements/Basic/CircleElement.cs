using Bluent.UI.Diagrams.Elements.Abstractions;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Diagrams.Elements.Basic;

public class CircleElement : DrawingElementBase, IHasUpdatablePoints
{
    private double _cx;
    private double _cy;
    private double _r;

    public CircleElement(double cx, double cy, double r)
    {
        _cx = cx;
        _cy = cy;
        _r = r;
    }

    public double CX
    {
        get => _cx + Drag.Dx;
        set
        {
            if (_cx != value)
            {
                _cx = value;
                NotifyPropertyChanged();
            }
        }
    }

    public double CY
    {
        get => _cy + Drag.Dy;
        set
        {
            if (_cy != value)
            {
                _cy = value;
                NotifyPropertyChanged();
            }
        }
    }
    public double R
    {
        get => _r;
        set
        {
            if (_r != value)
            {
                _r = value;
                NotifyPropertyChanged();
            }
        }
    }

    public override Boundary Boundary => new Boundary(CX - R, CY - R, R * 2, R * 2);

    public IEnumerable<UpdatablePoint> UpdatablePoints
    {
        get
        {
            yield return new UpdatablePoint(new DiagramPoint(CX + R, CY), "Radius");
        }
    }

    public override RenderFragment Render()
    {
        return builder =>
        {
            int seq = 0;

            builder.OpenElement(seq++, "circle");

            builder.AddAttribute(seq++, "cx", CX);
            builder.AddAttribute(seq++, "cy", CY);
            builder.AddAttribute(seq++, "r", R);

            builder.AddAttribute(seq++, "fill", Fill);
            builder.AddAttribute(seq++, "stroke", Stroke);
            builder.AddAttribute(seq++, "stroke-width", StrokeWidth);
            builder.AddAttribute(seq++, "stroke-dasharray", StrokeDashArray);

            builder.CloseElement();
        };
    }

    public override void ApplyDrag()
    {
        _cx += Drag.Dx;
        _cy += Drag.Dy;
        NotifyPropertyChanged();

        base.ApplyDrag();
    }

    public void UpdatePoint(UpdatablePoint point, DiagramPoint update)
    {
        if (point.Data is string position)
        {
            switch (position)
            {
                case "Radius":
                    {
                        var r = update.X - CX;
                        if (r > 0)
                            R = r;
                    }
                    break;
                default:
                    throw new InvalidOperationException($"Unknown point position: {position}");
            }
        }
        else
        {
            throw new InvalidOperationException("UpdatablePoint Data must be a string representing the position.");
        }
    }
}
