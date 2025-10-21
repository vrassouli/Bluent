using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Elements.Diagram;
using Bluent.UI.Diagrams.Tools;
using Bluent.UI.Diagrams.Tools.Drawings.Diagram;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Diagrams.Components;

public partial class Diagram : DrawingCanvas, IDiagramElementContainer
{
    [Parameter] public RenderFragment? ConnectorMarkerEnd { get; set; }
    //public event NotifyCollectionChangedEventHandler? CollectionChanged;

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

    public virtual void AddDiagramElement(IDiagramElement element)
    {
        base.AddElement(element);
    }

    public virtual void RemoveDiagramElement(IDiagramElement element)
    {
        base.RemoveElement(element);
        element.Clean();
    }

    public virtual bool CanContain<T>() where T : IDiagramElement
    {
        return CanContain(typeof(T));
    }

    public virtual bool CanContain(Type type)
    {
        if (type.IsAssignableTo(typeof(IDiagramBoundaryNode)))
            return false;

        return true;
    }

    internal override IEnumerable<IDrawingShape> GetShapesAt(DiagramPoint point)
    {
        return (this as IDiagramElementContainer).GetDiagramElementsAt(point).OfType<IDrawingShape>();
    }

    public IEnumerable<IDiagramShape> GetElementsAt(DiagramPoint point)
    {
        var elements = GetShapesAt(point);

        foreach (var el in elements.OfType<IDiagramShape>())
            yield return el;

        yield return this;
    }

    public IDiagramElementContainer? GetElementContainer(IDiagramElement element)
    {
        return (this as IDiagramContainer).FindElementContainer(element);
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

    protected override RenderFragment? GetSvgDefinitions()
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
            builder.AddAttribute(6, "markerWidth", "10");
            builder.AddAttribute(7, "markerHeight", "10");
            builder.AddAttribute(8, "orient", "auto");
            if (ConnectorMarkerEnd != null)
            {
                builder.AddContent(9, ConnectorMarkerEnd);
            }
            else
            {
                builder.OpenElement(10, "path");

                builder.AddAttribute(11, "d", "M 1 5 L 11 10 L 1 15 Z");
                builder.AddAttribute(12, "stroke-linecap", "round");
                builder.AddAttribute(13, "stroke-linejoin", "round");
                builder.AddAttribute(14, "stroke", "var(--colorNeutralStroke1)");
                builder.AddAttribute(15, "stroke-width", "1");
                builder.AddAttribute(16, "fill", "var(--colorNeutralStroke1)");

                builder.CloseElement();
            }

            builder.CloseElement(); // </marker>
        };
    }

    protected override void Clear()
    {
        (this as IDiagramContainer).Clear();

        base.Clear();
    }
}
