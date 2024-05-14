using Bluent.UI.Components.OverflowComponent;
using Bluent.UI.Interops;
using Humanizer;
using Microsoft.AspNetCore.Components;
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
        if (firstRender)
        {
            _interop = new OverflowInterop(JsRuntime);
            _interop.Init(GetOverflowId());
        }
        else
        {
            _overflowPopover?.RefreshSurface();
            //CheckOverflow();
        }

        base.OnAfterRender(firstRender);
    }

    protected void CheckOverflow()
    {
        _interop?.CheckOverflow();
    }

    //internal void Add(IOverflowItem item)
    //{
    //    Items.Add(item);
    //    StateHasChanged();
    //}

    //internal void Remove(IOverflowItem item)
    //{
    //    Items.Remove(item);
    //    StateHasChanged();
    //}

    //protected abstract RenderFragment<IOverflowItem> RenderItem();
    //protected abstract RenderFragment<IOverflowItem> RenderMenuItem();
}
