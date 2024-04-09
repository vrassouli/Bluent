using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public class Tab : OverflowItemComponentBase
{
    [Parameter] public string Text { get; set; } = default!;
    [Parameter] public string? MenuLabel { get; set; } = default!;
    [Parameter] public string Icon { get; set; } = default!;
    [Parameter] public string ActiveIcon { get; set; } = default!;
    [Parameter] public RenderFragment? ChildContent { get; set; } = default!;
}
