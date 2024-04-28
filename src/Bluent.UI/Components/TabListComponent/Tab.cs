using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Routing;

namespace Bluent.UI.Components;

public class Tab : OverflowItemComponentBase
{
    [Parameter] public string Text { get; set; } = default!;
    [Parameter] public string? MenuLabel { get; set; } = default!;
    [Parameter] public string Icon { get; set; } = default!;
    [Parameter] public string ActiveIcon { get; set; } = default!;
    [Parameter] public string? Href { get; set; }
    [Parameter] public NavLinkMatch Match { get; set; }
    [Parameter] public object? Data { get; set; }
    [Parameter] public bool DeferredLoading { get; set; }
    [Parameter] public EventCallback OnClick { get; set; }
    [Parameter] public Orientation Orientation { get; set; } = Orientation.Horizontal;
    [Parameter] public RenderFragment? ChildContent { get; set; } = default!;
}
