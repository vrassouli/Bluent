using Bluent.UI.Diagrams.Components.Internals;
using Microsoft.AspNetCore.Components.Rendering;
using System.Collections.Specialized;
using System.ComponentModel;

namespace Bluent.UI.Diagrams.Elements.Diagram;

public abstract class DiagramContainerBase : DiagramNodeBase, IDiagramElementContainer
{
    private List<IDiagramElement> _elements = new();

    //public event NotifyCollectionChangedEventHandler? CollectionChanged;

    public IEnumerable<IDiagramElement> DiagramElements => _elements;

    public virtual void AddDiagramElement(IDiagramElement element)
    {
        element.PropertyChanged += ChildElementPropertyChanged;

        _elements.Add(element);

        NotifyPropertyChanged(nameof(DiagramElements));
        //CollectionChanged?.Invoke(this, new NotifyCollectionChangedEventArgs(NotifyCollectionChangedAction.Add, element));
    }

    public virtual void RemoveDiagramElement(IDiagramElement element)
    {
        element.PropertyChanged -= ChildElementPropertyChanged;

        _elements.Remove(element);

        NotifyPropertyChanged(nameof(DiagramElements));
        //CollectionChanged?.Invoke(this, new NotifyCollectionChangedEventArgs(NotifyCollectionChangedAction.Remove, element));

        element.IsSelected = false;
        element.Clean();
    }

    private void ChildElementPropertyChanged(object? sender, PropertyChangedEventArgs e)
    {
        NotifyPropertyChanged(nameof(DiagramElements));
    }

    public bool CanContain<T>() where T : IDiagramElement
    {
        return CanContain(typeof(T));
    }

    public bool CanContain(Type type)
    {
        if (type.IsAssignableTo(typeof(IDiagramBoundaryNode)))
        {
            return false;
        }

        return true;
    }

    public override void ApplyDrag()
    {
        foreach (var el in DiagramElements.OfType<IDiagramNode>())
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

        base.CancelDrag();
    }

    public override void SetDrag(Distance2D drag)
    {
        foreach (var el in DiagramElements.OfType<IDiagramNode>())
        {
            el.SetDrag(drag);
        }


        base.SetDrag(drag);
    }

    protected virtual void RenderChildElements(int regionSeq, RenderTreeBuilder builder)
    {
        var sequence = 0;
        builder.OpenRegion(regionSeq);

        foreach (var childElement in (this as IDiagramElementContainer).GetRenderOrder())
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
