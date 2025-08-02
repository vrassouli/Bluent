namespace Bluent.UI.Diagrams.Elements.Diagram;

public interface IDiagramConnector : IDiagramElement
{
    IEnumerable<DiagramPoint> Points { get; }
}