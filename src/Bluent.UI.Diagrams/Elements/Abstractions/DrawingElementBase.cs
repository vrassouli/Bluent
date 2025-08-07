using Microsoft.AspNetCore.Components;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace Bluent.UI.Diagrams.Elements;

public abstract class DrawingElementBase : IDrawingElement
{
    private Distance2D _drag = new();
    private bool _isSelected;

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
    public bool IsSelected
    {
        get => _isSelected;
        set
        {
            if (_isSelected != value)
            {
                _isSelected = value;
                NotifyPropertyChanged();
            }
        }
    }
    public string? Fill { get; set; }
    public string? Stroke { get; set; }
    public double? StrokeWidth { get; set; }
    public string? StrokeDashArray { get; set; }
    public virtual double? SelectionStrokeWidth { get; set; } = 2;
    public virtual string? SelectionStrokeDashArray { get; set; } = "4 3";
    public virtual string? SelectionStroke { get; set; } = "#36a2eb";
    public abstract Boundary Boundary { get; }
    public virtual bool AllowHorizontalDrag { get; } = true;
    public virtual bool AllowVerticalDrag { get; } = true;

    public event PropertyChangedEventHandler? PropertyChanged;

    public virtual void PointerMovingOutside()
    {

    }

    public virtual void PointerMovingInside(DiagramPoint offset, bool direct)
    {

    }

    public abstract RenderFragment Render();
   
    public virtual void ApplyDrag()
    {
        Drag = new();
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
}
