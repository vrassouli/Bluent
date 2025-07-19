using Bluent.UI.Diagrams.Elements;
using Microsoft.AspNetCore.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Diagrams.Components;

public class Rect : ComponentBase, IDisposable
{
    private RectElement _element = default!;
    [CascadingParameter] public SvgCanvas Canvas { get; set; } = default!;
    [Parameter] public string? X { get; set; }
    [Parameter] public string? Y { get; set; }
    [Parameter, EditorRequired] public string Width { get; set; } = "0";
    [Parameter, EditorRequired] public string Height { get; set; } = "0";
    [Parameter] public string? Rx { get; set; }
    [Parameter] public string? Ry { get; set; }
    [Parameter] public string? PathLength { get; set; }
    [Parameter] public string? Fill { get; set; }

    public void Dispose()
    {
        Canvas.RemoveElement(_element);
    }

    protected override void OnInitialized()
    {
        if (Canvas is null)
            throw new InvalidOperationException($"{nameof(Rect)} should be nested inside a {nameof(SvgCanvas)} component.");

        _element = new RectElement(X, Y, Width, Height, Rx, Ry, PathLength)
        {
            Fill = Fill
        };
        Canvas.AddElement(_element);

        base.OnInitialized();
    }
}
