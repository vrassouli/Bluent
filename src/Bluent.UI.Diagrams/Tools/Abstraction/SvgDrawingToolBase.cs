using Bluent.UI.Diagrams.Components;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Tools;

public abstract class SvgDrawingToolBase : ISvgDrawingTool
{
    protected DrawingCanvas? Canvas { get; private set; }
    public string? Fill { get; set; }
    public string? Stroke { get; set; }
    public double? StrokeWidth { get; set; }

    public event EventHandler? Completed;

    public abstract string Cursor { get; }

    public void Register(DrawingCanvas svgCanvas)
    {
        Canvas = svgCanvas;
        Canvas.PointerDown += OnPointerDown;
        Canvas.PointerUp += OnPointerUp;
        Canvas.PointerCancel += OnPointerCancel;
        Canvas.PointerMove += OnPointerMove;
        Canvas.PointerLeave += OnPointerLeave;
    }

    public void Unregister()
    {
        if (Canvas is not null)
        {
            Canvas.PointerDown -= OnPointerDown;
            Canvas.PointerUp -= OnPointerUp;
            Canvas.PointerCancel -= OnPointerCancel;
            Canvas.PointerMove -= OnPointerMove;
            Canvas.PointerLeave -= OnPointerLeave;
        }
    }

    private void OnPointerDown(object? sender, PointerEventArgs e)
    {
        OnPointerDown(e);
    }

    private void OnPointerUp(object? sender, PointerEventArgs e)
    {
        OnPointerUp(e);
    }

    private void OnPointerCancel(object? sender, PointerEventArgs e)
    {
        OnPointerCancel(e);
    }

    private void OnPointerMove(object? sender, PointerEventArgs e)
    {
        OnPointerMove(e);
    }

    private void OnPointerLeave(object? sender, PointerEventArgs e)
    {
        OnPointerLeave(e);
    }

    protected virtual void OnPointerDown(PointerEventArgs e)
    {
    }

    protected virtual void OnPointerUp(PointerEventArgs e)
    {
    }

    protected virtual void OnPointerCancel(PointerEventArgs e)
    {
    }

    protected virtual void OnPointerMove(PointerEventArgs e)
    {
    }

    protected virtual void OnPointerLeave(PointerEventArgs e)
    {
    }

    protected void NotifyOperationCompleted()
    {
        Completed?.Invoke(this, EventArgs.Empty);
    }
}
