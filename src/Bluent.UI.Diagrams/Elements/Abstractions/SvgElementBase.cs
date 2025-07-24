using Microsoft.AspNetCore.Components;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace Bluent.UI.Diagrams.Elements;

internal abstract class SvgElementBase : IDrawingElement
{
    private Distance2D _drag = new();

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
    public string? Fill { get; set; }
    public string? Stroke { get; set; }
    public abstract Boundary Boundary { get; }
    public virtual bool AllowHorizontalDrag { get; } = true;
    public virtual bool AllowVerticalDrag { get; } = true;
    public virtual bool AllowVerticalResize { get; } = true;
    public virtual bool AllowHorizontalResize { get; } = true;

    public event PropertyChangedEventHandler? PropertyChanged;

    public virtual void ApplyDrag()
    {
        Drag = new();
    }

    public abstract RenderFragment Render();

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
