using Bluent.UI.Diagrams.Components;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Diagrams.Elements;

internal class CircleElement : SvgElementBase
{
    private string _cx;
    private string _cy;
    private string _r;
    private string? _strokeWidth;

    public CircleElement(string cx, string cy, string r)
    {
        _cx = cx;
        _cy = cy;
        _r = r;
    }

    public string CX
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

    public string CY
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
    public string R
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
    public string? StrokeWidth
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

    public override RenderFragment Render(ElementState state)
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
