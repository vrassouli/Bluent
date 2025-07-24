using Bluent.UI.Diagrams.Commands;
using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Extensions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Components.Internals;

public partial class ElementSelection : IDisposable
{
    private long? _pointerId;
    private DiagramPoint? _startPoint;
    private Distance2D? _delta;

    [Parameter] public double StrokeWidth { get; set; } = 2;
    [Parameter] public string StrokeDashArray { get; set; } = "4 3";
    [Parameter] public string Stroke { get; set; } = "#36a2eb";
    [Parameter, EditorRequired] public IDrawingElement Element { get; set; } = default!;
    [Parameter, EditorRequired] public double Padding { get; set; } = 5;
    [Parameter] public bool AllowDrag { get; set; }
    [CascadingParameter] public DrawingCanvas Canvas { get; set; } = default!;

    private Boundary Boundary => new Boundary(Element.Boundary.X - Padding,
                                              Element.Boundary.Y - Padding,
                                              Element.Boundary.Width + Padding * 2,
                                              Element.Boundary.Height + Padding * 2);

    private string? GetCursor()
    {
        if (AllowDrag && (Element.AllowVerticalDrag || Element.AllowHorizontalDrag))
            return "grab";

        return null;
    }

    protected override void OnInitialized()
    {
        if (Canvas is null)
            throw new InvalidOperationException($"{nameof(ElementSelection)} should not be used directly.");

        Canvas.PointerMove += OnPointerMove;
        Canvas.PointerUp += OnPointerUp;
        Canvas.PointerLeave += OnPointerLeave;
        Canvas.PointerCancel += OnPointerCancel;

        base.OnInitialized();
    }

    public void Dispose()
    {
        Canvas.PointerMove -= OnPointerMove;
        Canvas.PointerUp -= OnPointerUp;
        Canvas.PointerLeave -= OnPointerLeave;
        Canvas.PointerCancel -= OnPointerCancel;
    }

    private void HandlePointerDown(PointerEventArgs e)
    {
        if (e.CtrlKey)
            Canvas.OnElementClicked(Element, e.CtrlKey, e.AltKey, e.ShiftKey);
        else if (_pointerId is null)
            _pointerId = e.PointerId;
    }

    private void OnPointerMove(object? sender, PointerEventArgs e)
    {
        if (_pointerId == e.PointerId && Canvas.SelectedElements.Any())
        {
            if (_startPoint is null)
                _startPoint = Canvas.ScreenToDiagram(e.ToClientPoint());

            _delta = Canvas.ScreenToDiagram(e.ToClientPoint()) - _startPoint;

            foreach (var el in Canvas.SelectedElements)
            {
                var drag = new Distance2D(el.AllowHorizontalDrag ? _delta.Dx : 0, el.AllowVerticalDrag ? _delta.Dy : 0);

                el.SetDrag(drag);
            }
        }
    }

    private void OnPointerUp(object? sender, PointerEventArgs e)
    {
        if (e.PointerId == _pointerId)
        {
            if (Canvas != null)
            {
                foreach (var el in Canvas.SelectedElements)
                {
                    el.CancelDrag();
                }

                if (_delta != null)
                {
                    var command = new DragElementsCommand(Canvas.SelectedElements.ToList(), _delta);
                    Canvas.ExecuteCommand(command);
                }
            }
            Reset();
        }
    }

    private void OnPointerLeave(object? sender, PointerEventArgs e)
    {
        if (e.PointerId == _pointerId)
            Cancel();
    }

    private void OnPointerCancel(object? sender, PointerEventArgs e)
    {
        if (e.PointerId == _pointerId)
            Cancel();
    }

    private void Cancel()
    {
        foreach (var el in Canvas.SelectedElements)
        {
            el.CancelDrag();
        }

        Reset();
    }

    private void Reset()
    {
        _pointerId = null;
        _startPoint = null;
        _delta = null;
    }
}
