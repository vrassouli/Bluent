using Bluent.UI.Diagrams.Commands;
using Bluent.UI.Diagrams.Components;
using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Extensions;
using Microsoft.AspNetCore.Components.Web;
using System.Xml.Linq;

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
        _center = new();
        _r = 0;
    }
}
