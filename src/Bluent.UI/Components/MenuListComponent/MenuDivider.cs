using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

namespace Bluent.UI.Components;

public class MenuDivider : BluentComponentBase
{
    public override IEnumerable<string> GetClasses()
    {
        yield return "menu-divider";
    }

    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        builder.OpenElement(0, "div");

        builder.AddMultipleAttributes(2, AdditionalAttributes);
        builder.AddAttribute(3, "id", Id);
        builder.AddAttribute(4, "class", GetComponentClass());
        builder.AddAttribute(5, "style", Style);

        builder.CloseElement();
    }
}
