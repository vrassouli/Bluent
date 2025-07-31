using Bluent.UI.Diagrams.Commands.Basic;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Tools;

internal class DeleteElementsTool : KeyboardToolBase
{
    protected override void OnKeyUp(KeyboardEventArgs e)
    {
        if (e.Key == "Delete")
        {
            var cmd = new DeleteElementsCommand(Canvas, Canvas.SelectedElements.ToList());

            Canvas.ExecuteCommand(cmd);
        }
    }
}
