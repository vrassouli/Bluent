using Bluent.Core;
using Bluent.UI.Diagrams.Elements.Diagram;

namespace Bluent.UI.Diagrams.Commands.Diagram;

public class AddDiagramConnectorCommand : ICommand
{
    private readonly IDiagramContainer _container;
    private readonly IHasOutgoingConnector _source;
    private readonly IHasIncomingConnector _target;
    private readonly IDiagramConnector _connector;

    public AddDiagramConnectorCommand(IDiagramContainer container,
                                      IHasOutgoingConnector source,
                                      IHasIncomingConnector target,
                                      IDiagramConnector connector)
    {
        _container = container;
        _source = source;
        _target = target;
        _connector = connector;
    }

    public void Do()
    {
        _container.AddDiagramElement(_connector);
        _source.AddOutgoingConnector(_connector);
        _target.AddIncomingConnector(_connector);
        _connector.SourceElement = _source;
        _connector.TargetElement = _target;
    }

    public void Undo()
    {
        _container.RemoveDiagramElement(_connector);
    }
}
