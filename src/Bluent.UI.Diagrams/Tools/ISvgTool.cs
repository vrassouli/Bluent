using Bluent.UI.Diagrams.Components;

namespace Bluent.UI.Diagrams.Tools;

public interface ISvgTool
{
    string Cursor { get; }
    void Register(SvgCanvas svgCanvas);
    void Unregister();
}
