using Bluent.Core;
using Bluent.UI.Diagrams.Components;
using Bluent.UI.Diagrams.Elements;

namespace Bluent.UI.Diagrams.Commands;

public class AddElementCommand : ICommand
{
    private readonly DrawingCanvas _canvas;
    private readonly IDrawingElement _element;

    public AddElementCommand(DrawingCanvas canvas, IDrawingElement element)
    {
        _canvas = canvas;
        _element = element;
    }

    public void Do()
    {
        _canvas.AddElement(_element);
    }

    public void Undo()
    {
        _canvas.RemoveElement(_element);
    }
}
