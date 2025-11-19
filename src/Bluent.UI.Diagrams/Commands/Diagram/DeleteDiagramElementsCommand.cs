using Bluent.Core;
using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Elements.Diagram;

namespace Bluent.UI.Diagrams.Commands.Diagram;

public class DeleteDiagramElementsCommand : ICommand
{
    private readonly Components.Diagram _diagram;
    private readonly List<IDiagramElement> _elements;
    private IHasOutgoingConnector? _connectorSource;
    private IHasIncomingConnector? _connectorTarget;
    
    private readonly List<ICommand> _innerCommands = [];
    private IDiagramContainer? _container;

    public DeleteDiagramElementsCommand(Components.Diagram diagram, List<IDiagramElement> elements)
    {
        _diagram = diagram;
        _elements = elements;

        foreach (var element in _elements)
        {
            if (element is IHasIncomingConnector hasIncomingConnector)
            {
                foreach (var connector in hasIncomingConnector.IncomingConnectors)
                {
                    var command = new DeleteDiagramElementsCommand(_diagram, [connector]);
                    _innerCommands.Add(command);
                }
            }

            if (element is IHasOutgoingConnector hasOutgoingConnector)
            {
                foreach (var connector in hasOutgoingConnector.OutgoingConnectors)
                {
                    var command = new DeleteDiagramElementsCommand(_diagram, [connector]);
                    _innerCommands.Add(command);
                }
            }
        }
    }
    public void Do()
    {
        foreach (var command in _innerCommands)
        {
            command.Do();
        }
        
        foreach (var element in _elements)
        {
            _container = _diagram.GetElementContainer(element);

            if (element is IDiagramConnector connector)
            {
                _connectorSource = connector.SourceElement;
                _connectorTarget = connector.TargetElement;
            }

            if (_container != null)
                _container.RemoveDiagramElement(element);
        }
    }

    public void Undo()
    {
        foreach (var element in _elements)
        {
            if (element is IDiagramConnector connector)
            {
                if (_connectorSource != null && _connectorTarget != null)
                {
                    connector.SourceElement = _connectorSource;
                    connector.TargetElement = _connectorTarget;

                    _connectorSource.AddOutgoingConnector(connector);
                    _connectorTarget.AddIncomingConnector(connector);
                }
            }

            _container?.AddDiagramElement(element);
        }
        
        foreach (var command in _innerCommands.AsEnumerable().Reverse())
        {
            command.Undo();
        }
    }
}
