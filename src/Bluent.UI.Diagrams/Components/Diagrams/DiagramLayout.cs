using Bluent.UI.Diagrams.Elements;

namespace Bluent.UI.Diagrams.Components.Diagrams;

public class DiagramLayout
{
    public List<ILayoutElement> Elements { get; set; } = default!;
}

public interface ILayoutElement
{
    string Id { get; set; }
}

public class NodeLayout : ILayoutElement
{
    public string Id { get; set; } = default!;
    public double X { get; set; } = default!;
    public double Y { get; set; } = default!;
    public double Width { get; set; } = default!;
    public double Height { get; set; } = default!;
}

public class ConnectorLayout : ILayoutElement
{
    public string Id { get; set; } = default!;
    public List<DiagramPoint> WayPoints { get; set; } = default!;
}
