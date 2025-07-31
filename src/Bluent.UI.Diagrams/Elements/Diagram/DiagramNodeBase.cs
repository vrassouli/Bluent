using Bluent.UI.Diagrams.Components.Internals;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace Bluent.UI.Diagrams.Elements.Diagram;

public abstract class DiagramNodeBase : IDiagramNode, IDiagramElementContainer, IDiagramBoundaryElementContainer
{
    protected DiagramNodeBase(bool allowChildElements, bool allowBoundaryElements)
    {
        _allowChildElements = allowChildElements;
        _allowBoundaryElements = allowBoundaryElements;
    }

    #region Private fields
    private const double Epsilon = 0.01;

    private bool _pointerDirectlyOnNode = false;
    private bool _pointerIndirectlyOnNode = false;
    private List<IDiagramNode> _elements = new();
    private List<IDiagramBoundaryNode> _boundaryElements = new();
    private List<IDiagramConnector> _incomingConnectors = new();
    private List<IDiagramConnector> _outgoingConnectors = new();

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
    private bool _isSelected;
    private readonly bool _allowChildElements;
    private readonly bool _allowBoundaryElements;

    #endregion

    #region Properties

    public IEnumerable<IDiagramNode> DiagramElements => _elements;
    public IEnumerable<IDiagramBoundaryNode> BoundaryElements => _boundaryElements;
    public IEnumerable<IDiagramConnector> IncomingConnectors => _incomingConnectors;
    public IEnumerable<IDiagramConnector> OutgoingConnectors => _outgoingConnectors;

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
            if (Math.Abs(_x - value) > Epsilon)
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
            if (Math.Abs(_y - value) > Epsilon)
            {
                _y = value;
                NotifyPropertyChanged();
            }
        }
    }
    public double Width
    {
        get => _width - DeltaLeft + DeltaRight;
        private set
        {
            if (Math.Abs(_width - value) > Epsilon)
            {
                _width = value;
                NotifyPropertyChanged();
            }
        }
    }
    public double Height
    {
        get => _height - DeltaTop + DeltaBottom;
        private set
        {
            if (Math.Abs(_height - value) > Epsilon)
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
    public virtual string? Fill
    {
        get
        {
            if (_pointerDirectlyOnNode)
                return HighlightFill;
            if (_pointerIndirectlyOnNode)
                return IndirectHighlightFill;

            return _fill;
        }

        set
        {
            if (_fill != value)
            {
                _fill = value;
                NotifyPropertyChanged();
            }
        }
    }
    public virtual string? Stroke
    {
        get
        {
            if (_pointerDirectlyOnNode)
                return HighlightStroke;
            if (_pointerIndirectlyOnNode)
                return IndirectHighlightStroke;

            return _stroke;
        }

        set
        {
            if (_stroke != value)
            {
                _stroke = value;
                NotifyPropertyChanged();
            }
        }
    }
    public virtual double? StrokeWidth
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
    public virtual string? StrokeDashArray
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

    public string? HighlightStroke { get; set; } = "var(--colorNeutralStroke1Hover)";
    public string? HighlightFill { get; set; } = "var(--colorNeutralBackground1Hover)";
    public string? IndirectHighlightFill { get; set; } = "var(--colorNeutralBackground2)";
    public string? IndirectHighlightStroke { get; set; } = "var(--colorNeutralStroke2)";

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


    #endregion

    public abstract RenderFragment Render();

    public virtual void PointerMovingOutside()
    {
        if (_pointerDirectlyOnNode)
        {
            _pointerDirectlyOnNode = false;
            NotifyPropertyChanged();
        }


    }

    public virtual void PointerMovingInside(DiagramPoint point, bool direct)
    {
        if (direct && !_pointerDirectlyOnNode)
        {
            _pointerDirectlyOnNode = true;
            _pointerIndirectlyOnNode = false;
            NotifyPropertyChanged();
        }
        else if (_allowChildElements && _allowBoundaryElements && !direct && !_pointerIndirectlyOnNode)
        {
            _pointerDirectlyOnNode = false;
            _pointerIndirectlyOnNode = true;
            NotifyPropertyChanged();
        }
    }

    public void AddDiagramElement(IDiagramNode element)
    {
        element.PropertyChanged += ChildElementPropertyChanged;

        if (element is IDiagramBoundaryNode boundaryElement)
        {
            StickToBoundary(boundaryElement);
            _boundaryElements.Add(boundaryElement);
        }
        else
            _elements.Add(element);

        NotifyPropertyChanged(nameof(DiagramElements));
    }

    public void RemoveDiagramElement(IDiagramNode element)
    {
        element.PropertyChanged -= ChildElementPropertyChanged;

        if (element is IDiagramBoundaryNode boundaryElement)
        {
            _boundaryElements.Remove(boundaryElement);
            NotifyPropertyChanged(nameof(BoundaryElements));
        }
        else
        {
            _elements.Remove(element);
            NotifyPropertyChanged(nameof(DiagramElements));
        }

        element.IsSelected = false;
    }

    public virtual bool CanContain(IDiagramNode element)
    {
        if (element is IDiagramBoundaryNode)
        {
            return _allowBoundaryElements;
        }

        return _allowChildElements;
    }
    
    public bool CanContain<T>() where T : IDiagramElement
    {
        return CanContain(typeof(T));
    }

    public bool CanContain(Type type)
    {
        if (type.IsAssignableTo(typeof(IDiagramBoundaryNode)))
        {
            return _allowBoundaryElements;
        }

        return _allowChildElements;
    }

    public virtual void ApplyDrag()
    {
        foreach (var el in DiagramElements)
        {
            el.ApplyDrag();
        }
        foreach (var el in BoundaryElements)
        {
            el.ApplyDrag();
        }

        _x += Drag.Dx;
        _y += Drag.Dy;

        CancelDrag();
        NotifyPropertyChanged(nameof(X));
        NotifyPropertyChanged(nameof(Y));
    }

    public virtual void CancelDrag()
    {
        foreach (var el in DiagramElements)
        {
            el.CancelDrag();
        }
        foreach (var el in BoundaryElements)
        {
            el.CancelDrag();
        }
        _drag = new();
    }

    public virtual void SetDrag(Distance2D drag)
    {
        foreach (var el in DiagramElements)
        {
            el.SetDrag(drag);
        }
        foreach (var el in BoundaryElements)
        {
            el.SetDrag(drag);
        }

        Drag = drag;
    }

    public virtual void ApplyResize()
    {
        _x = _x + DeltaLeft;
        _width = _width - DeltaLeft + DeltaRight;
        _y = _y + DeltaTop;
        _height = _height - DeltaTop + DeltaBottom;

        CancelResize();
        NotifyPropertyChanged(nameof(X));
        NotifyPropertyChanged(nameof(Y));
        NotifyPropertyChanged(nameof(Width));
        NotifyPropertyChanged(nameof(Height));
    }

    public virtual void CancelResize()
    {
        _deltaLeft = 0;
        _deltaTop = 0;
        _deltaRight = 0;
        _deltaBottom = 0;
    }

    public virtual void ResizeBottom(double dy)
    {
        DeltaBottom = dy;
    }

    public virtual void ResizeLeft(double dx)
    {
        DeltaLeft = dx;
    }

    public virtual void ResizeRight(double dx)
    {
        DeltaRight = dx;
    }

    public virtual void ResizeTop(double dy)
    {
        DeltaTop = dy;
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

    public override string ToString()
    {
        return $"{Text} ({this.GetType().Name})";
    }

    protected void RenderChildElements(int regionSeq, RenderTreeBuilder builder)
    {
        var sequence = 0;
        builder.OpenRegion(regionSeq);

        foreach (var childElement in DiagramElements.OrderBy(x => x.IsSelected).ThenBy(x => (x as IDiagramElementContainer)?.HasSelection ?? false))
        {
            builder.OpenRegion(sequence++);
            builder.OpenComponent<ElementHost>(sequence++);
            builder.AddAttribute(sequence++, nameof(ElementHost.Element), childElement);
            builder.CloseComponent();
            builder.CloseRegion();
        }

        foreach (var childElement in BoundaryElements.OrderBy(x => x.IsSelected).ThenBy(x => (x as IDiagramElementContainer)?.HasSelection ?? false))
        {
            builder.OpenRegion(sequence++);
            builder.OpenComponent<ElementHost>(sequence++);
            builder.AddAttribute(sequence++, nameof(ElementHost.Element), childElement);
            builder.CloseComponent();
            builder.CloseRegion();
        }

        builder.CloseRegion();
    }

    private void ChildElementPropertyChanged(object? sender, PropertyChangedEventArgs e)
    {
        if (sender is IDiagramBoundaryNode boundaryElement &&
            (e.PropertyName == nameof(X) ||
            e.PropertyName == nameof(Y) ||
            e.PropertyName == nameof(Width) ||
            e.PropertyName == nameof(Height)))
        {
            StickToBoundary(boundaryElement);
        }

        NotifyPropertyChanged(nameof(DiagramElements));
    }

    private void StickToBoundary(IDiagramBoundaryNode element)
    {
        var left = Math.Abs(element.Boundary.Cx - Boundary.X);
        var top = Math.Abs(element.Boundary.Cy - Boundary.Y);
        var right = Math.Abs(element.Boundary.Cx - Boundary.Right);
        var bottom = Math.Abs(element.Boundary.Cy - Boundary.Bottom);

        Edges hEdge = left < right ? Edges.Left : Edges.Right;
        Edges vEdge = top < bottom ? Edges.Top : Edges.Bottom;

        Edges edge = (hEdge, vEdge) switch
        {
            (Edges.Left, Edges.Top) => left < top ? Edges.Left : Edges.Top,
            (Edges.Left, Edges.Bottom) => left < bottom ? Edges.Left : Edges.Bottom,

            (Edges.Right, Edges.Top) => right < top ? Edges.Right : Edges.Top,
            (Edges.Right, Edges.Bottom) => right < top ? Edges.Right : Edges.Bottom,

            _ => throw new ArgumentOutOfRangeException()
        };

        double cx = edge switch
        {
            Edges.Left => Boundary.X,
            Edges.Right => Boundary.Right,

            Edges.Top or Edges.Bottom => element.Boundary.Cx < Boundary.X ? Boundary.X : (element.Boundary.Cx > Boundary.Right ? Boundary.Right : element.Boundary.Cx),

            _ => throw new ArgumentOutOfRangeException()
        };

        double cy = edge switch
        {
            Edges.Left or Edges.Right => element.Boundary.Cy < Boundary.Y ? Boundary.Y : (element.Boundary.Cy > Boundary.Bottom ? Boundary.Bottom : element.Boundary.Cy),

            Edges.Top => Boundary.Y,
            Edges.Bottom => Boundary.Bottom,

            _ => throw new ArgumentOutOfRangeException()
        };

        element.SetCenter(cx, cy);
    }
}
