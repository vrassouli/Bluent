using Bluent.UI.Diagrams.Commands.Basic;
using Bluent.UI.Diagrams.Components;
using Bluent.UI.Diagrams.Elements.Diagram;

namespace Bluent.UI.Diagrams.Commands.Diagram;

internal class AddDiagramNodeCommand : AddElementCommand
{
    public AddDiagramNodeCommand(DrawingCanvas canvas, DiagramNode element) : base(canvas, element)
    {
    }

    public override void Do()
    {
        base.Do();
    }

    public override void Undo()
    {
        base.Undo();
    }
}
