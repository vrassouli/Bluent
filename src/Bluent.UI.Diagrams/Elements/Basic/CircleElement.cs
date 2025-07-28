using Bluent.UI.Diagrams.Components.Internals;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Diagrams.Elements.Basic;

public class CircleElement : DrawingElementBase
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
        get => _r - DeltaLeft + DeltaRight - DeltaTop + DeltaBottom;
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
    }

    public override void ApplyDrag()
    {
        _cx += Drag.Dx;
        _cy += Drag.Dy;
        NotifyPropertyChanged();

        base.ApplyDrag();
    }

    public override void ApplyResize()
    {
        _r = _r - DeltaLeft + DeltaRight - DeltaTop + DeltaBottom;
        //_width = _width - DeltaLeft + DeltaRight;
        //_y = _y + DeltaTop;
        //_height = _height - DeltaTop + DeltaBottom;

        NotifyPropertyChanged();

        base.ApplyResize();
    }
}
