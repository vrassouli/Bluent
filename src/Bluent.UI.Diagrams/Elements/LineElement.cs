using Bluent.UI.Diagrams.Components.Internals;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Diagrams.Elements;

internal class LineElement : SvgElementBase
{
    private double _x1;
    private double _x2;
    private double _y1;
    private double _y2;
    private double? _strokeWidth;

    public LineElement(double x1, double y1, double x2, double y2)
    {
        _x1 = x1;
        _y1 = y1;
        _x2 = x2;
        _y2 = y2;
    }

    public double X1
    {
        get => _x1 + Drag.Dx + DeltaLeft;
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
        get => _y1 + Drag.Dy + DeltaTop;
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
        get => _x2 + Drag.Dx + DeltaRight;
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
        get => _y2 + Drag.Dy + DeltaBottom;
        set
        {
            if (_y2 != value)
            {
                _y2 = value;
                NotifyPropertyChanged();
            }
        }
    }
    public double? StrokeWidth
    {
        get => _strokeWidth;
        set
        {
            if (StrokeWidth != value)
            {
                _strokeWidth = value;
                NotifyPropertyChanged();
            }
        }
    }

    public override Boundary Boundary => new Boundary(Math.Min(X1, X2),
                                                      Math.Min(Y1, Y2),
                                                      Math.Max(X1, X2) - Math.Min(X1, X2),
                                                      Math.Max(Y1, Y2) - Math.Min(Y1, Y2));

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
            builder.AddAttribute(seq++, "stroke-width", StrokeWidth);

            builder.AddAttribute(seq++, "fill", Fill);
            builder.AddAttribute(seq++, "stroke", Stroke);

            builder.CloseElement();
        };
    }

    protected override IEnumerable<ResizeAnchor> GetResizeAnchors()
    {
        if (AllowHorizontalResize)
        {
            yield return ResizeAnchor.Left;
            yield return ResizeAnchor.Right;
        }

        if (AllowVerticalResize)
        {
            yield return ResizeAnchor.Top;
            yield return ResizeAnchor.Bottom;
        }

        if (AllowVerticalResize && AllowHorizontalResize)
        {
            yield return ResizeAnchor.Left | ResizeAnchor.Top;
            yield return ResizeAnchor.Left | ResizeAnchor.Bottom;
            yield return ResizeAnchor.Right | ResizeAnchor.Top;
            yield return ResizeAnchor.Right | ResizeAnchor.Bottom;
        }
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

    public override void ApplyResize()
    {
        _x1 = _x1 + DeltaLeft;
        _y1 = _y1 + DeltaTop;
        _x2 = _x2 + DeltaRight;
        _y2 = _y2 + DeltaBottom;

        NotifyPropertyChanged();

        base.ApplyResize();
    }

}