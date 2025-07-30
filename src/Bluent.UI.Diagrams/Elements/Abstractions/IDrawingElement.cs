using Bluent.UI.Diagrams.Components.Internals;
using Microsoft.AspNetCore.Components;
using System.ComponentModel;

namespace Bluent.UI.Diagrams.Elements;

public interface IDrawingElement : INotifyPropertyChanged
{
    bool AllowHorizontalDrag { get; }
    bool AllowVerticalDrag { get; }
    bool AllowHorizontalResize { get; }
    bool AllowVerticalResize { get; }
    Boundary Boundary { get; }
    bool IsSelected { get; set; }
    string? Fill { get; set; }
    IEnumerable<ResizeAnchor> ResizeAnchors { get; }
    string? Stroke { get; set; }
    double? StrokeWidth { get; set; }
    string? StrokeDashArray { get; set; }
    void PointerMovingOutside();
    void PointerMovingInside(DiagramPoint offsetPoint, bool direct);
    void ApplyDrag();
    void ApplyResize();
    void CancelDrag();
    void CancelResize();
    RenderFragment Render();
    void ResizeBottom(double dy);
    void ResizeLeft(double dx);
    void ResizeRight(double dx);
    void ResizeTop(double dy);
    void SetDrag(Distance2D drag);
}