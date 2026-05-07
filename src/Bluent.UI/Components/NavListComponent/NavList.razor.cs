using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class NavList
{
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public bool Compact { get; set; }
    [Parameter] public string CollapsedWidth { get; set; } = "44px";


    public override IEnumerable<string> GetClasses()
    {
        foreach (var c in base.GetClasses())
            yield return c;
        
        yield return "bui-nav-list";
        
        if (Compact)
            yield return "compact";
    }

    protected override IEnumerable<(string key, string value)> GetStyles()
    {
        foreach (var s in base.GetStyles())
            yield return s;
        
        yield return ("--nav-list-collapsed-width",  CollapsedWidth);
    }
}