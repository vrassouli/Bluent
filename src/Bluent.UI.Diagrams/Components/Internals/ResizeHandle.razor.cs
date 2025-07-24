using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Components.Internals;

public partial class ResizeHandle : IDisposable
{
    private long? _pointerId;

    [Parameter] public string Stroke { get; set; } = "#36a2eb";
    [Parameter] public double StrokeWidth { get; set; } = 1;
    [Parameter] public string Fill { get; set; } = "#61bffb";
    [Parameter] public double Size { get; set; } = 4;
    [Parameter, EditorRequired] public double X { get; set; }
    [Parameter, EditorRequired] public double Y { get; set; }
    [Parameter, EditorRequired] public ResizeAnchor Anchor { get; set; }
    [CascadingParameter] public DrawingCanvas Canvas { get; set; } = default!;

    private string Cursor => Anchor switch
    {
        ResizeAnchor.Left or ResizeAnchor.Right => "ew-resize",
        ResizeAnchor.Top or ResizeAnchor.Bottom => "ns-resize",
        ResizeAnchor.Top | ResizeAnchor.Left or ResizeAnchor.Bottom | ResizeAnchor.Right => "nwse-resize",
        ResizeAnchor.Top | ResizeAnchor.Right or ResizeAnchor.Bottom | ResizeAnchor.Left => "nesw-resize",
        _ => throw new ArgumentOutOfRangeException(nameof(Anchor))
    };

    protected override void OnInitialized()
    {
        if (Canvas is null)
            throw new InvalidOperationException($"{nameof(ResizeHandle)} should be nested inside a {nameof(DrawingCanvas)} component.");

        Canvas.PointerMove += HandlePointerMove;
        Canvas.PointerUp += HandlePointerUp;
        Canvas.PointerCancel += HandlePointerCancel;
        Canvas.PointerLeave += HandlePointerLeave;

        base.OnInitialized();
    }

    public void Dispose()
    {
        Canvas.PointerMove -= HandlePointerMove;
        Canvas.PointerUp -= HandlePointerUp;
        Canvas.PointerCancel -= HandlePointerCancel;
        Canvas.PointerLeave -= HandlePointerLeave;
    }

    private void HandlePointerDown(PointerEventArgs e)
    {
        _pointerId = e.PointerId;
    }

    private void HandlePointerMove(object? sender, PointerEventArgs e)
    {
        if (_pointerId != e.PointerId)
            return;
    }

    private void HandlePointerUp(object? sender, PointerEventArgs e)
    {
        Reset();
    }

    private void HandlePointerLeave(object? sender, PointerEventArgs e)
    {
        Cancel();
    }

    private void HandlePointerCancel(object? sender, PointerEventArgs e)
    {
        Cancel();
    }

    private void Cancel()
    {
        Reset();
    }

    private void Reset()
    {
        _pointerId = null;
    }
}
