using Humanizer;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class Breadcrumb
{
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public BreadcrumbSize Size { get; set; } = BreadcrumbSize.Medium;

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-breadcrumb";

        if (Size != BreadcrumbSize.Medium)
            yield return Size.ToString().Kebaberize();
    }
}
