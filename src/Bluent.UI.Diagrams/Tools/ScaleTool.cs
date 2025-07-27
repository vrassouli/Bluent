using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Extensions;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Tools;
public class ScaleTool : PointerToolBase
{
    private double _startScale;

    //private Dictionary<long, ScreenPoint> _endPoints = new();

    public override string Cursor => "auto";

    protected override void RegisterEvents()
    {
        Canvas.MouseWheel += OnMouseWheel;
        base.RegisterEvents();
    }

    protected override void UnregisterEvents()
    {
        Canvas.MouseWheel -= OnMouseWheel;
        base.UnregisterEvents();
    }

    private void OnMouseWheel(object? sender, WheelEventArgs e)
    {
        if (e.DeltaY < 0)
            Canvas.ZoomIn(Canvas.ScreenToDiagram(e.ToOffsetPoint()));
        else
            Canvas.ZoomOut(Canvas.ScreenToDiagram(e.ToOffsetPoint()));
    }

    protected override void OnPointerDown(PointerEventArgs e)
    {
        if (Pointers.Count == 1)
        {
            _startScale = Canvas.Scale;
        }
        base.OnPointerDown(e);
    }

    protected override void OnPointerMove(PointerEventArgs e)
    {
        if (Pointers.Count != 2)
            return;

        var initialDistance = ScreenPoint.GetDistance(Pointers[0].ToClientPoint(), Pointers[1].ToClientPoint());
        var currentDistance = ScreenPoint.GetDistance(e.ToClientPoint(), Pointers.First(p => p.PointerId != e.PointerId).ToClientPoint());
        var center = ScreenPoint.GetCenter(Pointers[0].ToClientPoint(), Pointers[1].ToClientPoint());

        var scale = currentDistance / initialDistance * _startScale;

        Canvas?.SetScale(scale, Canvas.ScreenToDiagram(center));

        base.OnPointerMove(e);
    }
}
