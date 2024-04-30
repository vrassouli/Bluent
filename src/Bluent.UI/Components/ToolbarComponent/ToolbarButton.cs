using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public class ToolbarButton : OverflowItemComponentBase
{
    [Parameter] public string Text { get; set; } = default!;
    [Parameter] public string? MenuLabel { get; set; }
    [Parameter] public string Icon {  get; set; } = default!;
    [Parameter] public EventCallback OnClick { get; set; }
    [Parameter] public string? ActiveIcon { get; set; }
    [Parameter] public string? Href { get; set; }
    [Parameter] public RenderFragment? Dropdown{ get; set; }
    [Parameter] public ToolbarButtonAppearance Appearance { get; set; } = ToolbarButtonAppearance.Default;
}
