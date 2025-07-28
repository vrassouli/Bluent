using Bluent.UI.Diagrams.Commands;
using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Extensions;
using Bluent.UI.Diagrams.Tools.Utilities;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Tools;

public class InkToShapeTool : SinglePointerToolBase
{
    private PathElement? _element;

    public event EventHandler<ShapeDetectionResult>? OnShapeDetected;

    protected override void OnTargetPointerAvailable(PointerEventArgs e)
    {
        _element = new PathElement()
        {
            StrokeWidth = 1,
            Stroke = "#aaa",
            Fill = "none"
        };
        _element.AddPoint(Canvas.ScreenToDiagram(e.ToOffsetPoint(), 1));

        Canvas.AddElement(_element);
    }

    protected override void OnTargetPointerMove(PointerEventArgs e)
    {
        _element?.AddPoint(Canvas.ScreenToDiagram(e.ToOffsetPoint(), 1));
    }

    protected override void OnTargetPointerUnavailable()
    {
        if (_element is not null)
        {
            Canvas.RemoveElement(_element);
            var detection = new ShapeDetector(_element.Points).Detect();

            if (detection.Shape == CommonShapes.Unknown)
            {
                Canvas.ExecuteCommand(new AddElementCommand(Canvas, _element));
            }
            else
            {
                OnShapeDetected?.Invoke(this, detection);
            }

            NotifyCompleted();
        }
    }
}
