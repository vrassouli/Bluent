namespace Bluent.UI.Diagrams.Elements.Diagram;

public interface IDiagramElementContainer
{
    public IEnumerable<IDiagramNode> DiagramElements { get; }
    void AddDiagramElement(IDiagramNode element);
    void RemoveDiagramElement(IDiagramNode element);
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
                if (el is IDiagramNode diagramEl)
                    yield return diagramEl;
        }

        if (this is IDiagramBoundaryElementContainer boundaryElementContainer)
        {
            foreach (var el in boundaryElementContainer.BoundaryElements.OrderBy(x => !x.IsSelected))
            {
                if (el is IDiagramElementContainer container)
                {
                    foreach (var child in container.GetDiagramElementsAt(point))
                        yield return child;
                }

                if (el.Boundary.Contains(point))
                    if (el is IDiagramNode diagramEl)
                        yield return diagramEl;
            }
        }
    }
    public IEnumerable<IDiagramElement> SelectedElements
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
            if (this is IDiagramBoundaryElementContainer boundaryElementContainer)
            {
                foreach (var el in boundaryElementContainer.BoundaryElements.OrderBy(x => !x.IsSelected))
                {
                    if (el.IsSelected)
                        yield return el;

                    if (el is IDiagramElementContainer container)
                        foreach (var child in container.SelectedElements)
                            yield return child;
                }
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
            if (this is IDiagramBoundaryElementContainer boundaryElementContainer)
            {
                foreach (var el in boundaryElementContainer.BoundaryElements.OrderBy(x => !x.IsSelected))
                {
                    if (el.IsSelected)
                        return true;

                    if (el is IDiagramElementContainer container)
                        if (container.HasSelection)
                            return true;
                }
            }

            return false;
        }
    }
    public bool CanContain<T>() where T : IDiagramElement;
    public bool CanContain(Type type);
}

public interface IDiagramBoundaryElementContainer
{
    public IEnumerable<IDiagramBoundaryNode> BoundaryElements { get; }

}