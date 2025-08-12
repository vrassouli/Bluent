using Bluent.UI.Diagrams.Elements;
using System.Xml.Serialization;

namespace Bluent.UI.Diagrams.Components.Diagrams;

public class DiagramLayout
{
    [XmlArray("Elements")]
    [XmlArrayItem("Element")]
    public List<LayoutElement> Elements { get; set; } = new();
}

[XmlInclude(typeof(NodeLayout))]
[XmlInclude(typeof(ConnectorLayout))]
public abstract class LayoutElement
{
    [XmlElement]
    public string Id { get; set; } = default!;
}

public class NodeLayout : LayoutElement
{
    [XmlElement]
    public double X { get; set; } = default!;
    [XmlElement]
    public double Y { get; set; } = default!;
    [XmlElement]
    public double Width { get; set; } = default!;
    [XmlElement]
    public double Height { get; set; } = default!;
}

public class ConnectorLayout : LayoutElement
{
    [XmlElement]
    public List<DiagramPoint> WayPoints { get; set; } = default!;
}
