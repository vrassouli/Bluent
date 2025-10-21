namespace Bluent.UI.Diagrams.Elements.Diagram;

public interface IDiagramElementContainer : IDiagramContainer
{
    IEnumerable<IDiagramElement> DiagramElements { get; }
    
    IOrderedEnumerable<IDiagramElement> GetRenderOrder()
    {
        return DiagramElements.OrderBy(x => x.IsSelected)
            .ThenBy(x => (x as IDiagramContainer)?.HasSelection ?? false);
    }
}

public interface IDiagramBoundaryContainer : IDiagramContainer
{
    IEnumerable<IDiagramBoundaryNode> BoundaryNodes { get; }
    
    IOrderedEnumerable<IDiagramElement> GetRenderOrder()
    {
        return BoundaryNodes.OrderBy(x => x.IsSelected);
    }
}

public interface IDiagramContainer : IDiagramShape /*, INotifyCollectionChanged*/
{
    void AddDiagramElement(IDiagramElement element);
    void RemoveDiagramElement(IDiagramElement element);

    IEnumerable<IDiagramShape> GetDiagramElementsAt(DiagramPoint point)
    {
        if (this is IDiagramElementContainer elementContainer)
        {
            // Check selected elements first
            foreach (var el in elementContainer.GetRenderOrder().Reverse())
            {
                if (el is IDiagramContainer container)
                    foreach (var child in container.GetDiagramElementsAt(point))
                        yield return child;

                if (el.HitTest(point) && el is { } diagramEl)
                {
                    yield return diagramEl;
                }
            }
        }

        if (this is IDiagramBoundaryContainer boundaryElementContainer)
        {
            // Check selected elements first
            foreach (var el in boundaryElementContainer.GetRenderOrder().Reverse())
            {
                if (el is IDiagramContainer container)
                    foreach (var child in container.GetDiagramElementsAt(point))
                        yield return child;

                if (el.HitTest(point) && el is { } diagramEl)
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
                foreach (var el in boundaryElementContainer.BoundaryNodes.OrderBy(x => !x.IsSelected))
                {
                    if (el.IsSelected)
                        yield return el;

                    // if (el is IDiagramContainer container)
                    //     foreach (var child in container.SelectedElements)
                    //         yield return child;
                }
            }
        }
    }
    
    bool Contains(IDiagramElement element)
    {
        if (this is IDiagramElementContainer elementContainer)
        {
            foreach (var el in elementContainer.DiagramElements)
            {
                if (el.Equals(element))
                    return true;

                if (el is IDiagramContainer container && container.Contains(element))
                    return true;
            }
        }

        if (this is IDiagramBoundaryContainer boundaryElementContainer)
        {
            foreach (var el in boundaryElementContainer.BoundaryNodes.OrderBy(x => !x.IsSelected))
            {
                if (el.IsSelected)
                    return true;

                // if (el is IDiagramContainer container && container.Contains(element))
                //     return true;
            }
        }

        return false;
    }

    IDiagramContainer? FindContainer(IDiagramElement element)
    {
        if (this is IDiagramElementContainer elementContainer)
        {
            foreach (var el in elementContainer.DiagramElements)
            {
                if (el.Equals(element))
                    return elementContainer;

                if (el is IDiagramContainer container)
                {
                    var result = container.FindContainer(element);
                    if (result is not null)
                        return result;
                }
            }
        }
        
        if (this is IDiagramBoundaryContainer boundaryElementContainer)
        {
            foreach (var el in boundaryElementContainer.BoundaryNodes)
            {
                if (el.Equals(element))
                    return boundaryElementContainer;
            }
        }

        return null;
    }

    IDiagramElementContainer? FindElementContainer(IDiagramElement element)
    {
        if (this is IDiagramElementContainer elementContainer)
        {
            foreach (var el in elementContainer.DiagramElements)
            {
                if (el.Equals(element))
                    return elementContainer;

                if (el is IDiagramContainer container)
                {
                    var result = container.FindElementContainer(element);
                    if (result is not null)
                        return result;
                }
            }
        }
        
        if (this is IDiagramBoundaryContainer boundaryElementContainer)
        {
            foreach (var el in boundaryElementContainer.BoundaryNodes)
            {
                if (el.Equals(element) && boundaryElementContainer is IDiagramElement boundaryElement)
                    return FindElementContainer(boundaryElement);
            }
        }

        return null;
    }
    
    void Clear()
    {
        if (this is IDiagramElementContainer elementContainer)
        {
            var elements = elementContainer.DiagramElements.ToList();
            foreach (var el in elements)
            {
                if (el is IDiagramContainer container)
                    container.Clear();

                RemoveDiagramElement(el);
            }
        }

        if (this is IDiagramBoundaryContainer boundaryElementContainer)
        {
            var elements = boundaryElementContainer.BoundaryNodes.ToList();
            foreach (var el in elements)
            {
                // if (el is IDiagramContainer container)
                //     container.Clear();

                RemoveDiagramElement(el);
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

                    if (el is IDiagramContainer { HasSelection: true }) 
                        return true;
                }
            }

            if (this is IDiagramBoundaryContainer boundaryElementContainer)
            {
                foreach (var el in boundaryElementContainer.BoundaryNodes.OrderBy(x => !x.IsSelected))
                {
                    if (el.IsSelected)
                        return true;

                    // if (el is IDiagramContainer container)
                    //     if (container.HasSelection)
                    //         return true;
                }
            }

            return false;
        }
    }

    bool CanContain<T>() where T : IDiagramElement;
    bool CanContain(Type type);
}