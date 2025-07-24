using Bluent.Core;
using Bluent.UI.Diagrams.Elements;

namespace Bluent.UI.Diagrams.Commands;

internal class DragElementsCommand : ICommand
{
    private readonly List<IDrawingElement> _elements;
    private readonly Distance2D _drag;

    public DragElementsCommand(List<IDrawingElement> elements, Distance2D drag)
    {
        _elements = elements;
        _drag = drag;
    }

    public void Do()
    {
        foreach (var el in _elements)
        {
            var drag = new Distance2D(el.AllowHorizontalDrag ? _drag.Dx : 0, el.AllowVerticalDrag ? _drag.Dy : 0);

            el.SetDrag(drag);
            el.ApplyDrag();
        }
    }

    public void Undo()
    {
        foreach (var el in _elements)
        {
            var drag = new Distance2D(el.AllowHorizontalDrag ? -_drag.Dx : 0, el.AllowVerticalDrag ? -_drag.Dy : 0);

            el.SetDrag(drag);
            el.ApplyDrag();
        }
    }
}
