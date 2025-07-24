using Bluent.UI.Diagrams.Components;
using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Extensions;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Tools;

public class PanTool : ISvgTool
{
    private DrawingCanvas? _canvas;
    private long? _pointerId;
    private ScreenPoint? _startPoint;

    public string Cursor => "move";

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
        if (_canvas != null)
        {
            _canvas.PointerMove -= OnPointerMove;
            _canvas.PointerLeave -= OnPointerLeave;
            _canvas.PointerCancel -= OnPointerCancel;
        }
    }

    private void OnPointerMove(object? sender, PointerEventArgs e)
    {
        if (e.Buttons == 1 && _canvas is not null && !_canvas.SelectedElements.Any())
        {
            if (_pointerId is null)
                _pointerId = e.PointerId;

            if (_pointerId != e.PointerId)
                return;

            if (_startPoint is null)
                _startPoint = e.ToClientPoint();

            var delta = e.ToClientPoint() - _startPoint;
            _canvas.Pan(delta.Dx, delta.Dy);
        }
    }

    private void OnPointerUp(object? sender, PointerEventArgs e)
    {
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

    private void Reset()
    {
        _canvas?.ApplyPan();

        _pointerId = null;
        _startPoint = null;

    }
}
