using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Elements.Diagram;
using Bluent.UI.Diagrams.Tools;
using Bluent.UI.Diagrams.Tools.Drawings.Diagram;

namespace Bluent.UI.Diagrams.Components;

public partial class Diagram : DrawingCanvas, IDiagramElementContainer
{

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

    public IEnumerable<IDiagramNode> DiagramElements => Elements.OfType<IDiagramNode>();

    protected override void OnParametersSet()
    {
        if (Tool is not null && Tool is not IDiagramTool)
            throw new InvalidOperationException($"The provided tool must implement {nameof(IDiagramTool)} interface.");

        base.OnParametersSet();
    }

    public void AddDiagramElement(IDiagramNode element)
    {
        base.AddElement(element);
    }

    public void RemoveDiagramElement(IDiagramNode element)
    {
        base.RemoveElement(element);
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
}
