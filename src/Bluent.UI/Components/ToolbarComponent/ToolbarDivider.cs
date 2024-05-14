using Humanizer;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

namespace Bluent.UI.Components;

public class ToolbarDivider : OverflowItemComponentBase
{
    protected override void RenderOverflowItem(RenderTreeBuilder builder)
    {
        builder.OpenElement(0, "div");

        builder.AddAttribute(1, "class", $"toolbar-divider {Overflow?.Orientation.ToString().Kebaberize()}");

        builder.CloseElement();
    }

    protected override void RenderOverflowMenuItem(RenderTreeBuilder builder)
    {
        builder.OpenComponent<MenuDivider>(0);
        builder.CloseComponent();
    }
}
