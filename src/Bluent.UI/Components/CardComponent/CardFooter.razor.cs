using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class CardFooter
{
    [Parameter] public RenderFragment? ChildContent { get; set; }
    public override IEnumerable<string> GetClasses()
    {
        yield return "card-footer";
    }
}
