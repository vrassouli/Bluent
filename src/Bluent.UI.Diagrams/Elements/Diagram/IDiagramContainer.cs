namespace Bluent.UI.Diagrams.Elements.Diagram;

public interface IDiagramElementContainer : IDiagramContainer
{
    IEnumerable<IDiagramElement> DiagramElements { get; }
}

public interface IDiagramBoundaryContainer : IDiagramContainer
{
    IEnumerable<IDiagramBoundaryNode> BoundaryElements { get; }
}

public interface IDiagramContainer : IDiagramShape
{
    void AddDiagramElement(IDiagramElement element);
    void RemoveDiagramElement(IDiagramElement element);
    IEnumerable<IDiagramShape> GetDiagramElementsAt(DiagramPoint point)
    {
        // Check selected elements first
        if (this is IDiagramElementContainer elementContainer)
        {
            foreach (var el in elementContainer.DiagramElements.OrderBy(x => !x.IsSelected))
            {
                if (el is IDiagramContainer container)
                    foreach (var child in container.GetDiagramElementsAt(point))
                        yield return child;

                if (el.Boundary.Contains(point))
                    if (el is IDiagramNode diagramEl)
                        yield return diagramEl;
            }
        }
        if (this is IDiagramBoundaryContainer boundaryElementContainer)
        {
            foreach (var el in boundaryElementContainer.BoundaryElements.OrderBy(x => !x.IsSelected))
            {
                if (el is IDiagramContainer container)
                    foreach (var child in container.GetDiagramElementsAt(point))
                        yield return child;

                if (el.Boundary.Contains(point))
                    if (el is IDiagramNode diagramEl)
                        yield return diagramEl;
            }
        }
    }
    IEnumerable<IDiagramElement> SelectedElements
    {
        get
        {
            if (this is IDiagramElementContainer elementContainer)
            {
                foreach (var el in elementContainer.DiagramElements)
                {
                    if (el.IsSelected)
                        yield return el;

                    if (el is IDiagramContainer container)
                        foreach (var child in container.SelectedElements)
                            yield return child;
                }
            }
            if (this is IDiagramBoundaryContainer boundaryElementContainer)
            {
                foreach (var el in boundaryElementContainer.BoundaryElements.OrderBy(x => !x.IsSelected))
                {
                    if (el.IsSelected)
                        yield return el;

                    if (el is IDiagramContainer container)
                        foreach (var child in container.SelectedElements)
                            yield return child;
                }
            }
        }
    }
    bool HasSelection
    {
        get
        {
            if (this is IDiagramElementContainer elementContainer)
            {
                foreach (var el in elementContainer.DiagramElements)
                {
                    if (el.IsSelected)
                        return true;

                    if (el is IDiagramContainer container)
                        if (container.HasSelection)
                            return true;
                }
            }
            if (this is IDiagramBoundaryContainer boundaryElementContainer)
            {
                foreach (var el in boundaryElementContainer.BoundaryElements.OrderBy(x => !x.IsSelected))
                {
                    if (el.IsSelected)
                        return true;

                    if (el is IDiagramContainer container)
                        if (container.HasSelection)
                            return true;
                }
            }

            return false;
        }
    }
    bool CanContain<T>() where T : IDiagramElement;
    bool CanContain(Type type);
}