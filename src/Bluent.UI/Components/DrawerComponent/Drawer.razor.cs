using Humanizer;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class Drawer
{
    private bool _hiding;
    private object? _hideResult;

    [Parameter] public RenderFragment? ChildContent { get; set; } = default!;
    [Parameter] public DrawerPosition Position { get; set; } = DrawerPosition.End;
    [Parameter] public EventCallback<dynamic?> OnHide { get; set; }
    [Parameter] public string? Title { get; set; }
    [Parameter] public bool Dismissable { get; set; } = true;

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-drawer";
        yield return Position.ToString().Kebaberize();

        if (_hiding)
            yield return "hide";
    }

    public void Hide(dynamic? result)
    {
        _hiding = true;
        _hideResult = result;
        StateHasChanged();
    }

    private void OnDismiss()
    {
        Hide(null);
    }

    private void AnimationEndedHandler()
    {
        if (_hiding)
        {
            InvokeAsync(() => OnHide.InvokeAsync(_hideResult));
        }
    }
}
