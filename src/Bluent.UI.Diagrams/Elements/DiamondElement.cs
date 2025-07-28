using Bluent.UI.Diagrams.Components.Internals;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Diagrams.Elements;

public class DiamondElement : SvgElementBase
{
    private double _cx;
    private double _cy;
    private double _width;
    private double _height;

    public double Cx
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
    public double Cy
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
    public double Width
    {
        get => _width - DeltaLeft + DeltaRight;
        set
        {
            if (_width != value)
            {
                _width = value;
                NotifyPropertyChanged();
            }
        }
    }
    public double Height
    {
        get => _height - DeltaTop + DeltaBottom;
        set
        {
            if (_height != value)
            {
                _height = value;
                NotifyPropertyChanged();
            }
        }
    }

    public DiamondElement(double cx, double cy)
        : this(cx, cy, 0, 0)
    {
    }

    public DiamondElement(double cx, double cy, double width, double height)
    {
        _cx = cx;
        _cy = cy;
        _width = width;
        _height = height;
    }

    public override Boundary Boundary => new Boundary(Cx - Width/2, Cy - Height/2, Width, Height);

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

    private string GetPathData()
    {
        return $"M{Cx - Width / 2} {Cy} l{Width / 2} {-Height / 2} l{Width / 2} {Height / 2} l{-Width / 2} {Height / 2} l{-Width / 2} {-Height / 2} Z";
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
        _width = _width - DeltaLeft + DeltaRight;
        _height = _height - DeltaTop + DeltaBottom;

        NotifyPropertyChanged();

        base.ApplyResize();
    }
}
