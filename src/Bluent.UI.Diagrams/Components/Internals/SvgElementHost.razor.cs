using Bluent.UI.Diagrams.Elements;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Components.Internals;

public partial class SvgElementHost : ComponentBase
{
    private ISvgElement? _element;

    [Parameter, EditorRequired] public ISvgElement Element { get; set; } = default!;
    [Parameter, EditorRequired] public bool Selected { get; set; } = default!;
    [Parameter] public double SelectionPadding { get; set; } = 5;
    [CascadingParameter] public SvgCanvas Canvas { get; set; } = default!;

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
        Canvas.OnElementClicked(Element, e.CtrlKey, e.AltKey, e.ShiftKey);
    }
}
