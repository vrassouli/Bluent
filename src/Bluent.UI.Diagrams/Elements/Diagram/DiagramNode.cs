using Bluent.UI.Diagrams.Components.Internals;
using Microsoft.AspNetCore.Components;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace Bluent.UI.Diagrams.Elements.Diagram;

public interface IDiagramElement : IDrawingElement;
public interface IDiagramElementContainer
{
    void AddElement(IDiagramElement element);
    void RemoveElement(IDiagramElement element);
}

public abstract class DiagramNode : IDiagramElement
{
    private Distance2D _drag = new();
    private double _x;
    private double _y;
    private double _width;
    private double _height;
    private double _deltaLeft;
    private double _deltaRight;
    private double _deltaBottom;
    private double _deltaTop;
    private string? _stroke;
    private double? _strokeWidth;
    private string? _strokeDashArray;
    private string? _fill;
    private string? _text;

    public bool AllowHorizontalDrag => true;

    public bool AllowVerticalDrag => true;

    public bool AllowHorizontalResize => true;

    public bool AllowVerticalResize => true;

    public Boundary Boundary => new Boundary(X, Y, Width, Height);

    public double X
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
    public double Y
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

    public string? Text
    {
        get => _text;
        set
        {
            if (_text != value)
            {
                _text = value;
                NotifyPropertyChanged();
            }
        }
    }

    public IEnumerable<ResizeAnchor> ResizeAnchors => GetResizeAnchors();

    public string? Fill
    {
        get => _fill;
        set
        {
            if (_fill != value)
            {
                _fill = value;
                NotifyPropertyChanged();
            }
        }
    }
    public string? Stroke
    {
        get => _stroke;
        set
        {
            if (_stroke != value)
            {
                _stroke = value;
                NotifyPropertyChanged();
            }
        }
    }
    public double? StrokeWidth
    {
        get => _strokeWidth;
        set
        {
            if (_strokeWidth != value)
            {
                _strokeWidth = value;
                NotifyPropertyChanged();
            }
        }
    }
    public string? StrokeDashArray
    {
        get => _strokeDashArray;
        set
        {
            if (_strokeDashArray != value)
            {
                _strokeDashArray = value;
                NotifyPropertyChanged();
            }
        }
    }

    public event PropertyChangedEventHandler? PropertyChanged;

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

    public void ApplyDrag()
    {
        _x += Drag.Dx;
        _y += Drag.Dy;

        CancelDrag();
        NotifyPropertyChanged();
    }

    public void ApplyResize()
    {
        _x = _x + DeltaLeft;
        _width = _width - DeltaLeft + DeltaRight;
        _y = _y + DeltaTop;
        _height = _height - DeltaTop + DeltaBottom;

        CancelResize();
        NotifyPropertyChanged();
    }

    public void CancelDrag()
    {
        _drag = new();
    }

    public void CancelResize()
    {
        _deltaLeft = 0;
        _deltaTop = 0;
        _deltaRight = 0;
        _deltaBottom = 0;
    }

    public abstract RenderFragment Render();

    public void ResizeBottom(double dy)
    {
        DeltaBottom = dy;
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

    public void SetDrag(Distance2D drag)
    {
        Drag = drag;
    }

    protected virtual IEnumerable<ResizeAnchor> GetResizeAnchors()
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

    protected void NotifyPropertyChanged([CallerMemberName] string? propertyName = null)
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }
}

public abstract class DiagramContainerNode : DiagramNode, IDiagramElementContainer
{
    private List<IDiagramElement> _elements = new();

    public IReadOnlyList<IDiagramElement> Elements => _elements;

    public void AddElement(IDiagramElement element) => _elements.Add(element);

    public void RemoveElement(IDiagramElement element) => _elements.Remove(element);
}