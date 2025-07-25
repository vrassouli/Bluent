﻿using Bluent.UI.Diagrams.Components.Internals;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Diagrams.Elements;

internal class RectElement : SvgElementBase
{
    private double? _x;
    private double? _y;
    private double _width;
    private double _height;
    private double? _rx;
    private double? _ry;
    private double? _strokeWidth;

    public RectElement(double? x, double? y, double width, double height, double? rx, double? ry)
    {
        _x = x;
        _y = y;
        _width = width;
        _height = height;
        _rx = rx;
        _ry = ry;
    }
    public RectElement(double? x, double? y, double width, double height)
    {
        _x = x;
        _y = y;
        _width = width;
        _height = height;
    }

    public double? X
    {
        get => _x + Drag.Dx + DeltaLeft;
        set
        {
            if (_x != value)
            {
                _x = value;
                NotifyPropertyChanged();
            }
        }
    }
    public double? Y
    {
        get => _y + Drag.Dy + DeltaTop;
        set
        {
            if (_y != value)
            {
                _y = value;
                NotifyPropertyChanged();
            }
        }
    }
    public double Width
    {
        get => _width - DeltaLeft + DeltaRight;
        set
        {
            if (Width != value)
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
            if (Height != value)
            {
                _height = value;
                NotifyPropertyChanged();
            }
        }
    }
    public double? Rx
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
    public double? Ry
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
    public string? StrokeDashArray { get; set; }

    public override Boundary Boundary => new Boundary(X ?? 0, Y ?? 0, Width, Height);

    public override RenderFragment Render()
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
            builder.AddAttribute(seq++, "stroke", Stroke);
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

        if(AllowVerticalResize)
        {
            yield return ResizeAnchor.Top;
            yield return ResizeAnchor.Bottom;
        }

        if(AllowVerticalResize && AllowHorizontalResize)
        {
            yield return ResizeAnchor.Left | ResizeAnchor.Top;
            yield return ResizeAnchor.Left | ResizeAnchor.Bottom;
            yield return ResizeAnchor.Right | ResizeAnchor.Top;
            yield return ResizeAnchor.Right | ResizeAnchor.Bottom;
        }
    }

    public override void ApplyDrag()
    {
        _x += Drag.Dx;
        _y += Drag.Dy;
        NotifyPropertyChanged();

        base.ApplyDrag();
    }

    public override void ApplyResize()
    {
        _x = _x + DeltaLeft;
        _width = _width - DeltaLeft + DeltaRight;
        _y = _y + DeltaTop;
        _height = _height - DeltaTop + DeltaBottom;

        NotifyPropertyChanged();

        base.ApplyResize();
    }
}
