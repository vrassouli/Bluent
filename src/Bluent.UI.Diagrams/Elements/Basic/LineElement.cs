using Bluent.UI.Diagrams.Elements.Abstractions;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Diagrams.Elements.Basic;

public class LineElement : DrawingElementBase, IHasUpdatablePoints
{
    private double _x1;
    private double _x2;
    private double _y1;
    private double _y2;

    public LineElement(double x1, double y1, double x2, double y2)
    {
        _x1 = x1;
        _y1 = y1;
        _x2 = x2;
        _y2 = y2;
    }

    public double X1
    {
        get => _x1 + Drag.Dx;
        set
        {
            if (_x1 != value)
            {
                _x1 = value;
                NotifyPropertyChanged();
            }
        }
    }
    public double Y1
    {
        get => _y1 + Drag.Dy;
        set
        {
            if (_y1 != value)
            {
                _y1 = value;
                NotifyPropertyChanged();
            }
        }
    }
    public double X2
    {
        get => _x2 + Drag.Dx;
        set
        {
            if (_x2 != value)
            {
                _x2 = value;
                NotifyPropertyChanged();
            }
        }
    }
    public double Y2
    {
        get => _y2 + Drag.Dy;
        set
        {
            if (_y2 != value)
            {
                _y2 = value;
                NotifyPropertyChanged();
            }
        }
    }

    public override Boundary Boundary => new Boundary(Math.Min(X1, X2),
                                                      Math.Min(Y1, Y2),
                                                      Math.Max(X1, X2) - Math.Min(X1, X2),
                                                      Math.Max(Y1, Y2) - Math.Min(Y1, Y2));

    public IEnumerable<UpdatablePoint> UpdatablePoints
    {
        get
        {
            yield return new UpdatablePoint(new DiagramPoint(X1, Y1), "StartPoint");
            yield return new UpdatablePoint(new DiagramPoint(X2, Y2), "EndPoint");
        }
    }

    public override RenderFragment Render()
    {
        return builder =>
        {
            int seq = 0;

            builder.OpenElement(seq++, "line");

            builder.AddAttribute(seq++, "x1", X1);
            builder.AddAttribute(seq++, "x2", X2);
            builder.AddAttribute(seq++, "y1", Y1);
            builder.AddAttribute(seq++, "y2", Y2);

            builder.AddAttribute(seq++, "fill", Fill);
            builder.AddAttribute(seq++, "stroke", Stroke);
            builder.AddAttribute(seq++, "stroke-width", StrokeWidth);
            builder.AddAttribute(seq++, "stroke-dasharray", StrokeDashArray);

            builder.CloseElement();
        };
    }

    public override void ApplyDrag()
    {
        _x1 += Drag.Dx;
        _x2 += Drag.Dx;
        _y1 += Drag.Dy;
        _y2 += Drag.Dy;
        NotifyPropertyChanged();

        base.ApplyDrag();
    }

    public void UpdatePoint(UpdatablePoint point, DiagramPoint update)
    {
        if (point.Data is string position)
        {
            switch (position)
            {
                case "StartPoint":
                    {
                        X1 = update.X;
                        Y1 = update.Y;
                    }
                    break;

                case "EndPoint":
                    {
                        X2 = update.X;
                        Y2 = update.Y;
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