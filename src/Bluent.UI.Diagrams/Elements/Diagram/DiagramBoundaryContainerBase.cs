using Bluent.UI.Diagrams.Components.Internals;
using Microsoft.AspNetCore.Components.Rendering;
using System.ComponentModel;

namespace Bluent.UI.Diagrams.Elements.Diagram;

public abstract class DiagramBoundaryContainerBase : DiagramNodeBase, IDiagramBoundaryContainer
{
    private List<IDiagramBoundaryNode> _boundaryElements = new();
    public IEnumerable<IDiagramBoundaryNode> BoundaryElements => _boundaryElements;

    public void AddDiagramElement(IDiagramNode element)
    {
        if (element is not IDiagramBoundaryNode boundaryElement)
            return;

        boundaryElement.PropertyChanged += ChildElementPropertyChanged;
        StickToBoundary(boundaryElement);
        _boundaryElements.Add(boundaryElement);
        NotifyPropertyChanged(nameof(BoundaryElements));
    }

    public void RemoveDiagramElement(IDiagramNode element)
    {
        if (element is not IDiagramBoundaryNode boundaryElement)
            return;

        boundaryElement.PropertyChanged -= ChildElementPropertyChanged;
        _boundaryElements.Remove(boundaryElement);
        NotifyPropertyChanged(nameof(BoundaryElements));

        boundaryElement.IsSelected = false;
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
            StickToBoundary(boundaryElement);
        }

        NotifyPropertyChanged(nameof(BoundaryElements));
    }

    public override void ApplyDrag()
    {
        foreach (var el in BoundaryElements)
        {
            el.ApplyDrag();
        }

        base.ApplyDrag();
    }

    public override void CancelDrag()
    {
        foreach (var el in BoundaryElements)
        {
            el.CancelDrag();
        }

        base.CancelDrag();
    }

    public override void SetDrag(Distance2D drag)
    {
        foreach (var el in BoundaryElements)
        {
            el.SetDrag(drag);
        }


        base.SetDrag(drag);
    }

    protected void RenderChildElements(int regionSeq, RenderTreeBuilder builder)
    {
        var sequence = 0;
        builder.OpenRegion(regionSeq);

        foreach (var childElement in BoundaryElements.OrderBy(x => x.IsSelected).ThenBy(x => (x as IDiagramContainer)?.HasSelection ?? false))
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
