using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Diagrams.Elements;

internal class CircleElement : SvgElementBase
{
    private double _cx;
    private double _cy;
    private double _r;
    private double? _strokeWidth;

    public CircleElement(double cx, double cy, double r)
    {
        _cx = cx;
        _cy = cy;
        _r = r;
    }

    public double CX
    {
        get => _cx;
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
        get => _cy;
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
            builder.AddAttribute(seq++, "stroke-width", StrokeWidth);

            builder.AddAttribute(seq++, "fill", Fill);
            builder.AddAttribute(seq++, "stroke", Stroke);

            builder.CloseElement();
        };
    }
}
