using Bluent.UI.Diagrams.Elements;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Components.Internals;

public partial class SvgElementHost : ComponentBase
{
    private ISvgElement? _element;
    private long? _selectionPointerId;

    [Parameter, EditorRequired] public ISvgElement Element { get; set; } = default!;
    [Parameter] public ElementState State { get; set; } = ElementState.Ideal;
    [Parameter] public EventCallback<ElementState> StateChanged { get; set; }

    protected override void OnParametersSet()
    {
        if (_element != Element)
        {
            if (_element is not null)
                _element.PropertyChanged -= OnElementPropertyChanged;

            _element = Element;

            if (_element is not null)
                _element.PropertyChanged += OnElementPropertyChanged;
        }

        base.OnParametersSet();
    }

    private void OnElementPropertyChanged(object? sender, System.ComponentModel.PropertyChangedEventArgs e)
    {
        StateHasChanged();
    }

    private void HandlePointerDown(PointerEventArgs e)
    {
        if (_selectionPointerId != null)
            return;

        _selectionPointerId = e.PointerId;
    }

    private async Task HandlePointerUp(PointerEventArgs e)
    {
        if (e.PointerId == _selectionPointerId)
        {
            await SetState(ElementState.Selected);
            _selectionPointerId = null;
        }
    }

    private async Task SetState(ElementState state)
    {
        State = state;
        await StateChanged.InvokeAsync(State);
    }

    //protected override void BuildRenderTree(RenderTreeBuilder builder)
    //{
    //    if (Element != null)
    //        builder.AddContent(0, Element.Render());

    //    base.BuildRenderTree(builder);
    //}
}
