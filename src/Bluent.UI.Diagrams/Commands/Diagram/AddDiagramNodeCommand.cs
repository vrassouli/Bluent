using Bluent.Core;
using Bluent.UI.Diagrams.Elements.Diagram;

namespace Bluent.UI.Diagrams.Commands.Diagram;

internal class AddDiagramNodeCommand : ICommand
{
    private readonly IDiagramElementContainer _container;
    private readonly IDiagramElement _element;

    public AddDiagramNodeCommand(IDiagramElementContainer container, IDiagramElement element) 
    {
        _container = container;
        _element = element;
    }

    public void Do()
    {
        _container.AddDiagramElement(_element);
    }

    public void Undo()
    {
        _container.RemoveDiagramElement(_element);
    }
}
