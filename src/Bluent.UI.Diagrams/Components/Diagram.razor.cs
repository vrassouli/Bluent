using Bluent.Core;
using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Elements.Diagram;
using Bluent.UI.Diagrams.Tools.Drawings.Diagram;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Diagrams.Components;

public partial class Diagram : IDiagramElementContainer
{
    private DrawingCanvas? _canvas;
    private IDiagramTool? _tool;

    [Parameter] public int GridSize { get; set; } = 5;
    [Parameter] public RenderFragment? GridPattern { get; set; }
    [Parameter] public int SnapSize { get; set; } = 1;
    [Parameter] public IDiagramTool? Tool { get; set; }
    [Parameter] public SelectionMode Selection { get; set; } = SelectionMode.Multiple;
    [Parameter] public bool AllowDrag { get; set; }
    [Parameter] public bool AllowPan { get; set; }
    [Parameter] public bool AllowScale { get; set; }
    [Parameter] public CommandManager? CommandManager { get; set; }

    protected override void OnParametersSet()
    {
        if (_tool != Tool)
        {
            _tool = Tool;

            if (_tool != null)
                _tool.Register(this);
        }

        base.OnParametersSet();
    }

    public void AddElement(IDiagramElement element)
    {
        _canvas?.AddElement(element);
    }

    public void RemoveElement(IDiagramElement element)
    {
        _canvas?.RemoveElement(element);
    }

    internal IEnumerable<IDrawingElement> GetElementsAt(DiagramPoint point)
    {
        if (_canvas is not null)
        {
            foreach (var el in _canvas.Elements)
            {
                if (el.Boundary.Contains(point))
                    yield return el;
            }
        }
    }

    internal IEnumerable<IDiagramElementContainer> GetContainersAt(DiagramPoint point)
    {
        var elements = GetElementsAt(point);

        foreach (var el in elements)
            if (el is IDiagramElementContainer container)
                yield return container;

        yield return this;
    }
}
