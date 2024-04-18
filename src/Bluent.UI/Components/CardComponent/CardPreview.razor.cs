using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class CardPreview
{
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public RenderFragment? Logo { get; set; }
    public override IEnumerable<string> GetClasses()
    {
        yield return "card-preview";
    }
}
