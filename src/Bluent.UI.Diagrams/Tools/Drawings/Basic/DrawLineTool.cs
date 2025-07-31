using Bluent.UI.Diagrams.Commands.Basic;
using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Elements.Basic;
using Bluent.UI.Diagrams.Extensions;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Tools.Drawings.Basic;

public class DrawLineTool : ElementDrawingToolBase
{
    private long? _pointerId;
    private DiagramPoint? _startPoint;
    private LineElement? _element;

    public DrawLineTool()
    {
        Cursor = "crosshair";
    }

    protected override void OnPointerDown(PointerEventArgs e)
    {
        if (_pointerId is not null || Canvas is null)
            return;

        _pointerId = e.PointerId;
        _startPoint = Canvas.ScreenToDiagram(e.ToOffsetPoint());

        _element = new LineElement(_startPoint.X, _startPoint.Y, _startPoint.X, _startPoint.Y);
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

        if (_element is not null)
        {
            _element.X2 = endPoint.X;
            _element.Y2 = endPoint.Y;
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
    }
}
