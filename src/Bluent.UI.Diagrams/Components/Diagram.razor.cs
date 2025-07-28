using Bluent.Core;
using Bluent.UI.Diagrams.Tools.Drawings.Diagram;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Diagrams.Components;

public partial class Diagram
{
    [Parameter] public int GridSize { get; set; } = 5;
    [Parameter] public RenderFragment? GridPattern { get; set; }
    [Parameter] public int SnapSize { get; set; } = 1;
    [Parameter] public IDiagramTool? Tool { get;set; }
    [Parameter] public SelectionMode Selection { get; set; } = SelectionMode.Multiple;
    [Parameter] public bool AllowDrag { get; set; }
    [Parameter] public bool AllowPan { get; set; }
    [Parameter] public bool AllowScale { get; set; }
}
