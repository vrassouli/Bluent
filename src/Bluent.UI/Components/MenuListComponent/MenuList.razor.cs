using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class MenuList
{
    private List<MenuItem> _items = new();
    [Parameter] public RenderFragment? ChildContent { get; set; }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-menu-list";
    }

    internal void Add(MenuItem item)
    {
        _items.Add(item);
    }

    internal void Remove(MenuItem item)
    {
        _items.Remove(item);
    }

    internal bool ShouldRenderIconBox => _items.Any(x => x.Icon != null);
    internal bool ShouldRenderCheckmarkBox => _items.Any(x => x.Checked);
}
