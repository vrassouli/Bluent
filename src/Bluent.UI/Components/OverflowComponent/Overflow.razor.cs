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

    protected override void OnAfterRender(bool firstRender)
    {
        if (RendererInfo.IsInteractive)
        {
            if (firstRender)
            {
                _interop = new OverflowInterop(JsRuntime);
                _interop.Init(GetOverflowId());
            }
            else
            {
                _overflowPopover?.RefreshSurface();
            }
        }

        base.OnAfterRender(firstRender);
    }

    public override async ValueTask DisposeAsync()
    {
        if (_interop != null)
            await _interop.DisposeAsync();
        await base.DisposeAsync();
    }

    protected void CheckOverflow()
    {
        _interop?.CheckOverflow();
    }
}