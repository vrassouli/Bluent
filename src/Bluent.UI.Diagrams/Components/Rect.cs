using Bluent.UI.Diagrams.Elements;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Diagrams.Components;

public class Rect : ComponentBase, IDisposable
{
    private RectElement _element = default!;
    [CascadingParameter] public DrawingCanvas Canvas { get; set; } = default!;
    [Parameter] public double? X { get; set; }
    [Parameter] public double? Y { get; set; }
    [Parameter, EditorRequired] public double Width { get; set; } 
    [Parameter, EditorRequired] public double Height { get; set; } 
    [Parameter] public double? Rx { get; set; }
    [Parameter] public double? Ry { get; set; }
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
            throw new InvalidOperationException($"{nameof(Rect)} should be nested inside a {nameof(DrawingCanvas)} component.");

        _element = new RectElement(X, Y, Width, Height, Rx, Ry)
        {
            Fill = Fill,
            Stroke = Stroke,
            StrokeWidth = StrokeWidth,
        };
        Canvas.AddElement(_element);

        base.OnInitialized();
    }
}
