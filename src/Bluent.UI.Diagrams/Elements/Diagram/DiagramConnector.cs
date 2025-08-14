namespace Bluent.UI.Diagrams.Elements.Diagram;

internal class DiagramConnector : DiagramConnectorBase
{
    public DiagramConnector(IHasOutgoingConnector source, DiagramPoint start) : base(source, start)
    {
        Stroke = "var(--colorNeutralStroke1)";
        StrokeWidth = 2;
    }

}