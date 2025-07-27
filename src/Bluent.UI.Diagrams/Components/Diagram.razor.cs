using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Diagrams.Components;

public partial class Diagram
{
    [Parameter] public int GridSize { get; set; } = 5;
    [Parameter] public RenderFragment? GridPattern { get; set; }
    [Parameter] public bool SnapToGrid { get; set; }
}
