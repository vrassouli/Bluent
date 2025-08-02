using Microsoft.AspNetCore.Components;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace Bluent.UI.Diagrams.Elements.Diagram;

internal abstract class DiagramConnectorBase : IDiagramConnector
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

    public DiagramPoint Start
    {
        get => new DiagramPoint(_start.X + _startDrag.Dx, _start.Y + _startDrag.Dy);
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

    public IEnumerable<DiagramPoint> WayPoints => _wayPoints;

    public Boundary Boundary => new Boundary(Start.X, Start.Y, End.X - Start.X, End.Y - Start.Y);

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

    public event PropertyChangedEventHandler? PropertyChanged;

    protected DiagramConnectorBase(DiagramPoint start)
    {
        _start = start;
    }

    public RenderFragment Render()
    {
        return builder =>
        {
            var seq = 0;

            builder.OpenElement(seq++, "path");

            builder.AddAttribute(seq++, "stroke", Stroke);
            builder.AddAttribute(seq++, "stroke-width", StrokeWidth);
            builder.AddAttribute(seq++, "stroke-dasharray", StrokeDashArray);
            builder.AddAttribute(seq++, "marker-end", $"url(#{MarkerEnd})");
            builder.AddAttribute(seq++, "d", GetPathData());

            builder.CloseElement();
        };
    }

    protected abstract string GetPathData();

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
}
