using Bluent.Core;
using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Elements.Diagram;

namespace Bluent.UI.Diagrams.Commands.Diagram;

internal class DragDiagramElementsCommand : ICommand
{
    private readonly Components.Diagram _diagram;
    private readonly List<IDiagramNode> _elements;
    private readonly Distance2D _drag;
    private List<ICommand> _innerCommands = [];

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
            var drag = new Distance2D(el.AllowHorizontalDrag ? _drag.Dx : 0, el.AllowVerticalDrag ? _drag.Dy : 0);
            el.SetDrag(drag);
            el.ApplyDrag();            
            
            var prevParent = _diagram.GetElementContainer(el);
            var newParent = FindParent(el, el.Boundary.Center);

            if (newParent is not null && newParent != prevParent)
            {
                // delete from previous parent
                var deleteCmd = new DeleteDiagramElementsCommand(_diagram, [el]);
                deleteCmd.Do();

                // add to new parent at new position
                var addCmd = new AddDiagramElementCommand(newParent, el);
                addCmd.Do();
                
                _innerCommands.AddRange([deleteCmd, addCmd]);
            }

        }
    }

    public void Undo()
    {
        // undo any inner command
        foreach (var innerCommand in _innerCommands.AsEnumerable().Reverse())
        {
            innerCommand.Undo();
        }
        
        // Clear inner commands
        _innerCommands.Clear();
        
        foreach (var el in _elements)
        {
            var drag = new Distance2D(el.AllowHorizontalDrag ? -_drag.Dx : 0, el.AllowVerticalDrag ? -_drag.Dy : 0);

            el.SetDrag(drag);
            el.ApplyDrag();
        }
    }

    // private IDiagramContainer? FindParent(IDiagramNode el)
    // {
    //     var containers = _diagram.GetElementsAt(new DiagramPoint(el.Boundary.Cx, el.Boundary.Cy))
    //         .OfType<IDiagramContainer>()
    //         .Where(x => x.CanContain(el.GetType()));
    //
    //     return containers.FirstOrDefault(x => !Equals(el, x));
    // }

    private IDiagramContainer? FindParent(IDiagramNode el, DiagramPoint position)
    {
        var containers = _diagram.GetElementsAt(position)
            .OfType<IDiagramContainer>()
            .Where(x => x.CanContain(el.GetType()));

        return containers.FirstOrDefault(x => !Equals(el, x));
    }

    // private void SwitchParent(IDiagramNode element,
    //                           IDiagramContainer prevParent,
    //                           IDiagramContainer newParent)
    // {
    //     if (prevParent == newParent)
    //         return;
    //
    //     prevParent.RemoveDiagramElement(element);
    //     newParent.AddDiagramElement(element);
    //     
    //     
    // }
}
