using Bluent.Core;
using Bluent.UI.Diagrams.Components;
using Bluent.UI.Diagrams.Elements;

namespace Bluent.UI.Diagrams.Commands.Basic;

internal class DeleteElementsCommand : ICommand
{
    private readonly DrawingCanvas _canvas;
    private readonly List<IDrawingShape> _elements;

    public DeleteElementsCommand(DrawingCanvas canvas, List<IDrawingShape> elements)
    {
        _canvas = canvas;
        _elements = elements;
    }
    public void Do()
    {
        foreach (IDrawingElement element in _elements)
        {
            _canvas.RemoveElement(element);
        }
    }

    public void Undo()
    {
        foreach (var element in _elements)
        {
            _canvas.AddElement(element);
        }
    }
}
