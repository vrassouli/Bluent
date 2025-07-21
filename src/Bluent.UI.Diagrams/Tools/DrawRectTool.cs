using Bluent.UI.Diagrams.Components;
using Bluent.UI.Diagrams.Elements;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Tools;

public class DrawRectTool : SvgDrawingToolBase
{
    private long? _pointerId;
    private double? _x;
    private double? _y;
    private double _width;
    private double _height;
    private RectElement? _element;

    public override string Cursor => "crosshair";

    protected override void OnPointerDown(PointerEventArgs e)
    {
        if (_pointerId is not null)
            return;

        _pointerId = e.PointerId;
              
        _x = e.OffsetX;
        _y = e.OffsetY;

        _element = new RectElement(_x, _y, _width, _height);
        _element.Fill = Fill;
        _element.Stroke = Stroke;
        _element.StrokeWidth = StrokeWidth;
        
        Canvas?.AddElement(_element);
    }

    protected override void OnPointerUp(PointerEventArgs e)
    {
        if (_pointerId is not null)
            NotifyOperationCompleted();

        _pointerId = null;
        _element = null;
        _x = null;
        _y = null;
        _width = 0;
        _height = 0;
    }

    protected override void OnPointerCancel(PointerEventArgs e)
    {
        _pointerId = null;

        if (_element is not null)
        {
            Canvas?.RemoveElement(_element);
            _element = null;
        }
    }

    protected override void OnPointerMove(PointerEventArgs e)
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
                _element.X = ((_x ?? 0) + _width);
            
            if (_height < 0)
                _element.Y = ((_y ?? 0) + _height);

            _element.Width = Math.Abs(_width);
            _element.Height = Math.Abs(_height);
        }
    }
}
