using Bluent.UI.Diagrams.Components;
using Bluent.UI.Diagrams.Extensions;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Tools;

public class ScaleTool : ISvgTool
{
    private const double ScaleStep = 0.1;
    private DrawingCanvas? _canvas;

    public string Cursor => "auto";

    public event EventHandler? Completed;

    public void Register(DrawingCanvas svgCanvas)
    {
        _canvas = svgCanvas;

        _canvas.MouseWheel += OnMouseWheel;
    }

    public void Unregister()
    {
        if (_canvas is not null)
        {
            _canvas.MouseWheel -= OnMouseWheel;
        }
    }

    private void OnMouseWheel(object? sender, WheelEventArgs e)
    {
        if (_canvas is null)
            return;

        if (e.DeltaY < 0)
            _canvas.ZoomIn(_canvas.ScreenToDiagram(e.ToOffsetPoint()));
        else
            _canvas.ZoomOut(_canvas.ScreenToDiagram(e.ToOffsetPoint()));
    }
}
