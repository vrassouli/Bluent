using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Extensions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Components.Internals;

public partial class ElementHost : ComponentBase, IDisposable
{
    private IDrawingShape? _element;
    private bool _shouldRender = true;

    [Parameter, EditorRequired] public IDrawingShape Element { get; set; } = default!;
    [CascadingParameter] public DrawingCanvas Canvas { get; set; } = default!;
    //private bool Selected => Canvas.IsSelected(Element);

    public void Dispose()
    {
        Canvas.PointerMove -= OnPointerMove;
    }

    protected override void OnInitialized()
    {
        if (Canvas is null)
            throw new InvalidOperationException($"{nameof(ElementHost)} should be nested inside an {nameof(DrawingCanvas)} component.");

        Canvas.PointerMove += OnPointerMove;

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

    //    protected override void OnAfterRender(bool firstRender)
    //    {
    //#if DEBUG
    //        Console.WriteLine(Element.ToString());
    //#endif

    //        base.OnAfterRender(firstRender);
    //    }

    protected override bool ShouldRender()
    {
        if (!_shouldRender)
        {
            _shouldRender = true;

            return false;
        }

        return base.ShouldRender();
    }

    private void OnElementPropertyChanged(object? sender, System.ComponentModel.PropertyChangedEventArgs e)
    {
        StateHasChanged();
    }

    private void OnPointerMove(object? sender, PointerEventArgs e)
    {
        //_shouldRender = false;

        if (Element is IDrawingElement element)
        {
            var offsetPoint = Canvas.ScreenToDiagram(e.ToOffsetPoint());
            var elements = Canvas.GetElementsAt(offsetPoint);
            if (elements.Any(x => x == Element))
            {
                //Console.WriteLine($"[{Element}] Pointer on me");
                var topMost = elements.FirstOrDefault();

                var direct = topMost == Element;
                element.PointerMovingInside(offsetPoint, direct);
            }
            else
            {
                element.PointerMovingOutside();
            }
        }
    }

    private string? GetCursor()
    {
        if (Element is IDrawingElement element &&
            element.IsSelected &&
            (element.AllowVerticalDrag || element.AllowHorizontalDrag) &&
            Canvas.AllowDrag)
            return "grab";

        return null;
    }
}
