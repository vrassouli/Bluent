using Bluent.UI.Components.SplitPanelComponent.Internal;
using Bluent.UI.Interops.Abstractions;
using Bluent.UI.Services.Abstractions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.JSInterop;

namespace Bluent.UI.Components;

public partial class SplitPanelContainer : IPointerUpEventHandler, IPointerMoveEventHandler
{
    private SplitArea _resizeArea;
    private double _resizeStartX;
    private double _resizeStartY;
    private long? _resizePointerId;
    private double _resizeDeltaX;
    private double _resizeDeltaY;
    private DomRect? _resizeTargetSize;
    private bool? _allowHeaderResize;
    private bool? _allowFooterResize;
    private bool? _allowStartSideResize;
    private bool? _allowEndSideResize;
    private bool? _allowTopResize;
    private bool? _allowBottomResize;
    private bool? _allowStartResize;
    private bool? _allowEndResize;

    [Parameter] public RenderFragment? Header { get; set; }
    [Parameter] public RenderFragment? Footer { get; set; }
    [Parameter] public RenderFragment? StartSide { get; set; }
    [Parameter] public RenderFragment? EndSide { get; set; }
    [Parameter] public RenderFragment? Top { get; set; }
    [Parameter] public RenderFragment? Bottom { get; set; }
    [Parameter] public RenderFragment? Start { get; set; }
    [Parameter] public RenderFragment? End { get; set; }
    [Parameter] public RenderFragment? Center { get; set; }
    [Parameter] public ResizeMode HeaderResizeMode { get; set; } = ResizeMode.Auto;
    [Parameter] public ResizeMode FooterResizeMode { get; set; } = ResizeMode.Auto;
    [Parameter] public ResizeMode StartSideResizeMode { get; set; } = ResizeMode.Auto;
    [Parameter] public ResizeMode EndSideResizeMode { get; set; } = ResizeMode.Auto;
    [Parameter] public ResizeMode TopResizeMode { get; set; } = ResizeMode.Auto;
    [Parameter] public ResizeMode BottomResizeMode { get; set; } = ResizeMode.Auto;
    [Parameter] public ResizeMode StartResizeMode { get; set; } = ResizeMode.Auto;
    [Parameter] public ResizeMode EndResizeMode { get; set; } = ResizeMode.Auto;
    [Inject] private IDomHelper DomHelper { get; set; } = default!;

    internal int? HeaderSize { get; private set; }
    internal int? FooterSize { get; private set; }
    internal int? StartSideSize { get; private set; }
    internal int? EndSideSize { get; private set; }
    internal int? TopSize { get; private set; }
    internal int? BottomSize { get; private set; }
    internal int? StartSize { get; private set; }
    internal int? EndSize { get; private set; }

    private bool CanResizeHeader => HeaderResizeMode == ResizeMode.Resizable ||
                                 (HeaderResizeMode == ResizeMode.Auto && _allowHeaderResize != false);
    private bool CanResizeFooter => FooterResizeMode == ResizeMode.Resizable ||
                                 (FooterResizeMode == ResizeMode.Auto && _allowFooterResize != false);
    private bool CanResizeStartSide => StartSideResizeMode == ResizeMode.Resizable ||
                                 (StartSideResizeMode == ResizeMode.Auto && _allowStartSideResize != false);
    private bool CanResizeEndSide => EndSideResizeMode == ResizeMode.Resizable ||
                                 (EndSideResizeMode == ResizeMode.Auto && _allowEndSideResize != false);
    private bool CanResizeTop => TopResizeMode == ResizeMode.Resizable ||
                                 (TopResizeMode == ResizeMode.Auto && _allowTopResize != false);
    private bool CanResizeBottom => BottomResizeMode == ResizeMode.Resizable ||
                                    (BottomResizeMode == ResizeMode.Auto && _allowBottomResize != false);
    private bool CanResizeStart => StartResizeMode == ResizeMode.Resizable ||
                                   (StartResizeMode == ResizeMode.Auto && _allowStartResize != false);
    private bool CanResizeEnd => EndResizeMode == ResizeMode.Resizable ||
                                 (EndResizeMode == ResizeMode.Auto && _allowEndResize != false);

    public override IEnumerable<string> GetClasses()
    {
        foreach (var c in base.GetClasses())
            yield return c;

        yield return "bui-split-panel";
    }

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
            await DomHelper.RegisterPointerUpHandler(this);
            await DomHelper.RegisterPointerMoveHandler(this);
        }

        await base.OnAfterRenderAsync(firstRender);
    }

    public override async ValueTask DisposeAsync()
    {
        await DomHelper.UnregisterPointerUpHandler(this);
        await DomHelper.UnregisterPointerMoveHandler(this);

        await base.DisposeAsync();
    }

    [JSInvokable]
    public Task OnPointerUp(PointerEventArgs args)
    {
        // Check and stop resize...
        if (_resizePointerId == args.PointerId)
            _resizePointerId = null;

        return Task.CompletedTask;
    }

    [JSInvokable]
    public Task OnPointerMove(PointerEventArgs args)
    {
        if (_resizePointerId != args.PointerId)
            return Task.CompletedTask;

        _resizeDeltaX = args.ClientX - _resizeStartX;
        _resizeDeltaY = args.ClientY - _resizeStartY;

        if (_resizeTargetSize == null)
            return Task.CompletedTask;

        if (_resizeArea == SplitArea.Header)
        {
            HeaderSize = (int)(_resizeTargetSize.Height + _resizeDeltaY);
        }
        else if (_resizeArea == SplitArea.Top)
        {
            TopSize = (int)(_resizeTargetSize.Height + _resizeDeltaY);
        }
        else if (_resizeArea == SplitArea.Bottom)
        {
            BottomSize = (int)(_resizeTargetSize.Height - _resizeDeltaY);
        }
        else if (_resizeArea == SplitArea.Footer)
        {
            FooterSize = (int)(_resizeTargetSize.Height - _resizeDeltaY);
        }
        
        else if (_resizeArea == SplitArea.StartSide)
        {
            StartSideSize = (int)(_resizeTargetSize.Width + _resizeDeltaX);
        }
        else if (_resizeArea == SplitArea.Start)
        {
            StartSize = (int)(_resizeTargetSize.Width + _resizeDeltaX);
        }
        else if (_resizeArea == SplitArea.End)
        {
            EndSize = (int)(_resizeTargetSize.Width - _resizeDeltaX);
        }
        else if (_resizeArea == SplitArea.EndSide)
        {
            EndSideSize = (int)(_resizeTargetSize.Width - _resizeDeltaX);
        }

        StateHasChanged();
        return Task.CompletedTask;
    }

    internal async Task StartResize(SplitArea area, PointerEventArgs startEventArgs)
    {
        _resizePointerId = startEventArgs.PointerId;
        _resizeArea = area;
        _resizeStartX = startEventArgs.ClientX;
        _resizeStartY = startEventArgs.ClientY;

        _resizeTargetSize = await DomHelper.GetBoundingClientRectAsync($"#{Id}>.{area.ToString().ToLower()}-panel");
    }

    public void SetAllowResize(SplitArea area, bool allow)
    {
        if (area == SplitArea.Top)
            _allowTopResize = allow;
        else if (area == SplitArea.Bottom)
            _allowBottomResize = allow;
        else if (area == SplitArea.Start)
            _allowStartResize = allow;
        else if (area == SplitArea.End)
            _allowEndResize = allow;

        StateHasChanged();
    }

    public void ResetSize(SplitArea area)
    {
        if (area == SplitArea.Header)
        {
            HeaderSize = null;
            _allowHeaderResize = null;
        }
        else if (area == SplitArea.Footer)
        {
            FooterSize = null;
            _allowFooterResize = null;
        }
        else if (area == SplitArea.StartSide)
        {
            StartSideSize = null;
            _allowStartSideResize = null;
        }
        else if (area == SplitArea.EndSide)
        {
            EndSideSize = null;
            _allowEndSideResize = null;
        }
        else if (area == SplitArea.Top)
        {
            TopSize = null;
            _allowTopResize = null;
        }
        else if (area == SplitArea.Bottom)
        {
            BottomSize = null;
            _allowBottomResize = null;
        }
        else if (area == SplitArea.Start)
        {
            StartSize = null;
            _allowStartResize = null;
        }
        else if (area == SplitArea.End)
        {
            EndSize = null;
            _allowEndResize = null;
        }

        StateHasChanged();
    }
}