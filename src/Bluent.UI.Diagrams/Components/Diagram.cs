using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Elements.Diagram;
using Bluent.UI.Diagrams.Tools;
using Bluent.UI.Diagrams.Tools.Drawings.Diagram;

namespace Bluent.UI.Diagrams.Components;

public partial class Diagram : DrawingCanvas, IDiagramElementContainer
{

    public override IEnumerable<IDrawingElement> SelectedElements
    {
        get
        {
            foreach (var el in DiagramElements)
            {
                if (el.IsSelected)
                    yield return el;

                if (el is IDiagramElementContainer container)
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
    }

    internal override IEnumerable<IDrawingElement> GetElementsAt(DiagramPoint point)
    {
        foreach (var item in (this as IDiagramElementContainer).GetDiagramElementsAt(point))
            yield return item;
    }

    internal IEnumerable<IDiagramElementContainer> GetContainersAt(DiagramPoint point)
    {
        var elements = GetElementsAt(point);

        foreach (var el in elements)
            if (el is IDiagramElementContainer container)
                yield return container;

        yield return this;
    }

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

    public bool CanContain(IDiagramElement element)
    {
        if (element is  IDiagramBoundaryElement)
            return false;

        return true;
    }
}
