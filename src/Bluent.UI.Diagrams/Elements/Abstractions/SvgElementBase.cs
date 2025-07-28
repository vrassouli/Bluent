using Bluent.UI.Diagrams.Components.Internals;
using Microsoft.AspNetCore.Components;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace Bluent.UI.Diagrams.Elements;

public abstract class SvgElementBase : IDrawingElement
{
    private Distance2D _drag = new();
    private double _deltaLeft;
    private double _deltaRight;
    private double _deltaBottom;
    private double _deltaTop;

    protected Distance2D Drag
    {
        get => _drag;
        private set
        {
            if (_drag != value)
            {
                _drag = value;
                NotifyPropertyChanged();
            }
        }
    }
    protected double DeltaTop
    {
        get => _deltaTop;
        set
        {
            if (_deltaTop != value)
            {
                _deltaTop = value;
                NotifyPropertyChanged();
            }
        }
    }
    protected double DeltaBottom
    {
        get => _deltaBottom;
        set
        {
            if (_deltaBottom != value)
            {
                _deltaBottom = value;
                NotifyPropertyChanged();
            }
        }
    }
    protected double DeltaRight
    {
        get => _deltaRight;
        set
        {
            if (_deltaRight != value)
            {
                _deltaRight = value;
                NotifyPropertyChanged();
            }
        }
    }
    protected double DeltaLeft
    {
        get => _deltaLeft;
        set
        {
            if (_deltaLeft != value)
            {
                _deltaLeft = value;
                NotifyPropertyChanged();
            }
        }
    }
    public string? Fill { get; set; }
    public string? Stroke { get; set; }
    public double? StrokeWidth { get; set; }
    public string? StrokeDashArray { get; set; }
    public abstract Boundary Boundary { get; }
    public virtual bool AllowHorizontalDrag { get; } = true;
    public virtual bool AllowVerticalDrag { get; } = true;
    public virtual bool AllowVerticalResize { get; } = true;
    public virtual bool AllowHorizontalResize { get; } = true;
    public IEnumerable<ResizeAnchor> ResizeAnchors => GetResizeAnchors();


    public event PropertyChangedEventHandler? PropertyChanged;

    public virtual void ApplyDrag()
    {
        Drag = new();
    }

    public abstract RenderFragment Render();
    
    protected virtual IEnumerable<ResizeAnchor> GetResizeAnchors()
    {
        return Enumerable.Empty<ResizeAnchor>();
    }

    public void SetDrag(Distance2D drag)
    {
        Drag = drag;
    }

    public void CancelDrag() => Drag = new();

    protected void NotifyPropertyChanged([CallerMemberName] string? propertyName = null)
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }

    public void ResizeLeft(double dx)
    {
        DeltaLeft = dx;
    }

    public void ResizeRight(double dx)
    {
        DeltaRight = dx;
    }

    public void ResizeTop(double dy)
    {
        DeltaTop = dy;
    }

    public void ResizeBottom(double dy)
    {
        DeltaBottom = dy;
    }

    public void CancelResize()
    {
        DeltaLeft = 0;
        DeltaTop = 0;
        DeltaRight = 0;
        DeltaBottom = 0;
    }

    public virtual void ApplyResize() => CancelResize();
}
