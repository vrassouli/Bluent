using Bluent.UI.Components.OverflowComponent;
using Bluent.UI.Interops;
using Humanizer;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;
using Microsoft.JSInterop;

namespace Bluent.UI.Components;

public abstract partial class Overflow
{
    private OverflowInterop? _interop;
    private List<IOverflowItem> _items = new();

    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public OverflowOrientation Orientation { get; set; } = OverflowOrientation.Horizontal;
    [Inject] private IJSRuntime JsRuntime { get; set; } = default!;

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-overflow";
        yield return Orientation.ToString().Kebaberize();
    }

    protected override void OnAfterRender(bool firstRender)
    {
        if (firstRender)
        {
            _interop = new OverflowInterop(JsRuntime);
            _interop.Init(Id);
        }

        base.OnAfterRender(firstRender);
    }

    internal void Add(IOverflowItem item)
    {
        _items.Add(item);
        StateHasChanged();
    }

    internal void Remove(IOverflowItem item)
    {
        _items.Remove(item);
        StateHasChanged();
    }

    protected abstract RenderFragment<IOverflowItem> RenderItem();
    protected abstract RenderFragment<IOverflowItem> RenderMenuItem();
}
