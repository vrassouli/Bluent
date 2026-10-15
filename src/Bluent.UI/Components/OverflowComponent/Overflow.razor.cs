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
    private bool _checkOverflowOnNextRender;

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

        // The protected synchronous CheckOverflow() contract is preserved.
        // Actual JS invocation is awaited during the interactive render cycle,
        // after the DOM has its latest dimensions.
        if (RendererInfo.IsInteractive && _checkOverflowOnNextRender && _interop is not null)
        {
            _checkOverflowOnNextRender = false;
            await _interop.CheckOverflowAsync();
        }

        await base.OnAfterRenderAsync(firstRender);
    }

    public override async ValueTask DisposeAsync()
    {
        try
        {
            if (_interop is not null)
                await _interop.DisposeAsync();
        }
        finally
        {
            // Base tooltip/UI resources must be released even if the JS proxy
            // fails unexpectedly. The interop handles expected disconnections.
            await base.DisposeAsync();
        }
    }

    protected void CheckOverflow()
    {
        _checkOverflowOnNextRender = true;
        StateHasChanged();
    }
}
