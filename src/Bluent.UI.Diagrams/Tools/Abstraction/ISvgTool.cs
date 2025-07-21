using Bluent.UI.Diagrams.Components;

namespace Bluent.UI.Diagrams.Tools;

public interface ISvgTool
{
    event EventHandler? Completed;
    string Cursor { get; }
    void Register(SvgCanvas svgCanvas);
    void Unregister();
}
