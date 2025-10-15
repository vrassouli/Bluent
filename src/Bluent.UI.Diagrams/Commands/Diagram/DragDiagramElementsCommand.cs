using Bluent.Core;
using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Elements.Diagram;

namespace Bluent.UI.Diagrams.Commands.Diagram;

internal class DragDiagramElementsCommand : ICommand
{
    private readonly Components.Diagram _diagram;
    private readonly List<IDiagramNode> _elements;
    private readonly Distance2D _drag;

    public DragDiagramElementsCommand(Components.Diagram diagram, List<IDiagramNode> elements, Distance2D drag)
    {
        _diagram = diagram;
        _elements = elements;
        _drag = drag;
    }

    public void Do()
    {
        foreach (var el in _elements)
        {
            var prevParent = FindParent(el);

            var drag = new Distance2D(el.AllowHorizontalDrag ? _drag.Dx : 0, el.AllowVerticalDrag ? _drag.Dy : 0);

            el.SetDrag(drag);
            el.ApplyDrag();

            var newParent = FindParent(el);

            if (el is IDiagramNode diagramEl && prevParent is not null && newParent is not null)
                SwitchParent(diagramEl, prevParent, newParent);
        }
    }

    public void Undo()
    {
        foreach (var el in _elements)
        {
            var prevParent = FindParent(el);

            var drag = new Distance2D(el.AllowHorizontalDrag ? -_drag.Dx : 0, el.AllowVerticalDrag ? -_drag.Dy : 0);

            el.SetDrag(drag);
            el.ApplyDrag();

            var newParent = FindParent(el);

            if (el is IDiagramNode diagramEl && prevParent is not null && newParent is not null)
                SwitchParent(diagramEl, prevParent, newParent);
        }
    }

    private IDiagramContainer? FindParent(IDiagramNode el)
    {
        var containers = _diagram.GetElementsAt(new DiagramPoint(el.Boundary.Cx, el.Boundary.Cy)).OfType<IDiagramContainer>();

        return containers.FirstOrDefault(x => !object.Equals(el, x) && x.CanContain(el.GetType()));
    }

    private void SwitchParent(IDiagramNode element,
                              IDiagramContainer prevParent,
                              IDiagramContainer newParent)
    {
        if (prevParent == newParent)
            return;

        prevParent.RemoveDiagramElement(element);
        newParent.AddDiagramElement(element);
    }
}
