#define LOG_POINTER_EVENTS
//#define LOG_POINTER_EVENT_DETAILS

using Bluent.Core;
using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Tools;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Components;

public partial class SvgCanvas
{
    private ISvgTool? _tool;
    private List<ISvgElement> _elements = new();
    private List<ISvgElement> _selectedElements = new();
    private bool _shouldRender = true;

    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public RenderFragment? Elements { get; set; }
    [Parameter] public ISvgTool? Tool { get; set; }
    [Parameter] public SelectionMode Selection { get; set; } = SelectionMode.None;
    [Parameter] public EventCallback OnToolOperationCompleted { get; set; } 

    private string Cursor => Tool?.Cursor ?? "auto";

    public event EventHandler<PointerEventArgs>? PointerCancel;
    public event EventHandler<PointerEventArgs>? PointerDown;
    public event EventHandler<PointerEventArgs>? PointerEnter;
    public event EventHandler<PointerEventArgs>? PointerLeave;
    public event EventHandler<PointerEventArgs>? PointerMove;
    public event EventHandler<PointerEventArgs>? PointerOut;
    public event EventHandler<PointerEventArgs>? PointerOver;
    public event EventHandler<PointerEventArgs>? PointerUp;

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

        base.OnParametersSet();
    }

    private void ToolOperationCompleted(object? sender, EventArgs e)
    {
        InvokeAsync(OnToolOperationCompleted.InvokeAsync);
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

    internal void AddElement(ISvgElement element)
    {
        _elements.Add(element);
        StateHasChanged();
    }

    internal void OnElementClicked(ISvgElement element)
    {
        SelectElement(element);

        StateHasChanged();
    }

    internal void RemoveElement(ISvgElement element)
    {
        _elements.Remove(element);
        _selectedElements.Remove(element);

        StateHasChanged();
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

#endif

    #endregion

    private void SelectElement(ISvgElement element)
    {
        if (Selection == SelectionMode.None)
            return;

        if (Selection == SelectionMode.Single)
            _selectedElements.Clear();

        _selectedElements.Add(element);
    }
    
    private bool ClearSelection()
    {
        if (_selectedElements.Any())
        {
            _selectedElements.Clear();
            return true;
        }

        return false;
    }

    private bool IsSelected(ISvgElement element)
    {
        return _selectedElements.Contains(element);
    }
}
