using Bluent.UI.Diagrams.Components.Internals;

namespace Bluent.UI.Diagrams.Elements;

public interface IDrawingElement: IDrawingShape
{
    bool AllowHorizontalDrag { get; }
    bool AllowVerticalDrag { get; }
    bool AllowHorizontalResize { get; }
    bool AllowVerticalResize { get; }
    string? Fill { get; set; }
    IEnumerable<ResizeAnchor> ResizeAnchors { get; }
    void PointerMovingOutside();
    void PointerMovingInside(DiagramPoint offsetPoint, bool direct);
    void ApplyDrag();
    void ApplyResize();
    void CancelDrag();
    void CancelResize();
    void ResizeBottom(double dy);
    void ResizeLeft(double dx);
    void ResizeRight(double dx);
    void ResizeTop(double dy);
    void SetDrag(Distance2D drag);
}