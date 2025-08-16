using Bluent.Core.Utilities;
using Bluent.UI.Diagrams.Elements.Abstractions;
using Bluent.UI.Diagrams.Tools.Drawings.Diagram;
using Microsoft.AspNetCore.Components;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Security.Cryptography;

namespace Bluent.UI.Diagrams.Elements.Diagram;

public abstract class DiagramNodeBase : IDiagramNode, IHasUpdatablePoints
{
    #region Private fields

    private const double Epsilon = 0.01;

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
    //private string? _id;

    #endregion

    #region Properties

    //public string Id
    //{
    //    get
    //    {
    //        if (_id is null)
    //            _id = Identifier.NewId();

    //        return _id;
    //    }

    //    set
    //    {
    //        if (_id != value)
    //        {
    //            _id = value;
    //            NotifyPropertyChanged();
    //        }
    //    }
    //}

    public bool AllowHorizontalDrag { get; protected set; } = true;

    public bool AllowVerticalDrag { get; protected set; } = true;

    public bool AllowHorizontalResize { get; protected set; } = true;

    public bool AllowVerticalResize { get; protected set; } = true;

    public Boundary Boundary => new Boundary(X, Y, Width, Height);

    public virtual double X
    {
        get => _x + Drag.Dx /*+ DeltaLeft*/;
        set
        {
            if (Math.Abs(_x - value) > Epsilon)
            {
                _x = value;

                NotifyPropertyChanged();
                //NotifyPropertyChanged(nameof(Boundary));
            }
        }
    }
    public virtual double Y
    {
        get => _y + Drag.Dy /*+ DeltaTop*/;
        set
        {
            if (Math.Abs(_y - value) > Epsilon)
            {
                _y = value;
                NotifyPropertyChanged();
                //NotifyPropertyChanged(nameof(Boundary));
            }
        }
    }
    public virtual double Width
    {
        get => _width /*- DeltaLeft + DeltaRight*/;
        set
        {
            if (Math.Abs(_width - value) > Epsilon)
            {
                _width = value;
                NotifyPropertyChanged();
                //NotifyPropertyChanged(nameof(Boundary));
            }
        }
    }
    public virtual double Height
    {
        get => _height /*- DeltaTop + DeltaBottom*/;
        set
        {
            if (Math.Abs(_height - value) > Epsilon)
            {
                _height = value;
                NotifyPropertyChanged();
                //NotifyPropertyChanged(nameof(Boundary));
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
            if (_pointerDirectlyOnNode)
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
            if (_pointerDirectlyOnNode)
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
    public virtual double? SelectionStrokeWidth { get; set; } = 2;
    public virtual string? SelectionStrokeDashArray { get; set; } = "4 3";
    public virtual string? SelectionStroke { get; set; } = "#36a2eb";
    public RenderFragment? SelectionOptions { get; set; }

    public string? HighlightStroke { get; set; } = "var(--colorNeutralStroke1Hover)";
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
            yield return new UpdatablePoint(new DiagramPoint(X, Y), "TopLeft") { Cursor = "nwse-resize" };
            yield return new UpdatablePoint(new DiagramPoint(X + Width, Y), "TopRight") { Cursor = "nesw-resize" };
            yield return new UpdatablePoint(new DiagramPoint(X, Y + Height), "BottomLeft") { Cursor = "nesw-resize" };
            yield return new UpdatablePoint(new DiagramPoint(X + Width, Y + Height), "BottomRight") { Cursor = "nwse-resize" };
        }
    }
    public IEnumerable<IDiagramConnector> IncomingConnectors => _incomingConnectors ?? Enumerable.Empty<IDiagramConnector>();
    public IEnumerable<IDiagramConnector> OutgoingConnectors => _outgoingConnectors ?? Enumerable.Empty<IDiagramConnector>();

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
        if (direct && !_pointerDirectlyOnNode)
        {
            _pointerDirectlyOnNode = true;
            NotifyPropertyChanged();
        }
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

            Edges.Top or Edges.Bottom => point.X < Boundary.X ? Boundary.X : (point.X > Boundary.Right ? Boundary.Right : point.X),

            _ => throw new ArgumentOutOfRangeException()
        };

        double cy = edge switch
        {
            Edges.Left or Edges.Right => point.Y < Boundary.Y ? Boundary.Y : (point.Y > Boundary.Bottom ? Boundary.Bottom : point.Y),

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
}
