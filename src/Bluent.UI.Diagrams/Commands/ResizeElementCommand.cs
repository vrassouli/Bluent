using Bluent.Core;
using Bluent.UI.Diagrams.Components.Internals;
using Bluent.UI.Diagrams.Elements;

namespace Bluent.UI.Diagrams.Commands;

public class ResizeElementCommand : ICommand
{
    private IDrawingElement _element;
    private ResizeAnchor _resizeAnchor;
    private Distance2D _delta;

    public ResizeElementCommand(IDrawingElement element, ResizeAnchor resizeAnchor, Distance2D delta)
    {
        _element = element;
        _resizeAnchor = resizeAnchor;
        _delta = delta;
    }

    public void Do()
    {
        if ((_resizeAnchor & ResizeAnchor.Left) == ResizeAnchor.Left)
            _element.ResizeLeft(_delta.Dx);
        if ((_resizeAnchor & ResizeAnchor.Right) == ResizeAnchor.Right)
            _element.ResizeRight(_delta.Dx);
        if ((_resizeAnchor & ResizeAnchor.Top) == ResizeAnchor.Top)
            _element.ResizeTop(_delta.Dy);
        if ((_resizeAnchor & ResizeAnchor.Bottom) == ResizeAnchor.Bottom)
            _element.ResizeBottom(_delta.Dy);

        _element.ApplyResize();
    }

    public void Undo()
    {
        if ((_resizeAnchor & ResizeAnchor.Left) == ResizeAnchor.Left)
            _element.ResizeLeft(-_delta.Dx);
        if ((_resizeAnchor & ResizeAnchor.Right) == ResizeAnchor.Right)
            _element.ResizeRight(-_delta.Dx);
        if ((_resizeAnchor & ResizeAnchor.Top) == ResizeAnchor.Top)
            _element.ResizeTop(-_delta.Dy);
        if ((_resizeAnchor & ResizeAnchor.Bottom) == ResizeAnchor.Bottom)
            _element.ResizeBottom(-_delta.Dy);

        _element.ApplyResize();
    }
}
