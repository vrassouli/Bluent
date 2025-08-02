namespace Bluent.UI.Diagrams.Elements.Diagram;

public interface IDiagramNode : IDrawingElement, IDiagramElement
{
    IEnumerable<IDiagramConnector> IncomingConnectors { get; }
    IEnumerable<IDiagramConnector> OutgoingConnectors { get; }

    double X { get; set; }
    double Y { get; set; }
    double Width { get; }
    double Height { get; }
}
