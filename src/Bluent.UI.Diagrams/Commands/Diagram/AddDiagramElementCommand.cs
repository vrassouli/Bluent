using Bluent.Core;
using Bluent.UI.Diagrams.Elements.Diagram;

namespace Bluent.UI.Diagrams.Commands.Diagram;

public class AddDiagramElementCommand : ICommand
{
    private readonly IDiagramContainer _container;
    private readonly IDiagramNode _element;

    public AddDiagramElementCommand(IDiagramContainer container, IDiagramNode element) 
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
