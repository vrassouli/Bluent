using Bluent.UI.Diagrams.Components;
using Microsoft.AspNetCore.Components.Web;
using System.ComponentModel;

namespace Bluent.UI.Diagrams.Tools.Drawings.Diagram;

internal abstract class DiagramKeyboardToolBase : IDiagramTool
{
    public string Cursor { get; set; } = "auto";
    public DrawingCanvas Canvas { get; private set; } = default!;

    public Components.Diagram Diagram => (Canvas as Components.Diagram) ?? throw new ArgumentNullException("The tool should be added and registered on a Diagram component");

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
