namespace Bluent.UI.Diagrams.Elements.Diagram;

public interface IDiagramBoundaryNode : IDiagramNode
{
    void SetCenter(double cx, double cy)
    {
        X = cx - Width / 2;
        Y = cy - Height / 2;
    }
}
