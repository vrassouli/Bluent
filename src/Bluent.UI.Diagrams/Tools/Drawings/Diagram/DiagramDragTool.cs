using Bluent.UI.Diagrams.Commands.Diagram;
using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Elements.Diagram;
using Bluent.UI.Diagrams.Extensions;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Tools.Drawings.Diagram;

internal class DiagramDragTool : DiagramSinglePointerToolBase
{
    private DiagramPoint? _dragStart;
    private Distance2D? _dragDelta;
    private ScreenPoint? _panStart;

    public DiagramDragTool()
    {
        Cursor = "move";
    }

    protected override void OnTargetPointerAvailable(PointerEventArgs e) { }
    protected override void OnTargetPointerUp(PointerEventArgs e) { }

    protected override void OnTargetPointerMove(PointerEventArgs e)
    {
        if (Canvas.Tool is not null)
            return;

        if (Canvas.SelectedElements.Any())
            Drag(e);
        else
            Pan(e);
    }

    protected override void OnTargetPointerUnavailable()
    {
        Canvas.ApplyPan();
        if (Canvas.SelectedElements.Any())
        {
            if (_dragDelta != null)
            {
                var elements = Canvas.SelectedElements.OfType<IDiagramNode>().ToList();
                foreach (var el in elements)
                    el.CancelDrag();

                var command = new DragDiagramElementsCommand(Diagram, elements, _dragDelta);
                Canvas.ExecuteCommand(command);
            }
        }

        _panStart = null;
        _dragStart = null;
        _dragDelta = null;
    }

    private void Pan(PointerEventArgs e)
    {
        _panStart ??= e.ToClientPoint();

        var delta = e.ToClientPoint() - _panStart;
        Canvas.Pan(delta.Dx, delta.Dy);
    }

    private void Drag(PointerEventArgs e)
    {
        _dragStart ??= Canvas.ScreenToDiagram(e.ToClientPoint());

        _dragDelta = Canvas.ScreenToDiagram(e.ToClientPoint()) - _dragStart;
        var elements = Canvas.SelectedElements.OfType<IDiagramNode>();
        foreach (var el in elements)
        {
            var drag = new Distance2D(el.AllowHorizontalDrag ? _dragDelta.Dx : 0, el.AllowVerticalDrag ? _dragDelta.Dy : 0);

            el.SetDrag(drag);
        }
    }
}
