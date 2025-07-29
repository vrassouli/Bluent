using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Elements.Diagram;
using Bluent.UI.Diagrams.Tools;
using Bluent.UI.Diagrams.Tools.Drawings.Diagram;

namespace Bluent.UI.Diagrams.Components;

public partial class Diagram : DrawingCanvas, IDiagramElementContainer
{
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

    protected override IEnumerable<IDrawingElement> GetElementsAt(DiagramPoint point)
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
}
