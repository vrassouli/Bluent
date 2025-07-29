﻿using Bluent.Core;
using Bluent.UI.Diagrams.Commands.Basic;
using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Extensions;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Tools;

internal class DragTool : SinglePointerToolBase
{
    private DiagramPoint? _dragStart;
    private Distance2D? _dragDelta;
    private ScreenPoint? _panStart;
    private Dictionary<long, DiagramPoint> _startPoints = new();

    public override string Cursor => "move";

    protected override void OnTargetPointerAvailable(PointerEventArgs e)
    {
    }

    protected override void OnTargetPointerMove(PointerEventArgs e)
    {
        if (Canvas.Tool is not null)
            return;

        if (Canvas.SelectedElements.Any())
            Drag(e);
        else
            Pan(e);
    }

    protected override void OnTargetPointerUnavailable()
    {
        Canvas.ApplyPan();
        if (Canvas.SelectedElements.Any())
        {
            if (_dragDelta != null)
            {
                foreach (var el in Canvas.SelectedElements)
                    el.CancelDrag();

                var command = GetDragCommand(Canvas.SelectedElements.ToList(), _dragDelta);
                Canvas.ExecuteCommand(command);
            }
        }

        _startPoints.Clear();

        _panStart = null;
        _dragStart = null;
        _dragDelta = null;
    }

    private void Pan(PointerEventArgs e)
    {
        if (_panStart is null)
            _panStart = e.ToClientPoint();

        var delta = e.ToClientPoint() - _panStart;
        Canvas?.Pan(delta.Dx, delta.Dy);
    }

    private void Drag(PointerEventArgs e)
    {
        if (_dragStart is null)
            _dragStart = Canvas.ScreenToDiagram(e.ToClientPoint());

        _dragDelta = Canvas.ScreenToDiagram(e.ToClientPoint()) - _dragStart;
        foreach (var el in Canvas.SelectedElements)
        {
            var drag = new Distance2D(el.AllowHorizontalDrag ? _dragDelta.Dx : 0, el.AllowVerticalDrag ? _dragDelta.Dy : 0);

            el.SetDrag(drag);
        }
    }

    protected virtual ICommand GetDragCommand(List<IDrawingElement> elements, Distance2D drag)
    {
        return new DragElementsCommand(elements, drag);
    }
}
