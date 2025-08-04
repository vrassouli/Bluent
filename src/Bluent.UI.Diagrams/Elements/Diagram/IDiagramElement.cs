namespace Bluent.UI.Diagrams.Elements.Diagram;

public interface IDiagramElement : IDiagramShape, IDrawingShape
{
    bool HitTest(DiagramPoint point);
    void Clean();
}
