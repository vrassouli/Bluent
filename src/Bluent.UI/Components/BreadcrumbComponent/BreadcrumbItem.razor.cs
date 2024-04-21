using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class BreadcrumbItem
{
    [Parameter, EditorRequired] public string Title { get; set; } = default!;
    [Parameter] public string? Href { get; set; }
    [Parameter] public string? Target { get; set; }
    [Parameter] public string? Icon { get; set; }
    [Parameter] public string? ActiveIcon { get; set; }

    private bool IsCurrent => string.IsNullOrEmpty(Href);

    public override IEnumerable<string> GetClasses()
    {
        yield return "item";

        if (IsCurrent)
            yield return "current";
    }
}
