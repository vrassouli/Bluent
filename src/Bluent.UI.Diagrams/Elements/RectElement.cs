using Bluent.UI.Diagrams.Components;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Diagrams.Elements;

internal class RectElement : SvgElementBase
{
    private string? _x;
    private string? _y;
    private string _width;
    private string _height;
    private string? _rx;
    private string? _ry;
    private string? _strokeWidth;

    public RectElement(string? x, string? y, string width, string height, string? rx, string? ry, string? strokeWidth)
    {
        _x = x;
        _y = y;
        _width = width;
        _height = height;
        _rx = rx;
        _ry = ry;
        _strokeWidth = strokeWidth;
    }
    public RectElement(string? x, string? y, string width, string height)
    {
        _x = x;
        _y = y;
        _width = width;
        _height = height;
    }

    public string? X
    {
        get => _x;
        set
        {
            if (_x != value)
            {
                _x = value;
                NotifyPropertyChanged();
            }
        }
    }

    public string? Y
    {
        get => _y;
        set
        {
            if (_y != value)
            {
                _y = value;
                NotifyPropertyChanged();
            }
        }
    }
    public string Width
    {
        get => _width;
        set
        {
            if (Width != value)
            {
                _width = value;
                NotifyPropertyChanged();
            }
        }
    }
    public string Height
    {
        get => _height;
        set
        {
            if (Height != value)
            {
                _height = value;
                NotifyPropertyChanged();
            }
        }
    }
    public string? Rx
    {
        get => _rx;
        set
        {
            if (Rx != value)
            {
                _rx = value;
                NotifyPropertyChanged();
            }
        }
    }
    public string? Ry
    {
        get => _ry;
        set
        {
            if (_ry != value)
            {
                _ry = value;
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

            builder.OpenElement(seq++, "rect");


            builder.AddAttribute(seq++, "x", X);
            builder.AddAttribute(seq++, "y", Y);
            builder.AddAttribute(seq++, "width", Width);
            builder.AddAttribute(seq++, "height", Height);
            builder.AddAttribute(seq++, "rx", Rx);
            builder.AddAttribute(seq++, "ry", Ry);
            builder.AddAttribute(seq++, "stroke-width", StrokeWidth);
            builder.AddAttribute(seq++, "fill", Fill);
            builder.AddAttribute(seq++, "stroke", state == ElementState.Selected ? "orange" : Stroke);

            builder.CloseElement();
        };
    }
}
