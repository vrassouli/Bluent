using Bluent.UI.Diagrams.Components.Internals;
using Microsoft.AspNetCore.Components;
using System.ComponentModel;

namespace Bluent.UI.Diagrams.Elements;

public interface IDrawingElement : INotifyPropertyChanged
{
    bool AllowVerticalDrag { get; }
    bool AllowHorizontalResize { get; }
    bool AllowVerticalResize { get; }
    Boundary Boundary { get; }
    string? Fill { get; set; }
    string? Stroke { get; set; }
    double? StrokeWidth { get; set; }
    string? StrokeDashArray { get; set; }
    bool AllowHorizontalDrag { get; }
    IEnumerable<ResizeAnchor> ResizeAnchors { get; }
    RenderFragment Render();
    void SetDrag(Distance2D drag);
    void ApplyDrag();
    void CancelDrag();
    void ResizeLeft(double dx);
    void CancelResize();
    void ApplyResize();
    void ResizeRight(double dx);
    void ResizeTop(double dy);
    void ResizeBottom(double dy);
}