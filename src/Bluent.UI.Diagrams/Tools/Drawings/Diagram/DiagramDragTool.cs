using Bluent.Core;
using Bluent.UI.Diagrams.Commands.Diagram;
using Bluent.UI.Diagrams.Elements;

namespace Bluent.UI.Diagrams.Tools.Drawings.Diagram;

internal class DiagramDragTool : DragTool
{
    public Components.Diagram Diagram => (Canvas as Components.Diagram) ?? throw new ArgumentNullException("The tool should be added and registered on a Diagram component");
  
    protected override ICommand GetDragCommand(List<IDrawingElement> elements, Distance2D drag)
    {
        return new DragDiagramElementsCommand(Diagram, elements, drag);
    }
}
