using Bluent.UI.Diagrams.Elements.Abstractions;
using Bluent.UI.Diagrams.Tools.Drawings.Diagram;
using Microsoft.AspNetCore.Components;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace Bluent.UI.Diagrams.Elements.Diagram;

public abstract class DiagramNodeBase : IDiagramNode, IHasUpdatablePoints
{
    #region Private fields

    private const double _epsilon = 0.01;

    private bool _pointerDirectlyOnNode = false;

    private Distance2D _drag = new();
    private double _x;
    private double _y;
    private double _width;
    private double _height;
    private string? _stroke;
    private double? _strokeWidth;
    private string? _strokeDashArray;
    private string? _fill;
    private string? _text;
    private bool _isSelected;
    private List<IDiagramConnector>? _incomingConnectors;
    private List<IDiagramConnector>? _outgoingConnectors;

    #endregion

    #region Properties

    public bool AllowHorizontalDrag { get; protected set; } = true;

    public bool AllowVerticalDrag { get; protected set; } = true;

    // public bool AllowHorizontalResize { get; protected set; } = true;
    //
    // public bool AllowVerticalResize { get; protected set; } = true;

    public Boundary Boundary => new Boundary(X, Y, Width, Height);

    public virtual double X
    {
        get => _x + Drag.Dx;
        set
        {
            if (Math.Abs(_x - value) > _epsilon)
            {
                SetX(value);

                _x = value;

                NotifyPropertyChanged();
            }
        }
    }

    public virtual double Y
    {
        get => _y + Drag.Dy;
        set
        {
            if (Math.Abs(_y - value) > _epsilon)
            {
                SetY(value);
                NotifyPropertyChanged();
            }
        }
    }

    public virtual double Width
    {
        get => _width;
        set
        {
            if (Math.Abs(_width - value) > _epsilon)
            {
                SetWidth(value);
                NotifyPropertyChanged();
            }
        }
    }

    public virtual double Height
    {
        get => _height;
        set
        {
            if (Math.Abs(_height - value) > _epsilon)
            {
                SetHeight(value);
                NotifyPropertyChanged();
            }
        }
    }

    public virtual string? Text
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
            if (_pointerDirectlyOnNode && HighlightFill != null)
                return HighlightFill;
            //if (_pointerIndirectlyOnNode)
            //    return IndirectHighlightFill;

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
            if (_pointerDirectlyOnNode && HighlightStroke != null)
                return HighlightStroke;
            //if (_pointerIndirectlyOnNode)
            //    return IndirectHighlightStroke;

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
        get
        {
            if (_pointerDirectlyOnNode && HighlightStrokeWidth != null)
                return HighlightStrokeWidth;

            return _strokeWidth;
        }
        set
        {
            if (_strokeWidth is null || 
                value is null || 
                Math.Abs(_strokeWidth.Value - value.Value) > _epsilon)
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

    public virtual double? SelectionStrokeWidth { get; set; } = 2;
    public virtual string? SelectionStrokeDashArray { get; set; } = "4 3";
    public virtual string? SelectionStroke { get; set; } = "#36a2eb";
    public RenderFragment? SelectionOptions { get; set; }

    public double? HighlightStrokeWidth { get; set; } = 2.5;
    public string? HighlightStroke { get; set; } = "var(--colorNeutralForeground2BrandHover)";
    public string? HighlightFill { get; set; } = "var(--colorNeutralBackground1Hover)";

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

    public virtual IEnumerable<UpdatablePoint> UpdatablePoints
    {
        get
        {
            yield return UpdatablePoint.CreateTopLeft(Boundary);
            yield return UpdatablePoint.CreateTopRight(Boundary);
            yield return UpdatablePoint.CreateBottomLeft(Boundary);
            yield return UpdatablePoint.CreateBottomRight(Boundary);
        }
    }

    public IEnumerable<IDiagramConnector> IncomingConnectors =>
        _incomingConnectors ?? Enumerable.Empty<IDiagramConnector>();

    public IEnumerable<IDiagramConnector> OutgoingConnectors =>
        _outgoingConnectors ?? Enumerable.Empty<IDiagramConnector>();

    #endregion

    public abstract RenderFragment Render();

    public bool HitTest(DiagramPoint point)
    {
        return Boundary.Contains(point);
    }

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
        if (_pointerDirectlyOnNode != direct)
        {
            _pointerDirectlyOnNode = direct;
            NotifyPropertyChanged();
        }

        // if (direct && !_pointerDirectlyOnNode)
        // {
        //     _pointerDirectlyOnNode = true;
        //     NotifyPropertyChanged();
        // }
    }

    public virtual void ApplyDrag()
    {
        _x += Drag.Dx;
        _y += Drag.Dy;

        foreach (var outgoing in OutgoingConnectors)
        {
            outgoing.ApplyStartDrag();
        }

        foreach (var incoming in IncomingConnectors)
        {
            incoming.ApplyEndDrag();
        }

        CancelDrag();
        NotifyPropertyChanged();
    }

    public virtual void CancelDrag()
    {
        _drag = new();
        foreach (var outgoing in OutgoingConnectors)
        {
            outgoing.CancelStartDrag();
        }

        foreach (var incoming in IncomingConnectors)
        {
            incoming.CancelEndDrag();
        }
    }

    public virtual void SetDrag(Distance2D drag)
    {
        Drag = drag;
        foreach (var outgoing in OutgoingConnectors)
        {
            outgoing.DragStart(drag);
        }

        foreach (var incoming in IncomingConnectors)
        {
            incoming.DragEnd(drag);
        }

        RerouteConnectors();
        NotifyPropertyChanged();
    }

    public virtual void Clean()
    {
        var incomings = IncomingConnectors.ToList();
        var outgoings = OutgoingConnectors.ToList();

        foreach (var incoming in incomings)
        {
            incoming.Clean();
        }

        foreach (var outgoing in outgoings)
        {
            outgoing.Clean();
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

    public DiagramPoint StickToBoundary(DiagramPoint point)
    {
        Edges edge = Boundary.GetNearestEdge(point);

        double cx = edge switch
        {
            Edges.Left => Boundary.X,
            Edges.Right => Boundary.Right,

            Edges.Top or Edges.Bottom => point.X < Boundary.X
                ? Boundary.X
                : (point.X > Boundary.Right ? Boundary.Right : point.X),

            _ => throw new ArgumentOutOfRangeException()
        };

        double cy = edge switch
        {
            Edges.Left or Edges.Right => point.Y < Boundary.Y
                ? Boundary.Y
                : (point.Y > Boundary.Bottom ? Boundary.Bottom : point.Y),

            Edges.Top => Boundary.Y,
            Edges.Bottom => Boundary.Bottom,

            _ => throw new ArgumentOutOfRangeException()
        };

        return new DiagramPoint(cx, cy);
    }

    public virtual void UpdatePoint(UpdatablePoint point, DiagramPoint update)
    {
        if (point.Data is string position)
        {
            switch (position)
            {
                case "Left":
                {
                    var dx = update.X - X;

                    if (Width - dx > 0)
                    {
                        X = update.X;
                        Width -= dx;
                    }
                }
                    break;
                case "Right":
                {
                    var dx = update.X - (X + Width);

                    if (Width + dx > 0)
                    {
                        Width += dx;
                    }
                }
                    break;
                case "Top":
                {
                    var dy = update.Y - Y;
                    
                    if (Height - dy > 0)
                    {
                        Y = update.Y;
                        Height -= dy;
                    }
                }
                    break;
                case "Bottom":
                {
                    var dy = update.Y - (Y + Height);
                    
                    if (Height + dy > 0)
                    {
                        Height += dy;
                    }
                }
                    break;
                case "TopLeft":
                {
                    var dx = update.X - X;
                    var dy = update.Y - Y;

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
                    var dx = update.X - (X + Width);
                    var dy = update.Y - Y;

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
                    var dx = update.X - X;
                    var dy = update.Y - (Y + Height);

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
                    var dx = update.X - (X + Width);
                    var dy = update.Y - (Y + Height);

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

    public virtual void AddIncomingConnector(IDiagramConnector connector)
    {
        if (_incomingConnectors is null)
            _incomingConnectors = new List<IDiagramConnector>();
        _incomingConnectors.Add(connector);

        connector.PropertyChanged += ConnectorPropertyChanged;

        StickEndPoint(connector);
    }

    public virtual void RemoveIncomingConnector(IDiagramConnector connector)
    {
        if (_incomingConnectors is not null)
            _incomingConnectors.Remove(connector);
        connector.PropertyChanged -= ConnectorPropertyChanged;
    }

    private void ConnectorPropertyChanged(object? sender, PropertyChangedEventArgs e)
    {
        if (e.PropertyName == "Start" || e.PropertyName == "End")
            RerouteConnectors();
    }

    public virtual bool CanConnectIncoming<T>() where T : IDiagramConnector => CanConnectIncoming(typeof(T));

    public virtual bool CanConnectIncoming(Type connectorType) => true;

    public virtual void AddOutgoingConnector(IDiagramConnector connector)
    {
        if (_outgoingConnectors is null)
            _outgoingConnectors = new List<IDiagramConnector>();

        _outgoingConnectors.Add(connector);

        StickStartPoint(connector);
    }

    public virtual void RemoveOutgoingConnector(IDiagramConnector connector)
    {
        if (_outgoingConnectors is not null)
            _outgoingConnectors.Remove(connector);
    }

    public virtual bool CanConnectOutgoing<T>() where T : IDiagramConnector => CanConnectOutgoing(typeof(T));

    public virtual bool CanConnectOutgoing(Type connectorType) => true;

    protected void RerouteConnectors()
    {
        var router = GetConnectorRouter();
        if (this is IHasIncomingConnector hasIncomingConnectorElement)
        {
            foreach (var connector in hasIncomingConnectorElement.IncomingConnectors)
            {
                router.RouteConnector(connector);
            }
        }

        if (this is IHasOutgoingConnector hasOutgoingConnectorElement)
        {
            foreach (var connector in hasOutgoingConnectorElement.OutgoingConnectors)
            {
                router.RouteConnector(connector);
            }
        }
    }

    protected virtual ConnectorRouter GetConnectorRouter() => new ConnectorRouter();

    private void StickStartPoint(IDiagramConnector connector)
    {
        var point = StickToBoundary(connector.Start);
        connector.Start = point;
    }

    private void StickEndPoint(IDiagramConnector connector)
    {
        var point = StickToBoundary(connector.End);
        connector.End = point;
    }

    private void SetX(double value)
    {
        /*
         * Note: After X gets update, to stick the node at the same position, Width will get updated to.
         * Example: if X gets a (-10) delta, Width will get (+10) delta.
         *
         * By updating Width, the connectors at the Right edge, will be updated,
         * however, becouse the Right edge is sticked at it's place, the connector will be miss-placed.
         * To prevent it, we should update connectors at Right edge too, so after getting updated when the Width updates, they get placed at correct position.
         */

        var delta = value - _x;

        foreach (var outgoing in OutgoingConnectors)
        {
            if (Boundary.GetNearestEdge(outgoing.Start) == Edges.Left)
            {
                outgoing.DragStart(new Distance2D(delta, 0));
                outgoing.ApplyStartDrag();
            }
            else if (Boundary.GetNearestEdge(outgoing.Start) == Edges.Right)
            {
                outgoing.DragStart(new Distance2D(delta, 0));
                outgoing.ApplyStartDrag();
            }
        }

        foreach (var incomming in IncomingConnectors)
        {
            if (Boundary.GetNearestEdge(incomming.End) == Edges.Left)
            {
                incomming.DragEnd(new Distance2D(delta, 0));
                incomming.ApplyEndDrag();
            }
            else if (Boundary.GetNearestEdge(incomming.End) == Edges.Right)
            {
                incomming.DragEnd(new Distance2D(delta, 0));
                incomming.ApplyEndDrag();
            }
        }

        _x = value;

        RerouteConnectors();
    }

    private void SetY(double value)
    {
        /*
         * Note: After Y gets update, to stick the node at the same position, Height will get updated to.
         * Example: if Y gets a (-10) delta, Height will get (+10) delta.
         *
         * By updating Height, the connectors at the Bottom edge, will be updated,
         * however, becouse the Bottom edge is sticked at it's place, the connector will be miss-placed.
         * To prevent it, we should update connectors at Bottom edge too, so after getting updated when the Height updates, they get placed at correct position.
         */

        var delta = value - _y;

        foreach (var outgoing in OutgoingConnectors)
        {
            if (Boundary.GetNearestEdge(outgoing.Start) == Edges.Top)
            {
                outgoing.DragStart(new Distance2D(0, delta));
                outgoing.ApplyStartDrag();
            }

            if (Boundary.GetNearestEdge(outgoing.Start) == Edges.Bottom)
            {
                outgoing.DragStart(new Distance2D(0, delta));
                outgoing.ApplyStartDrag();
            }
        }

        foreach (var incomming in IncomingConnectors)
        {
            if (Boundary.GetNearestEdge(incomming.End) == Edges.Top)
            {
                incomming.DragEnd(new Distance2D(0, delta));
                incomming.ApplyEndDrag();
            }

            if (Boundary.GetNearestEdge(incomming.End) == Edges.Bottom)
            {
                incomming.DragEnd(new Distance2D(0, delta));
                incomming.ApplyEndDrag();
            }
        }

        _y = value;

        RerouteConnectors();
    }

    protected virtual void SetWidth(double value)
    {
        var delta = value - _width;

        foreach (var outgoing in OutgoingConnectors)
        {
            if (Boundary.GetNearestEdge(outgoing.Start) == Edges.Right)
            {
                outgoing.DragStart(new Distance2D(delta, 0));
                outgoing.ApplyStartDrag();
            }
        }

        foreach (var incomming in IncomingConnectors)
        {
            if (Boundary.GetNearestEdge(incomming.End) == Edges.Right)
            {
                incomming.DragEnd(new Distance2D(delta, 0));
                incomming.ApplyEndDrag();
            }
        }

        _width = value;

        RerouteConnectors();
    }

    protected virtual void SetHeight(double value)
    {
        var delta = value - _height;

        foreach (var outgoing in OutgoingConnectors)
        {
            if (Boundary.GetNearestEdge(outgoing.Start) == Edges.Bottom)
            {
                outgoing.DragStart(new Distance2D(0, delta));
                outgoing.ApplyStartDrag();
            }
        }

        foreach (var incomming in IncomingConnectors)
        {
            if (Boundary.GetNearestEdge(incomming.End) == Edges.Bottom)
            {
                incomming.DragEnd(new Distance2D(0, delta));
                incomming.ApplyEndDrag();
            }
        }

        _height = value;

        RerouteConnectors();
    }

    //private void OnSizeChanged()
    //{
    //    foreach (var outgoing in OutgoingConnectors)
    //        StickStartPoint(outgoing);

    //    foreach (var incomming in IncomingConnectors)
    //        StickEndPoint(incomming);
    //}
}