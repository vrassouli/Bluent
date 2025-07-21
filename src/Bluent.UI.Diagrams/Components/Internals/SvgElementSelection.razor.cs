using Bluent.UI.Diagrams.Elements;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Diagrams.Components.Internals;

public partial class SvgElementSelection
{
    [Parameter, EditorRequired] public ISvgElement Element { get; set; } = default!;
    [Parameter, EditorRequired] public double Padding { get; set; } = 5;

    private Boundary Boundary => new Boundary(Element.Boundary.X - Padding,
                                              Element.Boundary.Y - Padding,
                                              Element.Boundary.Width + Padding * 2,
                                              Element.Boundary.Height + Padding * 2);

}
