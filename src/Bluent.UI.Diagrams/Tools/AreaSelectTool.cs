using Bluent.UI.Diagrams.Components;
using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Extensions;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Tools;

public class AreaSelectTool : ISvgTool
{
    private long? _pointerId;
    private DiagramPoint? _startPoint;
    private RectElement? _element;
    private SvgCanvas? _canvas;

    public string Cursor => "default";

    public event EventHandler? Completed;

    public void Register(SvgCanvas svgCanvas)
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
        if (e.Buttons == 1 && _canvas != null && !_canvas.SelectedElements.Any())
        {
            if (_pointerId is null)
                _pointerId = e.PointerId;

            if (_pointerId != e.PointerId)
                return;

            if (_element is null)
            {
                _startPoint = _canvas.ScreenToDiagram(e.ToOffsetPoint());

                _element = new RectElement(e.OffsetX, e.OffsetY, 0, 0);
                _element.Fill = "#0095ff55";
                _element.Stroke = "#0095ff";
                _element.StrokeWidth = 2;
                _element.StrokeDashArray = "4 2";

                _canvas?.AddElement(_element);
            }
            else
            {
                var x = _element.X;
                var y = _element.Y;
                var width = e.OffsetX - (_startPoint?.X ?? 0);
                var height = e.OffsetY - (_startPoint?.Y ?? 0);

                if (width < 0)
                    x = (_startPoint?.X ?? 0) + width;

                if (height < 0)
                    y = (_startPoint?.Y ?? 0) + height;

                _element.X = x;
                _element.Y = y;
                _element.Width = Math.Abs(width);
                _element.Height = Math.Abs(height);
            }
        }
    }

    private void OnPointerUp(object? sender, PointerEventArgs e)
    {
        if (e.PointerId == _pointerId)
            SelectElements();
    }

    private void OnPointerLeave(object? sender, PointerEventArgs e)
    {
        if (e.PointerId == _pointerId)
            SelectElements();
    }

    private void OnPointerCancel(object? sender, PointerEventArgs e)
    {
        if (e.PointerId == _pointerId)
            SelectElements();
    }

    private void SelectElements()
    {
        if (_canvas is not null && _element is not null)
        {
            var selectionBoundary = _element.Boundary;

            foreach (var element in _canvas.Elements)
            {
                if (selectionBoundary.Contains(element.Boundary))
                    _canvas.SelectElement(element, true);
                else
                    _canvas.DeselectElement(element);
            }
        }

        Reset();

        Completed?.Invoke(this, EventArgs.Empty);
    }

    private void Reset()
    {
        _pointerId = null;
        _startPoint = null;

        if (_element is not null && _canvas is not null)
        {
            _canvas.RemoveElement(_element);
            _element = null;
        }
    }
}
