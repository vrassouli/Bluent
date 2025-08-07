using Bluent.UI.Diagrams.Commands.Diagram;
using Bluent.UI.Diagrams.Elements.Diagram;
using Bluent.UI.Diagrams.Tools.Drawings.Diagram;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Tools;

internal class DiagramDeleteElementsTool : DiagramKeyboardToolBase
{
    protected override void OnKeyUp(KeyboardEventArgs e)
    {
        if (e.Key == "Delete")
        {
            var cmd = new DeleteDiagramElementsCommand(Diagram, Diagram.SelectedElements.OfType<IDiagramElement>().ToList());

            Canvas.ExecuteCommand(cmd);
        }
    }
}
