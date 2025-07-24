//#define LOG_POINTER_EVENTS
//#define LOG_POINTER_EVENT_DETAILS

using Bluent.Core;
using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Tools;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Components;

public partial class DrawingCanvas
{
    private const double ZoomStep = 0.1;

    private bool _shouldRender = true;
    private bool _allowDrag;
    private bool _allowScale;
    private double _scale = 1;
    private Distance2D _pan = new();
    private Distance2D _activePan = new();
    private ISvgTool? _tool;
    private List<IDrawingElement> _elements = new();
    private List<IDrawingElement> _selectedElements = new();
    private List<ISvgTool> _internalTools = new();

    [Parameter] public CommandManager? CommandManager { get; set; }
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public ISvgTool? Tool { get; set; }
    [Parameter] public SelectionMode Selection { get; set; } = SelectionMode.None;
    [Parameter] public EventCallback OnToolOperationCompleted { get; set; }
    [Parameter] public bool AllowDrag { get; set; }
    [Parameter] public bool AllowScale { get; set; }
    [Parameter] public int SnapSize { get; set; }

    public IEnumerable<IDrawingElement> SelectedElements => _selectedElements;
    public IEnumerable<IDrawingElement> Elements => _elements;

    private string Cursor => Tool?.Cursor ?? "auto";

    public event EventHandler<PointerEventArgs>? PointerCancel;
    public event EventHandler<PointerEventArgs>? PointerDown;
    public event EventHandler<PointerEventArgs>? PointerEnter;
    public event EventHandler<PointerEventArgs>? PointerLeave;
    public event EventHandler<PointerEventArgs>? PointerMove;
    public event EventHandler<PointerEventArgs>? PointerOut;
    public event EventHandler<PointerEventArgs>? PointerOver;
    public event EventHandler<PointerEventArgs>? PointerUp;
    public event EventHandler<WheelEventArgs>? MouseWheel;

    protected override void OnParametersSet()
    {
        if (_tool != Tool)
        {
            if (_tool is not null)
            {
                _tool.Completed -= ToolOperationCompleted;
                _tool.Unregister();
            }

            _tool = Tool;

            if (_tool is not null)
            {
                _tool.Register(this);
                _tool.Completed += ToolOperationCompleted;
            }
        }

        if (_allowDrag != AllowDrag)
        {
            _allowDrag = AllowDrag;

            if (_allowDrag)
                ActivateDragTool();
            else
                DeactivateDragTool();
        }

        if (_allowScale != AllowScale)
        {
            _allowScale = AllowScale;

            if (_allowScale)
                ActivateScaleTool();
            else
                DeactivateScaleTool();
        }

        base.OnParametersSet();
    }

    protected override bool ShouldRender()
    {
        if (!_shouldRender)
        {
            _shouldRender = true;

            return false;
        }

        return base.ShouldRender();
    }

    internal void AddElement(IDrawingElement element)
    {
        _elements.Add(element);
        StateHasChanged();
    }

    internal void OnElementClicked(IDrawingElement element, bool ctrlKey, bool altKey, bool shiftKey)
    {
        ToggleElementSelection(element, ctrlKey);

        StateHasChanged();
    }

    internal void RemoveElement(IDrawingElement element)
    {
        _elements.Remove(element);
        _selectedElements.Remove(element);

        StateHasChanged();
    }

    internal void ToggleElementSelection(IDrawingElement element, bool addToSelections)
    {
        if (IsSelected(element))
            DeselectElement(element);
        else
            SelectElement(element, addToSelections);
    }

    internal void DeselectElement(IDrawingElement element)
    {
        _selectedElements.Remove(element);
    }

    internal void SelectElement(IDrawingElement element, bool addToSelections)
    {
        if (Selection == SelectionMode.None)
            return;

        if (Selection == SelectionMode.Single || !addToSelections)
            _selectedElements.Clear();

        _selectedElements.Add(element);
    }

    internal void Pan(double x, double y)
    {
        _activePan.Dx = x;
        _activePan.Dy = y;

        StateHasChanged();
    }

    internal void ApplyPan()
    {
        SetPan(_pan.Dx + _activePan.Dx, _pan.Dy + _activePan.Dy);

        StateHasChanged();
    }

    internal void SetPan(double x, double y)
    {
        _pan.Dx = x;
        _pan.Dy = y;

        _activePan = new();
    }

    internal void ZoomIn(DiagramPoint point)
    {
        // Get current screen position of the diagram point before zoom
        var screenBefore = DiagramToScreen(point);

        // Zoom in
        _scale += ZoomStep;

        // After zoom, that diagram point would appear at a different screen position
        var screenAfter = DiagramToScreen(point);

        // Calculate how much it moved due to zoom
        var dx = screenAfter.X - screenBefore.X;
        var dy = screenAfter.Y - screenBefore.Y;

        // Offset pan to keep the point visually fixed
        SetPan(_pan.Dx - dx, _pan.Dy - dy);

        StateHasChanged();
    }

    internal void ZoomOut(DiagramPoint point)
    {
        // Get current screen position of the diagram point before zoom
        var screenBefore = DiagramToScreen(point);

        // Zoom out
        _scale = Math.Max(_scale - ZoomStep, ZoomStep);

        // After zoom, that diagram point would appear at a different screen position
        var screenAfter = DiagramToScreen(point);

        // Calculate how much it moved due to zoom
        var dx = screenAfter.X - screenBefore.X;
        var dy = screenAfter.Y - screenBefore.Y;

        // Offset pan to keep the point visually fixed
        SetPan(_pan.Dx - dx, _pan.Dy - dy);

        StateHasChanged();
    }

    internal DiagramPoint ScreenToDiagram(ScreenPoint point)
    {
        var x = (point.X - _pan.Dx) / _scale;
        var y = (point.Y - _pan.Dy) / _scale;

        return SnapToGrid(new DiagramPoint(x, y));
    }

    internal ScreenPoint DiagramToScreen(DiagramPoint point)
    {
        var x = point.X * _scale + _pan.Dx;
        var y = point.Y * _scale + _pan.Dy;

        return new ScreenPoint(x, y);
    }
    
    internal DiagramPoint SnapToGrid(DiagramPoint point)
    {
        if (SnapSize <= 0)
            return point;

        return new DiagramPoint(Math.Round((double)point.X / SnapSize) * SnapSize, Math.Round((double)point.Y / SnapSize) * SnapSize);
    }

    public void ExecuteCommand(ICommand cmd)
    {
        if (CommandManager != null)
            CommandManager.Do(cmd);
        else
            cmd.Do();
    }

    #region Event Handlers

    private void HandlePointerCancel(PointerEventArgs args)
    {
        _shouldRender = false;
        PointerCancel?.Invoke(this, args);

#if DEBUG && LOG_POINTER_EVENTS
        LogEvent("SvgCanvas.PointerCancel", args);
#endif
    }

    private void HandlePointerDown(PointerEventArgs args)
    {
        if (!ClearSelection())
        {
            // if no selection is cleared, there is no need to re-render.
            _shouldRender = false;
        }

        PointerDown?.Invoke(this, args);

#if DEBUG && LOG_POINTER_EVENTS
        LogEvent("SvgCanvas.PointerDown", args);
#endif
    }

    private void HandlePointerEnter(PointerEventArgs args)
    {
        _shouldRender = false;
        PointerEnter?.Invoke(this, args);

#if DEBUG && LOG_POINTER_EVENTS
        LogEvent("SvgCanvas.PointerEnter", args);
#endif
    }

    private void HandlePointerLeave(PointerEventArgs args)
    {
        _shouldRender = false;
        PointerLeave?.Invoke(this, args);

#if DEBUG && LOG_POINTER_EVENTS
        LogEvent("SvgCanvas.PointerLeave", args);
#endif
    }

    private void HandlePointerMove(PointerEventArgs args)
    {
        _shouldRender = false;
        PointerMove?.Invoke(this, args);

#if DEBUG && LOG_POINTER_EVENTS
        //LogEvent("SvgCanvas.PointerMove", args);
#endif
    }

    private void HandlePointerOut(PointerEventArgs args)
    {
        _shouldRender = false;
        PointerOut?.Invoke(this, args);

#if DEBUG && LOG_POINTER_EVENTS
        LogEvent("SvgCanvas.PointerOut", args);
#endif
    }

    private void HandlePointerOver(PointerEventArgs args)
    {
        _shouldRender = false;
        PointerOver?.Invoke(this, args);

#if DEBUG && LOG_POINTER_EVENTS
        LogEvent("SvgCanvas.PointerOver", args);
#endif
    }

    private void HandlePointerUp(PointerEventArgs args)
    {
        _shouldRender = false;
        PointerUp?.Invoke(this, args);

#if DEBUG && LOG_POINTER_EVENTS
        LogEvent("SvgCanvas.PointerUp", args);
#endif
    }

    private void HandleMouseWheel(WheelEventArgs args)
    {
        _shouldRender = false;
        MouseWheel?.Invoke(this, args);

#if DEBUG && LOG_POINTER_EVENTS
        LogEvent("SvgCanvas.MouseWheel", args);
#endif
    }

#if DEBUG

    private static void LogEvent(string eventName, PointerEventArgs args)
    {
        Console.WriteLine($"{eventName}:");
#if LOG_POINTER_EVENT_DETAILS
        Console.WriteLine($"{eventName}:");
        Console.WriteLine($"PointerId: {args.PointerId}");
        Console.WriteLine($"PointerType: {args.PointerType}");
        Console.WriteLine($"ClientX: {args.ClientX}");
        Console.WriteLine($"ClientY: {args.ClientY}");
        Console.WriteLine($"OffsetX: {args.OffsetX}");
        Console.WriteLine($"OffsetY: {args.OffsetY}");
        Console.WriteLine($"Shift: {args.ShiftKey}, Control: {args.CtrlKey}, Alt: {args.AltKey}");
#else
        Console.WriteLine($"{eventName}");
#endif
    }

    private static void LogEvent(string eventName, WheelEventArgs args)
    {
        Console.WriteLine($"{eventName}:");
#if LOG_POINTER_EVENT_DETAILS
        Console.WriteLine($"{eventName}:");
        Console.WriteLine($"DeltaX: {args.DeltaX}");
        Console.WriteLine($"DeltaY: {args.DeltaY}");
        Console.WriteLine($"DeltaMode: {args.DeltaMode}");
        Console.WriteLine($"ClientX: {args.ClientX}");
        Console.WriteLine($"ClientY: {args.ClientY}");
        Console.WriteLine($"OffsetX: {args.OffsetX}");
        Console.WriteLine($"OffsetY: {args.OffsetY}");
        Console.WriteLine($"Shift: {args.ShiftKey}, Control: {args.CtrlKey}, Alt: {args.AltKey}");
#else
        Console.WriteLine($"{eventName}");
#endif
    }

#endif

    #endregion

    private bool ClearSelection()
    {
        if (_selectedElements.Any())
        {
            _selectedElements.Clear();
            return true;
        }

        return false;
    }

    private bool IsSelected(IDrawingElement element)
    {
        return _selectedElements.Contains(element);
    }

    private void ActivateDragTool()
    {
        var tool = new DragTool();
        tool.Register(this);

        _internalTools.Add(tool);
    }

    private void DeactivateDragTool() => DeactivateTool<DragTool>();

    private void ActivateScaleTool()
    {
        var tool = new ScaleTool();
        tool.Register(this);

        _internalTools.Add(tool);
    }

    private void DeactivateScaleTool() => DeactivateTool<ScaleTool>();

    private void DeactivateTool<T>()
    {
        _internalTools.RemoveAll(t => t.GetType() == typeof(T));
    }

    private void ToolOperationCompleted(object? sender, EventArgs e)
    {
        InvokeAsync(OnToolOperationCompleted.InvokeAsync);
    }
}
