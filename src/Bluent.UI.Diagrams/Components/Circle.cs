using Bluent.UI.Diagrams.Elements.Basic;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Diagrams.Components;

public class Circle : ComponentBase, IDisposable
{
    private CircleElement _element = default!;
    [CascadingParameter] public DrawingCanvas Canvas { get; set; } = default!;
    [Parameter, EditorRequired] public double Cx { get; set; }
    [Parameter, EditorRequired] public double Cy { get; set; }
    [Parameter, EditorRequired] public double R { get; set; } 
    [Parameter] public double? StrokeWidth { get; set; }
    [Parameter] public string? Fill { get; set; }
    [Parameter] public string? Stroke { get; set; }

    public void Dispose()
    {
        Canvas.RemoveElement(_element);
    }

    protected override void OnInitialized()
    {
        if (Canvas is null)
            throw new InvalidOperationException($"{nameof(Circle)} should be nested inside a {nameof(DrawingCanvas)} component.");

        _element = new CircleElement(Cx, Cy, R)
        {
            Fill = Fill,
            Stroke = Stroke,
            StrokeWidth = StrokeWidth,
        };
        Canvas.AddElement(_element);

        base.OnInitialized();
    }
}
