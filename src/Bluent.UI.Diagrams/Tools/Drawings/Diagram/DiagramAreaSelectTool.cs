

namespace Bluent.UI.Diagrams.Tools.Drawings.Diagram;

public class DiagramAreaSelectTool : AreaSelectTool, IDiagramTool
{
    public Components.Diagram Diagram { get; private set; } = default!;

    public void Register(Components.Diagram diagram)
    {
        Diagram = diagram;
    }
}
