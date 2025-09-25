using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class CardHeader
{
    [Parameter] public RenderFragment? Image { get; set; }
    [Parameter] public RenderFragment? Header { get; set; }
    [Parameter] public RenderFragment? Description { get; set; }
    [Parameter] public RenderFragment? Action { get; set; }
    [Parameter] public bool ContextualAction { get; set; }
    public override IEnumerable<string> GetClasses()
    {
        yield return "card-header";
        if (ContextualAction)
            yield return "contextual-action";
    }
}
