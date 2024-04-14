using Humanizer;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class Toast
{
    [Parameter] public RenderFragment? ChildContent { get; set; } = default!;
    [Parameter] public int? Duration { get; set; } = 1000;
    [Parameter] public ToastPlacement Placement { get; set; } = ToastPlacement.BottomEnd;

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-toast";
    }

    private void AnimationEndedHandler()
    {
    }
}
