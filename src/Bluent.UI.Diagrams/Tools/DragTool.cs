using Bluent.UI.Diagrams.Commands;
using Bluent.UI.Diagrams.Components;
using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Extensions;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Tools;

internal class DragTool : ISvgTool
{
    private DrawingCanvas? _canvas;
    private long? _pointerId;
    private ScreenPoint? _panStart;
    private DiagramPoint? _dragStart;
    private Distance2D? _dragDelta;

    public string Cursor => "move";

    public event EventHandler? Completed;

    public void Register(DrawingCanvas svgCanvas)
    {
        _canvas = svgCanvas;

        _canvas.PointerDown += OnPointerDown;
        _canvas.PointerMove += OnPointerMove;
        _canvas.PointerUp += OnPointerUp;
        _canvas.PointerLeave += OnPointerLeave;
        _canvas.PointerCancel += OnPointerCancel;
    }

    public void Unregister()
    {
        if (_canvas != null)
        {
            _canvas.PointerDown -= OnPointerDown;
            _canvas.PointerMove -= OnPointerMove;
            _canvas.PointerUp -= OnPointerUp;
            _canvas.PointerLeave -= OnPointerLeave;
            _canvas.PointerCancel -= OnPointerCancel;
        }
    }

    private void OnPointerDown(object? sender, PointerEventArgs e)
    {
        if (e.Buttons == 1 && _pointerId is null)
            _pointerId = e.PointerId;
    }

    private void OnPointerMove(object? sender, PointerEventArgs e)
    {
        if (_pointerId == e.PointerId && _canvas is not null && _canvas.Tool is null)
        {
            if (_canvas.SelectedElements.Any())
            {
                Drag(e);
            }
            else
            {
                Pan(e);
            }
        }
    }

    private void OnPointerUp(object? sender, PointerEventArgs e)
    {
        if (_pointerId == e.PointerId && _canvas != null)
        {
            if (_canvas.SelectedElements.Any())
            {
                //foreach (var el in _canvas.SelectedElements)
                //{
                //    el.CancelDrag();
                //}

                if (_dragDelta != null)
                {
                    var command = new DragElementsCommand(_canvas.SelectedElements.ToList(), _dragDelta);
                    _canvas.ExecuteCommand(command);
                }
            }
        }

        Reset();
    }

    private void OnPointerLeave(object? sender, PointerEventArgs e)
    {
        Reset();
    }

    private void OnPointerCancel(object? sender, PointerEventArgs e)
    {
        Reset();
    }

    private void Drag(PointerEventArgs e)
    {
        if (_canvas is null)
            return;

        if (_dragStart is null)
            _dragStart = _canvas.ScreenToDiagram(e.ToClientPoint());

        _dragDelta = _canvas.ScreenToDiagram(e.ToClientPoint()) - _dragStart;
        foreach (var el in _canvas.SelectedElements)
        {
            var drag = new Distance2D(el.AllowHorizontalDrag ? _dragDelta.Dx : 0, el.AllowVerticalDrag ? _dragDelta.Dy : 0);

            el.SetDrag(drag);
        }
    }

    private void Pan(PointerEventArgs e)
    {
        if (_canvas is null)
            return;

        if (_panStart is null)
            _panStart = e.ToClientPoint();

        var delta = e.ToClientPoint() - _panStart;
        _canvas?.Pan(delta.Dx, delta.Dy);
    }

    private void Reset()
    {
        _canvas?.ApplyPan();

        _pointerId = null;
        _panStart = null;
        _dragStart = null;
        _dragDelta = null;
    }
}
