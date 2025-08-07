using Bluent.UI.Diagrams.Components.Diagrams;
using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Elements.Diagram;
using Bluent.UI.Diagrams.Tools;
using Bluent.UI.Diagrams.Tools.Drawings.Diagram;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Diagrams.Components;

public partial class Diagram : DrawingCanvas, IDiagramElementContainer
{
    [Parameter] public RenderFragment? ConnectorMarkerEnd { get; set; }

    public override IEnumerable<IDrawingShape> SelectedElements
    {
        get
        {
            foreach (var el in DiagramElements)
            {
                if (el.IsSelected)
                    yield return el;

                if (el is IDiagramContainer container)
                    foreach (var child in container.SelectedElements)
                        yield return child;
            }
        }
    }

    public IEnumerable<IDiagramElement> DiagramElements => Elements.OfType<IDiagramElement>();

    protected override void OnParametersSet()
    {
        if (Tool is not null && Tool is not IDiagramTool)
            throw new InvalidOperationException($"The provided tool must implement {nameof(IDiagramTool)} interface.");

        base.OnParametersSet();
    }

    public void AddDiagramElement(IDiagramElement element)
    {
        base.AddElement(element);
    }

    public void RemoveDiagramElement(IDiagramElement element)
    {
        base.RemoveElement(element);
        element.Clean();
    }

    public bool CanContain<T>() where T : IDiagramElement
    {
        return CanContain(typeof(T));
    }

    public bool CanContain(Type type)
    {
        if (type.IsAssignableTo(typeof(IDiagramBoundaryNode)))
            return false;

        return true;
    }

    internal override IEnumerable<IDrawingShape> GetElementsAt(DiagramPoint point)
    {
        return (this as IDiagramElementContainer).GetDiagramElementsAt(point).OfType<IDrawingShape>();
    }

    internal IEnumerable<IDiagramShape> GetDiagramElementsAt(DiagramPoint point)
    {
        var elements = GetElementsAt(point);

        foreach (var el in elements.OfType<IDiagramShape>())
            yield return el;

        yield return this;
    }
    //internal IEnumerable<IDiagramContainer> GetContainersAt(DiagramPoint point)
    //{
    //    var elements = GetElementsAt(point);

    //    foreach (var el in elements.OfType<IDiagramContainer>())
    //        yield return el;

    //    yield return this;
    //}

    protected override void ActivatePanTool()
    {
        var tool = new DiagramDragTool();
        tool.Register(this);

        ActivateTool(tool);
    }

    protected override void DeactivatePanTool() => DeactivateTool<DiagramDragTool>();

    protected override void ActivateDeleteTool()
    {
        var tool = new DiagramDeleteElementsTool();
        tool.Register(this);

        ActivateTool(tool);
    }

    protected override void DeactivateDeleteTool() => DeactivateTool<DiagramDeleteElementsTool>();

    protected override RenderFragment? GetDefinitions()
    {
        return builder =>
        {
            if (Defs != null)
                builder.AddContent(0, Defs);

            builder.OpenElement(1, "marker");
            builder.AddAttribute(2, "id", "connector-marker-end");
            builder.AddAttribute(3, "viewBox", "0 0 20 20");
            builder.AddAttribute(4, "refX", "11");
            builder.AddAttribute(5, "refY", "10");
            builder.AddAttribute(6, "refY", "10");
            builder.AddAttribute(7, "markerWidth", "10");
            builder.AddAttribute(8, "markerHeight", "10");
            builder.AddAttribute(9, "orient", "auto");
            if (ConnectorMarkerEnd != null)
            {
                builder.AddContent(10, ConnectorMarkerEnd);
            }
            else
            {
                builder.OpenElement(11, "path");

                builder.AddAttribute(12, "d", "M 1 5 L 11 10 L 1 15 Z");
                builder.AddAttribute(13, "stroke-linecap", "round");
                builder.AddAttribute(14, "stroke-linejoin", "round");
                builder.AddAttribute(15, "stroke", "var(--colorNeutralStroke1)");
                builder.AddAttribute(16, "stroke-width", "1");
                builder.AddAttribute(17, "fill", "var(--colorNeutralStroke1)");

                builder.CloseElement();
            }

            builder.CloseElement(); // </marker>
        };
    }

    public DiagramLayout GetLayout()
    {
        var layout = new DiagramLayout();
        var layoutElements = GetLayoutElements(DiagramElements);

        foreach (var element in DiagramElements)
        {
            if (element is IDiagramNode)
            {
                layout.Elements.Add(new NodeLayout()
                {

                });
            }
            else if (element is ConnectorLayout connectorLayout)
            {
                layout.Elements.Add(connectorLayout);
            }
        }
        return layout;
    }

    private IEnumerable<ILayoutElement> GetLayoutElements(IEnumerable<IDiagramElement> elements)
    {
        foreach (var element in elements)
        {
            if (element is IDiagramNode node)
            {
                yield return new NodeLayout()
                {
                    Id = node.Id,
                    X = node.X,
                    Y = node.Y,
                    Width = node.Width,
                    Height = node.Height,
                };

                if (node is IDiagramElementContainer elementContainer)
                {
                    var children = GetLayoutElements(elementContainer.DiagramElements);
                    foreach (var child in children)
                        yield return child;
                }

                if (node is IDiagramBoundaryContainer boundaryContainer)
                {
                    var boundaryNodes = GetLayoutElements(boundaryContainer.BoundaryNodes);
                    foreach (var boundaryNode in boundaryNodes)
                        yield return boundaryNode;
                }
            }
            else if (element is IDiagramConnector connector)
            {
                yield return new ConnectorLayout()
                {
                    Id = connector.Id,
                    WayPoints = [connector.Start, .. connector.WayPoints, connector.End]
                };
            }
        }
    }
}
