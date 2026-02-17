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
    private int? _resizeTargetSize;
    private readonly Dictionary<SplitArea, bool?> _allowResizes = new();
    private readonly Dictionary<SplitArea, bool?> _floatings = new();
    private readonly Dictionary<SplitArea, int?> _sizes = new();

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
    // [Parameter] public int? HeaderMinSize { get; set; } = 100;
    // [Parameter] public int? TopMinSize { get; set; } = 100;
    // [Parameter] public int? BottomMinSize { get; set; } = 100;
    // [Parameter] public int? FooterMinSize { get; set; } = 100;
    // [Parameter] public int? StartMinSize { get; set; } = 100;
    // [Parameter] public int? StartSideMinSize { get; set; } = 100;
    // [Parameter] public int? EndMinSize { get; set; } = 100;
    // [Parameter] public int? EndSideMinSize { get; set; } = 100;
    [Parameter] public int? HeaderMaxSize { get; set; }
    [Parameter] public int? TopMaxSize { get; set; }
    [Parameter] public int? BottomMaxSize { get; set; }
    [Parameter] public int? FooterMaxSize { get; set; }
    [Parameter] public int? StartMaxSize { get; set; }
    [Parameter] public int? StartSideMaxSize { get; set; }
    [Parameter] public int? EndMaxSize { get; set; }
    [Parameter] public int? EndSideMaxSize { get; set; }
    
    [Inject] private IDomHelper DomHelper { get; set; } = default!;

    private bool CanResizeHeader => HeaderResizeMode == ResizeMode.Resizable ||
                                    (HeaderResizeMode == ResizeMode.Auto && GetAllowResize(SplitArea.Footer) != false);

    private bool CanResizeFooter => FooterResizeMode == ResizeMode.Resizable ||
                                    (FooterResizeMode == ResizeMode.Auto && GetAllowResize(SplitArea.Footer) != false);

    private bool CanResizeStartSide => StartSideResizeMode == ResizeMode.Resizable ||
                                       (StartSideResizeMode == ResizeMode.Auto &&
                                        GetAllowResize(SplitArea.EndSide) != false);

    private bool CanResizeEndSide => EndSideResizeMode == ResizeMode.Resizable ||
                                     (EndSideResizeMode == ResizeMode.Auto &&
                                      GetAllowResize(SplitArea.EndSide) != false);

    private bool CanResizeTop => TopResizeMode == ResizeMode.Resizable ||
                                 (TopResizeMode == ResizeMode.Auto && GetAllowResize(SplitArea.Top) != false);

    private bool CanResizeBottom => BottomResizeMode == ResizeMode.Resizable ||
                                    (BottomResizeMode == ResizeMode.Auto && GetAllowResize(SplitArea.Bottom) != false);

    private bool CanResizeStart => StartResizeMode == ResizeMode.Resizable ||
                                   (StartResizeMode == ResizeMode.Auto && GetAllowResize(SplitArea.Start) != false);

    private bool CanResizeEnd => EndResizeMode == ResizeMode.Resizable ||
                                 (EndResizeMode == ResizeMode.Auto && GetAllowResize(SplitArea.End) != false);

    public override IEnumerable<string> GetClasses()
    {
        foreach (var c in base.GetClasses())
            yield return c;

        yield return "bui-split-panel";
    }

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender && RendererInfo.IsInteractive)
        {
            await DomHelper.RegisterPointerUpHandler(this);
            await DomHelper.RegisterPointerMoveHandler(this);
        }

        await base.OnAfterRenderAsync(firstRender);
    }

    public override async ValueTask DisposeAsync()
    {
        if (RendererInfo.IsInteractive)
        {
            try
            {
                await DomHelper.UnregisterPointerUpHandler(this);
                await DomHelper.UnregisterPointerMoveHandler(this);
            }
            catch (JSDisconnectedException e)
            {
                // swallow
            }
        }

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

        if (ResizeArea())
            StateHasChanged();

        return Task.CompletedTask;
    }

    internal async Task StartResize(SplitArea area, PointerEventArgs startEventArgs)
    {
        _resizePointerId = startEventArgs.PointerId;
        _resizeArea = area;
        _resizeStartX = startEventArgs.ClientX;
        _resizeStartY = startEventArgs.ClientY;

        _resizeTargetSize = GetSize(area);
        if (_resizeTargetSize is null)
        {
            var rect = await DomHelper.GetBoundingClientRectAsync($"#{Id}>.{area.ToString().ToLower()}-panel");

            if (rect != null)
            {
                _resizeTargetSize = area switch
                {
                    SplitArea.Header or SplitArea.Top or SplitArea.Bottom or SplitArea.Footer
                        => (int)rect.Height,
                    SplitArea.StartSide or SplitArea.Start or SplitArea.EndSide or SplitArea.End
                        => (int)rect.Width,
                    _ => null
                };
            }
        }
    }

    internal bool ResizeArea()
    {
        if (_resizeTargetSize == null)
            return false;

        var size = _resizeArea switch
        {
            SplitArea.Header or SplitArea.Top => _resizeTargetSize + _resizeDeltaY,
            SplitArea.Bottom or SplitArea.Footer => _resizeTargetSize - _resizeDeltaY,
            SplitArea.StartSide or SplitArea.Start => _resizeTargetSize + _resizeDeltaX,
            SplitArea.EndSide or SplitArea.End => _resizeTargetSize - _resizeDeltaX,
            _ => null
        };

        var min = 0;//GetAreaMin(_resizeArea) ?? size;
        var max = GetAreaMax(_resizeArea) ?? size;
        
        if (size < min || size > max)
            return false;
        
        _sizes[_resizeArea] = (int?)size;
        
        return true;
    }

    internal int? GetSize(SplitArea area)
    {
        var size = _sizes.GetValueOrDefault(area);
        
        // if (size is null)
        //     return GetAreaMin(area);
        
        return size;
    }

    public void SetSize(SplitArea area, int size)
    {
        _sizes[area] = size;
        StateHasChanged();
    }
    
    internal void SetAllowResize(SplitArea area, bool allow)
    {
        _allowResizes[area] = allow;
        StateHasChanged();
    }

    internal void ResetSize(SplitArea area)
    {
        _sizes[area] = null;
        StateHasChanged();
    }

    internal bool? GetAllowResize(SplitArea area) => _allowResizes.GetValueOrDefault(area);

    internal void SetFloating(SplitArea area, bool floating)
    {
        _floatings[area] = floating;
        StateHasChanged();
    }

    internal bool GetFloating(SplitArea area) => _floatings.GetValueOrDefault(area) ?? false;

    // internal int? GetAreaMin(SplitArea area)
    // {
    //     return area switch
    //     {
    //         SplitArea.Top => TopMinSize,
    //         SplitArea.Header => HeaderMinSize,
    //         SplitArea.Bottom => BottomMinSize,
    //         SplitArea.Footer => FooterMinSize,
    //         SplitArea.Start => StartMinSize,
    //         SplitArea.End => EndMinSize,
    //         SplitArea.StartSide => StartSideMinSize,
    //         SplitArea.EndSide => EndSideMinSize,
    //         
    //         _ => null
    //     };
    // }

    internal int? GetAreaMax(SplitArea area)
    {
        return area switch
        {
            SplitArea.Top => TopMaxSize,
            SplitArea.Header => HeaderMaxSize,
            SplitArea.Bottom => BottomMaxSize,
            SplitArea.Footer => FooterMaxSize,
            SplitArea.Start => StartMaxSize,
            SplitArea.End => EndMaxSize,
            SplitArea.StartSide => StartSideMaxSize,
            SplitArea.EndSide => EndSideMaxSize,
            
            _ => null
        };
    }

}