using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class BreadcrumbItem
{
    [Parameter, EditorRequired] public string Title { get; set; } = default!;
    [Parameter] public string? Href { get; set; }
    [Parameter] public string? Target { get; set; }
    [Parameter] public string? Icon { get; set; }
    [Parameter] public string? ActiveIcon { get; set; }

    public override IEnumerable<string> GetClasses()
    {
        yield return "item";

        if (string.IsNullOrEmpty(Href))
            yield return "current";
    }
}
