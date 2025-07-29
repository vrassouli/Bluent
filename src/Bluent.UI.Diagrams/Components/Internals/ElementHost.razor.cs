using Bluent.UI.Diagrams.Elements;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Diagrams.Components.Internals;

public partial class ElementHost : ComponentBase
{
    private IDrawingElement? _element;

    [Parameter, EditorRequired] public IDrawingElement Element { get; set; } = default!;
    [CascadingParameter] public DrawingCanvas Canvas { get; set; } = default!;
    private bool Selected => Canvas.IsSelected(Element);

    private string? GetCursor()
    {
        if (Selected && Canvas.AllowDrag && (Element.AllowVerticalDrag || Element.AllowHorizontalDrag))
            return "grab";

        return null;
    }

    protected override void OnInitialized()
    {
        if (Canvas is null)
            throw new InvalidOperationException($"{nameof(ElementHost)} should be nested inside an {nameof(DrawingCanvas)} component.");

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

}
