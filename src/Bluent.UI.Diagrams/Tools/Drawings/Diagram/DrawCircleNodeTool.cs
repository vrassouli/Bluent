using Bluent.UI.Diagrams.Elements.Diagram;

namespace Bluent.UI.Diagrams.Tools.Drawings.Diagram;

public class DrawCircleNodeTool : DrawDiagramNodeTool<CircleNode>
{
    public DrawCircleNodeTool() : base("Circle")
    {
    }
}

public class DrawBoundaryCircleNodeTool : DrawDiagramNodeTool<BoundaryCircleNode>
{
    public DrawBoundaryCircleNodeTool() : base("Boundary")
    {
    }
}
