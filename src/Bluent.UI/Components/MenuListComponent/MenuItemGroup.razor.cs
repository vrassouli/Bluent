using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class MenuItemGroup
{
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter, EditorRequired] public string Title { get; set; } = default!;

    public override IEnumerable<string> GetClasses()
    {
        yield return "item-group";
    }
}
