namespace Bluent.UI.Diagrams.Elements.Diagram;

public interface IDiagramElement : IDiagramShape, IDrawingShape
{
    //string Id { get; set; }
    bool HitTest(DiagramPoint point);
    void Clean();
}
