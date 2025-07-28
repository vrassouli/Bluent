using Bluent.UI.Diagrams.Commands.Basic;
using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Extensions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Components.Internals;

public partial class ElementSelection : IDisposable
{
    private ResizeAnchor? _resizeAnchor;
    private long? _pointerId;
    private DiagramPoint? _startPoint;
    private Distance2D? _delta;

    [Parameter] public double StrokeWidth { get; set; } = 2;
    [Parameter] public string StrokeDashArray { get; set; } = "4 3";
    [Parameter] public string Stroke { get; set; } = "#36a2eb";
    [Parameter, EditorRequired] public IDrawingElement Element { get; set; } = default!;
    [Parameter, EditorRequired] public double Padding { get; set; } = 5;
    [CascadingParameter] public DrawingCanvas Canvas { get; set; } = default!;

    private Boundary Boundary => new Boundary(Element.Boundary.X - Padding,
                                              Element.Boundary.Y - Padding,
                                              Element.Boundary.Width + Padding * 2,
                                              Element.Boundary.Height + Padding * 2);

    private void HandleResizeHandlePointerDown(PointerEventArgs e, ResizeAnchor anchor)
    {
        if (_pointerId is null)
        {
            _resizeAnchor = anchor;
            _pointerId = e.PointerId;
        }
    }

    //private string? GetCursor()
    //{
    //    if (AllowDrag && (Element.AllowVerticalDrag || Element.AllowHorizontalDrag))
    //        return "grab";

    //    return null;
    //}

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

    private void OnPointerMove(object? sender, PointerEventArgs e)
    {
        if (_pointerId == e.PointerId && _resizeAnchor != null)
        {
            if (_startPoint is null)
                _startPoint = Canvas.ScreenToDiagram(e.ToClientPoint());

            _delta = Canvas.ScreenToDiagram(e.ToClientPoint()) - _startPoint;

            if ((_resizeAnchor.Value & ResizeAnchor.Left) == ResizeAnchor.Left)
                Element.ResizeLeft(_delta.Dx);
            if ((_resizeAnchor.Value & ResizeAnchor.Right) == ResizeAnchor.Right)
                Element.ResizeRight(_delta.Dx);
            if ((_resizeAnchor.Value & ResizeAnchor.Top) == ResizeAnchor.Top)
                Element.ResizeTop(_delta.Dy);
            if ((_resizeAnchor.Value & ResizeAnchor.Bottom) == ResizeAnchor.Bottom)
                Element.ResizeBottom(_delta.Dy);
        }
    }

    private void OnPointerUp(object? sender, PointerEventArgs e)
    {
        if (e.PointerId == _pointerId)
        {
            if (_resizeAnchor != null)
            {
                Element.CancelResize();

                if (_delta != null && _resizeAnchor != null)
                {
                    var command = new ResizeElementCommand(Element, _resizeAnchor.Value, _delta);
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
        Reset();
    }

    private void Reset()
    {
        _pointerId = null;
        _resizeAnchor = null;
        _startPoint = null;
        _delta = null;
    }
}
