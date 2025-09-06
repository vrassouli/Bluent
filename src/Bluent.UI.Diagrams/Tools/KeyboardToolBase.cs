using Bluent.UI.Diagrams.Components;
using Microsoft.AspNetCore.Components.Web;
using System.ComponentModel;

namespace Bluent.UI.Diagrams.Tools;

internal abstract class KeyboardToolBase : ITool
{
    public string Cursor { get; set; } = "auto";
    public DrawingCanvas Canvas { get; private set; } = default!;

    public event EventHandler? Completed;
    public event PropertyChangedEventHandler? PropertyChanged;

    public void Register(DrawingCanvas canvas)
    {
        Canvas = canvas;

        Canvas.KeyDown += Canvas_KeyDown;
        Canvas.KeyUp += Canvas_KeyUp;
    }

    public void Unregister()
    {
        Canvas.KeyDown -= Canvas_KeyDown;
        Canvas.KeyUp -= Canvas_KeyUp;
    }

    private void Canvas_KeyUp(object? sender, KeyboardEventArgs e)
    {
        OnKeyUp(e);
    }

    private void Canvas_KeyDown(object? sender, KeyboardEventArgs e)
    {
        OnKeyDown(e);
    }

    protected virtual void OnKeyDown(KeyboardEventArgs e)
    {
        
    }

    protected virtual void OnKeyUp(KeyboardEventArgs e)
    {
        
    }
}
