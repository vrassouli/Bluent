namespace Bluent.UI.Diagrams.Elements.Diagram;

public interface IDiagramElement : IDrawingShape
{

}

public interface IDiagramNode : IDrawingElement, IDiagramElement
{
    IEnumerable<IDiagramConnector> IncomingConnectors { get; }
    IEnumerable<IDiagramConnector> OutgoingConnectors { get; }

    double X { get; set; }
    double Y { get; set; }
    double Width { get; }
    double Height { get; }
}

public interface IDiagramBoundaryNode : IDiagramNode
{
    void SetCenter(double cx, double cy)
    {
        X = cx - Width / 2;
        Y = cy - Height / 2;
    }
}

public interface IDiagramConnector : IDiagramElement
{
    IEnumerable<DiagramPoint> Points { get; }
}