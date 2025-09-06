namespace Bluent.UI.Diagrams.Elements.Diagram;

public interface IDiagramConnector : IDiagramElement
{
    DiagramPoint Start { get; set; }
    DiagramPoint End { get; set; }

    IHasOutgoingConnector SourceElement { get; set; }
    IHasIncomingConnector? TargetElement { get; set; }

    IEnumerable<DiagramPoint> WayPoints { get; }

    void AddWayPoint(DiagramPoint point);
    void SetWayPoints(IEnumerable<DiagramPoint> points);
    void RemoveWayPoint(DiagramPoint point);
    void ClearWayPoints();

    void DragStart(Distance2D drag);
    void DragEnd(Distance2D drag);
    void CancelStartDrag();
    void CancelEndDrag();
    void ApplyStartDrag();
    void ApplyEndDrag();
}