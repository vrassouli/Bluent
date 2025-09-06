using Bluent.Core;
using Bluent.UI.Diagrams.Components;
using Bluent.UI.Diagrams.Elements;

namespace Bluent.UI.Diagrams.Commands.Basic;

public class AddElementCommand : ICommand
{
    private readonly DrawingCanvas _canvas;
    private readonly IDrawingElement _element;

    protected IDrawingElement Element => Element;

    public AddElementCommand(DrawingCanvas canvas, IDrawingElement element)
    {
        _canvas = canvas;
        _element = element;
    }

    public virtual void Do()
    {
        _canvas.AddElement(_element);
    }

    public virtual void Undo()
    {
        _canvas.RemoveElement(_element);
    }
}
