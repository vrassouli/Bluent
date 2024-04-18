using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class CardFloatingAction
{
    [Parameter] public RenderFragment? ChildContent { get; set; }
    public override IEnumerable<string> GetClasses()
    {
        yield return "card-floating-action";
    }
}
