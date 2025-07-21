using Bluent.UI.Diagrams.Elements;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Components.Internals;

public partial class SvgElementHost : ComponentBase
{
    private ISvgElement? _element;
    private long? _selectionPointerId;

    [Parameter, EditorRequired] public ISvgElement Element { get; set; } = default!;
    [Parameter, EditorRequired] public bool Selected { get; set; } = default!;
    [Parameter] public double SelectionPadding { get; set; } = 5;
    [CascadingParameter] public SvgCanvas Canvas { get; set; } = default!;

    private bool PointerCaptured => _selectionPointerId != null;

    protected override void OnInitialized()
    {
        if (Canvas is null)
            throw new InvalidOperationException($"{nameof(SvgElementHost)} should be nested inside an {nameof(SvgCanvas)} component.");

        base.OnInitialized();
    }

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

    private void HandlePointerUp(PointerEventArgs e)
    {
        if (e.PointerId == _selectionPointerId)
        {
            _selectionPointerId = null;

            Canvas.OnElementClicked(Element);
        }
    }

    private void HandlePointerLeave() => _selectionPointerId = null;
    private void HandlePointerOut() => _selectionPointerId = null;
}
