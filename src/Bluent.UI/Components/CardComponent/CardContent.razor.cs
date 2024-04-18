using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class CardContent
{
    [Parameter] public RenderFragment? ChildContent { get; set; }
    public override IEnumerable<string> GetClasses()
    {
        yield return "card-content";
    }
}
