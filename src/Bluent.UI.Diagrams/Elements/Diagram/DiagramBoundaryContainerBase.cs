using Bluent.UI.Diagrams.Components.Internals;
using Microsoft.AspNetCore.Components.Rendering;
using System.Collections.Specialized;
using System.ComponentModel;

namespace Bluent.UI.Diagrams.Elements.Diagram;

public abstract class DiagramBoundaryContainerBase : DiagramNodeBase, IDiagramBoundaryContainer
{
    private List<IDiagramBoundaryNode> _boundaryElements = new();

    //public event NotifyCollectionChangedEventHandler? CollectionChanged;

    public IEnumerable<IDiagramBoundaryNode> BoundaryNodes => _boundaryElements;

    public void AddDiagramElement(IDiagramElement element)
    {
        if (element is not IDiagramBoundaryNode boundaryElement)
            return;

        boundaryElement.PropertyChanged += ChildElementPropertyChanged;
        var stickPoint = StickToBoundary(boundaryElement.Boundary.Center);
        boundaryElement.SetCenter(stickPoint);

        _boundaryElements.Add(boundaryElement);

        NotifyPropertyChanged(nameof(BoundaryNodes));
        //CollectionChanged?.Invoke(this, new NotifyCollectionChangedEventArgs(NotifyCollectionChangedAction.Add, boundaryElement));
    }

    public void RemoveDiagramElement(IDiagramElement element)
    {
        if (element is not IDiagramBoundaryNode boundaryElement)
            return;

        boundaryElement.PropertyChanged -= ChildElementPropertyChanged;
        _boundaryElements.Remove(boundaryElement);

        NotifyPropertyChanged(nameof(BoundaryNodes));
        //CollectionChanged?.Invoke(this, new NotifyCollectionChangedEventArgs(NotifyCollectionChangedAction.Remove, boundaryElement));

        boundaryElement.IsSelected = false;
        element.Clean();
    }

    public bool CanContain<T>() where T : IDiagramElement
    {
        return CanContain(typeof(T));
    }

    public bool CanContain(Type type)
    {
        if (type.IsAssignableTo(typeof(IDiagramBoundaryNode)))
        {
            return true;
        }

        return false;
    }

    private void ChildElementPropertyChanged(object? sender, PropertyChangedEventArgs e)
    {
        if (sender is IDiagramBoundaryNode boundaryElement &&
            (e.PropertyName == nameof(X) ||
            e.PropertyName == nameof(Y) ||
            e.PropertyName == nameof(Width) ||
            e.PropertyName == nameof(Height)))
        {
            var stickPoint = StickToBoundary(boundaryElement.Boundary.Center);
            boundaryElement.SetCenter(stickPoint);
        }

        NotifyPropertyChanged(nameof(BoundaryNodes));
    }

    public override void ApplyDrag()
    {
        foreach (var el in BoundaryNodes)
        {
            el.ApplyDrag();
        }

        base.ApplyDrag();
    }

    public override void CancelDrag()
    {
        foreach (var el in BoundaryNodes)
        {
            el.CancelDrag();
        }

        base.CancelDrag();
    }

    public override void SetDrag(Distance2D drag)
    {
        foreach (var el in BoundaryNodes)
        {
            el.SetDrag(drag);
        }


        base.SetDrag(drag);
    }

    protected void RenderChildElements(int regionSeq, RenderTreeBuilder builder)
    {
        var sequence = 0;
        builder.OpenRegion(regionSeq);

        foreach (var childElement in BoundaryNodes.OrderBy(x => x.IsSelected).ThenBy(x => (x as IDiagramContainer)?.HasSelection ?? false))
        {
            builder.OpenRegion(sequence++);
            builder.OpenComponent<ElementHost>(sequence++);
            builder.AddAttribute(sequence++, nameof(ElementHost.Element), childElement);
            builder.CloseComponent();
            builder.CloseRegion();
        }

        builder.CloseRegion();
    }

}
