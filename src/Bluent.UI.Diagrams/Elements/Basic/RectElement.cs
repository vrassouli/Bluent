using Bluent.UI.Diagrams.Elements.Abstractions;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Diagrams.Elements.Basic;

public class RectElement : DrawingElementBase, IHasUpdatablePoints
{
    private double? _x;
    private double? _y;
    private double _width;
    private double _height;
    private double? _rx;
    private double? _ry;

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
        get => _x + Drag.Dx;
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
        get => _y + Drag.Dy;
        set
        {
            if (_y != value)
            {
                var old = _y;
                _y = value;
                NotifyPropertyChanged();
            }
        }
    }
    public double Width
    {
        get => _width;
        set
        {
            if (Width != value)
            {
                var old = _width;
                _width = value;
                NotifyPropertyChanged();
            }
        }
    }
    public double Height
    {
        get => _height;
        set
        {
            if (Height != value)
            {
                var old = _height;
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
                var old = _rx;
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
                var old = _ry;
                _ry = value;
                NotifyPropertyChanged();
            }
        }
    }

    private double Left => X ?? 0;
    private double Top => Y ?? 0;
    private double Right => Left + Width;
    private double Bottom => Top + Height;

    public override Boundary Boundary => new Boundary(X ?? 0, Y ?? 0, Width, Height);

    public IEnumerable<UpdatablePoint> UpdatablePoints
    {
        get
        {
            yield return new UpdatablePoint(new DiagramPoint(Left, Top), "TopLeft");
            yield return new UpdatablePoint(new DiagramPoint(Right, Top), "TopRight");
            yield return new UpdatablePoint(new DiagramPoint(Left, Bottom), "BottomLeft");
            yield return new UpdatablePoint(new DiagramPoint(Right, Bottom), "BottomRight");
        }
    }

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

            builder.AddAttribute(seq++, "fill", Fill);
            builder.AddAttribute(seq++, "stroke", Stroke);
            builder.AddAttribute(seq++, "stroke-width", StrokeWidth);
            builder.AddAttribute(seq++, "stroke-dasharray", StrokeDashArray);

            builder.CloseElement();
        };
    }

    public override void ApplyDrag()
    {
        _x += Drag.Dx;
        _y += Drag.Dy;

        NotifyPropertyChanged();

        base.ApplyDrag();
    }

    public void UpdatePoint(UpdatablePoint point, DiagramPoint update)
    {
        if (point.Data is string position)
        {
            switch (position)
            {
                case "TopLeft":
                    {
                        var dx = update.X - Left;
                        var dy = update.Y - Top;

                        if (Width - dx > 0)
                        {
                            X = update.X;
                            Width -= dx;
                        }

                        if (Height - dy > 0)
                        {
                            Y = update.Y;
                            Height -= dy;
                        }
                    }
                    break;
                case "TopRight":
                    {
                        var dx = update.X - Right;
                        var dy = update.Y - Top;

                        if (Width + dx > 0)
                        {
                            Width += dx;
                        }

                        if (Height - dy > 0)
                        {
                            Y = update.Y;
                            Height -= dy;
                        }
                    }
                    break;
                case "BottomLeft":
                    {
                        var dx = update.X - Left;
                        var dy = update.Y - Bottom;

                        if (Width - dx > 0)
                        {
                            X = update.X;
                            Width -= dx;
                        }

                        if (Height + dy > 0)
                        {
                            Height += dy;
                        }
                    }
                    break;
                case "BottomRight":
                    {
                        var dx = update.X - Right;
                        var dy = update.Y - Bottom;

                        if (Width + dx > 0)
                        {
                            Width += dx;
                        }

                        if (Height + dy > 0)
                        {
                            Height += dy;
                        }
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
