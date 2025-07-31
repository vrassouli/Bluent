using Bluent.Core;
using Bluent.UI.Diagrams.Elements.Diagram;

namespace Bluent.UI.Diagrams.Commands.Diagram;

internal class DeleteDiagramElementsCommand : ICommand
{
    private readonly Components.Diagram _diagram;
    private readonly List<IDiagramNode> _elements;

    public DeleteDiagramElementsCommand(Components.Diagram diagram, List<IDiagramNode> elements)
    {
        _diagram = diagram;
        _elements = elements;
    }
    public void Do()
    {
        foreach (var element in _elements)
        {
            var container = FindParent(element);

            if (container != null)
                container.RemoveDiagramElement(element);
        }
    }

    public void Undo()
    {
        foreach (var element in _elements)
        {
            var container = FindParent(element);

            if (container != null)
                container.AddDiagramElement(element);
        }
    }

    private IDiagramContainer? FindParent(IDiagramNode element)
    {
        var containers = _diagram.GetContainersAt(new Elements.DiagramPoint(element.Boundary.Cx, element.Boundary.Cy));
        var container = containers.FirstOrDefault(x => !object.Equals(element, x) && x.CanContain(element.GetType()));
        return container;
    }
}
