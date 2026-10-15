using Bluent.UI.Interops;
using Humanizer;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.JSInterop;

namespace Bluent.UI.Components;

public abstract partial class Overflow
{
    private OverflowInterop? _interop;
    private Popover? _overflowPopover;

    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public Orientation Orientation { get; set; } = Orientation.Horizontal;
    [Inject] private IJSRuntime JsRuntime { get; set; } = default!;

    protected IEnumerable<string> GetOverflowClasses()
    {
        yield return "bui-overflow";
        yield return Orientation.ToString().Kebaberize();
    }

    protected string GetOverflowId() => $"{Id}_overflow";

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (RendererInfo.IsInteractive)
        {
            if (firstRender)
            {
                _interop = new OverflowInterop(JsRuntime);
                await _interop.InitAsync(GetOverflowId());
            }
            else
            {
                _overflowPopover?.RefreshSurface();
            }
        }

        await base.OnAfterRenderAsync(firstRender);
    }

    public override async ValueTask DisposeAsync()
    {
        try
        {
            if (_interop != null)
                await _interop.DisposeAsync();
        }
        catch (JSDisconnectedException)
        {
            // swallow
        }
        
        await base.DisposeAsync();
    }

    protected void CheckOverflow()
    {
        _interop?.CheckOverflow();
    }
}
