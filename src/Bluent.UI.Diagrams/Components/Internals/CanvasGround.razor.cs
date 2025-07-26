using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Diagrams.Components.Internals;

public partial class CanvasGround
{
    [CascadingParameter] public DrawingCanvas Canvas { get; set; } = default!;

    private void HandlePointerDown()
    {
        Canvas?.ClearSelection();
    }
}
