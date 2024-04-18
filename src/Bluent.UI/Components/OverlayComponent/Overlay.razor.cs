using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class Overlay
{
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public EventCallback OnClick { get; set; }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-overlay";
    }
}
