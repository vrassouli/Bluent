using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Tools;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Components;

public partial class SvgCanvas
{
    private ISvgTool? _tool;
    private List<ISvgElement> _elements = new();
    private bool _shouldRender = true;

    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public RenderFragment? Elements { get; set; }
    [Parameter] public ISvgTool? Tool { get; set; }

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
                _tool.Unregister();

            _tool = Tool;

            if (_tool is not null)
                _tool.Register(this);
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

    internal void AddElement(ISvgElement element)
    {
        _elements.Add(element);
        StateHasChanged();
    }

    internal void RemoveElement(ISvgElement element)
    {
        _elements.Remove(element);
        StateHasChanged();
    }

    #region Event Handlers

    private void HandlePointerCancel(PointerEventArgs args)
    {
        _shouldRender = false;
        PointerCancel?.Invoke(this, args);
    }

    private void HandlePointerDown(PointerEventArgs args)
    {
        _shouldRender = false;
        PointerDown?.Invoke(this, args);
    }

    private void HandlePointerEnter(PointerEventArgs args)
    {
        _shouldRender = false;
        PointerEnter?.Invoke(this, args);
    }

    private void HandlePointerLeave(PointerEventArgs args)
    {
        _shouldRender = false;
        PointerLeave?.Invoke(this, args);
    }

    private void HandlePointerMove(PointerEventArgs args)
    {
        _shouldRender = false;
        PointerMove?.Invoke(this, args);
    }

    private void HandlePointerOut(PointerEventArgs args)
    {
        _shouldRender = false;
        PointerOut?.Invoke(this, args);
    }

    private void HandlePointerOver(PointerEventArgs args)
    {
        _shouldRender = false;
        PointerOver?.Invoke(this, args);
    }

    private void HandlePointerUp(PointerEventArgs args)
    {
        _shouldRender = false;
        PointerUp?.Invoke(this, args);
    }

    #endregion
}
