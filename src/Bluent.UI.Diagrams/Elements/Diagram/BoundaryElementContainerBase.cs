/*
using System.ComponentModel;

namespace Bluent.UI.Diagrams.Elements.Diagram;

public abstract class BoundaryElementContainerBase : DiagramNode, IDiagramBoundaryElementContainer
{
    private List<IDiagramElement> _boundaryElements = new();
    private bool _pointerOnNode = false;
    private bool _pointerOnNodeBoundary = false;

    public override string? Fill
    {
        get
        {
            if (_pointerOnNode)
                return HighlightFill;

            return base.Fill;
        }

        set => base.Fill = value;
    }
    public override string? Stroke
    {
        get
        {
            if (_pointerOnNode)
                return HighlightStroke;

            return base.Stroke;
        }

        set => base.Stroke = value;
    }
    public override double? StrokeWidth
    {
        get
        {
            if (_pointerOnNodeBoundary)
                return base.StrokeWidth * 2;

            return base.StrokeWidth;
        }

        set => base.StrokeWidth = value;
    }
    public double BoundaryThickness { get; set; } = 5;

    public IEnumerable<IDrawingElement> BoundaryElements => _boundaryElements;

    public void AddDiagramBoundaryElement(IDiagramElement element)
    {
        element.PropertyChanged += ChildElementPropertyChanged;

        _boundaryElements.Add(element);
        NotifyPropertyChanged(nameof(BoundaryElements));
    }

    public void RemoveDiagramBoundaryElement(IDiagramElement element)
    {
        element.PropertyChanged -= ChildElementPropertyChanged;

        _boundaryElements.Remove(element);
        NotifyPropertyChanged(nameof(BoundaryElements));
    }

    private void ChildElementPropertyChanged(object? sender, PropertyChangedEventArgs e)
    {
        NotifyPropertyChanged(nameof(Elements));
    }

    public override void PointerMovingOutside()
    {
        if (_pointerOnNode)
        {
            _pointerOnNode = false;
            _pointerOnNodeBoundary = false;
            NotifyPropertyChanged();
        }
    }

    public override void PointerMovingInside(DiagramPoint point, bool direct)
    {
        if (direct && !_pointerOnNode)
        {
            _pointerOnNode = true;
            _pointerOnNodeBoundary = IsOnBoundary(point);
            NotifyPropertyChanged();
        }
    }

    public override void SetDrag(Distance2D drag)
    {
        foreach (var el in BoundaryElements)
        {
            el.SetDrag(drag);
        }

        base.SetDrag(drag);
    }

    public override void CancelDrag()
    {
        foreach (var el in BoundaryElements)
        {
            el.CancelDrag();
        }

        base.CancelDrag();
    }

    public override void ApplyDrag()
    {
        foreach (var el in BoundaryElements)
        {
            el.ApplyDrag();
        }

        base.ApplyDrag();
    }

    private bool IsOnBoundary(DiagramPoint point)
    {
        if (IsOnLeftBoundary(point) ||
            IsOnRightBoundary(point) ||
            IsOnTopBoundary(point) ||
            IsOnBottomBoundary(point))
            return true;

        return false;
    }

    private bool IsOnLeftBoundary(DiagramPoint point)
    {
        return point.X >= Boundary.X &&
                point.X <= Boundary.X + BoundaryThickness &&
                point.Y >= Boundary.Y &&
                point.Y <= Boundary.Bottom;
    }

    private bool IsOnRightBoundary(DiagramPoint point)
    {
        return point.X <= Boundary.Right &&
                point.X >= Boundary.Right - BoundaryThickness &&
                point.Y >= Boundary.Y &&
                point.Y <= Boundary.Bottom;
    }

    private bool IsOnTopBoundary(DiagramPoint point)
    {
        return point.Y >= Boundary.Y &&
            point.Y <= Boundary.Y + BoundaryThickness &&
            point.X >= Boundary.X &&
            point.X <= Boundary.Right;
    }

    private bool IsOnBottomBoundary(DiagramPoint point)
    {
        return point.Y <= Boundary.Bottom &&
            point.Y >= Boundary.Bottom - BoundaryThickness &&
            point.X >= Boundary.X &&
            point.X <= Boundary.Right;
    }
}
*/