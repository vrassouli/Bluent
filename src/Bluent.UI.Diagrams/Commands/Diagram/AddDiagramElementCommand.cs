using Bluent.Core;
using Bluent.UI.Diagrams.Elements.Diagram;

namespace Bluent.UI.Diagrams.Commands.Diagram;

public class AddDiagramElementCommand : ICommand
{
    private readonly IDiagramContainer _container;

    public AddDiagramElementCommand(IDiagramContainer container, IDiagramNode element) 
    {
        _container = container;
        Element = element;
    }

    protected IDiagramNode Element { get; }

    public virtual void Do()
    {
        _container.AddDiagramElement(Element);
    }

    public virtual void Undo()
    {
        _container.RemoveDiagramElement(Element);
    }
}
