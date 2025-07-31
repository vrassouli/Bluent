using Bluent.UI.Diagrams.Components;
using Microsoft.AspNetCore.Components.Web;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace Bluent.UI.Diagrams.Tools;

public abstract class PointerToolBase : ITool
{
    private List<PointerEventArgs> _pointers = new();
    private string _cursor = "auto";

    protected IReadOnlyList<PointerEventArgs> Pointers => _pointers;
    protected DrawingCanvas Canvas { get; private set; } = default!;

    public string Cursor
    {
        get => _cursor;
        set
        {
            if (_cursor != value)
            {
                _cursor = value;
                NotifyPropertyChanged();
            }
        }
    }

    public event EventHandler? Completed;
    public event PropertyChangedEventHandler? PropertyChanged;

    public void Register(DrawingCanvas svgCanvas)
    {
        Canvas = svgCanvas;

        RegisterEvents();
    }

    public void Unregister()
    {
        UnregisterEvents();
    }

    protected virtual void RegisterEvents()
    {
        Canvas.PointerMove += Canvas_OnPointerMove;
        Canvas.PointerDown += Canvas_OnPointerDown;
        Canvas.PointerUp += Canvas_OnPointerUp;
        Canvas.PointerEnter += Canvas_OnPointerEnter;
        Canvas.PointerLeave += Canvas_OnPointerLeave;
    }

    protected virtual void UnregisterEvents()
    {
        Canvas.PointerMove -= Canvas_OnPointerMove;
        Canvas.PointerDown -= Canvas_OnPointerDown;
        Canvas.PointerUp -= Canvas_OnPointerUp;
        Canvas.PointerEnter -= Canvas_OnPointerEnter;
        Canvas.PointerLeave -= Canvas_OnPointerLeave;
    }

    private void Canvas_OnPointerDown(object? sender, PointerEventArgs e)
    {
        CapturePointer(e);
        OnPointerDown(e);
    }

    private void Canvas_OnPointerUp(object? sender, PointerEventArgs e)
    {
        ReleasePointer(e);
        OnPointerUp(e);
    }

    private void Canvas_OnPointerMove(object? sender, PointerEventArgs e)
    {
        OnPointerMove(e);
    }

    private void Canvas_OnPointerLeave(object? sender, PointerEventArgs e)
    {
        ReleasePointer(e);
        OnPointerLeave(e);
    }

    private void Canvas_OnPointerEnter(object? sender, PointerEventArgs e)
    {
        OnPointerEnter(e);
    }

    protected virtual void OnPointerUp(PointerEventArgs e)
    {
    }

    protected virtual void OnPointerDown(PointerEventArgs e)
    {
    }

    protected virtual void OnPointerMove(PointerEventArgs e)
    {
    }

    protected virtual void OnPointerLeave(PointerEventArgs e)
    {
    }

    protected virtual void OnPointerEnter(PointerEventArgs e)
    {
    }

    private void CapturePointer(PointerEventArgs pointer)
    {
        ReleasePointer(pointer);

        _pointers.Add(pointer);
    }

    private void ReleasePointer(PointerEventArgs pointer)
    {
        _pointers.RemoveAll(x => x.PointerId == pointer.PointerId);
    }

    protected void NotifyCompleted()
    {
        Completed?.Invoke(this, EventArgs.Empty);
    }

    protected void NotifyPropertyChanged([CallerMemberName] string? memberName = null)
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(memberName));
    }
}
