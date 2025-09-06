namespace Bluent.UI.Diagrams.Elements.Diagram;

public interface IDiagramBoundaryNode : IDiagramNode
{
    void SetCenter(DiagramPoint point)
    {
        X = point.X - Width / 2;
        Y = point.Y - Height / 2;
    }
}
