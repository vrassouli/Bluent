using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class Menu
{
    [Parameter, EditorRequired] public RenderFragment Trigger { get; set; } = default!;
    [Parameter, EditorRequired] public RenderFragment Items { get; set; } = default!;
    [Parameter] public Placement Placement { get; set; } = Placement.Bottom;
    
    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-menu";
    }
}
