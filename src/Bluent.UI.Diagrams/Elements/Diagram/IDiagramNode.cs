namespace Bluent.UI.Diagrams.Elements.Diagram;

public interface IDiagramNode : IDrawingElement, IDiagramElement
{
    double X { get; set; }
    double Y { get; set; }
    double Width { get; }
    double Height { get; }
}

public interface IHasIncommingConnector
{
    IEnumerable<IDiagramConnector> IncomingConnectors { get; }

    void AddIncomingConnector (IDiagramConnector connector);
    void RemoveIncomingConnector (IDiagramConnector connector);
    bool CanConnectIncoming<T>() where T: IDiagramConnector;
    bool CanConnectIncoming(Type connectorType);
}

public interface IHasOutgoingConnector
{
    IEnumerable<IDiagramConnector> OutgoingConnectors { get; }
    void AddOutgoingConnector(IDiagramConnector connector);
    void RemoveOutgoingConnector(IDiagramConnector connector);
    bool CanConnectOutgoing<T>() where T: IDiagramConnector;
    bool CanConnectOutgoing(Type connectorType);
}