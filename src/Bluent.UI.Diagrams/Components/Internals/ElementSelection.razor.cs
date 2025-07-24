using Bluent.UI.Diagrams.Elements;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Components.Internals;

public partial class ElementSelection : IDisposable
{
    [Parameter] public double StrokeWidth { get; set; } = 2;
    [Parameter] public string StrokeDashArray { get; set; } = "4 3";
    [Parameter] public string Stroke { get; set; } = "#36a2eb";
    [Parameter, EditorRequired] public IDrawingElement Element { get; set; } = default!;
    [Parameter, EditorRequired] public double Padding { get; set; } = 5;
    [CascadingParameter] public DrawingCanvas Canvas { get; set; } = default!;

    private Boundary Boundary => new Boundary(Element.Boundary.X - Padding,
                                              Element.Boundary.Y - Padding,
                                              Element.Boundary.Width + Padding * 2,
                                              Element.Boundary.Height + Padding * 2);

    private string? GetCursor()
    {
        /*if (_pointerId is not null)
            return "grabbing";
        else */
        if (Element.AllowVerticalDrag || Element.AllowHorizontalDrag)
            return "grab";

        return null;
    }

    protected override void OnInitialized()
    {
        if (Canvas is null)
            throw new InvalidOperationException($"{nameof(ElementSelection)} should not be used directly.");

        //Canvas.PointerMove += Canvas_PointerMove;
        //Canvas.PointerUp += Canvas_PointerUp;
        //Canvas.PointerOut += Canvas_PointerOut;
        //Canvas.PointerCancel += Canvas_PointerCancel;

        base.OnInitialized();
    }

    public void Dispose()
    {
        //Canvas.PointerMove -= Canvas_PointerMove;
        //Canvas.PointerUp -= Canvas_PointerUp;
        //Canvas.PointerOut -= Canvas_PointerOut;
        //Canvas.PointerCancel -= Canvas_PointerCancel;
    }

    private void HandlePointerDown(PointerEventArgs e)
    {
        if (/*_pointerId is null &&*/ e.CtrlKey)
            Canvas.OnElementClicked(Element, e.CtrlKey, e.AltKey, e.ShiftKey);
        //if (_pointerId is not null)
        //    return;

        //_pointerId = e.PointerId;
        //_startPoint = e.ToClientPoint();
    }

    //private void Canvas_PointerMove(object? sender, PointerEventArgs e)
    //{
    //    if (_pointerId is null || _startPoint is null)
    //        return;

    //    var currentPoint = e.ToClientPoint();
    //    var delta = currentPoint - _startPoint;
    //    var drag = new Distance2D(Element.AllowHorizontalDrag ? delta.Dx : 0, Element.AllowVerticalDrag ? delta.Dy : 0);

    //    Element.SetDrag(drag);
    //}

    //private void Canvas_PointerUp(object? sender, PointerEventArgs e)
    //{
    //    if (_pointerId is not null)
    //        Element.ApplyDrag();

    //    _pointerId = null;
    //}

    //private void Canvas_PointerCancel(object? sender, PointerEventArgs e)
    //{
    //    _pointerId = null;
    //    Element.CancelDrag();
    //}

    //private void Canvas_PointerOut(object? sender, PointerEventArgs e)
    //{
    //    _pointerId = null;
    //    Element.CancelDrag();
    //}
}
