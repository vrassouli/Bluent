using Bluent.UI.Diagrams.Elements.Abstractions;
using Microsoft.AspNetCore.Components;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace Bluent.UI.Diagrams.Elements.Diagram;

public abstract class DiagramConnectorBase : IDiagramConnector, IHasUpdatablePoints
{
    private List<DiagramPoint> _wayPoints = new();
    private DiagramPoint _start;
    private DiagramPoint? _end;
    private bool _isSelected;
    private string? _stroke;
    private double? _strokeWidth;
    private string? _strokeDashArray;
    private string? _markerEnd = "connector-marker-end";
    private string? _markerStart;
    private Distance2D _startDrag = new();
    private Distance2D _endDrag = new();
    private IHasOutgoingConnector _sourceElement;
    private IHasIncomingConnector? _targetElement;

    public DiagramPoint Start
    {
        get => new(_start.X + _startDrag.Dx, _start.Y + _startDrag.Dy);
        set
        {
            if (_start != value)
            {
                _start = value;
                NotifyPropertyChanged();
            }
        }
    }

    public DiagramPoint End
    {
        get
        {
            var point = _end ?? _start;
            return new DiagramPoint(point.X + _endDrag.Dx, point.Y + _endDrag.Dy);
        }

        set
        {
            if (_end != value)
            {
                _end = value;
                NotifyPropertyChanged();
            }
        }
    }

    public virtual IHasOutgoingConnector SourceElement
    {
        get => _sourceElement;
        set
        {
            if (_sourceElement != value)
            {
                _sourceElement = value;
                NotifyPropertyChanged();
            }
        }
    }

    public virtual IHasIncomingConnector? TargetElement
    {
        get => _targetElement;
        set
        {
            if (_targetElement != value)
            {
                _targetElement = value;
                NotifyPropertyChanged();
            }
        }
    }

    public IEnumerable<DiagramPoint> WayPoints => _wayPoints;

    public Boundary Boundary => new(Start.X, Start.Y, End.X - Start.X, End.Y - Start.Y);

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

    public virtual double? SelectionStrokeWidth { get; set; }
    public virtual string? SelectionStrokeDashArray { get; set; }
    public virtual string? SelectionStroke { get; set; }
    public RenderFragment? SelectionOptions { get; set; }

    public string? MarkerEnd
    {
        get => _markerEnd;
        set
        {
            if (_markerEnd != value)
            {
                _markerEnd = value;
                NotifyPropertyChanged();
            }
        }
    }

    public string? MarkerStart
    {
        get => _markerStart;
        set
        {
            if (_markerStart != value)
            {
                _markerStart = value;
                NotifyPropertyChanged();
            }
        }
    }

    public IEnumerable<UpdatablePoint> UpdatablePoints
    {
        get
        {
            yield return new UpdatablePoint(new DiagramPoint(Start.X, Start.Y), "Start");
            //for (var index = 0; index < WayPoints.Count(); index++)
            //{
            //    var point = WayPoints.ElementAt(index);
            //    yield return new UpdatablePoint(new DiagramPoint(point.X, point.Y), index);
            //}
            yield return new UpdatablePoint(new DiagramPoint(End.X, End.Y), "End");
        }
    }

    public event PropertyChangedEventHandler? PropertyChanged;

    protected DiagramConnectorBase(IHasOutgoingConnector source, DiagramPoint start)
    {
        _sourceElement = source;
        _start = start;
    }

    public RenderFragment Render()
    {
        return builder =>
        {
            var seq = -1;

            builder.OpenElement(++seq, "path");

            builder.AddAttribute(++seq, "stroke", Stroke);
            builder.AddAttribute(++seq, "stroke-width", StrokeWidth);
            builder.AddAttribute(++seq, "stroke-dasharray", StrokeDashArray);
            builder.AddAttribute(++seq, "fill", "none");
            builder.AddAttribute(++seq, "marker-end", $"url(#{MarkerEnd})");
            builder.AddAttribute(++seq, "marker-start", $"url(#{MarkerStart})");
            builder.AddAttribute(++seq, "d", GetPathData());

            builder.CloseElement();
        };
    }

    protected virtual string GetPathData()
    {
        string data = $"M{Start.X} {Start.Y}";

        foreach (var point in WayPoints)
        {
            data += $" L{point.X} {point.Y}";
        }

        data += $" L{End.X} {End.Y}";

        return data;
    }

    protected void NotifyPropertyChanged([CallerMemberName] string? propertyName = null)
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }

    public void DragStart(Distance2D drag)
    {
        _startDrag = drag;
        NotifyPropertyChanged(nameof(Start));
    }

    public void DragEnd(Distance2D drag)
    {
        _endDrag = drag;
        NotifyPropertyChanged(nameof(End));
    }

    public void CancelStartDrag()
    {
        _startDrag = new();
        NotifyPropertyChanged(nameof(Start));
    }

    public void CancelEndDrag()
    {
        _endDrag = new();
        NotifyPropertyChanged(nameof(End));
    }

    public void ApplyStartDrag()
    {
        Start = new DiagramPoint(_start.X + _startDrag.Dx, _start.Y + _startDrag.Dy);
        _startDrag = new();
    }

    public void ApplyEndDrag()
    {
        var point = _end ?? _start;
        End = new DiagramPoint(point.X + _endDrag.Dx, point.Y + _endDrag.Dy);
        _endDrag = new();
    }

    public void AddWayPoint(DiagramPoint point)
    {
        _wayPoints.Add(point);

        NotifyPropertyChanged(nameof(WayPoints));
    }

    public void SetWayPoints(IEnumerable<DiagramPoint> points)
    {
        ClearWayPoints();
        _wayPoints.AddRange(points);

        NotifyPropertyChanged(nameof(WayPoints));
    }

    public void RemoveWayPoint(DiagramPoint point)
    {
        _wayPoints.Remove(point);
    }

    public void ClearWayPoints()
    {
        _wayPoints.Clear();
    }

    public bool HitTest(DiagramPoint point)
    {
        const double tolerance = 3.0;

        var points = new List<DiagramPoint> { Start };
        points.AddRange(WayPoints);
        points.Add(End);

        for (int i = 0; i < points.Count - 1; i++)
        {
            if (DistanceToSegment(point, points[i], points[i + 1]) <= tolerance)
                return true;
        }

        return false;
    }

    public virtual void Clean()
    {
        SourceElement?.RemoveOutgoingConnector(this);

        TargetElement?.RemoveIncomingConnector(this);

        TargetElement = null;
        SourceElement = null!;
    }

    public void UpdatePoint(UpdatablePoint point, DiagramPoint update)
    {
        if (point.Data is string position)
        {
            switch (position)
            {
                case "Start":
                {
                    Start = update;
                    if (SourceElement is IDiagramNode node)
                    {
                        var newStart = node.StickToBoundary(update);
                        if (newStart != Start)
                        {
                            Start = newStart;
                        }
                    }
                }
                    break;
                case "End":
                {
                    End = update;
                    if (TargetElement is IDiagramNode node)
                    {
                        var newEnd = node.StickToBoundary(update);
                        if (newEnd != End)
                        {
                            End = newEnd;
                        }
                    }
                }
                    break;
                default:
                    throw new InvalidOperationException($"Unknown point position: {position}");
            }
        }
        else if (point.Data is int index)
        {
            if (index >= 0 && _wayPoints.Count > index)
            {
                _wayPoints[index] = update;
                NotifyPropertyChanged(nameof(WayPoints));
            }
        }
        else
        {
            throw new InvalidOperationException("UpdatablePoint Data must be a string representing the position.");
        }
    }

    private double DistanceToSegment(DiagramPoint p, DiagramPoint a, DiagramPoint b)
    {
        double dx = b.X - a.X;
        double dy = b.Y - a.Y;

        if (dx == 0 && dy == 0)
        {
            // a and b are the same point
            return Distance(p, a);
        }

        double t = ((p.X - a.X) * dx + (p.Y - a.Y) * dy) / (dx * dx + dy * dy);
        t = Math.Max(0, Math.Min(1, t)); // clamp t to [0,1]

        double closestX = a.X + t * dx;
        double closestY = a.Y + t * dy;

        return Distance(p.X, p.Y, closestX, closestY);
    }

    private double Distance(DiagramPoint p1, DiagramPoint p2)
    {
        return Distance(p1.X, p1.Y, p2.X, p2.Y);
    }

    private double Distance(double x1, double y1, double x2, double y2)
    {
        double dx = x1 - x2;
        double dy = y1 - y2;
        return Math.Sqrt(dx * dx + dy * dy);
    }
}