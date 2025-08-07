namespace Bluent.UI.Diagrams.Elements.Diagram;

internal class DiagramConnector : DiagramConnectorBase
{
    public DiagramConnector(IHasOutgoingConnector source, DiagramPoint start) : base(source, start)
    {
        Stroke = "var(--colorNeutralStroke1)";
        StrokeWidth = 2;
    }

    protected override string GetPathData()
    {
        string data = $"M{Start.X} {Start.Y}";

        foreach (var point in WayPoints)
        {
            data += $" L{point.X} {point.Y}";
        }

        data += $" L{End.X} {End.Y}";

        return data;
    }
}