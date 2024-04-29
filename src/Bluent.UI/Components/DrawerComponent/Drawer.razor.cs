using Humanizer;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class Drawer
{
    private bool _hiding;
    private object? _result;
    private bool _hide;

    [Parameter] public RenderFragment? ChildContent { get; set; } = default!;
    [Parameter] public DrawerPosition Position { get; set; } = DrawerPosition.End;
    [Parameter] public DrawerSize Size { get; set; } = DrawerSize.Small;
    [Parameter] public EventCallback<dynamic?> OnClose { get; set; }
    [Parameter] public Breakpoints? Breakpoint { get; set; }

    protected override void OnInitialized()
    {
        if (Breakpoint != null)
            _hide = true;

        base.OnInitialized();
    }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-drawer";

        yield return Position.ToString().Kebaberize();

        if (Size != DrawerSize.Small)
            yield return Size.ToString().Kebaberize();

        if (Breakpoint != null)
            yield return $"drawer-{Breakpoint.ToString()?.ToLower()}";

        if (_hiding)
            yield return "hiding";

        if (_hide)
            yield return "hide";
    }

    public void Close(dynamic? result = null)
    {
        _hiding = true;
        _result = result;
        StateHasChanged();
    }

    public void Open()
    {
        _hiding = false;
        _hide = false;
    }

    private void AnimationEndedHandler()
    {
        if (_hiding)
        {
            InvokeAsync(() => OnClose.InvokeAsync(_result));
            _hide = true;
            _hiding = false;
        }
    }
}
