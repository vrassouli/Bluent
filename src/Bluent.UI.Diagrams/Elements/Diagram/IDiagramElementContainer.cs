namespace Bluent.UI.Diagrams.Elements.Diagram;

public interface IDiagramElementContainer
{
    public IEnumerable<IDiagramElement> DiagramElements { get; }
    void AddDiagramElement(IDiagramElement element);
    void RemoveDiagramElement(IDiagramElement element);
    public IEnumerable<IDiagramElement> GetDiagramElementsAt(DiagramPoint point)
    {
        // Check selected elements first
        foreach (var el in DiagramElements.OrderBy(x => !x.IsSelected))
        {
            if (el is IDiagramElementContainer container)
            {
                foreach (var child in container.GetDiagramElementsAt(point))
                    yield return child;
            }

            if (el.Boundary.Contains(point))
                if (el is IDiagramElement diagramEl)
                    yield return diagramEl;
        }
    }
    public IEnumerable<IDrawingElement> SelectedElements
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
    public bool HasSelection
    {
        get
        {
            foreach (var el in DiagramElements)
            {
                if (el.IsSelected)
                    return true;

                if (el is IDiagramElementContainer container)
                    if (container.HasSelection)
                        return true;
            }

            return false;
        }
    }
    public bool CanContain(IDiagramElement element);
}

public interface IDiagramBoundaryElementContainer : IDiagramElementContainer
{
    public IEnumerable<IDiagramBoundaryElement> BoundaryElements { get; }

}