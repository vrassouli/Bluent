using Bluent.Core;
using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Elements.Abstractions;

namespace Bluent.UI.Diagrams.Commands.Basic;

internal class PointUpdateCommand : ICommand
{
    private IHasUpdatablePoints _element;
    private UpdatablePoint _point;
    private Distance2D _delta;
    private DiagramPoint _originalPoint;

    public PointUpdateCommand(IHasUpdatablePoints element, UpdatablePoint point, Distance2D delta)
    {
        _element = element;
        _point = point;
        _delta = delta;

        _originalPoint = point.Point with { };
    }

    public void Do()
    {
        _element.UpdatePoint(_point, new DiagramPoint(_originalPoint.X + _delta.Dx, _originalPoint.Y + _delta.Dy));
    }

    public void Undo()
    {
        _element.UpdatePoint(_point, new DiagramPoint(_originalPoint.X, _originalPoint.Y));
    }
}
