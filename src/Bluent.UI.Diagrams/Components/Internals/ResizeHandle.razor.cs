using Bluent.UI.Diagrams.Elements;
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
    [Parameter, EditorRequired] public Boundary Boundary { get; set; }
    [Parameter, EditorRequired] public ResizeAnchor Anchor { get; set; }
    [Parameter] public EventCallback<PointerEventArgs> PointerDown { get; set; }


    private double X
    {
        get
        {
            if (Anchor == ResizeAnchor.Left)
                return Boundary.X;

            if (Anchor == ResizeAnchor.Right)
                return Boundary.Right;

            if (Anchor == ResizeAnchor.Top)
                return Boundary.Cx;

            if (Anchor == ResizeAnchor.Bottom)
                return Boundary.Cx;

            if (Anchor == (ResizeAnchor.Top | ResizeAnchor.Left))
                return Boundary.X;

            if (Anchor == (ResizeAnchor.Top | ResizeAnchor.Right))
                return Boundary.Right;

            if (Anchor == (ResizeAnchor.Bottom | ResizeAnchor.Left))
                return Boundary.X;

            if (Anchor == (ResizeAnchor.Bottom | ResizeAnchor.Right))
                return Boundary.Right;

            throw new ArgumentOutOfRangeException();
        }
    }

    private double Y
    {
        get
        {
            if (Anchor == ResizeAnchor.Left)
                return Boundary.Cy;

            if (Anchor == ResizeAnchor.Right)
                return Boundary.Cy;

            if (Anchor == ResizeAnchor.Top)
                return Boundary.Y;

            if (Anchor == ResizeAnchor.Bottom)
                return Boundary.Bottom;

            if (Anchor == (ResizeAnchor.Top | ResizeAnchor.Left))
                return Boundary.Y;

            if (Anchor == (ResizeAnchor.Top | ResizeAnchor.Right))
                return Boundary.Y;

            if (Anchor == (ResizeAnchor.Bottom | ResizeAnchor.Left))
                return Boundary.Bottom;

            if (Anchor == (ResizeAnchor.Bottom | ResizeAnchor.Right))
                return Boundary.Bottom;

            throw new ArgumentOutOfRangeException();
        }
    }

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
        //if (Canvas is null)
        //    throw new InvalidOperationException($"{nameof(ResizeHandle)} should be nested inside a {nameof(DrawingCanvas)} component.");

        //Canvas.PointerMove += HandlePointerMove;
        //Canvas.PointerUp += HandlePointerUp;
        //Canvas.PointerCancel += HandlePointerCancel;
        //Canvas.PointerLeave += HandlePointerLeave;

        base.OnInitialized();
    }

    public void Dispose()
    {
        //Canvas.PointerMove -= HandlePointerMove;
        //Canvas.PointerUp -= HandlePointerUp;
        //Canvas.PointerCancel -= HandlePointerCancel;
        //Canvas.PointerLeave -= HandlePointerLeave;
    }

    private async Task HandlePointerDown(PointerEventArgs e)
    {
        await PointerDown.InvokeAsync(e);
    }

    //private void HandlePointerMove(object? sender, PointerEventArgs e)
    //{
    //    if (_pointerId != e.PointerId)
    //        return;
    //}

    //private void HandlePointerUp(object? sender, PointerEventArgs e)
    //{
    //    Reset();
    //}

    //private void HandlePointerLeave(object? sender, PointerEventArgs e)
    //{
    //    Cancel();
    //}

    //private void HandlePointerCancel(object? sender, PointerEventArgs e)
    //{
    //    Cancel();
    //}

    //private void Cancel()
    //{
    //    Reset();
    //}

    //private void Reset()
    //{
    //    _pointerId = null;
    //}
}
