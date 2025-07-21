using Bluent.UI.Diagrams.Components;
using Bluent.UI.Diagrams.Elements;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Tools;

public class DrawCircleTool : SvgDrawingToolBase
{
    private long? _pointerId;
    private double _cx;
    private double _cy;
    private double _r;
    private CircleElement? _element;

    public override string Cursor => "crosshair";

    protected override void OnPointerDown(PointerEventArgs e)
    {
        if (_pointerId is not null)
            return;

        _pointerId = e.PointerId;

        _cx = e.OffsetX;
        _cy = e.OffsetY;

        _element = new CircleElement(_cx, _cy, _r);
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
        _cx = 0;
        _cy = 0;
        _r = 0;
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

        _r = e.OffsetX - _cx;

        if (_element is not null)
        {
            _element.R = Math.Abs(_r);
        }
    }
}
