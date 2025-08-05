namespace Bluent.UI.Diagrams.Elements.Abstractions;

public interface IHasUpdatablePoints
{
    IEnumerable<UpdatablePoint> UpdatablePoints { get; }

    void UpdatePoint(UpdatablePoint point, DiagramPoint update);
}
