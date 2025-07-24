using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Extensions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Components;

public partial class CursorLocation : IDisposable
{
    private DiagramPoint? _point;

    [CascadingParameter] public SvgCanvas Canvas { get; set; } = default!;

    protected override void OnInitialized()
    {
        if (Canvas is null)
            throw new InvalidOperationException($"{nameof(CursorLocation)} should be nested inside a {nameof(SvgCanvas)} component.");

        Canvas.PointerMove += OnPointerMove;
        Canvas.PointerOut += OnPointerOut;

        base.OnInitialized();
    }

    public void Dispose()
    {
        Canvas.PointerMove -= OnPointerMove;
        Canvas.PointerMove -= OnPointerMove;
    }

    private void OnPointerMove(object? sender, PointerEventArgs e)
    {
        _point = Canvas.ScreenToDiagram(e.ToOffsetPoint());
        StateHasChanged();
    }

    private void OnPointerOut(object? sender, PointerEventArgs e)
    {
        _point = null;
        StateHasChanged();
    }
}
