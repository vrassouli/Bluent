using Bluent.UI.Diagrams.Commands.Basic;
using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Elements.Basic;
using Bluent.UI.Diagrams.Extensions;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Tools.Drawings.Basic;

public class DrawRectTool : ElementDrawingToolBase
{
    private long? _pointerId;
    private DiagramPoint? _startPoint;
    private double _width;
    private double _height;
    private RectElement? _element;

    public override string Cursor => "crosshair";

    protected override void OnPointerDown(PointerEventArgs e)
    {
        if (_pointerId is not null || Canvas is null)
            return;

        _pointerId = e.PointerId;

        _startPoint = Canvas.ScreenToDiagram(e.ToOffsetPoint());

        _element = new RectElement(_startPoint.X, _startPoint.Y, _width, _height);
        _element.Fill = Fill;
        _element.Stroke = Stroke;
        _element.StrokeWidth = StrokeWidth;
        
        Canvas?.AddElement(_element);
    }

    protected override void OnPointerMove(PointerEventArgs e)
    {
        if (_pointerId is null || Canvas is null)
            return;

        var endPoint = Canvas.ScreenToDiagram(e.ToOffsetPoint());
        _width = endPoint.X - (_startPoint?.X ?? 0);
        _height = endPoint.Y - (_startPoint?.Y ?? 0);

        if (_element is not null)
        {
            // As rect does not support negative width and height
            // we have to shift the rect in x or y axis
            if (_width < 0)
                _element.X = (_startPoint?.X ?? 0) + _width;
            
            if (_height < 0)
                _element.Y = (_startPoint?.Y ?? 0) + _height;

            _element.Width = Math.Abs(_width);
            _element.Height = Math.Abs(_height);
        }
    }

    protected override void OnPointerUp(PointerEventArgs e)
    {
        if (_pointerId is not null)
            NotifyOperationCompleted();

        if (Canvas != null && _element != null)
        {
            Canvas.RemoveElement(_element);
            Canvas.ExecuteCommand(new AddElementCommand(Canvas, _element));
        }

        Reset();
    }

    protected override void OnPointerCancel(PointerEventArgs e)
    {
        Cancel();
    }

    protected override void OnPointerLeave(PointerEventArgs e)
    {
        Cancel();
    }

    private void Cancel()
    {
        if (_element is not null)
            Canvas?.RemoveElement(_element);

        Reset();
    }

    private void Reset()
    {
        _pointerId = null;
        _element = null;
        _startPoint = null;
        _width = 0;
        _height = 0;
    }
}
