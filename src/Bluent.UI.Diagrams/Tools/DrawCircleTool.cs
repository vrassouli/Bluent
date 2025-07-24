using Bluent.UI.Diagrams.Components;
using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Extensions;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Tools;

public class DrawCircleTool : SvgDrawingToolBase
{
    private long? _pointerId;
    private DiagramPoint _center = new();
    private double _r;
    private CircleElement? _element;

    public override string Cursor => "crosshair";

    protected override void OnPointerDown(PointerEventArgs e)
    {
        if (_pointerId is not null || Canvas is null)
            return;

        _pointerId = e.PointerId;
        _center = Canvas.ScreenToDiagram(e.ToOffsetPoint());

        _element = new CircleElement(_center.X, _center.Y, _r);
        _element.Fill = Fill;
        _element.Stroke = Stroke;
        _element.StrokeWidth = StrokeWidth;

        Canvas.AddElement(_element);
    }

    protected override void OnPointerUp(PointerEventArgs e)
    {
        if (_pointerId is not null)
            NotifyOperationCompleted();

        _pointerId = null;
        _element = null;
        _center = new();
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
        if (_pointerId is null || Canvas is null)
            return;

        _r = Canvas.ScreenToDiagram(e.ToOffsetPoint()).X - _center.X;

        if (_element is not null)
        {
            _element.R = Math.Abs(_r);
        }
    }
}
