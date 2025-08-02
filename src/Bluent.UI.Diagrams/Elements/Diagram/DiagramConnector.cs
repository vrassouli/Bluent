namespace Bluent.UI.Diagrams.Elements.Diagram;

internal class DiagramConnector : DiagramConnectorBase
{
    public DiagramConnector(DiagramPoint start) : base(start)
    {
        Stroke = "var(--colorNeutralStroke1)";
        StrokeWidth = 2;
    }


    protected override string GetPathData()
    {
        return $"M{Start.X} {Start.Y} L{End.X} {End.Y}";
    }
}