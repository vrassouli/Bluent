using Bluent.UI.Diagrams.Elements.Basic;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Diagrams.Components;

public class Line : ComponentBase, IDisposable
{
    private LineElement _element = default!;
    [CascadingParameter] public DrawingCanvas Canvas { get; set; } = default!;
    [Parameter, EditorRequired] public double X1 { get; set; }
    [Parameter, EditorRequired] public double X2 { get; set; }
    [Parameter, EditorRequired] public double Y1 { get; set; } 
    [Parameter, EditorRequired] public double Y2 { get; set; } 
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
            throw new InvalidOperationException($"{nameof(Line)} should be nested inside a {nameof(DrawingCanvas)} component.");

        _element = new LineElement(X1, Y1, X2, Y2)
        {
            Fill = Fill,
            Stroke = Stroke,
            StrokeWidth = StrokeWidth,
        };
        Canvas.AddElement(_element);

        base.OnInitialized();
    }
}
