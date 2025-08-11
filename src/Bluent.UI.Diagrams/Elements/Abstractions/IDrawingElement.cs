namespace Bluent.UI.Diagrams.Elements;

public interface IDrawingElement: IDrawingShape
{
    bool AllowHorizontalDrag { get; }
    bool AllowVerticalDrag { get; }
    string? Fill { get; set; }
    void PointerMovingOutside();
    void PointerMovingInside(DiagramPoint offsetPoint, bool direct);
    void ApplyDrag();
    void SetDrag(Distance2D drag);
    void CancelDrag();
}