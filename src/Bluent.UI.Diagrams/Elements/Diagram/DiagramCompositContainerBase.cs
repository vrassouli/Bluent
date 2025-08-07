using Bluent.UI.Diagrams.Components.Internals;
using Microsoft.AspNetCore.Components.Rendering;
using System.ComponentModel;

namespace Bluent.UI.Diagrams.Elements.Diagram;

public abstract class DiagramCompositContainerBase : DiagramNodeBase, IDiagramElementContainer, IDiagramBoundaryContainer
{
    private List<IDiagramElement> _elements = new();
    private List<IDiagramBoundaryNode> _boundaryElements = new();
    public IEnumerable<IDiagramBoundaryNode> BoundaryNodes => _boundaryElements;
    public IEnumerable<IDiagramElement> DiagramElements => _elements;

    public void AddDiagramElement(IDiagramElement element)
    {
        element.PropertyChanged += ChildElementPropertyChanged;

        if (element is IDiagramBoundaryNode boundaryElement)
        {
            var stickPoint = StickToBoundary(boundaryElement.Boundary.Center);
            boundaryElement.SetCenter(stickPoint);

            _boundaryElements.Add(boundaryElement);
            NotifyPropertyChanged(nameof(BoundaryNodes));
        }
        else
        {
            _elements.Add(element);
            NotifyPropertyChanged(nameof(DiagramElements));
        }
    }

    public void RemoveDiagramElement(IDiagramElement element)
    {
        element.PropertyChanged -= ChildElementPropertyChanged;

        if (element is IDiagramBoundaryNode boundaryElement)
        {
            _boundaryElements.Remove(boundaryElement);
            NotifyPropertyChanged(nameof(BoundaryNodes));
        }
        else
        {
            _elements.Remove(element);
            NotifyPropertyChanged(nameof(DiagramElements));
        }

        element.IsSelected = false;
        element.Clean();
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

        NotifyPropertyChanged(nameof(DiagramElements));
    }

    public bool CanContain<T>() where T : IDiagramElement
    {
        return CanContain(typeof(T));
    }

    public bool CanContain(Type type)
    {
        return true;
    }

    public override void ApplyDrag()
    {
        foreach (var el in DiagramElements.OfType<IDiagramNode>())
        {
            el.ApplyDrag();
        }
        foreach (var el in BoundaryNodes)
        {
            el.ApplyDrag();
        }

        base.ApplyDrag();
    }

    public override void CancelDrag()
    {
        foreach (var el in DiagramElements.OfType<IDiagramNode>())
        {
            el.CancelDrag();
        }
        foreach (var el in BoundaryNodes)
        {
            el.CancelDrag();
        }

        base.CancelDrag();
    }

    public override void SetDrag(Distance2D drag)
    {
        foreach (var el in DiagramElements.OfType<IDiagramNode>())
        {
            el.SetDrag(drag);
        }
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

        foreach (var childElement in DiagramElements.OrderBy(x => x.IsSelected).ThenBy(x => (x as IDiagramContainer)?.HasSelection ?? false))
        {
            builder.OpenRegion(sequence++);
            builder.OpenComponent<ElementHost>(sequence++);
            builder.AddAttribute(sequence++, nameof(ElementHost.Element), childElement);
            builder.CloseComponent();
            builder.CloseRegion();
        }

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
