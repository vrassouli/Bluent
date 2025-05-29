using Humanizer;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class Drawer
{
    private bool _hiding;
    private object? _result;
    private bool _hidden;

    [Parameter] public RenderFragment? ChildContent { get; set; } = default!;
    [Parameter] public DrawerPosition Position { get; set; } = DrawerPosition.End;
    [Parameter] public DrawerSize Size { get; set; } = DrawerSize.Small;
    [Parameter] public EventCallback<dynamic?> OnClose { get; set; }
    [Parameter] public Breakpoints? Breakpoint { get; set; }

    protected override void OnInitialized()
    {
        if (Breakpoint != null)
            _hidden = true;

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

        if (_hidden)
            yield return "hide";
    }

    public void Close(dynamic? result = null)
    {
        if (!_hidden && !_hiding)
        {
            _hiding = true;
            _result = result;
            StateHasChanged();
        }
    }

    public void Open()
    {
        _hiding = false;
        _hidden = false;
        StateHasChanged();
    }

    private void AnimationEndedHandler()
    {
        if (_hiding)
        {
            InvokeAsync(() => OnClose.InvokeAsync(_result));
            _hidden = true;
            _hiding = false;
        }
    }
}
