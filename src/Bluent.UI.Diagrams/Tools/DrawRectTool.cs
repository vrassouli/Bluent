using Bluent.UI.Diagrams.Components;
using Bluent.UI.Diagrams.Elements;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Tools;

public class DrawRectTool : ISvgDrawingTool
{
    private SvgCanvas? _canvas;
    private long? _pointerId;
    private double? _x;
    private double? _y;
    private double _width;
    private double _height;
    private RectElement? _element;

    public string Cursor => "crosshair";

    public string? Fill { get; set; }
    public string? Stroke { get; set; }
    public string? StrokeWidth { get; set; }

    public void Register(SvgCanvas svgCanvas)
    {
        _canvas = svgCanvas;
        _canvas.PointerDown += OnPointerDown;
        _canvas.PointerUp += OnPointerUp;
        _canvas.PointerCancel += OnPointerCancel;
        _canvas.PointerMove += OnPointerMove;
    }

    public void Unregister()
    {
        if (_canvas is not null)
        {
            _canvas.PointerDown -= OnPointerDown;
        }
    }

    private void OnPointerDown(object? sender, PointerEventArgs e)
    {
        if (_pointerId is not null)
            return;

        _pointerId = e.PointerId;
              
        _x = e.OffsetX;
        _y = e.OffsetY;

        _element = new RectElement(_x.ToString(), _y.ToString(), _width.ToString(), _height.ToString());
        _element.Fill = Fill;
        _element.Stroke = Stroke;
        _element.StrokeWidth = StrokeWidth;
        _canvas?.AddElement(_element);
    }

    private void OnPointerUp(object? sender, PointerEventArgs e)
    {
        _pointerId = null;
        _element = null;
        _x = null;
        _y = null;
        _width = 0;
        _height = 0;
    }

    private void OnPointerCancel(object? sender, PointerEventArgs e)
    {
        _pointerId = null;

        if (_element is not null)
        {
            _canvas?.RemoveElement(_element);
            _element = null;
        }
    }

    private void OnPointerMove(object? sender, PointerEventArgs e)
    {
        if (_pointerId is null)
            return;

        _width = e.OffsetX - (_x ?? 0);
        _height = e.OffsetY - (_y ?? 0);

        if (_element is not null)
        {
            // As rect does not support negative width and height
            // we have to shift the rect in x or y axis
            if (_width < 0)
                _element.X = ((_x ?? 0) + _width).ToString();
            
            if (_height < 0)
                _element.Y = ((_y ?? 0) + _height).ToString();

            _element.Width = Math.Abs(_width).ToString();
            _element.Height = Math.Abs(_height).ToString();
        }
    }
}
