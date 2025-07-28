using Bluent.UI.Diagrams.Components;

namespace Bluent.UI.Diagrams.Tools;

public interface ITool
{
    event EventHandler? Completed;
    string Cursor { get; }
    void Register(DrawingCanvas svgCanvas);
    void Unregister();
}
