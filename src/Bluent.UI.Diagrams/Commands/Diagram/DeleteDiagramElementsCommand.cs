using Bluent.Core;
using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Elements.Diagram;

namespace Bluent.UI.Diagrams.Commands.Diagram;

internal class DeleteDiagramElementsCommand : ICommand
{
    private readonly Components.Diagram _diagram;
    private readonly List<IDiagramElement> _elements;
    private IHasOutgoingConnector? _connectorSource;
    private IHasIncomingConnector? _connectorTarget;

    public DeleteDiagramElementsCommand(Components.Diagram diagram, List<IDiagramElement> elements)
    {
        _diagram = diagram;
        _elements = elements;
    }
    public void Do()
    {
        foreach (var element in _elements)
        {
            var container = FindParent(element);

            if (element is IDiagramConnector connector)
            {
                _connectorSource = connector.SourceElement;
                _connectorTarget = connector.TargetElement;
            }

            if (container != null)
                container.RemoveDiagramElement(element);
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

            var container = FindParent(element);

            if (container != null)
                container.AddDiagramElement(element);
        }
    }

    private IDiagramContainer? FindParent(IDiagramElement el)
    {
        if (el is IDiagramConnector connector && connector.SourceElement is IDiagramElement sourceElement)
        {
            var parentFromSource = FindParent(sourceElement);
            if (parentFromSource?.Contains(el) == true)
                return parentFromSource;
        }

        var containers = _diagram.GetElementsAt(new DiagramPoint(el.Boundary.Cx, el.Boundary.Cy)).OfType<IDiagramContainer>();
        var container = containers.FirstOrDefault(x => !object.Equals(el, x) && x.Contains(el));
        return container;
    }
}
