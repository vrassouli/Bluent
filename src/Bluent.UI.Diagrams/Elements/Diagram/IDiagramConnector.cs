namespace Bluent.UI.Diagrams.Elements.Diagram;

public interface IDiagramConnector : IDiagramElement
{
    DiagramPoint Start { get; set; }
    DiagramPoint End { get; set; }

    IEnumerable<DiagramPoint> WayPoints { get; }

    void DragStart(Distance2D drag);
    void DragEnd(Distance2D drag);
    void CancelStartDrag();
    void CancelEndDrag();
    void ApplyStartDrag();
    void ApplyEndDrag();
}