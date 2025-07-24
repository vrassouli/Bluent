using Bluent.UI.Diagrams.Components;
using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Extensions;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Tools;

internal class DragTool : ISvgTool
{
    private long? _pointerId;
    private ScreenPoint? _startPoint;
    private DrawingCanvas? _canvas;

    public string Cursor => "default";

    public event EventHandler? Completed;

    public void Register(DrawingCanvas svgCanvas)
    {
        _canvas = svgCanvas;

        _canvas.PointerMove += OnPointerMove;
        _canvas.PointerUp += OnPointerUp;
        _canvas.PointerLeave += OnPointerLeave;
        _canvas.PointerCancel += OnPointerCancel;
    }

    public void Unregister()
    {
        if (_canvas is null)
            return;

        _canvas.PointerMove -= OnPointerMove;
        _canvas.PointerUp -= OnPointerUp;
        _canvas.PointerLeave -= OnPointerLeave;
        _canvas.PointerCancel -= OnPointerCancel;
    }

    private void OnPointerMove(object? sender, PointerEventArgs e)
    {
        if (e.Buttons == 1 && _canvas != null && _canvas.SelectedElements.Any())
        {
            if (_pointerId is null)
                _pointerId = e.PointerId;

            if (_pointerId != e.PointerId)
                return;

            if (_startPoint is null)
                _startPoint = e.ToClientPoint();

            var delta = e.ToClientPoint() - _startPoint;

            foreach (var el in _canvas.SelectedElements)
            {
                var drag = new Distance2D(el.AllowHorizontalDrag ? delta.Dx : 0, el.AllowVerticalDrag ? delta.Dy : 0);

                el.SetDrag(drag);
            }
        }
    }

    private void OnPointerUp(object? sender, PointerEventArgs e)
    {
        if (e.PointerId == _pointerId)
        {
            if (_canvas != null)
            {
                foreach (var el in _canvas.SelectedElements)
                {
                    el.ApplyDrag();
                }
            }
            Reset();
        }
    }

    private void OnPointerLeave(object? sender, PointerEventArgs e)
    {
        if (e.PointerId == _pointerId)
            Reset();
    }

    private void OnPointerCancel(object? sender, PointerEventArgs e)
    {
        if (e.PointerId == _pointerId)
            Reset();
    }

    private void Reset()
    {
        _pointerId = null;
        _startPoint = null;
    }
}
