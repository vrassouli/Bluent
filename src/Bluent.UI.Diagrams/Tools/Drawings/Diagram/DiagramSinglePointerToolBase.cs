using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Tools.Drawings.Diagram;

public abstract class DiagramSinglePointerToolBase : DiagramPointerToolBase
{
    private long? _pointerId;

    protected override void OnPointerDown(PointerEventArgs e)
    {
        if (Pointers.Count == 1 && _pointerId is null)
        {
            _pointerId = e.PointerId;
            OnTargetPointerAvailable(e);
        }

        base.OnPointerDown(e);
    }

    protected override void OnPointerUp(PointerEventArgs e)
    {
        if (_pointerId == e.PointerId)
        {
            _pointerId = null;

            OnTargetPointerUp(e);
            OnTargetPointerUnavailable();
        }

        base.OnPointerUp(e);
    }

    protected override void OnPointerLeave(PointerEventArgs e)
    {
        if (_pointerId == e.PointerId)
        {
            _pointerId = null;
            OnTargetPointerUnavailable();
        }

        base.OnPointerLeave(e);
    }

    protected override void OnPointerMove(PointerEventArgs e)
    {
        if (_pointerId == e.PointerId)
            OnTargetPointerMove(e);

        base.OnPointerMove(e);
    }

    protected abstract void OnTargetPointerAvailable(PointerEventArgs e);

    protected abstract void OnTargetPointerMove(PointerEventArgs e);

    protected abstract void OnTargetPointerUp(PointerEventArgs e);

    protected abstract void OnTargetPointerUnavailable();
}
